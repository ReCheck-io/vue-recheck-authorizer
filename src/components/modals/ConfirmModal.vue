<template>
  <div
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    class="modal confirm"
    v-show="isVisible"
  >
    <div class="modal-content">
      <header class="modal-header">
        <h3>
          <slot name="header">{{ title }}</slot>
        </h3>
      </header>
      <div class="modal-body">
        <slot name="body">
          <p v-show="!!message" v-html="message"></p>
          <p class="terms" v-if="agreementText" v-html="agreementText"></p>
        </slot>
      </div>
      <footer class="modal-footer">
        <slot name="footer">
          <button type="button" class="btn" @click="cancelModal">
            {{ !isButtonVisible ? 'Close' : 'Cancel' }}
          </button>
          <button type="button" class="btn primary" v-if="isButtonVisible" @click="confirmModal">
            Confirm
          </button>
        </slot>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'confirm-modal',

  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    isButtonVisible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    agreementText: {
      type: String,
      default: '',
    },
    resolve: null,
    reject: null,
  },

  methods: {
    cancelModal() {
      this.resolve(false);
      this.$emit('update:isVisible', false);
    },
    confirmModal() {
      this.resolve(true);
      this.$emit('update:isVisible', false);
    },
  },
};
</script>
