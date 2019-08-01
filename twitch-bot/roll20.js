var _Roll20 = (function () {
    var ROLL20_COMMANDS = {};

    var _options = {};

    var _viewers = new Array();

    var _reloadOptions = () => {
        _options = require('../config/options.js');
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
        if (roll20Command === undefined || roll20Command === "help") {
            client.say(config.twitch.channels[0], "@" + userstate.username + " !roll20 commands: " +
                       ["roll", "ping", "move"].join(", "))
            return;
        }
        command = roll20Command.run(self, userstate, message.substring(8));

        if ((self || isMaster) && tokens[1] === "reload-options") {
            _reloadOptions();
            return;
        }

        if (nightmare && command) {
            console.log(command.substring(0, 100));
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
        ROLL20_COMMANDS["admin"] = Roll20AdminCommand;
        ROLL20_COMMANDS["join"] = Roll20JoinCommand;
        ROLL20_COMMANDS["roll"] = Roll20RollCommand;
        ROLL20_COMMANDS["/roll"] = ROLL20_COMMANDS["roll"];
        ROLL20_COMMANDS["ping"] = Roll20PingCommand;
        ROLL20_COMMANDS["move"] = Roll20MoveCommand;
        ROLL20_COMMANDS["say"] = Roll20SayCommand;
    }

    return {
        registerCommands: registerCommands,
        options: _options,
        reloadOptions: _reloadOptions,
        processMessage: _processMessage
    };
}());

var Roll20 = (function () {
    _Roll20.registerCommands();
    return {
        options: _Roll20.options,
        reloadOptions: _Roll20.reloadOptions,
        processMessage: _Roll20.processMessage
    };
}());

