<template>
  <div
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    class="modal input"
    v-show="isVisible"
  >
    <div class="modal-content">
      <header class="modal-header">
        <h3><slot name="header"></slot></h3>
      </header>
      <div class="modal-body">
        <form @submit.prevent :id="modalFormId">
          <div class="form-group">
            <label class="inputLabel" v-show="!!inputLabel">
              {{ inputLabel }}
              <input
                :type="inputType"
                :value="inputValue"
                :placeholder="inputPlaceholder"
                @input="updateInput1($event.target.value)"
              />
            </label>
            <label class="inputLabel" v-if="showPinConfirmInput">
              <input
                :type="inputType"
                :value="pinConfirmValue"
                :placeholder="inputPlaceholder2"
                @input="updateInput2($event.target.value)"
              />
            </label>
            <div
              class="savePin"
              v-if="
                inputType === 'password' && rememberPin === true ? true : false
              "
            >
              <label class="checkboxLabel">
                Remember your Passcode
                <input
                  type="checkbox"
                  :value="checkboxValue"
                  @change="updateCheckbox($event.target.checked)"
                />
              </label>
            </div>
          </div>
        </form>
      </div>
      <footer class="modal-footer">
        <slot name="footer"></slot>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'input-modal',

  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    inputLabel: {
      type: String,
      default: 'Please enter your Passcode',
    },
    inputType: {
      type: String,
      default: 'password',
      validator: (value) =>
        ['hidden', 'text', 'password'].indexOf(value) !== -1,
    },
    inputValue: {
      type: String,
    },
    pinConfirmValue: {
      type: String,
    },
    rememberPin: {
      type: Boolean,
      default: false,
    },
    checkboxValue: {
      type: Boolean,
      default: false,
    },
    inputPlaceholder: {
      type: String,
      default: '********',
    },
    inputPlaceholder2: {
      type: String,
      default: '********',
    },
    showPinConfirmInput: {
      type: Boolean,
      default: false,
    },
    modalFormId: {
      type: String,
      default: '',
    }
  },

  methods: {
    updateInput1(value) {
      this.$emit('update:inputValue', value);
    },
    updateInput2(value) {
      this.$emit('update:confirmPinCode', value);
    },
    updateCheckbox(newValue) {
      this.$emit('update:checkboxValue', newValue);
    },
  },

  // Watch when modal is active focus on first input
  watch: {
    isVisible(isActive) {
      if (isActive) {
        const currentModals = document.querySelectorAll(".modal.input");
        setTimeout(() => {
          currentModals.forEach((modal) => {
            if (modal.attributes.style.value === '') {  
              modal.querySelector("input").focus();
            }
          })
        }, 100);
      }
    }
  }
};
</script>
