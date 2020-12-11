<script>
  import { _ } from "../i18n.js";

  let groupNumber = 1;
  let sameWebsites = [];
  let sameVideos = [];
  let sameSearches = [];

  const endpoint = "https://sakoku.uc.r.appspot.com";

  async function getSame(source) {
    const response = await fetch(
      endpoint + "/summary/same-" + source + "/" + groupNumber,
      {
        method: "GET",
        mode: "cors",
      }
    );
    return await response.text();
  }

  // could return json from the server and remove this
  function toCountAndContent(results) {
    return results
      .split("\n")
      .filter((e) => e)
      .map((e) => {
        const parts = e.split(" ");
        return {
          count: parts[0],
          content: parts.slice(1).join(" "),
        };
      });
  }

  function update() {
    getSame("websites").then((e) => {
      sameWebsites = toCountAndContent(e);
    });
    getSame("searches").then((e) => {
      sameSearches = toCountAndContent(e);
    });
    getSame("videos").then((e) => {
      sameVideos = toCountAndContent(e);
    });
  }
</script>

<style>
  button {
    font-style: italic;
    text-transform: uppercase;
    font-size: 0.8em;
    color: black;
    margin-left: 0;
  }

  input {
    margin-right: 0.5em;
    font-family: Roboto;
    font-size: 1em;
  }

  div {
    display: block;
    margin: 1em auto;
  }

  ul,
  li {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li > a {
    color: black;
  }
  li > a:hover {
    color: #e5e5e5;
  }
</style>

<div style="margin: 1em">
  <input bind:value={groupNumber} style="width: 2em" type="number" />
  <button class="data-button" on:click={update}>{$_('admin.update')}</button>
</div>

<div class="center-block center-block-flex">
  <div>
    <h2>{$_('games.same-websites-header')}</h2>

    <ul>
      {#if sameWebsites.length}
        {#each sameWebsites as { count, content }, i}
          <li><a target="_blank" href="//{content}">{content} ({count})</a></li>
        {/each}
      {:else}
        <li>{$_('admin.no-results')}</li>
      {/if}
    </ul>
  </div>

  <div>
    <h2>{$_('games.same-searches-header')}</h2>
    <ul>
      {#if sameSearches.length}
        {#each sameSearches as { count, content }, i}
          <li>
            <a
              target="_blank"
              href="https://www.google.com/search?q={content}">{content}
              ({count})
            </a>
          </li>
        {/each}
      {:else}
        <li>{$_('admin.no-results')}</li>
      {/if}
    </ul>
  </div>

  <div>
    <h2>{$_('games.same-videos-header')}</h2>
    <ul>
      {#if sameVideos.length}
        {#each sameVideos as { count, content }, i}
          <li>
            <a target="_blank" href="https://www.youtube.com/watch?v={content}">{content} ({count}) </a>
            <iframe
              title="YouTube Embed"
              frameborder="0"
              scrolling="no"
              marginheight="0"
              marginwidth="0"
              width="534"
              height="300"
              type="text/html"
              src="https://www.youtube.com/embed/{content}?autoplay=0&fs=1&iv_load_policy=3&showinfo=1&rel=0&cc_load_policy=1&start=0&end=0"><div /></iframe>
          </li>
        {/each}
      {:else}
        <li>{$_('admin.no-results')}</li>
      {/if}
    </ul>
  </div>
</div>
