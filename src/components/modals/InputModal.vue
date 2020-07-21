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
              :value="value"
              :placeholder="inputPlaceholder"
              @input="updateInput($event.target.value)"
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
    value: {
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
  },

  methods: {
    updateInput(value) {
      this.$emit('input', value);
    },
    updateCheckbox(newValue) {
      this.$emit('update:checkboxValue', newValue);
    },
  },
};
</script>
