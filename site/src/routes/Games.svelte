<script>
  import { _ } from "../i18n";
  import Same from "../components/Same.svelte";

  let curGame = "same-websites";
</script>

<style>
</style>

<nav aria-label="games-nav" class="secondary-nav">
  <ul role="list">
    <li role="listitem">
      <button
        on:click={() => (curGame = 'same-websites')}
        class={curGame === 'same-websites' ? 'active' : ''}>{$_('games.same-websites-header')}</button>
    </li>
    <li role="listitem">
      <button
        on:click={() => (curGame = 'same-videos')}
        class={curGame === 'same-videos' ? 'active' : ''}>{$_('games.same-videos-header')}</button>
    </li>
    <li role="listitem">
      <button
        on:click={() => (curGame = 'same-searches')}
        class={curGame === 'same-searches' ? 'active' : ''}>{$_('games.same-searches-header')}</button>
    </li>
  </ul>
</nav>

{#if curGame === 'same-websites'}
  <Same type="websites" />
{/if}

{#if curGame === 'same-videos'}
  <Same type="videos" />
{/if}

{#if curGame === 'same-searches'}
  <Same type="searches" />
{/if}
