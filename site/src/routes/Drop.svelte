<script>
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

  h1 {
    font-size: 1em;
  }

  p {
    font-size: 0.8em;
  }

  #arrow {
    width: 0.6em;
  }
  #drop-text {
    width: calc(100% - 1.3em);
    margin-left: 0.6em;
    float: right;
  }
  .drop {
    position: relative;
  }

  #google-header {
    position: absolute;
    top: 0.5em;
    left: 1em;
    display: none;
  }
  #facebook-header {
    position: absolute;
    top: 0.5em;
    right: 1em;
    display: none;
  }

  .icon {
    height: 0.9em;
    margin-right: 0.25em;
  }
</style>

<div class="center-block center-block-flex">
  <div class="left-col">
    <img src="../assets/floppy.svg" alt={$_('drop.floppy-alt')} />
  </div>
  <div class="right-col">
    <div class="drop">
      <Dropzone
        on:drop={handleFilesSelect}
        accept=""
        containerStyles="border: 2px dotted black; background: white; margin-bottom: 1em; cursor: pointer;">
        <p/>
      </Dropzone>
      <h2 id="google-header">
        <img
          src="../assets/google.png"
          alt=""
          class="icon" />{$_('overview.google-header')}
      </h2>
      <h2 id="facebook-header">
        <img
          src="../assets/facebook.png"
          alt=""
          class="icon" />{$_('overview.facebook-header')}
      </h2>
    </div>
    <img id='arrow' src='../assets/arrow.svg' alt=''>
    <div id='drop-text'>
      <h1>{$_('drop.header')}</h1>
      <p>{$_('drop.description')}</p>
    </div>
  </div>
</div>
