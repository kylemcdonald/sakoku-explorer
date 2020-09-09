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

// throws an error if the file does not exist
function loadRegexGroups(fn, regex) {
    const data = fs.readFileSync(fn, 'utf8');
    const matches = data.matchAll(regex, 'g');
    return [...matches].map(e => e.groups);
}

// need a more comprehensive solution that is still fast
function decodeHtmlEntities(input) {
    input = input
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
    return input;
}

// throws an error if the file is not found
function loadSearchActivity(dir, lang) {
    const fn = {
        'en': path.join(dir, 'My Activity', 'Search', 'MyActivity.html'),
        'jp': path.join(dir, 'マイ アクティビティ', '検索', 'マイアクティビティ.html')
    }[lang];
    const regex = {
        'en': 'Searched for.+?>(?<title>.+?)</a><br>(?<datetime>.+?)<',
        'jp': 'body-1">「 <a .+?>(?<title>.+?)</a> 」を検索しました<br>(?<datetime>.+?)( JST)?<'
    }[lang];
    let events = loadRegexGroups(fn, regex).map(e => {
        return {
            title: decodeHtmlEntities(e.title),
            start: new Date(Date.parse(e.datetime)).toISOString()
        }
    })
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
        events.searchActivity = loadSearchActivity(dir, lang);
    } catch (err) {
        console.log('no search activity');
        console.log(err)
    }

    module.exports.events = events;
}