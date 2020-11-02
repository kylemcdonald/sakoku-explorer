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
  <nav>
    <Link to="/">Home</Link>
    <Link to="drop-your-data">Drop_Your_Data</Link>
    <Link to="overview">Overview</Link>
    <Link to="calendar">Calendar</Link>
    <Link to="games">Games</Link>
    <lang>
      <button on:click={() => ($locale = 'jp')}>JP</button>
      <button on:click={() => ($locale = 'en')}>EN</button>
    </lang>
  </nav>
  <div>
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
  </div>
</Router>
