<script>
  import { slide } from 'svelte/transition';
  import Dropzone from "svelte-file-dropzone";
  import { _ } from "../i18n";
  import { used, loadFromFiles } from "../backends";

  function handleFilesSelect(e) {
    const { acceptedFiles } = e.detail;
    loadFromFiles(acceptedFiles);
  }
</script>

<style>
  .center-block {
    text-align: left;
  }

  .right-col {
    margin-left: 2em;
  }
</style>

<div class="center-block center-block-flex">
  <div class="left-col">
    <img src="../assets/floppy.svg" alt={$_('drop.floppy-alt')} />
  </div>
  <div class="right-col">
    <Dropzone
      on:drop={handleFilesSelect}
      accept=""
      containerStyles="border: 2px dotted black; margin-bottom: 1em">
      <p/> <!-- Google Facebook -->
    </Dropzone>
    <h1>{$_('drop.header')}</h1>
    <p>{$_('drop.description')}</p>
  </div>
</div>
