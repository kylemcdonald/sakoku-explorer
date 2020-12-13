<script>
  import { onMount } from "svelte";
  import { Calendar } from "@fullcalendar/core";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import timeGridPlugin from "@fullcalendar/timegrid";
  import tippy from "tippy.js";
  import "tippy.js/dist/tippy.css";
  import { eventCache } from "../backends";
  import { nearest } from "../nearest";
  import { _ } from "../i18n";
import { toggle_class } from "svelte/internal";
  let cal;

  let eventSourceCache = {};

  const colorScheme = {
    google: {
      adsActivity: "#ef6b88",
      youtubeSearchActivity: "#c2ef63",
      youtubeWatchActivity: "#be51ed",
      imageSearchActivity: "#70d9ea",
      imageViewActivity: "#63efa2",
      mapsActivity: "#5f9bee",
      searchActivity: "#e156e3",
      visitedActivity: "#48dd9d",
    },
    facebook: {
      comments: "#ef6b88",
      visited: "#c2ef63",
      viewed: "#be51ed",
      searchHistory: "#70d9ea",
      offFacebookActivity: "#63efa2",
      notifications: "#5f9bee",
      likesAndReactions: "#e156e3",
      friends: "#48dd9d",
    },
  };

  // function getMostRecentDateFromEvents(events) {
  //   if (events.length == 0) {
  //     return;
  //   }
  //   const mostRecent = events
  //     .map((e) => new Date(e.start))
  //     .reduce((a, b) => Math.max(a, b));
  //   return mostRecent;
  // }

  function eventComparator(a, b) {
    return a.start < b.start ? -1 : +1;
  }

  function getEventGenerator(events) {
    events.sort(eventComparator);
    return (info, success, failure) => {
      try {
        const startIndex = nearest(
          events,
          { start: info.start },
          eventComparator
        );
        const endIndex = nearest(
          events,
          { start: info.end },
          eventComparator,
          startIndex
        );
        console.log(events, info.start, info.end, startIndex, endIndex);
        success(events.slice(startIndex, endIndex));
      } catch (e) {
        console.log("out of bounds");
        success([]);
      }
    };
  }

  function addEventSources(loader, eventsCollection) {
    const backendName = loader.split("/")[0];
    for (const [key, events] of Object.entries(eventsCollection)) {
      const id = backendName + "/" + key;
      const color = colorScheme[backendName][key];
      events.sort(eventComparator);
      eventSourceCache[id] = {
        events: events.slice(-500), //getEventGenerator(events),
        color: color,
        id: id,
      };
    }
    window.eventSourceCache = eventSourceCache;
  }

  function getMostRecentDateFromEventSources(sources) {
    try {
      console.log(sources);
      const mostRecent = Object.values(sources)
        .map((source) => source.events.slice(-1)[0].start)
        .reduce((a, b) => Math.max(a, b));
      return mostRecent;
    } catch (e) {
      return new Date();
    }
  }

  onMount(async () => {
    for (const [loader, eventCollection] of Object.entries(eventCache)) {
      addEventSources(loader, eventCollection);
    }

    // jump to most recent date
    const mostRecent = getMostRecentDateFromEventSources(eventSourceCache);

    let elt = cal;
    const calendar = new Calendar(elt, {
      plugins: [dayGridPlugin, timeGridPlugin],
      eventSources: Object.values(eventSourceCache),
      aspectRatio: 2,
      eventDidMount: (info) => {
        tippy(info.el, {
          content: info.event.title,
          duration: 0,
        });
      },
      eventClick: (info) => {
        info.jsEvent.preventDefault();
        if (info.event.url) {
          window.open(info.event.url);
        }
      },
      defaultTimedEventDuration: "00:30",
      scrollTime: "9:00AM",
      initialView: "timeGridWeek",
      initialDate: mostRecent,
      headerToolbar: {
        left: "today prev,next",
        center: "title",
        right: "dayGridMonth,timeGridWeek",
      },
      allDaySlot: false,
      dayHeaderFormat: {
        weekday: "long",
      },
    });
    calendar.render();
    window.calendar = calendar;
    window.eventCache = eventCache;
  });

  function toggleEventSource(eventSourceId) {
    const eventSource = calendar.getEventSourceById(eventSourceId);
    if (eventSource !== null) {
      eventSource.remove();
    } else {
      calendar.addEventSource(eventSourceCache[eventSourceId]);
    }
  }
</script>

<style>
  /* hide the time in calendar events */
  :global(.fc-event-time) {
    display: none;
  }
  legend {
    position: fixed;
    bottom: 0;
  }
  legend > button {
    color: white;
    font-size: 0.5em;
    font-weight: 900;
    font-style: italic;
    padding: 2px 4px;
    background-color: #ef6b88;
    border: 1px solid white;
    border-radius: 3px;
  }
</style>

<h1 class="sr-only">Calendar</h1>
<div bind:this={cal} id="sakocal" />
<legend>
  {#each Object.keys(eventSourceCache) as name}
    <button
      class=".fc-event"
      on:click={toggleEventSource(name)}
      style="background-color:{colorScheme[name.split('/')[0]][name.split('/')[1]]}">{$_('overview.' + name)}</button>
  {/each}
</legend>
