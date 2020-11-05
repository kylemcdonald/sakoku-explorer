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
    facebook: "#9b5de5", // light purple
    google: "#f15bb5", // light pink
    //  - Yellow #fee440
    //  - Light blue #00bbf9
    //  - Cyan #00f5d4
  };

  function addCalendarData(calendar, loader, eventsCollection) {
    const backendName = loader.split("/")[0];
    const color = colorScheme[backendName];
    console.log("add to calendar");
    for (const [key, events] of Object.entries(eventsCollection)) {
      const id = name + "." + key;
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
      eventDidMount: function (info) {
        tippy(info.el, {
          content: info.event.title,
        });
      },
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

    console.log(eventCache);
    for (const [loader, eventCollection] of Object.entries(eventCache)) {
      addCalendarData(calendar, loader, eventCollection);
    }

    // jump to most recent date
    const mostRecent = getMostRecentDate(calendar.getEvents());
    if (mostRecent !== undefined) {
      calendar.gotoDate(mostRecent);
    }
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
