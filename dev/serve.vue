<template>
  <div id="app">
    <h3 class="title">Scanner</h3>
    <RecheckScanner
      appRequestId="ReCheckAPP" 
      :handledByComponent="true" 
      :useIntegratedCamera="true"
      @is-scanned="testIt"
    />

    <hr />
    
    <h3 class="title">Identity</h3>
    <RecheckIdentity appName="My ReCheck" />
  </div>
</template>

<script>
import Vue from 'vue';
import chainClient from '@/chain'
import { RecheckScanner, RecheckIdentity } from '@/entry';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    RecheckScanner,
    RecheckIdentity
  },

  mounted() {
    chainClient.setURLandNetwork("", process.env.VUE_APP_NETWORK);
  },

  methods: {
    testIt(res) {
      console.log('Dev server testId', res)
    }
  }
});
</script>

<style>
body {
  margin: 0;
  padding-left: 16px;
  padding-right: 16px;
  font-family: -apple-system, Roboto, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 16px;
  font-weight: 400;
}
h3.title {
  text-align: center;
  margin-top: 12px;
  margin-bottom: 12px;
}
</style>
