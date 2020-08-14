const fs = require('fs');
const path = require('path');
const googleParser = require('./google-parser');

const dir = '/Users/kyle/Desktop/downloaded-data/kyle/Takeout/My Activity/'
const html = '/MyActivity.html';

// const dir = '/Users/kyle/Desktop/downloaded-data/keina/Takeout/マイ アクティビティ/';
// const html = 'マイアクティビティ.html'

fs.readdirSync(dir)
.filter(e => e[0] != '.')
// .filter(e => e == 'マップ')
.filter(e => e == 'Maps')
.forEach(subdir => {
    fn = path.join(dir, subdir, html);
    const matches = googleParser.readFile(fn);
    console.log(matches.length + ' ' + subdir)
    console.log(matches[0])

    // const parsed = googleParser.parseYouTube(matches);
    // const parsed = googleParser.parseMaps(matches);
    const parsed = googleParser.parseSearch(matches);
    console.log(parsed[0]);
})