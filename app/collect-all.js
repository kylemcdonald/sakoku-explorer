const fs = require('fs');
const path = require('path');
const googleParser = require('./google-parser');

const dir = '/Users/kyle/Desktop/downloaded-data/';

let collectedData = {};

fs.readdirSync(dir)
.filter(e => e[0] != '.') // ignore hidden
.map(user => {
    let root = path.join(dir, user);
    if (!fs.lstatSync(root).isDirectory()) { // directories only
        return;
    }

    const jp = path.join(root, 'Takeout', 'マイ アクティビティ');
    const en = path.join(root, 'Takeout', 'My Activity');
    let full, html;
    if (fs.existsSync(jp)) {
        full = jp;
        html = 'マイアクティビティ.html';
    } else if (fs.existsSync(en)) {
        full = en;
        html = 'MyActivity.html';
    } else {
        return;
    }

    const valid = [
        'Search',
        '検索',
        'Maps',
        'マップ',
        'YouTube',
        // 'Image Search',
        // '画像検索',
    ]

    collectedData[user] = {}

    fs.readdirSync(full)
    .filter(e => e[0] != '.') // ignore hidden
    .filter(e => valid.includes(e))
    .map(product => {
        const productPath = path.join(full, product, html);
        const matches = googleParser.readFile(productPath);
        console.log(user + ' ' + product)
        console.log(matches[0]);

        if (['Search', '検索'].includes(product)) {
            collectedData[user][product] = googleParser.parseSearch(matches);
        } else if (['Maps', 'マップ'].includes(product)) {
            collectedData[user][product] = googleParser.parseMaps(matches);
        } else if (['YouTube'].includes(product)) {
            collectedData[user][product] = googleParser.parseYouTube(matches);
        }
    })
})

fs.writeFileSync('collected-data.json', JSON.stringify(collectedData, null, 2));