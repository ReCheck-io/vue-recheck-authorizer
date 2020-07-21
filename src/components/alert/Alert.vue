<template>
  <transition>
    <div class="alert" :class="[visible ? 'is-visible' : '']" :style="{ backgroundColor: color }">
      <p>{{ message }}</p>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'alert',

  data() {
    return {
      visible: false,
      message: '',
      color: '',
      timeout: 2000,
    };
  },

  methods: {
    hideAlert() {
      this.visible = false;
    },
  },

  mounted() {
    this.$root.$on('alertOn', (message, color) => {
      this.visible = true;
      this.message = message;
      this.color = color === 'green' ? '#89CA02' : '#ff0000';

      setTimeout(() => this.hideAlert(), this.timeout);
    });
    this.$root.$on('alertOff', () => {
      this.visible = false;
    });
  },
};
</script>
