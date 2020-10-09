const fs = require('fs');
const path = require('path');
const common = require('./common');

// private
let rootDir = null;
let lang = null;
let events = { };

// public
module.exports = {
    name: 'google'
};

// language-agnostic "activity" loader
// ignores the "products" and "locations" section
function loadActivity(fn) {
    const data = common.readFileSync(fn, 'utf8');
    const parts = data.split('outer-cell');
    const titleRe = /title">(.+?)<br/s;
    const bodyRe = /body-1">(.+?)<\/div/s;
    const linkRe = /<a href="(?<url>.+?)">(?<text>.+?)<\/a>/gs;
    const datetimeRe = />([^<]+)$/;
    const pieces = parts.slice(1).map(e => {
        const pieces = e.split('<div');
        const body = pieces[3].match(bodyRe)[1];
        return {
            body: body,
            title: pieces[2].match(titleRe)[1],
            links: [...(body.matchAll(linkRe))].map(e=>e.groups),
            start: new Date(Date.parse(body.match(datetimeRe)[1])).toISOString()
        }
    });
    return pieces;
}

// need a more comprehensive solution that is still fast
function decodeHtmlEntities(input) {
    input = input
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
    return input;
}

function extractUrlFromVisited(url) {
    url = url.replace(/^.+\?q=/, '');
    url = url.replace(/&amp;usg=.+$/, '');
    return url;
}

// throws an error if the file is not found
function loadSearchActivity(dir, lang) {
    const fn = {
        'en': path.join(dir, 'My Activity', 'Search', 'MyActivity.html'),
        'jp': path.join(dir, 'マイ アクティビティ', '検索', 'マイアクティビティ.html')
    }[lang];

    const activity = loadActivity(fn)
        .filter(e=>e.links.length);

    const searchFilter = {
        'en': (e=>e.body.startsWith('Searched')),
        'jp': (e=>e.body.includes('を検索しました')),
    }[lang];
    const visitedFilter = {
        'en': (e=>e.body.startsWith('Visited')),
        'jp': (e=>e.body.includes('にアクセスしました'))
    }[lang];

    const events = {
        'searchActivity': activity
            .filter(searchFilter)
            .map(e => {
                return {
                    title: decodeHtmlEntities(e.links[0].text),
                    url: e.links[0].url,
                    start: e.start
                }
            }),
        'visitedActivity': activity
            .filter(visitedFilter)
            .map(e => {
                const url = extractUrlFromVisited(e.links[0].url);
                const domain = common.extractDomain(url);
                let title = decodeHtmlEntities(e.links[0].text);
                if (title == url) {
                    title = domain;
                }
                return {
                    title: title,
                    url: url,
                    domain: domain,
                    start: e.start
                }
            })
    };

    return events;
}

module.exports.loadDirectory = dir => {
    if (fs.existsSync(path.join(dir, 'archive_browser.html'))) {
        lang = 'en';
    } else if (fs.existsSync(path.join(dir, 'アーカイブ概要.html'))) {
        lang = 'jp';
    } else {
        throw 'Invalid directory';
    }

    rootDir = dir;

    try {
        const start = window.performance.now();
        Object.assign(events, loadSearchActivity(dir, lang)); // 1500ms+
        console.log(window.performance.now() - start);
    } catch (err) {
        console.error('Error loading search activity');
    }

    module.exports.events = events;
}