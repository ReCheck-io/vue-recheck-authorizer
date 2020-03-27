<template>
  <div class="card">
    <header class="card-header">
      <h3>
        <slot name="header"></slot>
      </h3>
    </header>
    <div class="card-body">
      <slot></slot>
    </div>
    <footer class="card-footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'card',
};
</script>
