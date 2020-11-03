<script>
  import { Router, Link, Route } from "svelte-routing";
  import Same from '../components/Same.svelte';

  let curGame = 'same-websites';
</script>

<style>
</style>

<nav aria-label='games-nav' class='secondary-nav'>
  <ul role='list'>
    <li role='listitem'><button on:click={() => curGame = 'same-websites'}>Same Websites</button></li>
    <li role='listitem'><button on:click={() => curGame = 'same-videos'}>Same Videos</button></li>
  </ul>
</nav>


{#if curGame === 'same-websites'}
  <Same type='websites'/>
{/if}

{#if curGame === 'same-videos'}
  <Same type='videos'/>
{/if}
