const fs = require('fs');
const open = require('open');
const waitForUserInput = require('wait-for-user-input');

const data = JSON.parse(fs.readFileSync('collected-data.json'));

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const user = randomChoice(Object.keys(data));
const product = randomChoice(Object.keys(data[user]));
const datapoint = randomChoice(data[user][product]);

if (!datapoint.url) {
    console.log('Try again!');
    exit();
}

let url = datapoint.url;

let match = url.match('\\?q=(http.+?)(&amp;usg|$)');
if (match) {
    url = match[1];
}

open(datapoint.url);
waitForUserInput('')
.then(userInput => {
    console.log(user + ' / ' + product);  
    console.log(datapoint);  
})