<script>
  import { _ } from "../i18n";
  import { eventCache } from "../backends";
  window.eventCache = eventCache;
</script>

<style>
  .center-block {
    text-align: left;
    width: 40em;
  }

  .left-col {
    margin-right: 2em;
  }
  .middle-col,
  .right-col {
    margin-left: 2em;
  }

  .icon {
    height: 0.9em;
    margin-right: 0.25em;
  }

  ul,
  li {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .overview {
    line-height: 1.6;
  }

  h3 {
    font-size: 0.5em;
    margin: 4em 0 0 0;
    padding: 0;
  }

  .restrict {
    font-size: 0.5em;
  }
</style>

<h1 class="sr-only">{$_('overview.header')}</h1>

<div class="center-block center-block-flex">
  <div class="left-col">
    <img src="../assets/eyes.svg" alt={$_('overview.eyes-alt')} />
  </div>
  <div class="middle-col">
    <h2 id="google-header">
      <img
        src="../assets/google.png"
        alt=""
        class="icon" />{$_('overview.google-header')}
    </h2>
    <ul aria-labelledby="google-header" role="list" class="overview">
      {#each Object.entries(eventCache) as [loader, eventCollection]}
        {#if loader.startsWith('google/')}
          {#each Object.entries(eventCollection) as [groupName, eventGroup]}
            <li role="listitem">{$_('overview.' + loader + '.' + groupName)}: {eventGroup.length.toLocaleString()}</li>
          {/each}
        {/if}
      {/each}
    </ul>

    <h3 id="google-restrict">{$_('overview.google-restrict-header')}</h3>
    <ul aria-labelledby="google-restrict" role="list" class="restrict">
      <li role="listitem">- {$_('overview.google-restrict-0')}</li>
      <li role="listitem">- {$_('overview.google-restrict-1')}</li>
      <li role="listitem">- {$_('overview.google-restrict-2')}</li>
      <li role="listitem">- {$_('overview.google-restrict-3')}</li>
    </ul>
  </div>

  <div class="right-col">
    <h2 id="facebook-header">
      <img
        src="../assets/facebook.png"
        alt=""
        class="icon" />{$_('overview.facebook-header')}
    </h2>
    <ul aria-labelledby="facebook-header" role="list" class="overview">
      {#each Object.entries(eventCache) as [loader, eventCollection]}
        {#if loader.startsWith('facebook/')}
          {#each Object.entries(eventCollection) as [groupName, eventGroup]}
            <li role="listitem">{$_('overview.' + loader + '.' + groupName)}: {eventGroup.length.toLocaleString()}</li>
          {/each}
        {/if}
      {/each}
    </ul>

    <h3 id="google-restrict">{$_('overview.facebook-restrict-header')}</h3>
    <ul aria-labelledby="facebook-restrict" role="list" class="restrict">
      <li role="listitem">- {$_('overview.facebook-restrict-0')}</li>
      <li role="listitem">- {$_('overview.facebook-restrict-1')}</li>
      <li role="listitem">- {$_('overview.facebook-restrict-2')}</li>
      <li role="listitem">- {$_('overview.facebook-restrict-3')}</li>
    </ul>
  </div>
</div>
