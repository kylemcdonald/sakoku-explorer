<script>
  import { onMount } from "svelte";
  import { Calendar } from "@fullcalendar/core";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import timeGridPlugin from "@fullcalendar/timegrid";
  import tippy from "tippy.js";
  import "tippy.js/dist/tippy.css";
  import { eventCache } from "../backends";
  let cal;

  function getMostRecentDate(events) {
    if (events.length == 0) {
      return;
    }
    window.events = events;
    const mostRecent = events
      .map((e) => new Date(e.start))
      .reduce((a, b) => Math.max(a, b));
    return new Date(mostRecent);
  }

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

  function addCalendarData(calendar, loader, eventsCollection) {
    const backendName = loader.split("/")[0];
    for (const [key, events] of Object.entries(eventsCollection)) {
      const id = backendName + "." + key;
      const color = colorScheme[backendName][key];
      const existingEventSource = calendar.getEventSourceById(id);
      if (existingEventSource != null) {
        // remove any existing event source with this same id
        existingEventSource.remove();
      }
      const eventSource = {
        events: events,
        color: color,
        id: id,
      };
      calendar.addEventSource(eventSource);
    }
  }

  onMount(async () => {
    let today = new Date().toISOString().split("T")[0];
    let elt = cal; //document.querySelector('#calendar');
    const calendar = new Calendar(elt, {
      plugins: [dayGridPlugin, timeGridPlugin],
      aspectRatio: 2,
      eventDidMount: (info) => {
        tippy(info.el, {
          content: info.event.title,
          duration: 0
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
      initialDate: today,
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

    calendar.batchRendering(() => {
      for (const [loader, eventCollection] of Object.entries(eventCache)) {
        addCalendarData(calendar, loader, eventCollection);
      }

      // jump to most recent date
      const mostRecent = getMostRecentDate(calendar.getEvents());
      if (mostRecent !== undefined) {
        calendar.gotoDate(mostRecent);
      }
    });
  });
</script>

<style>
  /* hide the time in calendar events */
  :global(.fc-event-time) {
    display: none;
  }
</style>

<h1 class="sr-only">Calendar</h1>
<div bind:this={cal} id="sakocal" />
