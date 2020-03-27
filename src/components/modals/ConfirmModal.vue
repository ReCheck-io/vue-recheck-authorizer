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
          <p v-show="!!message">{{ message }}</p>
        </slot>
      </div>
      <footer class="modal-footer">
        <slot name="footer">
          <button type="button" class="btn" @click="cancelModal">Cancel</button>
          <button type="button" class="btn primary" @click="confirmModal">
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
    title: {
      type: String,
      default: '',
    },
    message: {
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
