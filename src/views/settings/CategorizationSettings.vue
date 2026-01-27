<template lang="pug">
div
  h5.d-inline-block
    div {{ $t('settings.categorization') }}
  div.float-right
    b-btn.ml-1(@click="restoreDefaultClasses", variant="outline-warning" size="sm")
      icon(name="undo")
      | {{ $t('common.restoreDefaults') }}
    label.btn.btn-sm.ml-1.btn-outline-primary(style="margin: 0")
      | {{ $t('common.import') }}
      input(type="file" @change="importCategories" hidden)
    b-btn.ml-1(@click="exportClasses", variant="outline-primary" size="sm")
      | {{ $t('common.export') }}
  p
    | {{ $t('settings.categorizationDescription') }}
  p
    | {{ $t('settings.categoryBuilderDescription') }}
  p
    | {{ $t('settings.categoryPresets') }}
  p
    | {{ $t('settings.categoryDocs') }}

  div.my-4
    b-alert(variant="warning" :show="classes_unsaved_changes")
      | {{ $t('settings.unsavedChanges') }}
      div.float-right(style="margin-top: -0.15em; margin-right: -0.6em")
        b-btn.ml-2(@click="saveClasses", variant="success" size="sm")
          | {{ $t('common.save') }}
        b-btn.ml-2(@click="resetClasses", variant="warning" size="sm")
          | {{ $t('common.discard') }}
    div(v-for="_class in classes_hierarchy")
      CategoryEditTree(:_class="_class")
    div(v-if="editingId !== null")
      CategoryEditModal(:categoryId='editingId', @hidden="hideEditModal()")

  div.row
    div.col-sm-12
      b-btn(@click="addClass")
        icon.mr-2(name="plus")
        | {{ $t('settings.addCategory') }}
      b-btn.float-right(@click="saveClasses", variant="success" :disabled="!classes_unsaved_changes")
        | {{ $t('common.save') }}
</template>
<script lang="ts">
import { mapState, mapGetters } from 'pinia';
import CategoryEditTree from '~/components/CategoryEditTree.vue';
import CategoryEditModal from '~/components/CategoryEditModal.vue';
import 'vue-awesome/icons/undo';
import router from '~/route';

import { useCategoryStore } from '~/stores/categories';

import _ from 'lodash';

export default {
  name: 'CategorizationSettings',
  components: {
    CategoryEditTree,
    CategoryEditModal,
  },
  data: () => ({
    categoryStore: useCategoryStore(),
    editingId: null,
    routerGuardRemover: null,
  }),
  computed: {
    ...mapState(useCategoryStore, ['classes_unsaved_changes']),
    ...mapGetters(useCategoryStore, ['classes_hierarchy']),
    confirmationMessage() {
      return this.$t('settings.confirmLeave');
    },
  },
  mounted() {
    this.categoryStore.load();

    // uses beforeunload event to warn user if they have
    // unsaved changes and are about to leave the page
    // also needs to be hooked into the router using the
    // beforeEach hook
    window.addEventListener('beforeunload', this.beforeUnload);

    this.routerGuardRemover = router.beforeEach((to, from, next) => {
      try {
        if (this.classes_unsaved_changes) {
          if (confirm(this.confirmationMessage)) {
            next();
          } else {
            next(false);
          }
        } else {
          next();
        }
      } catch (e) {
        console.error('Error in router.beforeEach: ', e);
        next();
      }
    });
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.beforeUnload);
    if (this.routerGuardRemover) {
      this.routerGuardRemover();
    }
  },
  methods: {
    addClass: function () {
      this.categoryStore.addClass({
        name: ['New class'],
        rule: { type: 'regex', regex: 'FILL ME' },
      });

      // Find the category with the max ID, and open an editor for it
      const lastId = _.max(_.map(this.categoryStore.classes, 'id'));
      this.editingId = lastId;
    },
    saveClasses: async function () {
      await this.categoryStore.save();
    },
    resetClasses: async function () {
      await this.categoryStore.load();
    },
    restoreDefaultClasses: async function () {
      await this.categoryStore.restoreDefaultClasses();
    },
    hideEditModal: function () {
      this.editingId = null;
    },
    exportClasses: function () {
      console.log('Exporting categories...');

      const export_data = {
        categories: this.categoryStore.classes,
      };
      // Pretty-format it for easier reading
      const text = JSON.stringify(export_data, null, 2);
      const filename = 'aw-category-export.json';

      // Initiate downloading a file by creating a hidden button and clicking it
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:application/json;charset=utf-8,' + encodeURIComponent(text)
      );
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },
    importCategories: async function (elem) {
      console.log('Importing categories...');

      // Get file from upload
      const file = elem.target.files[0];
      if (file.type != 'application/json') {
        console.error(this.$t('errors.importOnlyJSON'));
        return;
      }

      // Read and parse import text to JSON
      const text = await file.text();
      const import_obj = JSON.parse(text);

      // Set import to categories as unsaved changes
      this.categoryStore.import(import_obj.categories);
    },
    beforeUnload: function (e) {
      if (this.classes_unsaved_changes) {
        e = e || window.event;
        e.preventDefault();
        e.returnValue = this.confirmationMessage;
        return this.confirmationMessage;
      }
    },
  },
};
</script>
