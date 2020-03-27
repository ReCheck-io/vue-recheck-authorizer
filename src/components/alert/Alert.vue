<template>
  <transition
    enter-active-class="animated quick fadeInRight"
    leave-active-class="animated quick fadeOutRight"
  >
    <div class="alert" v-show="visible" :style="{ backgroundColor: color }">
      <p>{{ message }}</p>
      <button type="button" @click="hideAlert">OK</button>
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
      timeout: 4000,
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
