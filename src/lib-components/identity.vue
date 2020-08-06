<template>
  <div class="identity" :class="classes">
    <!-- Current user identity -->
    <div v-if="pinned && !backupMode" class="current-identity">
      <card>
        <template #header>My ReCheck Identity</template>
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
      <card :class="{ 'do-backup': !backupDone }">
        <template #header>Backup &amp; Recover</template>
        <p>
          We <strong>STRONGLY RECOMMEND</strong> to write down your recovery phrase in order to be able to restore your identity.
        </p>
        <template #footer>
          <button type="button" class="btn" @click="backupIdentity">
            Backup
          </button>
        </template>
      </card>

      <card>
        <template #header>Reset Identity</template>
        <p>
          Reset Identity will remove your current identity. If you have not saved the recovery phrase for your current identity it will be lost <strong>FOREVER</strong>.
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
        <template #header>New ReCheck Identity</template>
        <p>
          To start using the app, please create or restore your digital identity.
          You will be asked to create and remember your personal security Passcode.
        </p>
        <template #footer>
          <button type="button" class="btn" @click="createIdentity">
            Create Identity
          </button>
          <button type="button" class="btn" @click="restoreIdentityAtStart">
            Recover Identity
          </button>
        </template>
      </card>
    </div>

    <alert />
    <loader />
    <input-modal
      :isVisible="showPinDialog"
      :inputLabel="pinMessage"
      :inputLabel2="pinMessage2"
      :confirmPinCode.sync="pin1"
      :inputValue.sync="pin"
      :rememberPin="true"
      :checkboxValue.sync="automation"
      :showPinConfirmInput="showPinConfirmInput"
    >
      <template #header>Your Passcode</template>
      <template #footer>
        <button type="button" class="btn" @click="cancelPin">Cancel</button>
        <button type="button" class="btn primary" @click="confirmPin">Confirm</button>
      </template>
    </input-modal>
    <input-modal
      :isVisible="importDialog"
      :inputValue.sync="privateKey"
      inputType="text"
      :inputLabel="inputMessage"
      inputPlaceholder="Please enter your recovery phrase."
    >
      <template #header>Recover Identity</template>
      <template #footer>
        <button type="button" class="btn" @click="importDialog = false">
          Cancel
        </button>
        <button type="button" class="btn primary" @click="doRestoreIdentity">
          Recover
        </button>
      </template>
    </input-modal>
    <confirm-modal :isVisible="privateKeyDialog" title="Your Recovery Phrase">
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
    mobileBackup: {
      type: Boolean,
      default: false,
    }
  },

  data() {
    return {
      pinned: false,
      privateKey: '',
      publicAddress: '',
      inputMessage: '',
      pinMessage: '',

      pin: '',
      pin1: '',
      check: false,

      pinDialog: 0,
      automation: false,
      importDialog: false,
      showPinDialog: false,
      privateKeyDialog: false,
      showPinConfirmInput: false,
      pinMessage2: "Please repeat your Passcode",

      showConfirmModal: false,
      title: '',
      message: '',
      resolve: null,
      reject: null,

      backupDone: false,
      backupMode: false,
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

    this.backupDone = localStorage.getItem("backupDone") 
      ? JSON.parse(localStorage.getItem("backupDone"))
      : false;
  },

  methods: {
    seedCheck(seedPhrase) {
      if (seedPhrase.split(" ").length == 12) {
        return true;
      } else {
        return false;
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

    resetIdentity() {
      this.open(
        "Reset Identity",
        "Are you really sure you want to reset your Identity?"
      )
        .then((resolved) => {
          if (resolved) {
            this.open(
              "Reset Identity",
              "Are you really sure you want to reset your identity? You will lose the current one FOREVER!"
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
      this.pin1 = '';
      this.pinDialog = 2;
      this.showPinConfirmInput = true;
      this.pinMessage = 'Please choose a new Passcode';
      this.showPinDialog = true;
      this.backupDone = false;
    },

    backupIdentity() {
      if (chainClient.pinned() && !this.$store.state.automatedPIN) {
        this.pin = '';
        this.pinDialog = 1;
        this.showPinDialog = true;
        this.pinMessage = 'Please enter your Passcode';
      } else {
        if (chainClient.loadWallet(this.returnRememberedPIN) !== 'authError') {
          this.privateKey = chainClient.wallet().phrase;
          this.privateKeyDialog = true;
        }
      }
    },

    restoreIdentityAtStart() {
      this.check = false;
      this.pin = "";
      this.pin1 = "";
      this.showPinConfirmInput = true;
      this.pinMessage = "Please choose a new Passcode";
      this.inputMessage = 'Recovery phrase';
      this.pinDialog = 3;
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
            "Identity recovered successfully!",
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
          this.importDialog = false;
          this.$root.$emit(
            "alertOn",
            "Identity recovered successfully!",
            "green"
          );
          location.reload();
        } else {
          this.$root.$emit("alertOn", "Passcode mismatch.", "red");
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
      if (this.pin === "") {
        this.$root.$emit('alertOn', 'Passcode must be at least 4 characters!', 'red');
      } else {
        if (this.pinDialog === 1) { // Backup
          if (chainClient.loadWallet(this.pin) !== 'authError') {
            this.privateKey = chainClient.wallet().phrase;
            if (this.mobileBackup) {
              this.backupMode = true;
              this.$root.$emit("backupMode", {
                "privateKey": this.privateKey,
                "backupMode": this.backupMode
              });
            } else {
              this.privateKeyDialog = true;
              this.pinAutomation(this.returnAutomation, this.pin);

              this.backupDone = true;
              localStorage.setItem('backupDone', true);

              const card = document.querySelector('.card');
              if (this.backupDone === true && card.classList.contains('do-backup')) {
                card.classList.remove('do-backup');
              }
            }
          } else {
            this.$root.$emit('alertOn', 'Passcode mismatch.', 'red');
          }

          this.pin = '';
          this.pin1 = '';
          this.pinDialog = 0;
          this.showPinConfirmInput = false;
          this.showPinDialog = false;
        } else if (this.pinDialog === 2) { // New identity pin
          if (this.pin.length < 4 || this.pin1.length < 4) {
            this.$root.$emit(
              'alertOn',
              'Passcode must be at least 4 characters long!',
              'red',
            );
            this.pin = '';
            this.pin1 = '';
          } else {
            if (this.pin === this.pin1) {
              this.check = true;
              this.showPinDialog = false;
              this.$root.$emit("loaderOn");
              await chainClient.init(this.pin);
              this.pinned = chainClient.pinned();
              this.pinAutomation(this.returnAutomation, this.pin);
              this.$root.$emit("walletEvent");
              this.$root.$emit("loaderOff");
              if (!localStorage.getItem("backupDone")) {
                localStorage.setItem("backupDone", JSON.stringify(false));
                this.backupDone = false;
              } else {
                this.backupDone = JSON.parse(localStorage.getItem("backupDone"));
              }
              this.$root.$emit(
                "alertOn",
                "Identity created successfully!",
                "green"
              );
              this.pin = "";
              this.pin1 = "";
              this.pinDialog = 0;
              this.showPinDialog = false;
              this.showPinConfirmInput = false;
            } else {
              this.pin = "";
              this.pin1 = "";
              this.$root.$emit("alertOn", "Passcode mismatch.", "red");
            }
          }
        } else if (this.pinDialog === 3) { // Restore 
          if (this.pin.length < 4 || this.pin1.length < 4) {
            this.$root.$emit(
              "alertOn",
              "Passcode must be at least 4 characters long!",
              "red"
            );
            this.pin = '';
            this.pin1 = '';
          } else {
            if (this.pin === this.pin1) {
              this.check = true;
              this.showPinDialog = false;
              this.importDialog = true;
            }
          }
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
          this.$root.$emit('alertOn', 'Passcode remembered successfully!', 'green');
        }
      } else {
        this.$root.$emit(
          'alertOn',
          'You cannot remember your Passcode, while in PINless mode',
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

