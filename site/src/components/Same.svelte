<script>
  import { onMount } from 'svelte';
  export let type;

	onMount(async () => {
    
	});

</script>

<style>
  .emphasis {
    text-transform: uppercase;
  }

  .data-button {
    font-style: italic;
    text-transform: uppercase;
    font-size: 0.8em;
    color: black;
    margin-left: 5em;
  }

  .data-button:first-of-type {
    margin: 0;
  }

  p {
    margin-top: 2em;
  }

</style>

<div class='center-block'>
  <div class='content'>
    <h1>Same {type}</h1>
    <textarea></textarea>
    <button class='data-button'>Prepare Data</button>
    <button class='data-button'>Share Data</button>
    <p>
      <span class='emphasis'>
        {#if type === 'websites'}
          What websites and apps has everyone used?
        {:else if type === 'videos'}
          What videos has everyone watched?
        {/if}
      </span>
      Only the names will be sent to the server, not the pages. This is the data that will be sent.
    </p>
  </div>
</div>