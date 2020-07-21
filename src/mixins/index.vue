<script>
export default {
  methods: {
    copyToClipboard() {
      const valueToCopy = document.querySelector('#mnemonicKey');
      const range = document.createRange();
      range.selectNode(valueToCopy);
      window.getSelection().addRange(range);

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          this.$root.$emit('alertOn', 'Recovery phrase copied to clipboard.', 'green');
        } else {
          this.$root.$emit('alertOn', 'Could not copy to clipboard!', 'red');
        }
      } catch (err) {
        this.$root.$emit('alertOn', 'Could not copy to clipboard!', 'red');
      }

      window.getSelection().removeAllRanges();
    },

    copyStringToClipboard(str) {
      // Create new element
      let el = document.createElement('textarea');
      // Set value (string to be copied)
      el.value = str;
      // Set non-editable to avoid focus and move outside of view
      el.setAttribute('readonly', '');
      el.style = { position: 'absolute', left: '-9999px' };
      document.body.appendChild(el);
      // Select text inside element
      el.select();
      // Copy text to clipboard
      try {
        var successful = document.execCommand('copy');
        if (successful) {
          this.$root.$emit('alertOn', 'Address copied to clipboard.', 'green');
        } else {
          this.$root.$emit('alertOn', 'Could not copy to clipboard!', 'red');
        }
      } catch (err) {
        this.$root.$emit('alertOn', 'Could not copy to clipboard!', 'red');
      }
      // Remove temporary element
      document.body.removeChild(el);
    },
  },
};
</script>
