<script>
  import { _ } from "../i18n.js";

  export let key;
  export let groupNumber;
  export let type;

  let results = [];

  const endpoint = "https://sakoku.uc.r.appspot.com";

  async function getSame(source) {
    const response = await fetch(
      endpoint + "/summary/same-" + source + "/" + groupNumber + "?key=" + key,
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
    getSame(type).then((e) => {
      results = toCountAndContent(e);
    });
  }
</script>

<div class="center-block center-block-flex">
  <div>
    {#if type == "searches"}
      <h1>{$_("games.same-searches-header")}</h1>
      <ul>
        {#each results as { count, content }, i}
          <li>
            <a target="_blank" href="https://www.google.com/search?q={content}"
              >{content}
              ({count})
            </a>
          </li>
        {/each}
      </ul>
    {:else if type == "websites"}
      <h1>{$_("games.same-websites-header")}</h1>
      <ul>
        {#each results as { count, content }, i}
          <li>
            <a target="_blank" href="https://www.google.com/search?q={content}"
              >{content}
              ({count})
            </a>
          </li>
        {/each}
      </ul>
    {:else if type == "videos"}
      <h1>{$_("games.same-videos-header")}</h1>
      <ul>
        {#each results as { count, content }, i}
          <li>
            <a target="_blank" href="https://www.youtube.com/watch?v={content}"
              >{content}
              ({count})
            </a>
            <iframe
              title="YouTube Embed"
              frameborder="0"
              scrolling="no"
              marginheight="0"
              marginwidth="0"
              width="534"
              height="300"
              type="text/html"
              src="https://www.youtube.com/embed/{content}?autoplay=0&fs=1&iv_load_policy=3&showinfo=1&rel=0&cc_load_policy=1&start=0&end=0"
              ><div /></iframe
            >
          </li>
        {/each}
      </ul>
    {:else}
      <p>{$_("admin.no-results")}</p>
    {/if}
    <button class="data-button" disabled={key === ""} on:click={update}
      >{$_("admin.update")}</button
    >
  </div>
</div>

<style>
  button {
    font-style: italic;
    text-transform: uppercase;
    font-size: 0.8em;
    color: black;
    margin-left: 0;
  }

  .data-button:disabled {
    color: #e5e5e5;
    text-decoration: line-through;
    cursor: not-allowed;
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
