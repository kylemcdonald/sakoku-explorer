<script>
  import { onMount } from "svelte";
  import { _ } from "../i18n";
  import { eventCache } from "../backends";

  export let type;
  export let groupNumber;
  export let nickname;

  const endpoint = "https://sakoku.uc.r.appspot.com";

  let preparedData = "";

  const typeToKey = {
    websites: "site",
    videos: "video",
    searches: "search",
  };

  function removeLongestItems(list, maxLength) {
    const valid = list.filter((e) => e);
    const lengths = valid.map((e) => e.length);
    lengths.sort();
    let sum = 0;
    let threshold = lengths[lengths.length - 1];
    for (let i = 0; i < lengths.length; i++) {
      sum += lengths[i];
      if (sum >= maxLength) {
        threshold = lengths[i];
        break;
      }
    }
    return valid.filter((e) => e.length <= threshold);
  }

  function prepareSameData() {
    let inputFieldName = typeToKey[type];
    let items = new Set();
    for (const loader in eventCache) {
      const events = eventCache[loader];
      for (const eventGroup in events) {
        events[eventGroup]
          .filter((e) => inputFieldName in e)
          .forEach((e) => {
            items.add(e[inputFieldName]);
          });
      }
    }
    let data = {
      id: nickname,
      group: groupNumber,
    };
    // remove longest items until we get to a reasonable output size
    const maximumSize = 512 * 1024; // 512KB
    const filteredItems = removeLongestItems([...items], maximumSize);
    data[type] = filteredItems.slice(0, 10000); // only use first 10k results
    preparedData = JSON.stringify(data);
  }

  async function shareData() {
    const response = fetch(endpoint + "/submit/same-" + type, {
      method: "POST",
      mode: "cors",
      headers: { "content-type": "application/json;charset=UTF-8" },
      body: preparedData,
    });
    console.log(await response);
  }

  onMount(async () => {
    //   prepareSameData();
  });
</script>

<div class="center-block">
  <h1>{$_("games.same-" + type + "-header")}</h1>
  <textarea bind:value={preparedData} />
  <button
    class="data-button"
    disabled={nickname === ""}
    on:click={prepareSameData}>{$_("games.prepare-data")}</button
  >
  <button class="data-button" disabled={nickname === ""} on:click={shareData}
    >{$_("games.share-data")}</button
  >
  <p>
    <span class="emphasis"> {$_("games.same-" + type + "-question")} </span>
    {$_("games.same-" + type + "-description")}
  </p>
</div>

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

  .data-button:disabled {
    color: #e5e5e5;
    text-decoration: line-through;
    cursor: not-allowed;
  }

  .data-button:first-of-type {
    margin: 0;
  }

  p {
    margin-top: 2em;
  }

  .center-block {
    margin-top: 2em;
  }
</style>
