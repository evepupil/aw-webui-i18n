# aw-webui 国际化(i18n)实施计划

## 项目现状分析

- **Vue 版本**: 2.7
- **组件数量**: 64 个 Vue 文件
- **模板语法**: Pug
- **现有 i18n**: 无
- **硬编码文本**: 大量英文文本分布在模板和 JS 代码中

## 技术方案

### 推荐工具: vue-i18n v8.x

```bash
npm install vue-i18n@8
```

> 注意: Vue 2 使用 vue-i18n v8.x，Vue 3 使用 v9.x

### 目录结构

```
src/
├── i18n/
│   ├── index.ts          # i18n 配置和初始化
│   └── locales/
│       ├── en.json       # 英文（默认）
│       ├── zh-CN.json    # 简体中文
│       ├── zh-TW.json    # 繁体中文
│       └── ...           # 其他语言
```

---

## 实施阶段

### 阶段一: 基础设施搭建 (1-2天)

#### 1.1 安装依赖
```bash
npm install vue-i18n@8
```

#### 1.2 创建 i18n 配置文件

**`src/i18n/index.ts`**
```typescript
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import en from './locales/en.json';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages: { en },
});

// 动态加载语言包
export async function loadLocale(locale: string) {
  if (!i18n.availableLocales.includes(locale)) {
    const messages = await import(`./locales/${locale}.json`);
    i18n.setLocaleMessage(locale, messages.default);
  }
  i18n.locale = locale;
  localStorage.setItem('locale', locale);
}

export default i18n;
```

#### 1.3 修改 main.js
```javascript
import i18n from './i18n';

new Vue({
  el: '#app',
  router,
  pinia,
  i18n,  // 添加 i18n
  render: h => h(App),
});
```

#### 1.4 添加语言切换组件

在 Settings 页面添加语言选择器。

---

### 阶段二: 文本提取与翻译键设计 (2-3天)

#### 2.1 翻译键命名规范

```
{页面/组件}.{区域}.{描述}
```

示例:
```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm"
  },
  "nav": {
    "activity": "Activity",
    "timeline": "Timeline",
    "stopwatch": "Stopwatch",
    "tools": "Tools",
    "rawData": "Raw Data",
    "settings": "Settings"
  },
  "home": {
    "greeting": "Hello early user,",
    "spreadTheWord": "Spread the word",
    "supportUs": "Support us!",
    "resources": "Resources"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "theme": "Theme",
    "dayStart": "Day start time"
  }
}
```

#### 2.2 需翻译的文件清单 (按优先级)

**高优先级 (用户常见)**
| 文件 | 描述 |
|------|------|
| `components/Header.vue` | 导航菜单 |
| `components/Footer.vue` | 页脚 |
| `views/Home.vue` | 首页 |
| `views/settings/*.vue` | 设置页面 (10个文件) |
| `views/activity/*.vue` | 活动视图 |

**中优先级**
| 文件 | 描述 |
|------|------|
| `visualizations/*.vue` | 可视化组件 (18个文件) |
| `views/Buckets.vue` | 数据桶页面 |
| `views/Timeline.vue` | 时间线 |
| `views/Stopwatch.vue` | 秒表 |

**低优先级**
| 文件 | 描述 |
|------|------|
| `views/QueryExplorer.vue` | 查询浏览器 |
| `views/Dev.vue` | 开发者页面 |
| `components/*Modal.vue` | 模态框 |

---

### 阶段三: 模板改造 (3-5天)

#### 3.1 Pug 模板中使用 i18n

**改造前:**
```pug
h3 Settings
b-nav-item(to="/timeline")
  | Timeline
```

**改造后:**
```pug
h3 {{ $t('settings.title') }}
b-nav-item(to="/timeline")
  | {{ $t('nav.timeline') }}
```

#### 3.2 带变量的文本

**改造前:**
```pug
p You have #{count} events
```

**改造后:**
```pug
p {{ $t('activity.eventCount', { count }) }}
```

```json
{
  "activity": {
    "eventCount": "You have {count} events"
  }
}
```

#### 3.3 HTML 内容 (使用 v-html)

**改造前:**
```pug
p Thank you for using #[b ActivityWatch]!
```

**改造后:**
```pug
p(v-html="$t('home.thankYou')")
```

```json
{
  "home": {
    "thankYou": "Thank you for using <b>ActivityWatch</b>!"
  }
}
```

---

### 阶段四: JavaScript/TypeScript 改造 (1-2天)

#### 4.1 在脚本中使用 i18n

```typescript
// Options API
export default {
  methods: {
    showMessage() {
      alert(this.$t('common.success'));
    }
  }
}

// 或在 setup/Composition API 中
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
```

#### 4.2 Store 中的文本
某些 store 中可能有错误消息等，需要通过 i18n 实例访问。

---

### 阶段五: 语言切换功能 (1天)

#### 5.1 创建语言选择组件

**`src/views/settings/LanguageSettings.vue`**
```vue
<template lang="pug">
div
  h5 {{ $t('settings.language') }}
  b-form-select(v-model="currentLocale" :options="localeOptions")
</template>

<script>
import { loadLocale } from '~/i18n';

export default {
  data() {
    return {
      currentLocale: this.$i18n.locale,
      localeOptions: [
        { value: 'en', text: 'English' },
        { value: 'zh-CN', text: '简体中文' },
        { value: 'zh-TW', text: '繁體中文' },
      ]
    };
  },
  watch: {
    currentLocale(locale) {
      loadLocale(locale);
    }
  }
};
</script>
```

#### 5.2 在 Settings.vue 中添加
```pug
LanguageSettings
hr
```

---

### 阶段六: 翻译文件编写 (持续)

#### 6.1 初始语言包结构

**`src/i18n/locales/en.json`** (约 200-300 个键)
```json
{
  "common": { ... },
  "nav": { ... },
  "home": { ... },
  "activity": { ... },
  "settings": { ... },
  "timeline": { ... },
  "stopwatch": { ... },
  "buckets": { ... },
  "visualizations": { ... },
  "errors": { ... }
}
```

#### 6.2 翻译工作流建议
1. 先完成英文键值提取
2. 复制为其他语言基础
3. 逐步翻译或使用 AI 辅助翻译
4. 人工审核校对

---

## 时间估算

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| 1 | 基础设施搭建 | 1-2 天 |
| 2 | 文本提取与键设计 | 2-3 天 |
| 3 | 模板改造 (64个文件) | 3-5 天 |
| 4 | JS/TS 改造 | 1-2 天 |
| 5 | 语言切换功能 | 1 天 |
| 6 | 翻译文件 (每语言) | 1-2 天 |
| **总计** | | **9-15 天** |

---

## 注意事项

1. **日期/时间格式**: 使用 `$d()` 方法处理日期本地化
2. **数字格式**: 使用 `$n()` 方法处理数字本地化
3. **复数形式**: 使用 vue-i18n 的复数语法
   ```json
   { "events": "no events | one event | {count} events" }
   ```
4. **RTL 支持**: 如需支持阿拉伯语等，需额外处理 CSS
5. **SEO**: 考虑 HTML lang 属性动态更新

---

## 推荐执行顺序

1. **先做**: Header.vue + Settings 语言切换 (快速验证流程)
2. **再做**: Home.vue + 常用设置页面
3. **然后**: Activity 相关页面
4. **最后**: 可视化组件和低频页面

---

## 可选: 自动化工具

### 提取硬编码文本
```bash
# 使用 i18n-extract 或类似工具扫描
npx vue-i18n-extract report --vueFiles './src/**/*.vue' --languageFiles './src/i18n/locales/*.json'
```

### 翻译管理平台
- Crowdin
- Lokalise
- POEditor
- 或直接用 JSON 文件 + GitHub PR
