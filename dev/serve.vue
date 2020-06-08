<script>
import Vue from 'vue';
import { RecheckScanner } from '@/entry';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    RecheckScanner,
  }
});
</script>

<template>
  <div id="app">
    <recheck-scanner />
  </div>
</template>
