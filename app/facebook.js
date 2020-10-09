const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const common = require('./common');

// private
let rootDir = null;
let events = { };
let appInfo = { };

// public
module.exports = {
    name: 'facebook'
};

async function getAppInfo(appId) {
    if (!(appId in appInfo)) {
        let response = await fetch('https://graph.facebook.com/' + appId);
        appInfo[appId] = await response.json();
    }
    return appInfo[appId];
}

function fixFacebookEncoding(data) {
    return iconv.decode(iconv.encode(data, 'latin1'), 'utf-8');
}

function loadOffFacebookActivity(dir) {
    let events = [];
    const fn = path.join(dir, 'ads_and_businesses', 'your_off-facebook_activity.json');
    const data = common.loadJson(fn);
    // console.log(data['off_facebook_activity'][0]);
    // const fbids = new Set();
    // let groups = {};
    data['off_facebook_activity'].forEach(e => {
        let name = fixFacebookEncoding(e['name']);
        e['events'].forEach(e => {
            let title = name;
            const type = e.type;
            if (type != 'CUSTOM') {
                title += ' ' + type;
            }
            const timestamp = new Date(e.timestamp * 1000);
            events.push({
                title: title,
                start: timestamp.toISOString(),
                site: name
            })
            // if (!(type in groups)) {
            //     groups[type] = new Set();
            // }
            // groups[type].add(name);
            // fbids.add(e.id)
        })
    })
    // console.log(groups);
    return {
        'offFacebookActivity': events
    };
}

function loadSearchHistory(dir) {
    let events = [];
    const fn = path.join(dir, 'search_history', 'your_search_history.json');
    const data = common.loadJson(fn);
    return {
        searchHistory: data.searches.map(e => {
            const timestamp = new Date(e.timestamp * 1000);
            // e.attachments[0].data[0] always exists
            // e.data[0] does not always exist
            return {
                title: fixFacebookEncoding(e.attachments[0].data[0].text),
                start: timestamp.toISOString()
            }
        })
    }
}

function flatten(data) {
    if (Array.isArray(data)) {
        return data.flatMap(flatten);
    } else if ('timestamp' in data) {
        return data;
    } else {
        const values = Object.values(data).filter(Array.isArray);
        return flatten(values);
    }
}

function loadTimestamped(fn) {
    const data = flatten(common.loadJson(fn));
    return data.map(e => {
            const timestamp = new Date(e.timestamp * 1000);
            return {
                title: fixFacebookEncoding(e.data.name),
                url: e.data.uri,
                start: timestamp.toISOString()
            }
        })
}

function loadViewed(dir) {
    return {
        viewed: loadTimestamped(path.join(dir, 'about_you', 'viewed.json'))
    }
}

function loadVisited(dir) {
    return {
        visited: loadTimestamped(path.join(dir, 'about_you', 'visited.json'))
    }
}

function loadNotifications(dir) {
    const fn = path.join(dir, 'about_you', 'notifications.json');
    const data = flatten(common.loadJson(fn));
    return {
        notifications: data.map(e => {
            const timestamp = new Date(e.timestamp * 1000);
            return {
                title: fixFacebookEncoding(e.text),
                url: e.href,
                start: timestamp.toISOString()
            }
        })
    }
}

function loadComments(dir) {
    const fn = path.join(dir, 'comments', 'comments.json');
    const data = flatten(common.loadJson(fn));
    return {
        comments: data.map(e => {
            const timestamp = new Date(e.timestamp * 1000);
            return {
                title: fixFacebookEncoding(e.title),
                start: timestamp.toISOString()
            }
        })
    }
}

function loadPosts(dir) {
    const fn = path.join(dir, 'posts', 'your_posts_1.json');
    const data = flatten(common.loadJson(fn));
    return {
        posts: data.map(e => {
            const timestamp = new Date(e.timestamp * 1000);
            let title = 'Post';
            if ('title' in e) {
                title = fixFacebookEncoding(e.title);
            }
            return {
                title: title,
                start: timestamp.toISOString()
            }
        })
    }
}

function loadLikesAndReactions(dir) {
    const fn = path.join(dir, 'likes_and_reactions', 'posts_and_comments.json');
    const data = flatten(common.loadJson(fn));
    return {
        likesAndReactions: data.map(e => {
            const timestamp = new Date(e.timestamp * 1000);
            return {
                title: fixFacebookEncoding(e.title),
                start: timestamp.toISOString()
            }
        })
    }
}

function loadFriends(dir) {
    const fn = path.join(dir, 'friends', 'friends.json');
    const data = flatten(common.loadJson(fn));
    return {
        friends: data.map(e => {
            const timestamp = new Date(e.timestamp * 1000);
            return {
                title: fixFacebookEncoding(e.name),
                start: timestamp.toISOString()
            }
        })
    }
}

module.exports.loadDirectory = dir => {
    if (!common.anyFile(dir, ['ads_and_businesses', 'messages'])) {
        throw 'Invalid directory'
    }

    rootDir = dir;

    [
        [loadOffFacebookActivity, 'Off-Facebook Activity'],
        [loadSearchHistory, 'Search History'],
        [loadViewed, 'Viewed'],
        [loadVisited, 'Visited'],
        [loadNotifications, 'Notifications'],
        [loadComments, 'Comments'],
        [loadPosts, 'Posts'],
        [loadLikesAndReactions, 'Likes and Reactions'],
        [loadFriends, 'Friends'],
    ].forEach(([loader, name]) => {
        try {
            const start = window.performance.now();
            Object.assign(events, loader(dir));
            const duration = window.performance.now() - start;
            console.log(`Loaded ${name}: ${duration}`);
        } catch (err) {
            console.error(`Error loading ${name}`);
            console.error(err);
        }
    })

    module.exports.events = events;
}