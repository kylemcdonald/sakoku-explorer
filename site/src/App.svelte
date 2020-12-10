<script>
  import { Router, Link, Route } from "svelte-routing";

  import Home from "./routes/Home.svelte";
  import Drop from "./routes/Drop.svelte";
  import Overview from "./routes/Overview.svelte";
  import Calendar from "./routes/Calendar.svelte";
  import Games from "./routes/Games.svelte";
  import Admin from "./routes/Admin.svelte";

  import { _, locale } from "./i18n.js";
  import NavLink from "./components/NavLink.svelte";

  export let url = "";
</script>

<style>
  lang {
    float:right
  }

  lang button {
    margin-left: 0.5em;
  }

</style>

<Router {url}>
  <nav aria-label='primary'>
    <ul role='list'>
      <li role='listitem'><NavLink to="/" >Home</NavLink>
      <li role='listitem'><NavLink to="drop-your-data">Drop_Your_Data</NavLink>
      <li role='listitem'><NavLink to="overview">Overview</NavLink>
      <li role='listitem'><NavLink to="calendar">Calendar</NavLink>
      <li role='listitem'><NavLink to="games">Games</NavLink>
    </ul>
    <lang>
      <button on:click={() => ($locale = 'en')} class='{$locale === "en" ? "active" : ""}'>EN</button>
      <button on:click={() => ($locale = 'jp')} class='{$locale === "jp" ? "active" : ""}'>JP</button>
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
    <Route path="admin">
      <Admin />
    </Route>
  </section>
</Router>
