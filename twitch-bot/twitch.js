const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true });

const tmi = require('tmi.js')

config = require('../config/config.js').config;

new Promise(function(resolve, reject) {
    request({
        method: "POST",
        url: "https://id.twitch.tv/oauth2/token" +
            "?client_id=" + config.twitch.clientid +
            "&client_secret=" + config.twitch.clientsecret +
            "&grant_type=client_credentials"
    }, function(error, response, body) {
        if (error) {
            console.log("saveProfileImage: ERROR " + error);
        }
        resolve(body);
    });
}).then(function(body) {
    try {
        results = JSON.parse(body);
    } catch (e) {
        console.log("OAuth access_token: failed to parse json");
        return false;
    }

    config.twitch.access_token = results.access_token;
});


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


// const getViewerProfile = function () {
// }

// const fs = require('fs');

// var download = function(uri, filename, callback){
//     request(uri).pipe(fs.createWriteStream(filename))
// };

// new Promise(function(resolve, reject) {
//     request({
//         url: "https://api.twitch.tv/helix/users?login=" + "PintAndPie",
//         headers: {
//             "Client-ID": config.twitch.clientid
//         }
//     }, function(error, response, body) {
//         console.log("???? " + body);
//         resolve(body);
//     });
// }).then(function(body) {
//     console.log("???? PROMISED: " + JSON.parse(body));
//     results = JSON.parse(body);

//     console.log(results.data[0].profile_image_url);
//     download(results.data[0].profile_image_url, "tmp.jpg", function() {
//         console.log("DONE!!")
//     });
// });
// console.log("AFTER");

// return

var client = new tmi.client(options);

client.connect();

if (config.options.platform === "foundryvtt") {
    var WebSocket = require('ws'),
        HTTPServ = require('http'),
        app = null,
        cfg = {
            ssl: false,
            port: 30001
        },
        logfile = fs.createWriteStream(config.foundryvtt.logfile, {flags: "a"});

    var processRequest = function( req, res ) {
        res.writeHead(200);
        res.end("Request/Response\n");
    };

    app = HTTPServ.createServer( processRequest ).listen( cfg.port );

    const broadcast = (data) => {
        console.log("???? broadcast: " + data);
        console.log("???? client: " + foundryvtt);
        console.log("???? readyState: " + client.readyState);

        console.log("???? BROADCASTING: " + data);
        if (foundryvtt) {
            foundryvtt.send(data)
        } else {
            console.log("???? BROADCASTING: FAILED, no foundryvtt");
        }
    };

    var wss = new WebSocket.Server( { server: app } );
    var ws = undefined;

    var foundryvtt = undefined;
    wss.on('connection', function connection(ws) {
        foundryvtt = ws;
        ws.on('message', function incoming(message) {
            console.log('received: ' + message);
            broadcast("MESSAGE RECEIVED: " + message);

            if (message.indexOf(">>") == 0) {
                logfile.write(message + "\n");
            } else {
                client.say(config.twitch.channels[0], message);
            }
        });
        ws.send('something');
    });

    if (true) {
        FoundryVTT.reloadOptions();
        client
            .on('chat', function (channel, userstate, message, self) {
                FoundryVTT.processMessage(nightmare, broadcast, self, userstate, message);
            })
            .on('whisper', function (channel, userstate, message, self) {
                FoundryVTT.processMessage(nightmare, broadcast, self, userstate, message);
            })
            .on('action', function (channel, userstate, message, self) {
                FoundryVTT.processMessage(nightmare, broadcast, self, userstate, message);
            })
    } else {
        nightmare
            .goto(config.foundryvtt.server + '/setup')
            .wait('input#eula-agree')
            .click('input#eula-agree')
            .click('button#sign')
            .wait('li.package[data-package-id="' + config.foundryvtt.world + '"] .launch')
            .click('li.package[data-package-id="' + config.foundryvtt.world + '"] .launch')
            .wait(2000)
            .then( function () {
                nightmare.goto(config.foundryvtt.server + '/join')
                    .wait('input[name=password]')
                    .type('input[name=password]', config.foundryvtt.password)
                    .select('select[name=userid]', config.foundryvtt.username)
                    .click('button[name=submit]')
                    .wait('#chat-message')
                    .exists('#chat-message')
                    .then(function(result) {
                        FoundryVTT.reloadOptions();
                        client
                            .on('chat', function (channel, userstate, message, self) {
                                console.log(JSON.stringify(userstate));
                                FoundryVTT.processMessage(nightmare, broadcast, self, userstate, message);
                            })
                            .on('whisper', function (channel, userstate, message, self) {
                                FoundryVTT.processMessage(nightmare, broadcast, self, userstate, message);
                            })
                            .on('action', function (channel, userstate, message, self) {
                                FoundryVTT.processMessage(nightmare, broadcast, self, userstate, message);
                            })
                    })
                    .catch(error => {
                        console.error('ERROR (nightmare startup):', error);
                    })
            })
            .catch(error => {
                console.error('ERROR (nightmare startup):', error);
            });
    }
} else if (config.options.platform === "roll20") {
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
            console.error('ERROR (nightmare startup):', error);
        });
} else {
    console.error('Config option "platform" must be either "roll20" or "foundryvtt"');
}
