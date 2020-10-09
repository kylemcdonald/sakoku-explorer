const fs = require('fs');
const path = require('path');

const cache = { };

module.exports = {
    anyFile: (dir, fns) => {
        return fns.map(fn => fs.existsSync(path.join(dir, fn))).some(e => e);
    },
    loadJson: (fn) => {
        const dataRaw = fs.readFileSync(fn, 'utf8');
        const data = JSON.parse(dataRaw);
        return data;
    },
    extractDomain: (url) => {
        const hostname = url.match('^(?:https?:\/\/)?(?<hostname>[^:\/\n?%]+)', 'i');
        const domain = hostname.groups.hostname.split('.').slice(-2).join('.');
        return domain;
    }
}