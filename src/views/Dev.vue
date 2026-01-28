<template lang="pug">
div
  h3 {{ $t('dev.title') }}
  | {{ $t('dev.description') }}

  p
    | {{ $t('dev.nothing') }}
</template>

<script lang="ts">
export default {
  name: 'aw-dev',
};
</script>
