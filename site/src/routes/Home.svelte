<script>
  import { _ } from "../i18n.js";
</script>

<div class="center-block center-block-flex">
  <div class="left-col">
    <img src="../assets/about.svg" alt={$_("about.about-alt")} />
  </div>
  <div class="right-col">
    <h1>{$_("about.header")}</h1>
    <p>{$_("about.description-1")}</p>
    <p>{$_("about.description-2")}</p>
    <p class="disclaimer">{$_("about.disclaimer")}</p>
  </div>
</div>

<style>
  .center-block {
    text-align: left;
  }

  .right-col {
    margin-left: 2em;
  }

  .disclaimer {
    font-size: 0.6em;
    text-transform: uppercase;
    text-align: justify;
  }
</style>
