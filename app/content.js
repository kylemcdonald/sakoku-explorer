const electron = require('electron');
const facebook = require('./facebook');
const google = require('./google');
const copy = require('./copy.json');
const computerId = require('node-machine-id').machineIdSync({original: true});

// const endpoint = 'http://localhost:8080';
const endpoint = 'https://sakoku.uc.r.appspot.com';
const backends = [
    facebook,
    google
];
let calendar = null;
let lang = 'en';

const colorScheme = {
    'facebook': '#9b5de5', // light purple
    'google': '#f15bb5' // light pink
//  - Yellow #fee440
//  - Light blue #00bbf9
//  - Cyan #00f5d4
};

function setView(viewName) {
    let viewId = viewName + '-view';
    let viewsElt = document.getElementById('views');
    for (e of viewsElt.children) {
        if (e.id === viewId) {
            e.style.display = 'block';
        } else {
            e.style.display = '';
        }
    }
}

function hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
}

function getMostRecentDate(events) {
    const dates = events.map(e => new Date(e.start));
    const mostRecent = Math.max(...dates);
    return new Date(mostRecent);
}

async function addCalendarData(name, eventsCollection) {
    const color = colorScheme[name];
    for (key in eventsCollection) {
        const id = name + '.' + key;
        const existingEventSource = calendar.getEventSourceById(id);
        if (existingEventSource != null) {
            // remove any existing event source with this same id
            existingEventSource.remove();
        }
        const events = eventsCollection[key];
        const eventSource = {
            'events': events,
            'color': color,
            'id': id
        };
        calendar.addEventSource(eventSource);
        calendar.gotoDate(getMostRecentDate(events));
    }
}

function spell(x) {
    try {
        if (lang in x) {
            return x[lang];
        }
        return x['en'];
    } catch (err) {
        return x;
    }
}

async function addOverviewData(name, eventsCollection) {
    let containerId = name + '-container';
    let existingContainer = document.getElementById(containerId);
    if (existingContainer != null) {
        existingContainer.remove();
    }
    let html = `<div id="${containerId}"><h1>${spell(copy.backends[name].name)}</h1>`;
    for (key in eventsCollection) {
        let total = eventsCollection[key].length;
        html += `<h2>${spell(copy.backends[name].source[key])} total: ${total}</h2>`;
    }
    html += `<div>${spell(copy.views.overview.advice[name])}</div>`;
    html += '</div>';
    document.getElementById('overview-view').innerHTML += html;
}

async function loadFromDirectory(dir) {
    console.log('Loading directory: ' + dir);
    backends.map(backend => {
        try {
            backend.loadDirectory(dir);
            console.log('Loaded with backend: ' + backend.name);
            console.log(backend.events);
            addCalendarData(backend.name, backend.events);
            addOverviewData(backend.name, backend.events);
        } catch (err) {
            if (err != 'Invalid directory') {
                console.error(err);
            }
        }
    })
}

function setupCalendar() {
    let today = new Date().toISOString().split('T')[0];
    let elt = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(elt, {
        aspectRatio: 2,
        // eventDidMount: function(info) {
        //     var tooltip = new Tooltip(info.el, {
        //         title: info.event.title,
        //         placement: 'top',
        //         trigger: 'hover',
        //         container: 'body'
        //     });
        // },
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
}

function prepareDataAwardsData() {
    let groupNumber = document.getElementById('group-number').value;
    let data = {};
    for (backend of backends) {
        let totals = {};
        const events = backend.events;
        if (events === undefined) {
            continue;
        }
        for (key in events) {
            totals[key] = events[key].length;
        }
        data[backend.name] = totals;
    }
    data = {
        'totals': data,
        'id': computerId,
        'group': groupNumber
    }
    data = JSON.stringify(data);
    document.getElementById('data-awards-data').innerText = data;
}

async function uploadDataAwardsData() {
    let data = document.getElementById('data-awards-data').value;
    console.log(data);
    const response = fetch(endpoint + '/submit/data-awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data
    });
    console.log(await response);
}

function prepareSameWebsitesData() {
    let groupNumber = document.getElementById('group-number').value;
    let data = {};
    for (backend of backends) {
        let totals = {};
        const events = backend.events;
        if (events === undefined) {
            continue;
        }
        for (key in events) {
            totals[key] = events[key].length;
        }
        data[backend.name] = totals;
    }
    data = {
        'totals': data,
        'id': computerId,
        'group': groupNumber
    }
    data = JSON.stringify(data);
    document.getElementById('data-awards-data').innerText = data;
}

function prepareSameWebsitesData() {
    let groupNumber = document.getElementById('group-number').value;
    let data = {};
    for (backend of backends) {
        let totals = {};
        const events = backend.events;
        if (events === undefined) {
            continue;
        }
        for (key in events) {
            totals[key] = events[key].length;
        }
        data[backend.name] = totals;
    }
    data = {
        'websites': data,
        'id': computerId,
        'group': groupNumber
    }
    data = JSON.stringify(data);
    document.getElementById('same-websites-data').innerText = data;
}

function setupComputerId() {
    document.getElementById('computer-id').innerHTML = computerId;
}

async function addFolderDialog() {
    let options = {properties:['openDirectory']};
    let selected = await electron.remote.dialog.showOpenDialog(options);
    for (let f of selected.filePaths) {
        loadFromDirectory(f);
    }
}

let holder = document.getElementById('drop-point');
holder.ondragover = () => { return false; };
holder.ondragleave = () => { return false; };
holder.ondragend = () => { return false; };
holder.ondrop = (e) => {
    e.preventDefault();
    for (let f of e.dataTransfer.files) {
        loadFromDirectory(f.path);
    }
    return false;
};

setupCalendar();
setupComputerId();
hideOverlay();
loadFromDirectory('/Users/kyle/Desktop/ycam-downloaded-data/kyle/facebook-json');
// loadFromDirectory('/Users/kyle/Desktop/ycam-downloaded-data/kyle/Takeout-jp');
// loadFromDirectory('/Users/kyle/Desktop/ycam-downloaded-data/kyle/Takeout');