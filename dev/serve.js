import Vue from 'vue';
import Dev from './serve.vue';

import { store } from "./store";
import { router } from "./router";

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  render: (h) => h(Dev),
}).$mount('#app');
