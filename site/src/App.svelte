<script>
  import { Router, Link, Route } from "svelte-routing";

  import Home from "./routes/Home.svelte";
  import Drop from "./routes/Drop.svelte";
  import Overview from "./routes/Overview.svelte";
  import Calendar from "./routes/Calendar.svelte";
  import Games from "./routes/Games.svelte";

  import { _, locale } from "./i18n.js";

  export let url = "";
</script>

<style>
  lang {
    float:right
  }

</style>

<Router {url}>
  <nav aria-label='primary'>
    <ul role='list'>
      <li role='listitem'><Link to="/" >Home</Link>
      <li role='listitem'><Link to="drop-your-data">Drop_Your_Data</Link>
      <li role='listitem'><Link to="overview">Overview</Link>
      <li role='listitem'><Link to="calendar">Calendar</Link>
      <li role='listitem'><Link to="games">Games</Link>
    </ul>
    <lang>
      <button on:click={() => ($locale = 'jp')} class='{$locale === "jp" ? "selected" : ""}'>JP</button>
      <button on:click={() => ($locale = 'en')} class='{$locale === "en" ? "selected" : ""}'>EN</button>
    </lang>
  </nav>
  <section>
    <Route path="/">
      <Home />
    </Route>
    <Route path="drop-your-data">
      <Drop />
    </Route>
    <Route path="overview">
      <Overview />
    </Route>
    <Route path="calendar">
      <Calendar />
    </Route>
    <Route path="games">
      <Games />
    </Route>
  </section>
</Router>
