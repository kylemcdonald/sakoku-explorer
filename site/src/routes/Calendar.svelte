<script>
  import { onMount, tick } from "svelte";
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

  let calendar;
  let calendarElt;
  let legendElt;
  let textVisible = true;
  let eventSourceCache = {};

  let activeTooltips = new Set();

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
        success(events.slice(startIndex, endIndex));
      } catch (e) {
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
      const mostRecent = Object.values(sources)
        .map((source) => source.events.slice(-1)[0].start)
        .reduce((a, b) => Math.max(a, b));
      return mostRecent;
    } catch (e) {
      return new Date();
    }
  }

  function calendarHeight() {
    return legendElt.offsetTop - calendarElt.offsetTop;
  }

  function handleResize() {
    calendar.setHeight(calendarHeight());
  }

  $: calendar !== undefined && calendar.setOption("locale", $locale);
  onMount(async () => {
    for (const [loader, eventCollection] of Object.entries(eventCache)) {
      addEventSources(loader, eventCollection);
    }

    // jump to most recent date
    const mostRecent = getMostRecentDateFromEventSources(eventSourceCache);

    calendar = new Calendar(calendarElt, {
      plugins: [dayGridPlugin, timeGridPlugin],
      locales: [jaLocale],
      locale: $locale,
      eventSources: Object.values(eventSourceCache),
      height: calendarHeight(),
      eventDidMount: (info) => {
        let tooltip = tippy(info.el, {
          content: info.event.title,
          duration: 0,
        });
        activeTooltips.add(tooltip);
        info.el.tooltip = tooltip;
        if (!textVisible) {
          let titleElt = info.el.getElementsByClassName("fc-event-title")[0];
          setEltVisibility(titleElt, false);
          setTooltipVisibility(tooltip, false);
        }
      },
      eventWillUnmount: (info) => {
        activeTooltips.delete(info.el.tooltip);
        info.el.tooltip.destroy();
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

    await tick();
    handleResize();
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

  function setEltVisibility(elt, display) {
    elt.style.display = display ? "" : "none";
  }

  function setTooltipVisibility(tooltip, display) {
    if (display) {
      tooltip.enable();
    } else {
      tooltip.disable();
    }
  }

  function toggleText() {
    if (textVisible) {
      textVisible = false;
    } else {
      textVisible = true;
    }
    [...document.getElementsByClassName("fc-event-title")].forEach((e) => {
      setEltVisibility(e, textVisible);
    });
    activeTooltips.forEach((e) => setTooltipVisibility(e, textVisible));
  }
</script>

<svelte:window on:resize={handleResize} />

<h1 class="sr-only">Calendar</h1>
<div bind:this={calendarElt} id="sakocal" />
<legend bind:this={legendElt}>
  <button on:click={toggleText} style="background-color:white;color:black"
    >{$_("calendar.toggle-text")}</button
  >
  {#each Object.keys(eventSourceCache) as word}
    <button
      on:click={toggleEventSource(this, word)}
      style="background-color:{getColor(word)}">{$_("calendar." + word)}</button
    >
  {/each}
</legend>

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
