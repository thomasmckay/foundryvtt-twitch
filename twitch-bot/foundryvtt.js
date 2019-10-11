var _FoundryVTT = (function () {
    var FOUNDRYVTT_COMMANDS = {};

    var _options = {};

    var _viewers = new Array();

    var _reloadOptions = () => {
        _options = require('../config/config.js').config;
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

    var _processMessage = (nightmare, broadcast, self, userstate, message) => {
        var isPlayer = _isPlayer(userstate["display-name"]),
            isMaster = _isMaster(userstate["display-name"]);
        var fvttCommand,
            command = undefined;

        var tokens = message.split(" ");
        if (tokens[0].toLowerCase() === config.twitch.command.toLowerCase()) {
            fvttCommand = FOUNDRYVTT_COMMANDS[tokens[1]];
            args = tokens.slice(2);
        } else if (tokens[0].charAt(0) === "!") {
            fvttCommand = FOUNDRYVTT_COMMANDS[tokens[0].substring(1, tokens[0].length)];
            args = tokens.slice(1);
        }

        if (!fvttCommand) {
            return;
        }
        command = fvttCommand.run(self, userstate, args);

        if ((self || isMaster) && tokens[1] === "reload-options") {
            _reloadOptions();
            return;
        }

        if (nightmare && command) {
            console.log(command.substring(0, 400));
            broadcast(command.substring(0, 400));
        } else if (command) {
            console.log('DEBUG ' + command);
        }
    }

    var registerCommands = () => {
        FOUNDRYVTT_COMMANDS["arrow"] = FoundryVTTArrowCommand;
        FOUNDRYVTT_COMMANDS["character"] = FoundryVTTCharacterCommand;
        FOUNDRYVTT_COMMANDS["dndbeyond"] = FoundryVTTDnDBeyondCommand;
        FOUNDRYVTT_COMMANDS["char"] = FoundryVTTCharacterCommand;
        FOUNDRYVTT_COMMANDS["help"] = FoundryVTTHelpCommand;
        FOUNDRYVTT_COMMANDS["join"] = FoundryVTTJoinCommand;
        FOUNDRYVTT_COMMANDS["leave"] = FoundryVTTLeaveCommand;
        FOUNDRYVTT_COMMANDS["move"] = FoundryVTTMoveCommand;
        FOUNDRYVTT_COMMANDS["play"] = FoundryVTTPlayCommand;
        FOUNDRYVTT_COMMANDS["roll"] = FoundryVTTRollCommand;
        FOUNDRYVTT_COMMANDS["rp"] = FoundryVTTRPCommand;
    }

    return {
        registerCommands: registerCommands,
        options: _options,
        reloadOptions: _reloadOptions,
        processMessage: _processMessage
    };
}());

var FoundryVTT = (function () {
    _FoundryVTT.registerCommands();
    return {
        options: _FoundryVTT.options,
        reloadOptions: _FoundryVTT.reloadOptions,
        processMessage: _FoundryVTT.processMessage
    };
}());

