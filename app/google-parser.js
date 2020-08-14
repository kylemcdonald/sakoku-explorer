const fs = require('fs');

function readFile(fn) {
    const data = fs.readFileSync(fn, 'utf8');
    const regex = 'mdl-typography--title">(?<title>.+?)<br>.+?mdl-typography--body-1">(?<body>.+?)</div>';
    const matches = data.matchAll(regex, 'gs');
    return [...matches].map(e => e.groups);
}

const linkRegex = '<a href="(?<url>.+?)">(?<text>.+?)</a>';
const timeRegex = '<br>(?<time>[^<]+?)$';

function parseYouTube(matches) {
    return matches.map(match => {
        const linkMatches = match.body.matchAll(linkRegex, 'gs');
        const links = [...linkMatches].map(e => e.groups);
        const time = match.body.match(timeRegex).groups.time;
        let parsed = {
            product: match.title,
            time: time
        };
        if (links.length == 1) {
            parsed.activity = 'search';
            parsed.title = links[0].text;
            parsed.url = links[0].url;
        } else if (links.length == 2) {
            parsed.activity = 'watch';
            parsed.url = links[0].url;
            parsed.title = links[0].text;
            parsed.channel = links[1].url;
            parsed.account = links[1].text;
        }
        return parsed;
    })
}

function parseMaps(matches) {
    return matches.map(match => {
        const linkMatches = match.body.matchAll(linkRegex, 'gs');
        const links = [...linkMatches].map(e => e.groups);
        const time = match.body.match(timeRegex).groups.time;
        let parsed = {
            product: match.title,
            time: time
        };
        if (links.length == 1) {
            parsed.activity = 'view';
            parsed.title = links[0].text;
            parsed.url = links[0].url;
        }
        return parsed;
    })
}

function parseSearch(matches) {
    return matches.map(match => {
        const linkMatches = match.body.matchAll(linkRegex, 'gs');
        const links = [...linkMatches].map(e => e.groups);
        const time = match.body.match(timeRegex).groups.time;
        let parsed = {
            product: match.title,
            time: time
        };
        if (links.length == 1) {
            parsed.title = links[0].text;
            parsed.url = links[0].url;
            if (url.includes(title)) {
                parsed.url = parsed.title;
            }
            let match = url.match('\\?q=(http.+?)(&amp;usg|$)');
            if (match) {
                url = match[1];
            }
        }
        if (match.body.startsWith('Search') || match.body.includes('検索')) {
            parsed.activity = 'search';
        } else {
            parsed.activity = 'visit';
        }
        return parsed;
    })
}

module.exports = {
    readFile: readFile,
    parseYouTube: parseYouTube,
    parseMaps: parseMaps,
    parseSearch: parseSearch
}