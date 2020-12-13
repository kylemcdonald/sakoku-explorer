<script>
  import { onMount } from "svelte";
  import { Calendar } from "@fullcalendar/core";
  import jaLocale from "@fullcalendar/core/locales/ja";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import timeGridPlugin from "@fullcalendar/timegrid";
  import tippy from "tippy.js";
  import "tippy.js/dist/tippy.css";
  import { eventCache } from "../backends";
  import { nearest } from "../nearest";
  import { locale, _ } from "../i18n";
  import { getColor } from "../color";

  let cal;
  let eventSourceCache = {};

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
    const backend = loader.split("/")[0];
    for (const [key, events] of Object.entries(eventsCollection)) {
      const word = loader + "." + key;
      const color = getColor(word);
      events.sort(eventComparator);
      eventSourceCache[word] = {
        events: events, //getEventGenerator(events),
        color: color,
        id: word,
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

  let calendar;
  $: calendar !== undefined && calendar.setOption("locale", $locale);
  onMount(async () => {
    for (const [loader, eventCollection] of Object.entries(eventCache)) {
      addEventSources(loader, eventCollection);
    }

    // jump to most recent date
    const mostRecent = getMostRecentDateFromEventSources(eventSourceCache);

    let elt = cal;
    calendar = new Calendar(elt, {
      plugins: [dayGridPlugin, timeGridPlugin],
      locales: [jaLocale],
      locale: $locale,
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

  function toggleEventSource(elt, eventSourceId) {
    const eventSource = calendar.getEventSourceById(eventSourceId);
    if (eventSource !== null) {
      elt.style.filter = "grayscale(100%)";
      eventSource.remove();
    } else {
      elt.style.filter = "";
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
    z-index: 1;
  }
  legend > button {
    color: white;
    font-size: 0.8em;
    font-weight: 900;
    font-style: italic;
    margin: 0.05em;
    padding: 0.1em 0.2em;
    background-color: black;
    border: 0.1em solid white;
    border-radius: 0.3em;
    box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, 0.2);
  }
</style>

<h1 class="sr-only">Calendar</h1>
<div bind:this={cal} id="sakocal" />
<legend>
  {#each Object.keys(eventSourceCache) as word}
    <button
      class=".fc-event"
      on:click={toggleEventSource(this, word)}
      style="background-color:{getColor(word)}">{$_('calendar.' + word)}</button>
  {/each}
</legend>
