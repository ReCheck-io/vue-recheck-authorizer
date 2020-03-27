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

## Default import

Install all the components:

```javascript
import Vue from 'vue'
import VueRecheckAuthorizer from 'vue-recheck-authorizer'

Vue.use(VueRecheckAuthorizer)
```

Use specific components:

```javascript
import Vue from 'vue'
import { Scanner } from 'vue-recheck-authorizer'

Vue.component('recheck-scanner', Scanner)
```

**⚠️ A css file is included when importing the package. You may have to setup your bundler to embed the css in your page.**

## Distribution import

Install all the components:

```javascript
import 'vue-recheck-authorizer/dist/vue-recheck-authorizer.css'
import VueRecheckAuthorizer from 'vue-recheck-authorizer/dist/vue-recheck-authorizer.common'

Vue.use(VueRecheckAuthorizer)
```

Use specific components:

```javascript
import 'vue-recheck-authorizer/dist/vue-recheck-authorizer.css'
import { Scanner } from 'vue-recheck-authorizer/dist/vue-recheck-authorizer.common'

Vue.component('recheck-scanner', Scanner)
```

**⚠️ You may have to setup your bundler to embed the css file in your page.**

---

### See [Documentation](https://recheck-io.github.io/vue-recheck-authorizer) for more information.

---

## License

[MIT](http://opensource.org/licenses/MIT)
