// Vue I18n type augmentation
import type { VueI18n } from 'vue-i18n';

declare module 'vue' {
  interface ComponentCustomProperties {
    $i18n: VueI18n;
    $t: VueI18n['t'];
  }
}
