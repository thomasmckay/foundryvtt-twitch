
var Roll20 = require('./roll20.js');
var roll20 = new Roll20();

roll20.reloadOptions();

var self = false,
    userstate = {
        'display-name': 'PintAndPie'
    },
    message = "roll20 /roll d20",
    nightmare = false;

roll20.processMessage(nightmare, self, userstate, message);
