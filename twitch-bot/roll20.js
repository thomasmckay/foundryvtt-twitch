var Roll20 = (function () {
    var ROLL20_COMMANDS = {};

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
        var isPlayer = _isPlayer(userstate["display-name"]),
            isMaster = _isMaster(userstate["display-name"]);
        var roll20Command,
            command = undefined;

        var tokens = message.split(" ");
        if (tokens[0] != "!roll20") {
            return;
        }

        roll20Command = ROLL20_COMMANDS[tokens[1]];
        if (roll20Command === undefined) {
            console.log("Unrecognized command: " + tokens[1]);
            return;
        }
        command = roll20Command.run(self, userstate, message.substring(8));

        if ((self || isMaster) && tokens[1] === "reload-options") {
            _reloadOptions();
            return;
        }

        /*
        if ((isPlayer || isMaster) && tokens[1] === "/roll") {
            command = message.substring(8);
        } else if ((isPlayer || isMaster) && tokens[1] === "ping") {
            command = "!twitch [#####] " + message.substring(8);
        } else {
            return;
        }
        */

        if (nightmare && command) {
            nightmare
                .insert('#textchat-input > textarea.ui-autocomplete-input', command + '\n')
                .click('#textchat-input > button.btn')
                .catch(error => {
                    console.error('ERROR (insert failed):', error)
                })
        } else if (command) {
            console.log('DEBUG ' + command);
        }
    }

    var registerCommands = () => {
        var Roll20AdminCommand = require('./roll20-admin.js');
        ROLL20_COMMANDS["admin"] = new Roll20AdminCommand();
        var Roll20RollCommand = require('./roll20-roll.js');
        ROLL20_COMMANDS["roll"] = new Roll20RollCommand();
        ROLL20_COMMANDS["/roll"] = ROLL20_COMMANDS["roll"];
        var Roll20PingCommand = require('./roll20-ping.js');
        ROLL20_COMMANDS["ping"] = new Roll20PingCommand();
    }

    return {
        registerCommands: registerCommands,
        options: _options,
        reloadOptions: _reloadOptions,
        processMessage: _processMessage
    };
}());

module.exports = function () {
    Roll20.registerCommands();
    this.options = Roll20.options;
    this.reloadOptions = Roll20.reloadOptions;
    this.processMessage = Roll20.processMessage;
}
