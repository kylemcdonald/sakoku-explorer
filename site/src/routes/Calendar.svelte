<style>
/* hide the time in calendar events */
:global(.fc-event-time) {
    display: none;
}
</style>

<script>
  import { onMount } from "svelte";
  import { Calendar } from "@fullcalendar/core";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import timeGridPlugin from "@fullcalendar/timegrid";
  import tippy from "tippy.js";
  import "tippy.js/dist/tippy.css";
  import { eventCache } from "../backends";

  function getMostRecentDate(events) {
    if (events.length == 0) {
      return;
    }
    window.events = events;
    const mostRecent = events
      .map((e) => new Date(e.start))
      .reduce((a,b) => Math.max(a,b))
    return new Date(mostRecent);
  }

  function addCalendarData(calendar, name, eventsCollection) {
    const color = "#9b5de5"; //colorScheme[name];
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
    let elt = document.querySelector("#calendar");
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
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
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

<div id="calendar" />
