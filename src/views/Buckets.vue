<template lang="pug">
div
  h2 {{ $t('buckets.title') }}

  b-alert(show)
    i18n-t(keypath="buckets.moreWatchersHint" tag="span")
      template(#link)
        a(href="https://activitywatch.readthedocs.io/en/latest/watchers.html") {{ $t('buckets.theDocs') }}

  // By device
  b-card.mb-3(v-for="device in bucketsStore.bucketsByDevice", :key="device.hostname || device.device_id")
    div.mb-3
      div.d-flex
        div
          icon(v-if="device.hostname === 'unknown'" name="question")
          // TODO: detect device type somewhere else (should unify with store logic)
          icon(v-else, name="desktop")
          | &nbsp;
        div
          b {{ device.hostname }}
          span.small.ml-2(v-if="serverStore.info.hostname == device.hostname")
            | {{ $t('buckets.theCurrentDevice') }}
          div.small
            div(v-if="device.hostname !== device.device_id", style="color: #666")
              | {{ $t('buckets.id') }}: {{ device.id }}
            div
              | {{ $t('buckets.lastUpdated') }}:&nbsp;
              time(:style="{'color': isRecent(device.last_updated) ? 'green' : 'inherit'}",
                   :datetime="device.last_updated",
                   :title="device.last_updated")
                | {{ device.last_updated | friendlytime }}
            div
              | {{ $t('buckets.firstSeen') }}:&nbsp;
              time(:datetime="device.first_seen",
                   :title="device.first_seen")
                | {{ device.first_seen | friendlytime }}

    b-row
      b-col
        b-table.mb-0(small, hover, :items="device.buckets", :fields="fields", responsive="md")
          template(v-slot:cell(last_updated)="data")
            small(v-if="data.item.last_updated", :style="{'color': isRecent(data.item.last_updated) ? 'green' : 'inherit'}")
              | {{ data.item.last_updated | friendlytime }}
          template(v-slot:cell(actions)="data")
            b-button-toolbar.float-right
              b-button-group(size="sm", class="mx-1")
                b-button(variant="primary", :to="'/buckets/' + data.item.id")
                  icon(name="folder-open").d-none.d-md-inline-block
                  | {{ $t('common.open') }}
                b-dropdown(variant="outline-secondary", size="sm", :text="$t('common.more')")
                  // FIXME: These also exist as almost-copies in the Bucket view, can maybe be shared/reused instead.
                  b-dropdown-item(
                             :href="$aw.baseURL + '/api/0/buckets/' + data.item.id + '/export'",
                             :download="'aw-bucket-export-' + data.item.id + '.json'",
                             :title="$t('buckets.exportBucketJSON')",
                             variant="secondary")
                      icon(name="download")
                      | {{ $t('buckets.exportBucketJSON') }}
                  b-dropdown-item(
                              @click="export_csv(data.item.id)",
                             :title="$t('buckets.exportEventsCSV')",
                             variant="secondary")
                      icon(name="download")
                      | {{ $t('buckets.exportEventsCSV') }}
                  b-dropdown-divider
                  b-dropdown-item-button(@click="openDeleteBucketModal(data.item.id)",
                           :title="$t('buckets.deleteBucket')",
                           variant="danger")
                    | #[icon(name="trash")] {{ $t('buckets.deleteBucket') }}

    // Checks
    hr.mt-1(v-if="runChecks(device).length > 0")
    div.small.text-muted(v-for="msg in runChecks(device)", style="color: #333")
      icon(name="exclamation-triangle")
      | &nbsp;
      | {{ msg }}

  b-modal(id="delete-modal", :title="$t('buckets.danger')", centered, hide-footer)
    | {{ $t('buckets.confirmDelete', { bucketId: delete_bucket_selected }) }}
    br
    br
    b {{ $t('buckets.confirmDeletePermanent') }}
    hr
    div.float-right
      b-button.mx-2(@click="$root.$emit('bv::hide::modal','delete-modal')")
        | {{ $t('common.cancel') }}
      b-button(@click="deleteBucket(delete_bucket_selected)", variant="danger")
        | {{ $t('common.confirm') }}

  h3 {{ $t('buckets.importAndExport') }}

  b-card-group.deck
    b-card(:header="$t('buckets.importBuckets')")
      b-alert(v-if="import_error" show variant="danger" dismissable)
        | {{ import_error }}
      b-form-file(v-model="import_file"
                  :placeholder="$t('buckets.chooseOrDropFile')"
                  :drop-placeholder="$t('buckets.dropFileHere')")
      // TODO: This spinner could be placed in a more suitable place
      div(v-if="import_file" class="spinner-border" role="status")
      span
        | {{ $t('buckets.importBucketsDescription') }}
    b-card(:header="$t('buckets.exportBucket')")
      b-button(:href="$aw.baseURL + '/api/0/export'",
               :download="'aw-bucket-export.json'",
               :title="$t('buckets.exportBucketJSON')",
               variant="outline-secondary")
        icon(name="download")
        | {{ $t('buckets.exportAllBuckets') }}

  hr

  aw-devonly(reason="This section is still under development")
    h2.p-2 {{ $t('buckets.tools') }}

    hr

    aw-bucket-validate.p-2

    hr

    aw-bucket-merge.p-2
</template>

<style lang="scss">
// This won't work if scoped
.bucket-card {
  .card-header,
  .card-footer {
    padding: 0.5em 0.75em 0.5em 0.75em;
  }

  .card-body {
    padding: 0.5em;
  }
}
</style>

<style scoped lang="scss">
.bucket-card {
  margin-bottom: 1em;
}

.bucket-last-updated {
  color: #666;
}
</style>

<script lang="ts">
import 'vue-awesome/icons/trash';
import 'vue-awesome/icons/download';
import 'vue-awesome/icons/folder-open';
import 'vue-awesome/icons/desktop';
import 'vue-awesome/icons/mobile';
import 'vue-awesome/icons/question';
import 'vue-awesome/icons/exclamation-triangle';

import _ from 'lodash';
import Papa from 'papaparse';
import moment from 'moment';

import { useServerStore } from '~/stores/server';
import { useBucketsStore } from '~/stores/buckets';

export default {
  name: 'Buckets',
  components: {
    'aw-bucket-merge': () => import('~/components/BucketMerge.vue'),
    'aw-bucket-validate': () => import('~/components/BucketValidate.vue'),
  },
  data() {
    return {
      moment,
      bucketsStore: useBucketsStore(),
      serverStore: useServerStore(),

      import_file: null,
      import_error: null,
      delete_bucket_selected: null,
      fields: [
        { key: 'id', label: 'Bucket ID', sortable: true },
        { key: 'hostname', sortable: true },
        { key: 'last_updated', label: 'Updated', sortable: true },
        { key: 'actions', label: '' },
      ],
    };
  },
  watch: {
    import_file: async function (_new_value, _old_value) {
      if (this.import_file != null) {
        console.log('Importing file');
        try {
          await this.importBuckets(this.import_file);
          console.log('Import successful');
          this.import_error = null;
        } catch (err) {
          console.log('Import failed');
          // TODO: Make aw-server report error message so it can be shown in the web-ui
          this.import_error = this.$t('buckets.importFailed');
        }
        // We need to reload buckets even if we fail because imports can be partial
        // (first bucket succeeds, second fails for example when importing multiple)
        await this.bucketsStore.loadBuckets();
        this.import_file = null;
      }
    },
  },
  mounted: async function () {
    // load or reload buckets on mount
    await this.bucketsStore.loadBuckets();
  },
  methods: {
    isRecent: function (date) {
      return moment().diff(date) / 1000 < 120;
    },
    runChecks: function (device) {
      const checks = [
        {
          msg: () => {
            return this.$t('buckets.deviceKnownByHostnames', { hostnames: device.hostnames });
          },
          failed: () => device.hostnames.length > 1,
        },
        {
          msg: () => {
            return this.$t('buckets.deviceKnownByIds', { ids: device.device_ids });
          },
          failed: () => device.device_ids.length > 1,
        },
        {
          msg: () => {
            return this.$t('buckets.deviceSpecial');
          },
          failed: () => _.isEqual(device.hostnames, ['unknown']),
        },
        //{
        //  msg: () => 'just a test',
        //  failed: () => true,
        //},
      ];
      const failedChecks = _.filter(checks, c => c.failed());
      return _.map(failedChecks, c => c.msg());
    },
    openDeleteBucketModal: function (bucketId: string) {
      this.delete_bucket_selected = bucketId;
      this.$root.$emit('bv::show::modal', 'delete-modal');
    },
    deleteBucket: async function (bucketId: string) {
      await this.bucketsStore.deleteBucket({ bucketId });
      this.$root.$emit('bv::hide::modal', 'delete-modal');
    },
    importBuckets: async function (importFile) {
      const formData = new FormData();
      formData.append('buckets.json', importFile);
      const headers = { 'Content-Type': 'multipart/form-data' };
      return this.$aw.req.post('/0/import', formData, { headers });
    },

    async export_csv(bucketId: string) {
      const bucket = await this.bucketsStore.getBucketWithEvents({ id: bucketId });
      const events = bucket.events;
      const datakeys = Object.keys(events[0].data);
      const columns = ['timestamp', 'duration'].concat(datakeys);
      const data = events.map(e => {
        return Object.assign(
          { timestamp: e.timestamp, duration: e.duration },
          Object.fromEntries(datakeys.map(k => [k, e.data[k]]))
        );
      });
      const csv = Papa.unparse(data, { columns, header: true });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aw-events-export-${bucketId}-${new Date()
        .toISOString()
        .substring(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};
</script>
