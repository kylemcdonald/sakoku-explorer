<script>
  import { onMount } from "svelte";
  import { _ } from "../i18n";
  import { eventCache } from "../backends";

  export let type;

  const endpoint = "https://sakoku.uc.r.appspot.com";

  let groupNumber = "1";
  let nickname = "";
  let preparedData = "";

  const typeToKey = {
    websites: "site",
    videos: "video",
    searches: "search",
  };

  function removeLongestItems(list, maxLength) {
    const lengths = list.map((e) => e.length);
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
    return list.filter((e) => e.length <= threshold);
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
    data[type] = filteredItems.slice(0, 30000);
    preparedData = JSON.stringify(data);
  }

  async function shareData() {
    const response = fetch(endpoint + "/submit/same-" + type, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: preparedData,
    });
    console.log(await response);
  }

  onMount(async () => {
    //   prepareSameData();
  });
</script>

<style>
  .top-block {
    margin: 0.5em;
  }

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

  input {
    margin-right: 0.5em;
    font-family: Roboto;
    font-size: 1em;
  }
</style>

<div class="top-block">
  {$_('games.group')}
  <input bind:value={groupNumber} style="width: 2em" type="number" />
  {$_('games.nickname')}
  <input bind:value={nickname} style="width: 6em" type="text" />
</div>

<div class="center-block">
  <h1>{$_('games.same-' + type + '-header')}</h1>
  <textarea bind:value={preparedData} />
  <button
    class="data-button"
    on:click={prepareSameData}>{$_('games.prepare-data')}</button>
  <button
    class="data-button"
    on:click={shareData}>{$_('games.share-data')}</button>
  <p>
    <span class="emphasis"> {$_('games.same-' + type + '-question')} </span>
    {$_('games.same-' + type + '-description')}
  </p>
</div>
