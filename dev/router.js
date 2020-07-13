import Vue from "vue";
import Router from "vue-router";

const Component = resolve => {
  require.ensure(["./serve.vue"], () => {
    resolve(require("./serve.vue"));
  });
};

Vue.use(Router);

export const router = new Router({
  routes: [
    {
      path: "/",
      name: "Home",
      default: true,
      component: Component
    },
    {
      path: "*",
      redirect: "/"
    }
  ]
});
