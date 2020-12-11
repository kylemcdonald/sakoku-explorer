<script>
  import { _ } from "../i18n";
  import Same from "../components/Same.svelte";

  let curGame = "same-websites";
  let groupNumber = 1;
  let nickname = "";
</script>

<style>
  .top-block {
    margin: 0.5em;
  }

  input {
    margin-right: 0.5em;
    font-family: Roboto;
    font-size: 1em;
  }
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

<div class="top-block">
  {$_('games.group')}
  <input bind:value={groupNumber} style="width: 2em" type="number" />
  {$_('games.nickname')}
  <input bind:value={nickname} style="width: 6em" type="text" />
</div>

{#if curGame === 'same-websites'}
  <Same type="websites" {groupNumber} {nickname} />
{/if}

{#if curGame === 'same-videos'}
  <Same type="videos" {groupNumber} {nickname} />
{/if}

{#if curGame === 'same-searches'}
  <Same type="searches" {groupNumber} {nickname} />
{/if}
