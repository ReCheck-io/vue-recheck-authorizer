<template>
  <div v-if="loading" class="loader"></div>
</template>

<script>
export default {
  name: 'loader',

  mounted() {
    this.$root.$on('loaderOn', () => {
      this.loading = true;
    });
    this.$root.$on('loaderOff', () => {
      this.loading = false;
    });
  },
  data() {
    return {
      loading: false,
    };
  },
};
</script>
