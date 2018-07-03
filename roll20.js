
var _options = {};

var _viewers = new Array();

var _reloadOptions = () => {
    _options = require('./config/options.js');
    _viewers = Array.from(_options.viewers);
};

const _isPlayer = (name) => {
    return _viewers.find( (viewer) => {
        return (viewer.name === name && viewer.role === "player");
    });
}

const _isMaster = (name) => {
    return _viewers.find( (viewer) => {
        return (viewer.name === name && viewer.role === "master");
    });
}

var _processMessage = (nightmare, self, userstate, message) => {
    console.log(userstate["display-name"]);
    var isPlayer = _isPlayer(userstate["display-name"]),
        isMaster = _isMaster(userstate["display-name"]);
    var command = undefined;

    var tokens = message.split(" ");
    if (tokens[0] != "!roll20") {
        return;
    }

    if ((self || isMaster) && tokens[1] === "reload-options") {
        _reloadOptions();
        return;
    }

    if ((isPlayer || isMaster) && tokens[1] === "/roll") {
        command = message.substring(8);
    } else if ((isPlayer || isMaster) && tokens[1] === "ping") {
        command = "!twitch [#####] " + message.substring(8);
    } else {
        return;
    }

    if (nightmare && command) {
        nightmare
            .insert('#textchat-input > textarea.ui-autocomplete-input', command + '\n')
            .click('#textchat-input > button.btn')
            .catch(error => {
                console.error('ERROR (insert failed):', error)
            })
    }
};

module.exports = function () {
    this.options = _options;
    this.reloadOptions = _reloadOptions;
    this.processMessage = _processMessage;
}
