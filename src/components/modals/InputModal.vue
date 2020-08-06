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
        <div class="form-group">
          <label class="inputLabel" v-show="!!inputLabel">
            {{ inputLabel }}
            <input
              :type="inputType"
              :value="inputValue"
              :placeholder="inputPlaceholder"
              @input="updateInput1($event.target.value)"
              required
            />
          </label>
          <label class="inputLabel" v-if="showPinConfirmInput">
            <input
              :type="inputType"
              :value="pinConfirmValue"
              :placeholder="inputPlaceholder2"
              @input="updateInput2($event.target.value)"
              required
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
      default: 'Your Passcode',
    },
    inputPlaceholder2: {
      type: String,
      default: 'Please repeat your Passcode',
    },
    showPinConfirmInput: {
      type: Boolean,
      default: false,
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
};
</script>
