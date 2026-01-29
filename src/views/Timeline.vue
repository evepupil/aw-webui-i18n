<template lang="pug">
div
  h2 {{ $t('timeline.title') }}

  input-timeinterval(v-model="daterange", :defaultDuration="timeintervalDefaultDuration", :maxDuration="maxDuration").mb-3

  // blocks
  div.d-inline-block.border.rounded.p-2.mr-2
    | {{ $t('timeline.eventsShown') }}  {{ num_events }}
  div.d-inline-block.border.rounded.p-2.mr-2
    | {{ $t('timeline.swimlanes') }}
    select(v-model="swimlane")
      option(:value='null') {{ $t('timeline.swimlanesNone') }}
      option(value='category') {{ $t('timeline.swimlanesCategory') }}
      option(value='bucketType') {{ $t('timeline.swimlanesBucketType') }}
  details.d-inline-block.bg-light.small.border.rounded.mr-2.px-2
    summary.p-2
      b {{ $t('timeline.filters') }} {{ filter_summary }}
    div.p-2.bg-light
      table
        tr
          th.pt-2.pr-3
            label {{ $t('timeline.filterHost') }}
          td
              select(v-model="filter_hostname")
                option(:value='null') {{ $t('common.all') }}
                option(v-for="host in hosts", :value="host") {{ host }}
        tr
          th.pt-2.pr-3
            label {{ $t('timeline.filterClient') }}
          td
            select(v-model="filter_client")
              option(:value='null') {{ $t('common.all') }}
              option(v-for="client in clients", :value="client") {{ client }}
  div.d-inline-block.border.rounded.p-2.mr-2(v-if="num_events !== 0")
    | {{ $t('timeline.eventsShown') }} {{ num_events }}
  b-alert.d-inline-block.p-2.mb-0.mt-2(v-if="num_events === 0", variant="warning", show)
    | {{ $t('timeline.noMatchingEvents') }}
  div.float-right.small.text-muted.pt-3
        tr
          th.pt-2.pr-3
            label {{ $t('timeline.filterDuration') }}
          td
            select(v-model="filter_duration")
              option(:value='null') {{ $t('common.all') }}
              option(:value='2') 2+ {{ $t('time.secs') }}
              option(:value='5') 5+ {{ $t('time.secs') }}
              option(:value='10') 10+ {{ $t('time.secs') }}
              option(:value='30') 30+ {{ $t('time.secs') }}
              option(:value='1 * 60') 1+ {{ $t('time.mins') }}
              option(:value='2 * 60') 2+ {{ $t('time.mins') }}
              option(:value='3 * 60') 3+ {{ $t('time.mins') }}
              option(:value='10 * 60') 10+ {{ $t('time.mins') }}
              option(:value='30 * 60') 30+ {{ $t('time.mins') }}
              option(:value='1 * 60 * 60') 1+ {{ $t('time.hrs') }}
              option(:value='2 * 60 * 60') 2+ {{ $t('time.hrs') }}
  div(style="float: right; color: #999").d-inline-block.pt-3
    | {{ $t('timeline.dragToPan') }}

  div(v-if="buckets !== null")
    div(style="clear: both")
    vis-timeline(:buckets="buckets", :showRowLabels='true', :queriedInterval="daterange", :swimlane="swimlane", :updateTimelineWindow='updateTimelineWindow')

    aw-devonly(:reason="$t('timeline.notReadyForProduction')")
      aw-calendar(:buckets="buckets")
  div(v-else)
    h1.aw-loading {{ $t('common.loading') }}
</template>

<script lang="ts">
import _ from 'lodash';
import { useSettingsStore } from '~/stores/settings';
import { useBucketsStore } from '~/stores/buckets';
import { seconds_to_duration } from '~/util/time';

export default {
  name: 'Timeline',
  data() {
    return {
      all_buckets: null,
      hosts: null,
      buckets: null,
      clients: null,
      daterange: null,
      maxDuration: 31 * 24 * 60 * 60,
      filter_hostname: null,
      filter_client: null,
      filter_duration: null,
      swimlane: null,
      updateTimelineWindow: true,
    };
  },
  computed: {
    timeintervalDefaultDuration() {
      const settingsStore = useSettingsStore();
      return Number(settingsStore.durationDefault);
    },
    // This does not match the chartData which is rendered in the timeline, as chartData excludes short events.
    num_events() {
      return _.sumBy(this.buckets, 'events.length');
    },
    filter_summary() {
      const desc = [];
      if (this.filter_hostname) {
        desc.push(this.filter_hostname);
      }
      if (this.filter_client) {
        desc.push(this.filter_client);
      }
      if (this.filter_duration > 0) {
        desc.push(seconds_to_duration(this.filter_duration));
      }

      if (desc.length > 0) {
        return desc.join(', ');
      }
      return 'none';
    },
  },
  watch: {
    daterange() {
      this.updateTimelineWindow = true;
      this.getBuckets();
    },
    filter_hostname() {
      this.updateTimelineWindow = false;
      this.getBuckets();
    },
    filter_client() {
      this.updateTimelineWindow = false;
      this.getBuckets();
    },
    filter_duration() {
      this.updateTimelineWindow = false;
      this.getBuckets();
    },
    swimlane() {
      this.updateTimelineWindow = false;
      this.getBuckets();
    },
  },
  methods: {
    getBuckets: async function () {
      if (this.daterange == null) return;

      this.all_buckets = Object.freeze(
        await useBucketsStore().getBucketsWithEvents({
          start: this.daterange[0].format(),
          end: this.daterange[1].format(),
        })
      );

      this.hosts = this.all_buckets
        .map(a => a.hostname)
        .filter((value, index, array) => array.indexOf(value) === index);
      this.clients = this.all_buckets
        .map(a => a.client)
        .filter((value, index, array) => array.indexOf(value) === index);

      let buckets = this.all_buckets;
      if (this.filter_hostname) {
        buckets = _.filter(buckets, b => b.hostname == this.filter_hostname);
      }
      if (this.filter_client) {
        buckets = _.filter(buckets, b => b.client == this.filter_client);
      }

      if (this.filter_duration > 0) {
        for (const bucket of buckets) {
          bucket.events = _.filter(bucket.events, e => e.duration >= this.filter_duration);
        }
      }

      this.buckets = buckets;
    },
  },
};
</script>

<style scoped>
details {
  position: relative;
}

details[open] summary ~ * {
  visibility: visible;
  position: absolute;
  border: 1px solid #ddd;
  border-radius: 5px;
  left: 0;
  top: 2.7em;
  background: white;
  z-index: 100;
}
</style>
