<script>
  import { _ } from "../i18n";

  import SameResults from "../components/SameResults.svelte";

  let curSection = "same-websites";
  let key = "";
  let groupNumber = 1;
</script>

<nav aria-label="admin-nav" class="secondary-nav">
  <ul role="list">
    <li role="listitem">
      <button
        on:click={() => (curSection = "same-websites")}
        class={curSection === "same-websites" ? "active" : ""}
        >{$_("games.same-websites-header")}</button
      >
    </li>
    <li role="listitem">
      <button
        on:click={() => (curSection = "same-videos")}
        class={curSection === "same-videos" ? "active" : ""}
        >{$_("games.same-videos-header")}</button
      >
    </li>
    <li role="listitem">
      <button
        on:click={() => (curSection = "same-searches")}
        class={curSection === "same-searches" ? "active" : ""}
        >{$_("games.same-searches-header")}</button
      >
    </li>
  </ul>
</nav>

<div class="top-block">
  {$_("games.group")}
  <input bind:value={groupNumber} style="width: 2em" type="number" />
  {$_("admin.key")}
  <input bind:value={key} style="width: 4em" type="password" />
</div>

{#if curSection === "same-websites"}
  <SameResults type="websites" {groupNumber} {key} />
{/if}

{#if curSection === "same-videos"}
  <SameResults type="videos" {groupNumber} {key} />
{/if}

{#if curSection === "same-searches"}
  <SameResults type="searches" {groupNumber} {key} />
{/if}

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
