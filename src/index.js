import Scanner from './components/Scanner.vue';
import Identity from './components/Identity.vue';

// Install the components
export function install(Vue) {
  Vue.component('scanner', Scanner);
  Vue.component('identity', Identity);
}

// Expose the components
export { Scanner, Identity };

// Plugin
const plugin = { install };

export default plugin;

// Auto-install
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}
