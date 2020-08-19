<template>
  <div class="scanner" :class="classes">
    <alert />
    <loader />
    <div class="camera" v-if="useIntegratedCamera && pinned && !error.length > 0">
      <qrcode-stream @init="onInit" @decode="onDecode"></qrcode-stream>
    </div>

    <info-card :isPinned="pinned" :error="error" />
    <confirm-modal
      :isVisible.sync="showConfirmModal"
      :title="title"
      :message="message"
      :resolve="resolve"
      :reject="reject"
    />
    <input-modal
      :isVisible="showPinModal"
      :rememberPin="false"
      :inputValue.sync="pinCode"
      :checkboxValue.sync="automation"
    >
      <template #header>Your Passcode</template>
      <template #footer>
        <button type="button" class="btn" @click="cancelPin">Cancel</button>
        <button type="button" class="btn" @click="confirmPin">Confirm</button>
      </template>
    </input-modal>
  </div>
</template>

<script>
import { QrcodeStream } from 'vue-qrcode-reader'
import Card from '../components/cards/Card.vue'
import Alert from '../components/alert/Alert.vue'
import Loader from '../components/loader/Loader.vue'
import InfoCard from '../components/cards/InfoCard.vue'
import InputModal from '../components/modals/InputModal.vue'
import ConfirmModal from '../components/modals/ConfirmModal.vue'
import chainClient from '../chain/index';
import { logger } from '../utils/logger';

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
      default: true
    },
    classes: {
      type: String,
      default: '',
    },
    appRequestId: {
      type: String,
      default: "ReCheckAPP"
    }
  },

  data() {
    return {
      error: '',
      pinned: false,
      initialized: false,
      decodedString: '',
      componentHandled: this.handledByComponent,
      apiEnv: process.env.VUE_APP_API_ENV && process.env.VUE_APP_API_ENV !== ""
        ? process.env.VUE_APP_API_ENV.split(",") 
        : "",
      apiNetwork: process.env.VUE_APP_NETWORK_URL && process.env.VUE_APP_NETWORK_URL !== ""
        ? process.env.VUE_APP_NETWORK_URL
        : "",

      automation: false,
      showPinModal: false,
      pinCase: 'login',
      pinCode: '',

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

    if (!this.$router) {
      alert("Hey you don't have Vue Router!");
    }

    if (this.apiEnv !== "") {
      chainClient.setURLandNetwork(this.apiEnv[0], this.apiEnv[1]);
    } else {
      const currentNetwork = this.apiNetwork !== "" ? this.apiNetwork : "ae";
      let savedApiUrl = localStorage.getItem("apiUrl")
      if (savedApiUrl && savedApiUrl !== null) {
        chainClient.setURLandNetwork(savedApiUrl, currentNetwork);
      }
    }

    if (this.pinned) {
      this.setupCamera();
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
      this.decodedString = decodedString;

      if (decodedString.indexOf('/login') > 0) {
        this.pinCase = 'login';
        if (this.apiEnv === "") {
          let apiUrl = decodedString.split("/login")[0];
          const currentNetwork = this.apiNetwork !== "" ? this.apiNetwork : "ae";
          localStorage.setItem("apiUrl", apiUrl)
          chainClient.setURLandNetwork(apiUrl, currentNetwork);
        }
        if (!this.componentHandled) {
          this.$emit('qr-decode', this.pinCase);
        } else {
          this.handleDecode(
            this.pinCase,
            'Login Request',
            'You are about to login. Are you sure?',
          );
        }
      } else if (decodedString.startsWith('sh:')) {
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
      } else if (decodedString.startsWith('se:')) {
        this.pinCase = 'share';
        if (!this.componentHandled) {
          this.$emit('qr-decode', this.pinCase);
        } else {
          this.handleDecode(
            this.pinCase,
            'Document Email Share Request',
            'You are about to share a document by email. Are you sure?'
          );
        }
      } else if (decodedString.startsWith('sg:')) {
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
      } else if (decodedString.startsWith('re:')) {
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
          } else if (['share','decrypt','sign'].includes(this.pinCase)) {
            this.doExecSelection();
          }
          this.showPinModal = false;      
        } else {
          this.$root.$emit("alertOn", "Passcode is incorrect!", "red");
          this.pinCode = "";
        }
      } else {
        this.$root.$emit("alertOn", "Passcode is incorrect!", "red");
        this.pinCode = "";
      }
    },

    cancelPin() {
      this.pinCode = '';
      this.showPinModal = false;
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
            logger("scan error: ", err);
          } else {
            logger("scan result: ", contents)
            this.onDecode(contents);
          }
        });
      }
    },

    checkPin(pin) {
      if (pin === "") {
        return false;
      } else {
        if (pin === undefined) {
          return false;
        } else {
          if (pin.length < 3) {
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
