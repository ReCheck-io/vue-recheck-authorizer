import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    automatedPIN: false,
    savedPIN: "",
    counter: 0,
    timeToRemember: 600000
  },
  getters: {
    returnPINState: state => {
      return state.automatedPIN;
    },
    returnSavedPIN: state => {
      return state.savedPIN;
    },
    returnTimeToRemember: state => {
      return state.timeToRemember;
    }
  },
  mutations: {
    deadline: state => {
      state.automatedPIN = false;
      state.savedPIN = "";
      alert("Your automated PIN entry service has ended ");
    },
    startTiming: (state, payload) => {
      if (!state.automatedPIN) {
        alert(
          "Your Passcode is has been saved for the next " +
          state.timeToRemember / 60000 +
          " minutes"
        );
      }
      state.automatedPIN = true;
      state.savedPIN = payload;
    },
    rememberTime: (state, payload) => {
      state.timeToRemember = payload;
    }
  },
  actions: {
    // the payload is passed to the mutation
    startTiming: ({ commit }, payload) => {
      commit("startTiming", payload);
    },
    deadline: ({ commit, state }) => {
      setTimeout(() => {
        commit("deadline");
      }, state.timeToRemember);
    }
  }
});
