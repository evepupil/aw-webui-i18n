<template lang="pug">
div
  h5 {{ $t('settings.language') }}
  p.text-muted.small {{ $t('settings.languageDescription') }}
  b-form-select(
    v-model="currentLocale"
    :options="localeOptions"
    @change="onLocaleChange"
  )
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { availableLocales, loadLocale, LocaleCode } from '~/i18n';

export default defineComponent({
  name: 'LanguageSettings',

  data() {
    return {
      currentLocale: this.$i18n.locale as LocaleCode,
    };
  },

  computed: {
    localeOptions() {
      return availableLocales.map(locale => ({
        value: locale.code,
        text: `${locale.nativeName} (${locale.name})`,
      }));
    },
  },

  methods: {
    async onLocaleChange(locale: LocaleCode) {
      await loadLocale(locale);
      this.currentLocale = locale;
    },
  },
});
</script>
