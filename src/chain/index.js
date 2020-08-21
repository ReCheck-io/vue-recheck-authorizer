import { encrypt, decrypt } from 'aes256';
import e2e from 'recheck-clientjs-library';
import { logger } from '../utils/logger';

// eslint-disable-next-line
var wallet = null;
var keyPair = null;

let environment = process.env.VUE_APP_API_ENV && process.env.VUE_APP_API_ENV !== ""
  ? process.env.VUE_APP_API_ENV.split(",")
  : "";

let apiUrl = environment !== "" ? environment[0] : ""
let network = process.env.VUE_APP_NETWORK && process.env.VUE_APP_NETWORK !== ""
  ? process.env.VUE_APP_NETWORK
  : "ae";

logger(process.env)

const chain = {
  setInstance: function (newInstance = "ReCheckAPP") {
    e2e.setDefaultRequestId(newInstance)
  },

  setURLandNetwork: function (apiURL, network) {
    apiUrl = apiURL;
    network = network;
    e2e.init(apiURL, network);
  },

  init: async function (password) {
    logger('init');
    e2e.init(apiUrl, network);
    if (!localStorage.walletAe1) {
      logger('Wallet does not exist yet. Will create one.');
      keyPair = await e2e.newKeyPair(null);
      wallet = JSON.stringify(keyPair);
      logger('Wallet created with account', keyPair);
      this.saveWallet(keyPair, password);
      logger('Wallet saved.');
    } else {
      logger('wallet account exists');
    }
    return wallet;
  },

  pinned: function () {
    var privateKey = localStorage.walletAe1;
    if (typeof privateKey === 'undefined') return false;
    logger('pinned: privateKey =', privateKey);
    var storedSha3 = localStorage.walletSha3Ae;
    logger('pinned: storedSha3 =', storedSha3);
    logger(
      'pinned: typeof storedSha3 === undefined =',
      typeof storedSha3 === 'undefined',
    );
    var computedSha3 = e2e.getHash(privateKey);
    logger('pinned: computedSha3 =', computedSha3);
    logger(
      'pinned: (computedSha3 !== storedSha3) =',
      computedSha3 !== storedSha3,
    );
    if (typeof storedSha3 === 'undefined') return false;
    return computedSha3 !== storedSha3;
  },

  checkPassword: function (password) {
    logger('password', password);
    return (
      e2e.getHash(decrypt(password, localStorage.walletAe1)) ===
      localStorage.walletSha3Ae
    );
  },

  saveWallet: function (keyPair, password) {
    let keyPairStr = JSON.stringify(keyPair);
    logger('saveWallet with password', password);
    localStorage.walletSha3Ae = e2e.getHash(keyPairStr);
    var encrypted = encrypt(password, keyPairStr);
    logger('encrypted private key', encrypted);
    localStorage.walletAe1 = encrypted; // web3.eth.accounts.wallet.accounts[0].privateKey // encrypt wallet
    localStorage.publicAddress = keyPair.address;
    this.resetWallet();
  },

  resetWallet: function () {
    wallet = null;
    keyPair = null;
  },

  loadWallet: function (password) {
    if (!this.checkPassword(password)) {
      return 'authError';
    }
    var encrypted = localStorage.walletAe1;
    if (typeof encrypted === 'undefined') return encrypted;
    var account = decrypt(password, encrypted); // decrypt encrypted
    this.resetWallet();
    logger('loaded private key: ' + encrypted);
    wallet = account;
    keyPair = JSON.parse(account);
    localStorage.publicAddress = keyPair.address;
    localStorage.walletSha3Ae = e2e.getHash(account);
    return true;
  },

  resetPIN(oldPass, newPass) {
    if (!this.checkPassword(oldPass)) {
      return false;
    }
    let encrypted = localStorage.walletAe1;
    if (typeof encrypted === 'undefined') return encrypted;
    let account = decrypt(oldPass, encrypted); // decrypt encrypted
    logger('loaded private key: ' + encrypted);
    wallet = account;
    keyPair = JSON.parse(account);

    let keyPairStr = JSON.stringify(keyPair);
    logger('saveWallet with password', newPass);
    localStorage.walletSha3Ae = e2e.getHash(keyPairStr);
    encrypted = encrypt(newPass, keyPairStr);
    logger('encrypted private key', encrypted);
    localStorage.walletAe1 = encrypted; // web3.eth.accounts.wallet.accounts[0].privateKey // encrypt wallet
    localStorage.publicAddress = keyPair.address;
    this.resetWallet();
    return true;
  },

  restoreIdentityAtStart: async function (password, phrase) {
    this.resetWallet()
    keyPair = await e2e.newKeyPair(phrase)
    wallet = JSON.stringify(keyPair)
    this.saveWallet(keyPair, password)
    return true
  },

  importPrivateKey: async function (password, phrase) {
    if (!this.checkPassword(password)) {
      return 'authError'
    }
    await this.restoreIdentityAtStart(password, phrase)
  },

  doLogin: async function (password, _challenge, callback) {
    logger('pass', password);

    if (!this.checkPassword(password)) {
      callback('authError');
      return 'authError';
    } else {
      this.loadWallet(password);
    }

    var challenge = _challenge.substring(
      _challenge.lastIndexOf('/') + 1,
      _challenge.length,
    );
    logger('challenge', challenge);
    try {
      let token = await e2e.loginWithChallenge(challenge, keyPair);
      localStorage.lastRtnToken = token;
      logger(token);
      callback(false);
    } catch (error) {
      console.error(error);
      callback(error);
    }
    this.resetWallet();
    return true;
  },

  doExecSelection: async function (password, _selection, callback) {
    logger('pass', password);

    if (!this.checkPassword(password)) {
      callback('authError');
      return 'authError';
    } else {
      this.loadWallet(password);
    }

    try {
      await e2e.login(keyPair);
      let token = await e2e.execSelection(_selection, keyPair);
      logger(token);
      callback(false);
    } catch (error) {
      console.error(error);
      callback(error);
    }
    this.resetWallet();
    return true;
  },

  privateKey: function () {
    return wallet;
  },

  wallet() {
    return keyPair;
  },
};

export default chain
export { chain }