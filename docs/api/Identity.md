# Identity

## Pin Management

::: warning
In order to use `Identity` component you need to setup `Vuex` and create store like the sample below.
:::

::: details Show sample Vuex Store code

```js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    automatedPIN: false,
    savedPIN: '',
    counter: 0,
    timeToRemember: 600000,
  },
  getters: {
    returnPINState: (state) => {
      return state.automatedPIN;
    },
    returnSavedPIN: (state) => {
      return state.savedPIN;
    },
    returnTimeToRemember: (state) => {
      return state.timeToRemember;
    },
  },
  mutations: {
    deadline: (state) => {
      state.automatedPIN = false;
      state.savedPIN = '';
      alert('Your automated PIN entry service has ended ');
    },
    startTiming: (state, payload) => {
      state.automatedPIN = true;
      state.savedPIN = payload;
      alert(
        `Your PIN is saved for the next ${
          state.timeToRemember / 60000
        } minutes`,
      );
    },
    rememberTime: (state, payload) => {
      state.timeToRemember = payload;
    },
  },
  actions: {
    startTiming: ({ commit }, payload) => {
      commit('startTiming', payload);
    },
    deadline: ({ commit, state }) => {
      setTimeout(() => {
        commit('deadline');
      }, state.timeToRemember);
    },
  },
});

export default store;
```

:::

## Events

No Events

## Props

### `classes`

- **Payload Type:** `String`
- **Required:** `false`

Used for custom styles for the components (alert, loader, cards and modals).

## Slots

No Slots
