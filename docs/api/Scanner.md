# Scanner

## Events

### `qr-decode`

- **Payload Type:** `String`

`qr-decode` event is continuously scans QR codes and returns `String` with the operation type.

```html
<scanner @qr-decode="onDecode" />
```

```js
methods: {
  onDecode(decodedString) {
    // ...
  }
}
```

::: warning
`qr-decode` event is emitted only when `handledByComponent` prop is false.
:::

## Props

### `handledByComponent`

- **Payload Type:** `Boolean`
- **Default:** `true`
- **Required:** `true`

Determines who will process the decoded string. Gives ability to the developer to handle the process the data.

```html
<scanner handledByComponent="false" />
```

::: tip
Passing `true` to `handledByComponent` prop emits `qr-decode` event.
:::

### `classes`

- **Payload Type:** `String`
- **Required:** `false`

Used for custom styles for the components (alert, loader, cards and modals). <br />
For more information about custom component styles. [Styles](../guide.html#styles)

## Slots

No Slots
