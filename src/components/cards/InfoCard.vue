<template>
  <div class="card" v-show="!isPinned || error.length > 0">
    <header class="card-header">
      <h3 v-if="error.length > 0">Problem with camera</h3>
      <h3 v-else-if="!isPinned">Identity Required</h3>
    </header>
    <div class="card-body">
      <p v-if="!isPinned">
        To start using the camera you have to setup a new digital identity.
      </p>
      <p v-else-if="error.length > 0">
        The camera could not be initialized. Please make sure you permit usage
        of your phone camera by setting Camera Permission to state "Allowed".
        You can do so by selecting "Site Settings" from the browser settings
        menu or by clicking the site security icon located left of the address
        bar.
      </p>
    </div>
    <footer v-if="!isPinned" class="card-footer">
      <button type="button" class="btn link" @click="goToIdentity">
        Identity Settings
      </button>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'info-card',

  props: {
    isPinned: {
      type: Boolean,
    },
    error: {
      type: String,
    },
  },

  methods: {
    goToIdentity() {
      window.location.assign('/#/identity');
    }
  }
};
</script>
