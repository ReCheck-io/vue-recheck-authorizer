[![Website recheck.io](https://img.shields.io/badge/Website-recheck.io-brightgreen.svg)](https://recheck.io/) <a href="https://discord.gg/3KwFw72"><img src="https://img.shields.io/discord/675683560673509386?logo=discord" alt="chat on Discord"></a>

# vue-recheck-authorizer

[![npm](https://img.shields.io/npm/v/vue-recheck-authorizer.svg) ![npm](https://img.shields.io/npm/dm/vue-recheck-authorizer.svg)](https://www.npmjs.com/package/vue-recheck-authorizer)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

> Vue.js component for authentication and data interaction with [Recheck Platform](https://recheck.io)

### [Documentation](https://recheck-io.github.io/vue-recheck-authorizer)

# Installation

```bash
npm install --save vue-recheck-authorizer vue-qrcode-reader
# OR
yarn add vue-recheck-authorizer vue-qrcode-reader
```

## Config
*Each (production/development) scripts loads env file for itself* <br />
`.env.production.local` for production settings/scripts <br />
`.env.development.local` for development settings/scripts

Example `.env.production.local` file:
```bash
# production (logs disabled) or debug (logs enabled)
VUE_APP_LOGGER_MODE=production

# api endpoint,network needed to initialize function
VUE_APP_API_ENV=https://beta.recheck.io,ae
```

## Default import

Install all the components:

```javascript
import Vue from 'vue';
import VueQrcodeReader from 'vue-qrcode-reader';
import VueRecheckAuthorizer from 'vue-recheck-authorizer';
import '../node_modules/vue-recheck-authorizer/dist/main.css';

Vue.use(VueQrcodeReader);
Vue.use(VueRecheckAuthorizer);
```

Use specific components:

```javascript
import Vue from 'vue';
import VueQrcodeReader from 'vue-qrcode-reader';
import { Scanner } from 'vue-recheck-authorizer';
import '../node_modules/vue-recheck-authorizer/dist/main.css';

Vue.use(VueQrcodeReader);
Vue.component('recheck-scanner', Scanner);
```

---

#### See [Documentation](https://recheck-io.github.io/vue-recheck-authorizer) for more information.

---

## License

[MIT](http://opensource.org/licenses/MIT)
