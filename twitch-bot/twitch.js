const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true });

const tmi = require('tmi.js')

config = require('../config/config.js').config;

var options= {
    options: {
        debug: true,
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: config.twitch.username,
        password: config.twitch.password
    },
    channels: config.twitch.channels
};

var client = new tmi.client(options);

client.connect();


nightmare
    .goto('https://app.roll20.net/editor/setcampaign/' + config.roll20.campaign)
    .type('.login input[name=email', config.roll20.username)
    .type('.login input[name=password', config.roll20.password)
    .click('.login button')
    .wait('.gameinfo a[href$="' + config.roll20.campaign + '"]')
    .goto('https://app.roll20.net/editor/setcampaign/' + config.roll20.campaign)
    .wait('textarea.ui-autocomplete-input')
    .exists('textarea.ui-autocomplete-input')
    .then(function(result) {
        Roll20.reloadOptions();
        client
            .on('chat', function (channel, userstate, message, self) {
                Roll20.processMessage(nightmare, self, userstate, message);
            })
            .on('whisper', function (channel, userstate, message, self) {
                Roll20.processMessage(nightmare, self, userstate, message);
            })
            .on('action', function (channel, userstate, message, self) {
                Roll20.processMessage(nightmare, self, userstate, message);
            })
    })
    .catch(error => {
        console.error('ERROR (nightmare startup):', error)
    });
