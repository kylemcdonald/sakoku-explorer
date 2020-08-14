/*
Colors:
 - Light purple #9b5de5 # google search
 - Light pink #f15bb5 # google visited
 - Yellow #fee440
 - Light blue #00bbf9
 - Cyan #00f5d4
*/

const stringHash = require('string-hash');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const machineId = require('node-machine-id').machineIdSync();
const electron = require('electron');

function openInBrowser(url) {
  electron.shell.openExternal(url);
}

function fixFacebookEncoding(data) {
    return iconv.decode(iconv.encode(data, 'latin1'), 'utf-8');
}

function loadJson(fn) {
    const dataRaw = fs.readFileSync(fn, 'utf8');
    const data = JSON.parse(dataRaw);
    return data;
}

let facebookEvents = [];
let googleEvents = [];
function setupCalendar() {
    let events = facebookEvents.concat(googleEvents);
    let today = new Date().toISOString().split('T')[0];
    let elt = document.getElementById('calendar');
    let calendar = new FullCalendar.Calendar(elt, {
        aspectRatio: 2,
        eventDidMount: function(info) {
            var tooltip = new Tooltip(info.el, {
                title: info.event.title,
                placement: 'top',
                trigger: 'hover',
                container: 'body'
            });
        },
        initialView: 'timeGridWeek',
        initialDate: today,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: events
    });
    calendar.render();
}

function convertOffFacebookActivityToEvents(data) {
    let events = [];
    data['off_facebook_activity'].forEach(e => {
        let name = fixFacebookEncoding(e['name']);
        e['events'].forEach(e => {
            let title = name;
            let type = e['type'];
            if (type != 'CUSTOM') {
                title += ' ' + type.toLowerCase();
            }
            let timestamp = new Date(e['timestamp'] * 1000);
            events.push({
                title: title,
                start: timestamp.toISOString()
            })
        })
    })
    return events;
}

function convertFacebookMessagesToEvents(dir) {
    let events = [];
    fs.readdirSync(dir).forEach(e => {
        let chatDir = path.join(dir, e);
        fs.readdirSync(chatDir).forEach(e => {
            if (e.includes('.json')) {
                let fn = path.join(chatDir, e);
                let chat = loadJson(fn);
                let title = fixFacebookEncoding(chat['title']);
                chat['messages'].forEach(e => {
//                     let title = fixFacebookEncoding(e['sender_name']);
                    let timestamp = new Date(e['timestamp_ms']);
                    events.push({
                        title: title,
                        start: timestamp.toISOString()
                    })
                })
            }
        })
    })
    return events;
}

function loadFacebookData(dir) {
    try {
        const peerGroupFn = path.join(dir, 'about_you', 'friend_peer_group.json');
        const peerGroupData = loadJson(peerGroupFn);
        let peerGroup = fixFacebookEncoding(peerGroupData['friend_peer_group']);
        // let elt = document.getElementById('friend_peer_group');
        // elt.innerText = 'Your peer group: ' + peerGroup;
    } catch (err) {
        console.error(err);
    }

    let events = [];

    try {
        const activityFn = path.join(dir, 'ads_and_businesses', 'your_off-facebook_activity.json');
        const activityData = loadJson(activityFn);
        const activityEvents = convertOffFacebookActivityToEvents(activityData);
        activityEvents.forEach(e => {
            e['backgroundColor'] = '#d62828'
            e['borderColor'] = '#d62828'
            events.push(e)
        })
    } catch (err) {
        console.error(err);
    }

    try {
        const messagesDir = path.join(dir, 'messages', 'inbox');
        const messagesEvents = convertFacebookMessagesToEvents(messagesDir);
        messagesEvents.forEach(e => {
            e['backgroundColor'] = '#fcbf49'
            e['borderColor'] = '#fcbf49'
            events.push(e)
        })
    } catch (err) {
        console.error(err);
    }

    if (events.length > 0) {
        facebookEvents = events;
        setupCalendar();
    }
}

let parser = new DOMParser();
function htmlDecode(input) {
    // this is slow, so we don't run it for now
//   var doc = parser.parseFromString(input, "text/html");
//   return doc.documentElement.textContent;
    // fast but incomplete
    input = input
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
    return input;
}

function getAllGoogleSearchEN(dir) {
    console.log('Loading English search activity');
    const fn = path.join(dir, 'My Activity', 'Search', 'MyActivity.html');
    if (!fs.existsSync(fn)) {
        console.log('Could not load English search activity');
        return false;
    }
    const data = fs.readFileSync(fn, 'utf8');
    const matches = data.matchAll('Searched for.+?>(?<title>.+?)</a><br>(?<datetime>.+?)<', 'g');
    return [...matches].map(e => e.groups);
}

function getAllGoogleVisitedEN(dir) {
    console.log('Loading English visited activity');
    const fn = path.join(dir, 'My Activity', 'Search', 'MyActivity.html');
    if (!fs.existsSync(fn)) {
        console.log('Could not load English visited activity');
        return false;
    }
    const data = fs.readFileSync(fn, 'utf8');
    const matches = data.matchAll('Visited.+?q=(?<url>http.+?)(&amp;usg=.+?)?">(?<title>.+?)</a><br>(?<datetime>.+?)<', 'g');
    return [...matches].map(e => e.groups);
}

function getAllGoogleSearchJP(dir) {
    console.log('Loading Japanese search activity');
    const fn = path.join(dir, 'マイ アクティビティ', '検索', 'マイアクティビティ.html');
    if (!fs.existsSync(fn)) {
        console.log('Could not load Japanese search activity');
        return false;
    }    
    const data = fs.readFileSync(fn, 'utf8');
    const matches = data.matchAll('body-1">「 <a .+?>(?<title>.+?)</a> 」を検索しました<br>(?<datetime>.+?)( JST)?<', 'g');
    return [...matches].map(e => e.groups);
}

function getAllGoogleVisitedJP(dir) {
    console.log('Loading Japanese visited activity');
    const fn = path.join(dir, 'マイ アクティビティ', '検索', 'マイアクティビティ.html');
    if (!fs.existsSync(fn)) {
        console.log('Could not load Japanese visited activity');
        return false;
    }    
    const data = fs.readFileSync(fn, 'utf8');
    const matches = data.matchAll('q=(?<url>http.+?)(&amp;usg=.+?)?">(?<title>.+?)</a> にアクセスしました<br>(?<datetime>.+?)( JST)?<', 'g');
    return [...matches].map(e => e.groups);
}

function convertGoogleSearchVisitedToEvents(matches, maxResults) {
    if (maxResults) {
        matches = matches.slice(0, maxResults);
    }
    let events = []
    matches.forEach(e => {
        const title = htmlDecode(e.title);
        const datetime = new Date(Date.parse(e.datetime));
        events.push({
            title: title,
            start: datetime.toISOString()
        })
    })
    return events;
}

function convertGoogleSearchToUnique(matches) {
    return new Set(matches.map(e => htmlDecode(e.title)));
}

function convertGoogleVisitedToDomains(matches) {
    let domains = [];
    matches.forEach(e => {
        try {
            const url = e.url;
            const domain = (new URL(url)).hostname;
            domains.push(domain);
        } catch (err) {
            console.log('Could not parse URL: ' + e.url);
        }
    })
    return new Set(domains);
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

var hashedDomains = {};

async function postDomainData(request) {
    console.log(request);
    const url = 'http://35.222.106.237/submit'
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request) // body data type must match "Content-Type" header
    });
    const data = await response.json();
    
    console.log(data);
    
    const mostCommonCount = Math.max(...Object.values(data));
    console.log('mostCommonCount: ' + mostCommonCount);

    const leastCommon = [];
    const mostCommon = [];
    for (const [hashedDomain, value] of Object.entries(data)) {
        const domain = hashedDomains[hashedDomain];
        if (value == 2) {
            leastCommon.push(domain);
        }
        if (value == mostCommonCount) {
            mostCommon.push(domain);
        }
    }

    console.log(mostCommon);

    let mostCommonb64 = mostCommon.slice(0,5).join('%0A');
    let leastCommonb64 = leastCommon.slice(0,5).join('%0A');

    console.log(mostCommonb64);
    console.log(leastCommonb64);

    let b64 = btoa('enter');
    document.getElementById('hangman').innerHTML = 
        "<a href=\"javascript:openInBrowser('https://www.hangmanwords.com/play/custom-" + btoa(mostCommonb64) + "');\">Domain Hangman (" + mostCommonCount + " people)</a> " + 
        "<a href=\"javascript:openInBrowser('https://www.hangmanwords.com/play/custom-" + btoa(leastCommonb64) + "');\">Domain Hangman (2 people)</a>";

}

function loadGoogleData(dir) {
    let events = [];
    
    const maxResults = 10000;

    let totalDataPoints = 0;

    try {
        const matches = getAllGoogleSearchEN(dir) || getAllGoogleSearchJP(dir);
        const searchEvents = convertGoogleSearchVisitedToEvents(matches, maxResults);
        searchEvents.forEach(e => {
            let color = '#9b5de5';
            e['backgroundColor'] = color;
            e['borderColor'] = color;
            events.push(e)
        })

        totalDataPoints += matches.length;

        const uniqueResults = convertGoogleSearchToUnique(matches);
        console.log(uniqueResults);
    } catch (err) {
        console.error(err);     
    }

    try {
        const matches = getAllGoogleVisitedEN(dir) || getAllGoogleVisitedJP(dir);
        const visitedEvents = convertGoogleSearchVisitedToEvents(matches, maxResults);
        visitedEvents.forEach(e => {
            let color = '#f15bb5';
            e['backgroundColor'] = color;
            e['borderColor'] = color;
            events.push(e)
        })

        totalDataPoints += matches.length;

        const domains = convertGoogleVisitedToDomains(matches);

        hashedDomains = {};
        domains.forEach(e => {
            const hashedDomain = stringHash(e);
            hashedDomains[hashedDomain] = e;
        })
        const request = {
            machineId: machineId,
            hashedDomains: Object.keys(hashedDomains)
        }
        postDomainData(request);
    } catch (err) {
        console.error(err);
    }

    document.getElementById('stats').innerText = 'Total Data Points: ' + totalDataPoints;

    if (events.length > 0) {
        googleEvents = events;
        setupCalendar();
    }
}

loadFacebookData('/Users/kyle/Desktop/downloaded-data/kyle/facebook-json');
// loadGoogleData('/Users/kyle/Desktop/downloaded-data/kyle/Takeout');

// file drag-drop
let holder = document.getElementById('drag-file');
holder.ondragover = () => { return false; };
holder.ondragleave = () => { return false; };
holder.ondragend = () => { return false; };
holder.ondrop = (e) => {
    e.preventDefault();
    for (let f of e.dataTransfer.files) {
        console.log('File(s) you dragged here: ', f.path);
        try {
            console.log('Attempting to load Facebook data')
            loadFacebookData(f.path);
        } catch (err) {
            console.log('Count not load Facebook data')
        }
        try {
            console.log('Attempting to load Google data')
            loadGoogleData(f.path);
        } catch (err) {
            console.log('Count not load Google data')
        }
    }
    return false;
};