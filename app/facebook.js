const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const common = require('./common');

// private
let rootDir = null;
let events = { };

// public
module.exports = {
    name: 'facebook'
};

function fixFacebookEncoding(data) {
    return iconv.decode(iconv.encode(data, 'latin1'), 'utf-8');
}

function loadOffFacebookActivity(dir) {
    let events = [];
    const fn = path.join(dir, 'ads_and_businesses', 'your_off-facebook_activity.json');
    const data = common.loadJson(fn);
    data['off_facebook_activity'].forEach(e => {
        let name = fixFacebookEncoding(e['name']);
        e['events'].forEach(e => {
            let title = name;
            let type = e['type'];
            if (type != 'CUSTOM') {
                title += ' ' + type;
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

module.exports.loadDirectory = dir => {
    if (!common.anyFile(dir, ['ads_and_businesses', 'messages'])) {
        throw 'Invalid directory'
    }

    rootDir = dir;

    try {
        events.offFacebookActivity = loadOffFacebookActivity(dir);
    } catch (err) {
        console.error(err);
    }

    module.exports.events = events;
}