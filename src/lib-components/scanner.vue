<template>
  <div class="scanner" :class="classes">
    <alert />
    <loader />
    <div class="camera" v-if="pinned && !error.length > 0">
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
      v-model="pinCode"
    >
      <template #header>Your PIN</template>
      <template #footer>
        <button type="button" class="btn" @click="cancelPin">Cancel</button>
        <button type="button" class="btn" @click="confirmPin">Confirm</button>
      </template>
    </input-modal>
  </div>
</template>

<script>
import chainClient from '../chain/index';
import { QrcodeStream } from 'vue-qrcode-reader'
import Card from '../components/cards/Card.vue'
import Alert from '../components/alert/Alert.vue'
import Loader from '../components/loader/Loader.vue'
import InfoCard from '../components/cards/InfoCard.vue'
import InputModal from '../components/modals/InputModal.vue'
import ConfirmModal from '../components/modals/ConfirmModal.vue'
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
    classes: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      error: '',
      pinned: false,
      initialized: false,
      decodedString: '',
      componentHandled: this.handledByComponent,
      apiEnv: process.env.VUE_APP_API_ENV.split(","),

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
    chainClient.setURLandNetwork(this.apiEnv[0], this.apiEnv[1]);
    this.pinned = chainClient.pinned();

    if (!this.$router) {
      alert("Hey you don't have Vue Router!");
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
            this.$root.$emit('alertOn', 'PIN mismatch!', 'red');
          } else {
            this.$root.$emit('alertOn', 'Unable to send login data', 'red');
          }
          this.$router.push('/');
        }
      });
      this.pinCode = '';
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
            this.$root.$emit('alertOn', 'PIN mismatch!', 'red');
          } else {
            if (this.pinCase === 'sign') {
              this.$root.$emit('alertOn', 'Failed to sign data.', 'red');
            } else if (this.pinCase === 'share') {
              this.$root.$emit('alertOn', 'Failed to share data.', 'red');
            } else if (this.pinCase === 'decrypt') {
              this.$root.$emit('alertOn', 'Failed to decrypt data.', 'red');
            }
          }
          this.$router.push('/');
        }
      });
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
      if (this.pinCase === 'login') {
        this.doLogin();
      } else if (this.pinCase === 'decrypt') {
        this.doExecSelection();
      } else if (this.pinCase === 'share') {
        this.doExecSelection();
      } else if (this.pinCase === 'sign') {
        this.doExecSelection();
      }
      this.showPinModal = false;
    },

    cancelPin() {
      this.pinCode = '';
      this.showPinModal = false;
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
              } else if (
                pinCase === 'share' ||
                pinCase === 'decrypt' ||
                pinCase === 'sign'
              ) {
                this.doExecSelection();
              }
            }
          } else {
            this.$router.push('/');
          }
        })
        .catch(() => {
          this.$root.$emit('loaderOff');
          this.$router.push('/');
        });
    },
  },
};
</script>

<style lang="scss">
@import '../styles/app.scss';
</style>
