// node roll20_test.js
// -or-
// npm test

var Roll20 = require('./roll20.js');
var roll20 = new Roll20();

roll20.reloadOptions();

var self = false,
    userstate = {
        'display-name': 'PintAndPie'
    },
    message = "!roll20 /roll d20",
    nightmare = false;

roll20.processMessage(false, false, userstate, "!roll20 admin abc def");
roll20.processMessage(false, false, userstate, "!roll20 /roll d20");
roll20.processMessage(false, false, userstate, "!roll20 roll d20");
roll20.processMessage(false, false, userstate, "!roll20 ping 111 222");


