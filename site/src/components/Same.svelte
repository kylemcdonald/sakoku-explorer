<script>
  import { onMount } from 'svelte';
  import { _ } from "../i18n.js";
  export let type;

	onMount(async () => {
    
	});

</script>

<style>
  .emphasis {
    text-transform: uppercase;
    display: block;
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
  <h1>{$_('games.same-'+type+'-header')}</h1>
  <textarea></textarea>
  <button class='data-button'>{$_('games.prepare-data')}</button>
  <button class='data-button'>{$_('games.share-data')}</button>
  <p>
    <span class='emphasis'>
      {$_('games.same-'+type+'-question')}
    </span>
      {$_('games.same-'+type+'-description')}
  </p>
</div>