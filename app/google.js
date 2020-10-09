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

function parseDatetime(datetime) {
    datetime = datetime.replace('JST', 'UTC+9');
    return new Date(Date.parse(datetime)).toISOString()
}

// language-agnostic "my activity" loader
// ignores the "products" and "locations" section
function loadActivity(fn) {
    const data = fs.readFileSync(fn, 'utf8');
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
            start: parseDatetime(body.match(datetimeRe)[1])
        }
    });
    return pieces;
}

// need a more comprehensive solution that is still fast
function decodeHtmlEntities(input) {
    input = input
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
    return input;
}

const visitedUrlPrefixRe = /^.+url\?q=/;
const visitedUrlPostfixRe = /&amp;usg=.+$/;
function extractUrlFromVisited(url) {
    url = url.replace(visitedUrlPrefixRe, '');
    url = url.replace(visitedUrlPostfixRe, '');
    return url;
}

// function filterActivity(dir, lang, paths)

function loadSearchActivity(dir, lang) {
    const paths = {
        'en': ['My Activity', 'Search', 'MyActivity.html'],
        'jp': ['マイ アクティビティ', '検索', 'マイアクティビティ.html']
    };

    const searchFilter = {
        'en': (e=>e.body.startsWith('Searched')),
        'jp': (e=>e.body.includes('を検索しました')),
    }[lang];
    const visitedFilter = {
        'en': (e=>e.body.startsWith('Visited')),
        'jp': (e=>e.body.includes('にアクセスしました'))
    }[lang];

    const fn = path.join(dir, ...paths[lang]);
    const activity = loadActivity(fn)
        .filter(e=>e.links.length);

    return {
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
                    site: domain,
                    start: e.start
                }
            })
    };
}

function loadYouTubeActivity(dir, lang) {
    const paths = {
        'en': ['My Activity', 'YouTube', 'MyActivity.html'],
        'jp': ['マイ アクティビティ', 'YouTube', 'マイアクティビティ.html']
    };

    const fn = path.join(dir, ...paths[lang]);
    const activity = loadActivity(fn)
        .filter(e=>e.links.length);

    const searchFilter = {
        'en': (e=>e.body.startsWith('Searched')),
        'jp': (e=>e.body.includes('を検索しました')),
    }[lang];
    const watchFilter = {
        'en': (e=>e.body.startsWith('Watched')),
        'jp': (e=>e.body.includes('を視聴しました'))
    }[lang];

    const videoIdRe = /v=(.+)/;

    return {
        'youtubeSearchActivity': activity
            .filter(searchFilter)
            .map(e => {
                return {
                    title: decodeHtmlEntities(e.links[0].text),
                    url: e.links[0].url,
                    start: e.start
                }
            }),
        'youtubeWatchActivity': activity
            .filter(watchFilter)
            .map(e => {
                const url = e.links[0].url;
                const videoId = url.match(videoIdRe)[1];
                return {
                    title: decodeHtmlEntities(e.links[0].text),
                    url: url,
                    video: videoId,
                    start: e.start
                }
            })
    };
}

function loadImageSearchActivity(dir, lang) {
    const paths = {
        'en': ['My Activity', 'Image Search', 'MyActivity.html'],
        'jp': ['マイ アクティビティ', '画像検索', 'マイアクティビティ.html']
    };

    const fn = path.join(dir, ...paths[lang]);
    const activity = loadActivity(fn)
        .filter(e=>e.links.length);

    const searchFilter = {
        'en': (e=>e.body.startsWith('Searched')),
        'jp': (e=>e.body.includes('を検索しました')),
    }[lang];
    const viewFilter = {
        'en': (e=>e.body.startsWith('Viewed')),
        'jp': (e=>e.body.includes('画像を表示'))
    }[lang];

    return {
        'imageSearchActivity': activity
            .filter(searchFilter)
            .map(e => {
                return {
                    title: decodeHtmlEntities(e.links[0].text),
                    url: e.links[0].url,
                    start: e.start
                }
            }),
        'imageViewActivity': activity
            .filter(viewFilter)
            .map(e => {
                return {
                    title: decodeHtmlEntities(e.links[0].text),
                    url: extractUrlFromVisited(e.links[0].url),
                    start: e.start
                }
            })
    };
}

function loadAdsActivity(dir, lang) {
    const paths = {
        'en': ['My Activity', 'Ads', 'MyActivity.html'],
        'jp': ['マイ アクティビティ', 'Ads', 'マイアクティビティ.html']
    };

    const fn = path.join(dir, ...paths[lang]);
    const activity = loadActivity(fn)
        .filter(e=>e.links.length);

    return {
        'adsActivity': activity
            .map(e => {
                const url = extractUrlFromVisited(e.links[0].url);
                const domain = common.extractDomain(url);
                return {
                    title: domain,
                    site: domain,
                    url: url,
                    start: e.start
                }
            })
    };
}

function loadMapsActivity(dir, lang) {
    const paths = {
        'en': ['My Activity', 'Maps', 'MyActivity.html'],
        'jp': ['マイ アクティビティ', 'マップ', 'マイアクティビティ.html']
    };

    const fn = path.join(dir, ...paths[lang]);
    const activity = loadActivity(fn); // do not filter no links

    return {
        'mapsActivity': activity
            .map(e => {
                // "Used maps" with no other info
                if (e.links.length == 0) {
                    return {
                        title: 'Maps',
                        start: e.start
                    }
                }
                return {
                    title: decodeHtmlEntities(e.links[0].text),
                    url: e.links[0].url,
                    start: e.start
                }
            })
    };
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

    [
        [loadSearchActivity, 'Search Activity'],
        [loadYouTubeActivity, 'YouTube Activity'],
        [loadImageSearchActivity, 'ImageSearch Activity'],
        [loadAdsActivity, 'Ads Activity'],
        [loadMapsActivity, 'Maps Activity']
    ].forEach(([loader, name]) => {
        try {
            const start = window.performance.now();
            Object.assign(events, loader(dir, lang));
            const duration = window.performance.now() - start;
            console.log(`Loaded ${name}: ${duration}`);
        } catch (err) {
            console.error(`Error loading ${name}`);
            console.error(err);
        }
    })

    module.exports.events = events;
}