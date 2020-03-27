# Getting Started

## Installation

### Browser / CDN

> TODO

### NPM

```bash
npm install vue-recheck-authorizer vue-qrcode-reader
```

OR

```bash
yarn add vue-recheck-authorizer vue-qrcode-reader
```

::: warning
In order to use the `Scanner` component you need to install `vue-qrcode-reader` as a dependencie.
:::

### Default import

Install all the components:

```javascript
import Vue from 'vue';
import VueQrcodeReader from 'vue-qrcode-reader';
import VueRecheckAuthorizer from 'vue-recheck-authorizer';

Vue.use(VueQrcodeReader);
Vue.use(VueRecheckAuthorizer);
```

Use specific components:

```javascript
import Vue from 'vue';
import VueQrcodeReader from 'vue-qrcode-reader';
import { Scanner } from 'vue-recheck-authorizer';

Vue.use(VueQrcodeReader);
Vue.component('recheck-scanner', Scanner);
```

**⚠️ A css file is included when importing the package. You may have to setup your bundler to embed the css in your page.**

### Distribution import

Install all the components:

```javascript
import Vue from 'vue';
import VueQrcodeReader from 'vue-qrcode-reader';
import VueRecheckAuthorizer from 'vue-recheck-authorizer/dist/vue-recheck-authorizer.common';
import 'vue-recheck-authorizer/dist/vue-recheck-authorizer.css';

Vue.use(VueQrcodeReader);
Vue.use(VueRecheckAuthorizer);
```

Use specific components:

```javascript
import Vue from 'vue';
import VueQrcodeReader from 'vue-qrcode-reader';
import { Scanner } from 'vue-recheck-authorizer/dist/vue-recheck-authorizer.common';
import 'vue-recheck-authorizer/dist/vue-recheck-authorizer.css';

Vue.use(VueQrcodeReader);
Vue.component('recheck-scanner', Scanner);
```

**⚠️ You may have to setup your bundler to embed the css file in your page.**

## Styles

You can write your own css/scss styles for components (alert, loader, cards, modals):

Structure:

```scss
// SCSS
.my-custom-styles {
  // Component styles

  .loader {
  } // Loader styles

  .alert {
    // Alert styles

    p {
    } // Styles for description
    button {
    } // Style for alert close button
  }

  .card {
    // Card itself

    .card-header {
    } // Styles for card header
    .card-body {
    } // Style for card content
    .card-footer {
    } // Styles for card footer - buttons, etc..
  }

  // Modal Styles
  // Additional classes 'confirm' for confirm and 'input' for pin modal
  .modal {
    // Style of the modal overlay (backdrop)

    .modal-content {
    } // Style of the modal itself
    .modal-header {
    } // Styles for modal header
    .modal-body {
      // Styles for modal content

      .form-group {
      } // Styles for label/input/checkbox in the modal
    }
    .modal-footer {
    } // Styles for modal footer - buttons, etc..
  }

  .modal.confirm {
    // Additional class for confirm modals
    // ....
  }

  .modal.input {
    // Additional class for input/pin modals
    // ....
  }
}
```

To apply this style you will have to specify `classes` property:

```html
<scanner classes="my-custom-styles" /> <identity classes="my-custom-styles" />
```
