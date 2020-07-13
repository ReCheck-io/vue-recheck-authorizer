<template>
  <div class="identity" :class="classes">
    <!-- Current user identity -->
    <div v-if="pinned" class="current-identity">
      <card>
        <template #header>Blockchain User Identity</template>
        <h4 class="publicAddress" @click="copyStringToClipboard(publicAddress)">
          {{ publicAddress }}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            stroke-width="2"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
          >
            <path
              d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"
            />
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
          </svg>
        </h4>
      </card>

      <!-- User Identity settings (restore identity & backup identity) -->
      <card>
        <template #header>Backup &amp; Restore</template>
        <p>
          It is <strong>STRONGLY</strong> advised that you make a backup copy of
          your private key!
        </p>
        <template #footer>
          <button type="button" class="btn" @click="backupIdentity">
            Backup
          </button>
          <button type="button" class="btn" @click="restoreIdentity">
            Restore
          </button>
        </template>
      </card>

      <card>
        <template #header>Reset Identity</template>
        <p>
          Reset Identity will remove your current identity. If you have not saved the phrase for your current identity it will be lost FOREVER.
        </p>
        <template #footer>
          <button type="button" class="btn danger" @click="resetIdentity">
            Reset Identity
          </button>
        </template>
      </card>
    </div>

    <!-- New identity -->
    <div v-if="!pinned" class="new-identity">
      <card>
        <template #header>New Identity</template>
        <p>
          To start using the app, please create or restore your digital identity.
          You will be asked to create and remember your personal security PIN.
        </p>
        <template #footer>
          <button type="button" class="btn" @click="createIdentity">
            Create Identity
          </button>
          <button type="button" class="btn" @click="restoreIdentityAtStart">
            Restore Identity
          </button>
        </template>
      </card>
    </div>

    <alert />
    <loader />
    <input-modal
      :isVisible="showPinDialog"
      :inputLabel="pinMessage"
      v-model="pin"
      :rememberPin="true"
      :checkboxValue.sync="automation"
    >
      <template #header>Your Pin</template>
      <template #footer>
        <button type="button" class="btn" @click="cancelPin">Cancel</button>
        <button type="button" class="btn" @click="confirmPin">Confirm</button>
      </template>
    </input-modal>
    <input-modal
      :isVisible="importDialog"
      v-model="privateKey"
      inputType="text"
      :inputLabel="inputMessage"
      inputPlaceholder="Please enter your key mnemonic."
    >
      <template #header>Restore Identity</template>
      <template #footer>
        <button type="button" class="btn" @click="importDialog = false">
          Cancel
        </button>
        <button type="button" class="btn" @click="doRestoreIdentity">
          Restore
        </button>
      </template>
    </input-modal>
    <confirm-modal :isVisible="privateKeyDialog" title="Your Key Mnemonic">
      <template #body>
        <p id="mnemonicKey">{{ privateKey }}</p>
      </template>
      <template #footer>
        <button type="button" class="btn" @click="privateKeyDialog = false">
          OK
        </button>
        <button type="button" class="btn" @click="copyToClipboard">
          Copy to Clipboard
        </button>
      </template>
    </confirm-modal>
    <confirm-modal
      :isVisible.sync="showConfirmModal"
      :title="title"
      :message="message"
      :resolve="resolve"
      :reject="reject"
    />
  </div>
</template>

<script>
import chainClient from '../chain/index';
import identityMixins from '../mixins/index.vue';
import Card from '../components/cards/Card.vue'
import Alert from '../components/alert/Alert.vue'
import Loader from '../components/loader/Loader.vue'
import InputModal from '../components/modals/InputModal.vue'
import ConfirmModal from '../components/modals/ConfirmModal.vue'
import { logger } from '../utils/logger';

export default {
  name: 'RecheckIdentity',

  mixins: [identityMixins],

  components: {
    Card,
    Alert,
    Loader,
    InputModal,
    ConfirmModal,
  },

  props: {
    classes: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      pinned: false,
      privateKey: '',
      publicAddress: '',
      inputMessage: '',
      pinMessage: '',

      pin: '',
      check: false,

      // Pin dialog types / 1 - Backup / 2 - Restore / 3 - New Identity pin / 4 - Confirm new pin
      pinDialog: 0,
      automation: false,
      importDialog: false,
      showPinDialog: false,
      privateKeyDialog: false,

      showConfirmModal: false,
      title: '',
      message: '',
      resolve: null,
      reject: null,
    };
  },

  mounted() {
    this.pinned = chainClient.pinned();
    this.$root.$on('walletEvent', () => {
      this.publicAddress = localStorage.publicAddress;
    });
    if (this.pinned) {
      this.publicAddress = localStorage.publicAddress;
    }
    if (!this.$store) {
      alert('Hey you need Vuex in order to use this component!');
    }
  },

  methods: {
    seedCheck(seedPhrase) {
      if (seedPhrase.split(" ").length == 12) {
        return true;
      } else {
        return false;
      }
    },

    resetIdentity() {
      this.open(
        "Reset Identity",
        "Are you really sure you want to reset your Identity?"
      )
        .then((resolved) => {
          if (resolved) {
            this.open(
              "Reset Identity",
              "Are you really sure you want to reset your identity ? You will lose the current one forever!"
            )
              .then((resolved) => {
                if (resolved) {
                  localStorage.clear();
                  location.reload();
                } else {
                  this.showConfirmModal = false;
                }
              })
          } else {
            this.showConfirmModal = false;
          }
        })
    },

    createIdentity() {
      this.pin = '';
      this.pinDialog = 3;
      this.pinMessage = 'Please choose a new PIN';
      this.showPinDialog = true;
    },

    backupIdentity() {
      if (chainClient.pinned() && !this.$store.state.automatedPIN) {
        this.pin = '';
        this.pinDialog = 1;
        this.showPinDialog = true;
        this.pinMessage = 'Please enter your PIN';
      } else {
        if (chainClient.loadWallet(this.returnRememberedPIN) !== 'authError') {
          this.privateKey = chainClient.wallet().phrase;
          this.privateKeyDialog = true;
        }
      }
    },

    restoreIdentity() {
      if (chainClient.pinned() && !this.$store.state.automatedPIN) {
        this.pin = '';
        this.pinDialog = 2;
        this.showPinDialog = true;
        this.pinMessage = 'Please enter your PIN';
      } else {
        if (chainClient.loadWallet(this.returnRememberedPIN) !== 'authError') {
          this.privateKey = chainClient.wallet().phrase;
          this.inputMessage = 'Private Key Mnemonic*';
          this.importDialog = true;
        }
      }
    },

    restoreIdentityAtStart() {
      this.check = false;
      this.pin = "";
      this.pinMessage = "Please choose a new PIN";
      this.inputMessage = 'Private Key Mnemonic*';
      this.pinDialog = 10;
      this.showPinDialog = true;
    },

    async doRestoreIdentity() {
      if (this.seedCheck(this.privateKey)) {
        if (!chainClient.pinned()) {
          logger("new privateKey", this.privateKey);
          this.$root.$emit("loaderOn");
          await chainClient.restoreIdentityAtStart(this.pin, this.privateKey);
          this.$root.$emit("loaderOff");
          this.$root.$emit("walletEvent");
          this.$root.$emit(
            "alertOn",
            "Identity restored successfully!",
            "green"
          );
          this.importDialog = false;
          location.reload();
        } else if (chainClient.loadWallet(this.pin) !== "authError") {
          logger("new privateKey", this.privateKey);
          this.$root.$emit("loaderOn");
          await chainClient.importPrivateKey(this.pin, this.privateKey);
          this.$root.$emit("loaderOff");
          this.$root.$emit("walletEvent");
          this.$root.$emit(
            "alertOn",
            "Identity restored successfully!",
            "green"
          );
          this.importDialog = false;
          location.reload();
        } else {
          this.$root.$emit("alertOn", "PIN mismatch.", "red");
        }
      } else {
        this.$root.$emit(
          "alertOn",
          "The secret phrase have to be 12 words.",
          "red"
        );
      }
    },

    async confirmPin() {
      if (this.pinDialog === 1) {
        if (chainClient.loadWallet(this.pin) !== 'authError') {
          this.privateKey = chainClient.wallet().phrase;
          this.privateKeyDialog = true;
          this.pinAutomation(this.returnAutomation, this.pin);
        } else {
          this.$root.$emit('alertOn', 'PIN mismatch.', 'red');
        }
        this.showPinDialog = false;
      } else if (this.pinDialog === 2) {
        if (chainClient.loadWallet(this.pin) !== 'authError') {
          this.privateKey = chainClient.wallet().phrase;
          this.inputMessage = 'Private Key Mnemonic*';
          this.importDialog = true;
        } else {
          this.$root.$emit('alertOn', 'PIN mismatch.', 'red');
        }
        this.showPinDialog = false;
      } else if (this.pinDialog === 3) {
        if (this.pin.length < 4) {
          this.$root.$emit(
            'alertOn',
            'PIN must be at least 4 characters long!',
            'red',
          );
        } else {
          this.check = true;
          this.pinMessage = 'Please repeat your new PIN';
          this.pin1 = this.pin;
          this.pin = '';
          this.pinDialog = 4;
          this.showPinDialog = true;
        }
      } else if (this.pinDialog === 10) {
        if (this.pin.length < 4) {
          this.$root.$emit(
            "alertOn",
            "PIN must be at least 4 characters long!",
            "red"
          );
        } else {
          this.check = true;
          this.pinMessage = "Please repeat your new PIN";
          this.pin1 = this.pin;
          this.pin = "";
          this.pinDialog = 11;
          this.showPinDialog = true;
        }
      } else if (this.pinDialog === 11) {
        if (this.pin.length < 4) {
          this.$root.$emit(
            "alertOn",
            "PIN must be at least 4 characters long!",
            "red"
          );
        } else {
          this.pin2 = this.pin;
          if (this.pin1 === this.pin2) {
            this.showPinDialog = false;
            this.importDialog = true;
          }
        }
      } else if (this.pinDialog === 4) {
        this.pin2 = this.pin;
        if (this.pin1 === this.pin2) {
          this.check = true;
          this.showPinDialog = false;
          this.$root.$emit("loaderOn");
          await chainClient.init(this.pin);
          this.pinned = chainClient.pinned();
          this.pinAutomation(this.returnAutomation, this.pin);
          this.$root.$emit("walletEvent");
          this.$root.$emit("loaderOff");
          this.$root.$emit(
            "alertOn",
            "Identity created successfully!",
            "green"
          );
        } else {
          this.pinDialog = 0;
          this.showPinDialog = false;
          this.pin = "";
          this.$root.$emit("alertOn", "PIN mismatch.", "red");
        }
      }
    },

    cancelPin() {
      this.pin = '';
      this.pin1 = '';
      this.pin2 = '';
      this.showPinDialog = false;
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

    async pinAutomation(check, PIN) {
      if (!this.$store.state.automatedPIN) {
        if (check) {
          this.showPinDialog = false;
          await this.rememberPIN(PIN);
          this.$root.$emit('alertOn', 'PIN remembered successfully!', 'green');
        }
      } else {
        this.$root.$emit(
          'alertOn',
          'You cannot remember your PIN, while in PINless mode',
          'red',
        );
      }
    },
    async rememberPIN(userPIN) {
      this.$store.dispatch('startTiming', userPIN);
      await this.$store.dispatch('deadline');
    },
  },
  computed: {
    returnPINState() {
      return this.$store.getters.returnPINState;
    },
    returnRememberedPIN() {
      return this.$store.getters.returnSavedPIN;
    },
    returnAutomation() {
      return this.automation;
    },
  },
};
</script>
