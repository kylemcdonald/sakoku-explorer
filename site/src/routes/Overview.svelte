<script>
  import { _ } from "../i18n.js";
</script>

<style>
  .center-block {
    text-align: left;
    width: 40em;
  }

  .left-col {
    margin-right: 2em;
  }
  .middle-col, .right-col {
    margin-left: 2em;
  }

  .icon {
    height: 0.9em;
    margin-right: 0.25em;
  }

  ul, li {
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

<h1 class='sr-only'>{$_('overview.header')}</h1>

<div class='center-block center-block-flex'>
  <div class='left-col'>
    <img src='../assets/eyes.svg' alt='{$_('overview.eyes-alt')}'>
  </div>
  <div class='middle-col'>
    <h2 id='google-header'><img src='../assets/google.png' alt='' class='icon'>{$_('overview.google-header')}</h2>
    <ul aria-labelledby='google-header' role='list' class='overview'>
      <li role='listitem'>{$_('overview.google-0')}</li>
      <li role='listitem'>{$_('overview.google-1')}</li>
      <li role='listitem'>{$_('overview.google-2')}</li>
      <li role='listitem'>{$_('overview.google-3')}</li>
      <li role='listitem'>{$_('overview.google-4')}</li>
      <li role='listitem'>{$_('overview.google-5')}</li>
      <li role='listitem'>{$_('overview.google-6')}</li>
      <li role='listitem'>{$_('overview.google-7')}</li>
    </ul>

    <h3 id='google-restrict'>{$_('overview.google-restrict-header')}</h3>
    <ul aria-labelledby='google-restrict' role='list' class='restrict'>
      <li role='listitem'>- {$_('overview.google-restrict-0')}</li>
      <li role='listitem'>- {$_('overview.google-restrict-1')}</li>
      <li role='listitem'>- {$_('overview.google-restrict-2')}</li>
      <li role='listitem'>- {$_('overview.google-restrict-3')}</li>
    </ul>
  </div>

  <div class='right-col'>
    <h2 id='facebook-header'><img src='../assets/facebook.png' alt='' class='icon'>{$_('overview.facebook-header')}</h2>
    <ul aria-labelledby='facebook-header' role='list' class='overview'>
      <li role='listitem'>{$_('overview.facebook-0')}</li>
      <li role='listitem'>{$_('overview.facebook-1')}</li>
      <li role='listitem'>{$_('overview.facebook-2')}</li>
      <li role='listitem'>{$_('overview.facebook-3')}</li>
      <li role='listitem'>{$_('overview.facebook-4')}</li>
      <li role='listitem'>{$_('overview.facebook-5')}</li>
      <li role='listitem'>{$_('overview.facebook-6')}</li>
      <li role='listitem'>{$_('overview.facebook-7')}</li>
      <li role='listitem'>{$_('overview.facebook-8')}</li>
    </ul>

    <h3 id='google-restrict'>{$_('overview.facebook-restrict-header')}</h3>
    <ul aria-labelledby='facebook-restrict' role='list' class='restrict'>
      <li role='listitem'>{$_('overview.facebook-restrict-0')}</li>
      <li role='listitem'>{$_('overview.facebook-restrict-1')}</li>
      <li role='listitem'>{$_('overview.facebook-restrict-2')}</li>
      <li role='listitem'>{$_('overview.facebook-restrict-3')}</li>
    </ul>
  </div>
</div>