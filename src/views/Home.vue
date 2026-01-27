<template lang="pug">
div
  b-alert(v-if="$isAndroid" show)
    | #[b {{ $t('common.note') }}:] {{ $t('home.androidNote') }}

  h3 {{ $t('home.greeting') }}
  p
    | {{ $t('home.earlyDaysMessage') }}
    span(v-if="$isAndroid")  {{ $t('home.androidEspecially') }}
  p {{ $t('home.developerMessage') }}
  p
    div {{ $t('home.thankYou') }}
    small
      i18n(path="home.surveyMessage" tag="span")
        template(#surveyLink)
          a(href="https://forms.gle/q2N9K5RoERBV8kqPA") {{ $t('home.userSurvey') }}
        template(#forumLink)
          a(href="https://forum.activitywatch.net/c/features") {{ $t('home.voteOnFeatures') }}

  hr

  div.row
    div.col-md-6
      h4 {{ $t('home.spreadTheWord') }}
      p {{ $t('home.spreadMessage') }}
      ul
        li
          i18n(path="home.alternativeTo" tag="span")
            template(#link)
              a(href="https://alternativeto.net/software/activitywatch/") AlternativeTo
        li
          i18n(path="home.productHunt" tag="span")
            template(#link)
              a(href="https://www.producthunt.com/posts/activitywatch") ProductHunt
        li
          i18n(path="home.socialMedia" tag="span")
            template(#twitterLink)
              a(href="https://twitter.com/ActivityWatchIt") Twitter
            template(#facebookLink)
              a(href="https://www.facebook.com/ActivityWatch") Facebook
        li
          i18n(path="home.starOnGithub" tag="span")
            template(#link)
              a(href="https://github.com/ActivityWatch/activitywatch") GitHub

    div.col-md-6
      h4 {{ $t('home.supportUs') }}
      p {{ $t('home.supportMessage') }}
      ul
        li #[a(href="https://www.patreon.com/erikbjare") Patreon]
        li #[a(href="https://opencollective.com/activitywatch") Open Collective]
        li #[a(href="https://liberapay.com/ActivityWatch/") Liberapay]
        li #[a(href="https://activitywatch.net/donate/") {{ $t('home.otherMethods') }}] {{ $t('home.includingCrypto') }}
      p
        i18n(path="home.donationPageInfo" tag="span")
          template(#link)
            a(href="https://activitywatch.net/donate/") {{ $t('home.donationPage') }}

  hr

  div.row
    div.col-md-6
      h4 {{ $t('home.resources') }}
      p
        ul
          li #[a(href="https://activitywatch.net/") {{ $t('home.website') }}]
          li #[a(href="https://activitywatch.readthedocs.org/") {{ $t('home.documentation') }}]
          li #[a(href="https://forum.activitywatch.net/") {{ $t('home.forum') }}]
          li #[a(href="https://discord.gg/vDskV9q") {{ $t('home.discord') }}]
          li #[a(href="https://github.com/ActivityWatch/activitywatch") {{ $t('home.github') }}]
          li(v-if="!info.version.includes('rust')") #[a(href="/api/") {{ $t('home.apiBrowser') }}]

    div.col-md-6
      h4 {{ $t('home.workingOn') }}
      p
        i18n(path="home.devUpdates" tag="span")
          template(#link)
            a(href="https://forum.activitywatch.net/c/news") {{ $t('home.developmentUpdates') }}

  hr

  p
    small
      i
        i18n(path="home.landingPageHint" tag="span")
          template(#settingsLink)
            router-link(to="/settings") {{ $t('home.settings') }}

</template>

<script lang="ts">
import { mapState } from 'pinia';
import { useServerStore } from '~/stores/server';

export default {
  name: 'Home',
  computed: {
    ...mapState(useServerStore, ['info']),
  },
};
</script>
