<template>
  <div class="scanner" :class="classes">
    <alert />
    <loader />
    <div
      class="camera"
      v-if="useIntegratedCamera && pinned && !error.length > 0"
    >
      <qrcode-stream @init="onInit" @decode="onDecode"></qrcode-stream>
    </div>

    <info-card :isPinned="pinned" :error="error" />
    <confirm-modal
      :isVisible.sync="showConfirmModal"
      :title="title"
      :message="message"
      :resolve="resolve"
      :reject="reject"
      :isButtonVisible="isButtonVisible"
      :agreementText="agreementTexts"
    />
    <input-modal
      :isVisible="showPinModal"
      :rememberPin="false"
      modalFormId="pinModalForm"
      :inputValue.sync="pinCode"
      :checkboxValue.sync="automation"
    >
      <template #header>
        Passcode
        <span>
          {{
            publicAddress !== ''
              ? 'for ' +
                publicAddress.replace(
                  publicAddress.substring(7, publicAddress.length - 4),
                  '...',
                )
              : ''
          }}
        </span>
      </template>
      <template #footer>
        <button type="button" class="btn" @click="cancelPin">Cancel</button>
        <button
          type="submit"
          class="btn"
          form="pinModalForm"
          @click="confirmPin"
          @keyup.enter="confirmPin"
        >
          Confirm
        </button>
      </template>
    </input-modal>
  </div>
</template>

<script>
import { QrcodeStream } from 'vue-qrcode-reader';
import Card from '../components/cards/Card.vue';
import Alert from '../components/alert/Alert.vue';
import Loader from '../components/loader/Loader.vue';
import InfoCard from '../components/cards/InfoCard.vue';
import InputModal from '../components/modals/InputModal.vue';
import ConfirmModal from '../components/modals/ConfirmModal.vue';
import chainClient from '../chain/index';
import { logger, getOrigin, isValidURL } from '../utils';

export default {
  name: 'RecheckScanner',

  components: {
    QrcodeStream,
    Card,
    Alert,
    Loader,
    InfoCard,
    InputModal,
    ConfirmModal,
  },

  props: {
    handledByComponent: {
      type: Boolean,
      default: true,
      required: true,
    },
    useIntegratedCamera: {
      type: Boolean,
      default: true,
    },
    classes: {
      type: String,
      default: '',
    },
    appRequestId: {
      type: String,
      default: 'ReCheckAPP',
    },
    isCameraOmitted: {
      type: Boolean,
      default: false,
    },
    scanLink: {
      type: String,
      default: '',
    },
    agreementText: ''
  },

  data() {
    return {
      error: '',
      pinned: false,
      initialized: false,
      decodedString: '',

      componentHandled: this.handledByComponent,
      omitCamera: this.isCameraOmitted,
      scanUrl: this.scanLink,

      apiEnv:
        process.env.VUE_APP_API_URL && process.env.VUE_APP_API_URL !== ''
          ? process.env.VUE_APP_API_URL
          : '',
      apiNetwork:
        process.env.VUE_APP_NETWORK && process.env.VUE_APP_NETWORK !== ''
          ? process.env.VUE_APP_NETWORK
          : 'ae',

      publicAddress: '',
      automation: false,
      showPinModal: false,
      pinCase: 'login',
      pinCode: '',

      isButtonVisible: true,
      agreementTexts: this.agreementText,

      showConfirmModal: false,
      title: '',
      message: '',
      resolve: null,
      reject: null,
    };
  },

  mounted() {
    this.pinned = chainClient.pinned();
    chainClient.setInstance(this.appRequestId);

    if (this.pinned) {
      this.publicAddress = localStorage.publicAddress;
    }

    if (!this.$router) {
      alert("Hey you don't have Vue Router!");
    }

    if (this.apiEnv !== '' && this.apiNetwork !== '') {
      chainClient.setURLandNetwork(this.apiEnv, this.apiNetwork);
    } else {
      let savedApiUrl = localStorage.getItem('apiUrl');
      if (savedApiUrl && savedApiUrl !== null) {
        chainClient.setURLandNetwork(savedApiUrl, this.apiNetwork);
      }
    }

    if (this.pinned && !this.omitCamera) {
      this.setupCamera();
    }

    if (this.pinned && this.omitCamera && this.scanUrl !== '') {
      this.onDecode(this.scanUrl);

      setTimeout(() => {
        this.setupCamera();
      }, 1500);
    }
  },

  methods: {
    async onInit(promise) {
      this.$root.$emit('loaderOn');
      try {
        await promise;
        this.initialized = true;
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          this.error = 'ERROR: you need to grant camera access permisson';
        } else if (error.name === 'NotFoundError') {
          this.error = 'ERROR: no camera on this device';
        } else if (error.name === 'NotSupportedError') {
          this.error = 'ERROR: secure context required (HTTPS, localhost)';
        } else if (error.name === 'NotReadableError') {
          this.error = 'ERROR: is the camera already in use?';
        } else if (error.name === 'OverconstrainedError') {
          this.error = 'ERROR: installed cameras are not suitable';
        } else if (error.name === 'StreamApiNotSupportedError') {
          this.error = 'ERROR: Stream API is not supported in this browser';
        }
      } finally {
        this.$root.$emit('loaderOff');
      }
    },

    onDecode(decodedString) {
      this.$emit('is-scanned', true);
      this.decodedString = decodedString;

      if (decodedString) {
        const origin = getOrigin(decodedString);
        logger('hasOrigin: ', origin);
        if (origin && !origin.includes('verify')) {
          localStorage.setItem('apiUrl', origin);
          chainClient.setURLandNetwork(origin, this.apiNetwork);
        }
      }

      if (decodedString.indexOf('/login') > 0) {
        this.pinCase = 'login';
        if (!this.componentHandled) {
          this.$emit('qr-decode', this.pinCase);
        } else {
          this.handleDecode(
            this.pinCase,
            'Login Request',
            'You are about to login. Are you sure?',
          );
        }
      } else if (decodedString.indexOf('sh:') > 0) {
        this.decodedString = decodedString.substring(decodedString.length - 69);
        this.pinCase = 'share';
        if (!this.componentHandled) {
          this.$emit('qr-decode', this.pinCase);
        } else {
          this.handleDecode(
            this.pinCase,
            'Document Share Request',
            'You are about to share a document. Are you sure?',
          );
        }
      } else if (decodedString.indexOf('se:') > 0) {
        this.decodedString = decodedString.substring(decodedString.length - 69);
        this.pinCase = 'share';
        if (!this.componentHandled) {
          this.$emit('qr-decode', this.pinCase);
        } else {
          this.handleDecode(
            this.pinCase,
            'Document Email Share Request',
            'You are about to share a document by email. Are you sure?',
          );
        }
      } else if (decodedString.indexOf('sg:') > 0) {
        this.decodedString = decodedString.substring(decodedString.length - 69);
        this.pinCase = 'sign';
        if (!this.componentHandled) {
          this.$emit('qr-decode', this.pinCase);
        } else {
          this.handleDecode(
            this.pinCase,
            'File Sign Request',
            'You are about to sign a file. Are you sure?',
          );
        }
      } else if (decodedString.indexOf('re:') > 0) {
        this.decodedString = decodedString.substring(decodedString.length - 69);
        this.pinCase = 'decrypt';
        if (!this.componentHandled) {
          this.$emit('qr-decode', this.pinCase);
        } else {
          this.handleDecode(
            this.pinCase,
            'Document Decrypt Request',
            'You are about to decrypt a document. Are you sure?',
          );
        }
      } else if (decodedString.indexOf('verify') > 0) {
        this.isButtonVisible = false;
        let verifyMessage = `
          Please click the link to verify certificate content. <br />
          <a href="${decodedString}" target="_blank" rel="noopener noreferrer">${decodedString.slice(0, 56) + '...'}</a>
        `;
        this.open('ReCheck Verifier URL', verifyMessage);
      } else if (decodedString) {
        this.isButtonVisible = false;
        let messageContent = isValidURL(decodedString) 
          ? `Unrecognized QR Code content: <br /> <a href="${decodedString}" target="_blank" rel="noopener noreferrer">${decodedString.slice(0, 56) + '...'}</a>`
          : `Unrecognized QR Code content: <br /> ${decodedString}`
        this.open('Unrecognized QR Code', messageContent);
      }
    },

    doLogin() {
      this.$root.$emit('loaderOn');
      chainClient.doLogin(this.pinCode, this.decodedString, (err) => {
        this.$root.$emit('loaderOff');
        if (!err) {
          this.$root.$emit('alertOn', 'Login data sent successfully.', 'green');
        } else {
          if (err === 'authError') {
            this.$root.$emit('alertOn', 'Passcode mismatch!', 'red');
          } else {
            this.$root.$emit('alertOn', 'Unable to send login data', 'red');
          }
        }
        this.$emit('scan-result', err);
        setTimeout(() => this.setupCamera(), 2000);
      });
      this.pinCode = '';
      this.pinCase = '';
    },

    doExecSelection() {
      this.$root.$emit('loaderOn');

      chainClient.doExecSelection(this.pinCode, this.decodedString, (err) => {
        this.$root.$emit('loaderOff');
        if (!err) {
          if (this.pinCase === 'sign') {
            this.$root.$emit('alertOn', 'Signed data successfully.', 'green');
          } else if (this.pinCase === 'share') {
            this.$root.$emit('alertOn', 'Shared data successfully.', 'green');
          } else if (this.pinCase === 'decrypt') {
            this.$root.$emit(
              'alertOn',
              'Decrypted data successfully.',
              'green',
            );
          }
        } else {
          if (err === 'authError') {
            this.$root.$emit('alertOn', 'Passcode mismatch!', 'red');
          } else {
            if (this.pinCase === 'sign') {
              this.$root.$emit('alertOn', 'Failed to sign data.', 'red');
            } else if (this.pinCase === 'share') {
              this.$root.$emit('alertOn', 'Failed to share data.', 'red');
            } else if (this.pinCase === 'decrypt') {
              this.$root.$emit('alertOn', 'Failed to decrypt data.', 'red');
            }
          }
        }
        this.$emit('scan-result', err);
        setTimeout(() => this.setupCamera(), 2000);
      });
      this.pinCase = '';
      this.pinCode = '';
    },

    open(title, message) {
      this.showConfirmModal = true;
      this.title = title;
      this.message = message;
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },

    confirmPin() {
      if (this.checkPin(this.pinCode)) {
        if (chainClient.checkPassword(this.pinCode)) {
          if (this.pinCase === 'login') {
            this.doLogin();
          } else if (['share', 'decrypt', 'sign'].includes(this.pinCase)) {
            this.doExecSelection();
          }
          this.showPinModal = false;
        } else {
          this.$root.$emit('alertOn', 'Passcode is incorrect!', 'red');
          this.pinCode = '';
        }
      } else {
        this.$root.$emit('alertOn', 'Passcode is incorrect!', 'red');
        this.pinCode = '';
      }
      this.isButtonVisible = true;
    },

    cancelPin() {
      this.pinCode = '';
      this.showPinModal = false;
      this.isButtonVisible = true;
      setTimeout(() => this.setupCamera(), 300);
    },

    handleDecode(pinCase, title, message) {
      this.open(title, message)
        .then((resolved) => {
          if (resolved) {
            if (chainClient.pinned()) {
              this.showPinModal = true;
            } else {
              if (pinCase === 'login') {
                this.doLogin();
              } else {
                this.confirmPin();
              }
            }
          } else {
            setTimeout(() => this.setupCamera(), 300);
          }
        })
        .catch(() => this.$root.$emit('loaderOff'));
    },

    setupCamera() {
      if (!this.useIntegratedCamera && window && window.QRScanner) {
        window.QRScanner.show();
        window.QRScanner.scan((err, contents) => {
          if (err) {
            logger('scan error: ', err);
          } else {
            logger('scan result: ', contents);
            this.onDecode(contents);
          }
        });
      }
    },

    checkPin(pin) {
      if (pin === '') {
        return false;
      } else {
        if (pin === undefined) {
          return false;
        } else {
          if (pin.length < 4) {
            return false;
          } else {
            return true;
          }
        }
      }
    },
  },
};
</script>

<style lang="scss">
@import '../styles/app.scss';
</style>
