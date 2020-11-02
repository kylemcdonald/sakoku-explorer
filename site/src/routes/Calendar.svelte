<script>
  import { onMount } from 'svelte';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import timeGridPlugin from '@fullcalendar/timegrid';

	onMount(async () => {
    let today = new Date().toISOString().split('T')[0];
    let elt = document.querySelector('#calendar');
    const calendar = new Calendar(elt, {
    plugins: [
      dayGridPlugin,
      timeGridPlugin
    ],
    aspectRatio: 2,
    eventDidMount: function(info) {
      const tooltip = new Tooltip(info.el, {
        title: info.event.title,
        placement: 'top',
        trigger: 'hover',
        container: 'body'
      });
    },
    scrollTime: '9:00AM',
    initialView: 'timeGridWeek',
    initialDate: today,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    }
    });
    calendar.render();
	});

</script>

<h1>Calendar</h1>
<p>Let's go!</p>
<div id='calendar'></div>
