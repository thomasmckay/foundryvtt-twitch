/* global Twitch:true */
/* exported TwitchAdminCommand */

var TwitchAdminCommand = {
    run: function (msg, params, args) {
        var username, twitch;

        if (args.length < 2) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch admin");
            return;
        }

        var objects = findObjs({
            _type: "character",
        });
        twitch = _.find(objects, function (obj) {
            return obj.get("name") == "Twitch Chat";
        });
        if (twitch === undefined) {
            Twitch.rawWrite("Error: 'Twitch Chat' character not found", msg.who, "", "twitch admin");
            return;
        }

        var character = args[2],
            command = args[3];

        username = args[1];
        if (args[0] === "add") {
            userPermissions = findObjs({
                _type: "ability",
                _characterid: twitch.id,
                name: username
            })[0];
            var permissions = this.getPermissions(userPermissions.get("action"));

            this.setPermissions(permissions, msg);
        } else if (args[0] === "remove") {
        } else if (args[0] === "check") {
            var result;

            if (args.length !== 4) {
                Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch admin");
                return;
            }

            userPermissions = findObjs({
                _type: "ability",
                _characterid: twitch.id,
                name: username
            })[0];
            allowed = this.checkPermission(msg, twitch, username, character, command);
            //TODO: output nice message
            Twitch.rawWrite("DEBUG: allowed=" + result, msg.who, "", "twitch admin");
        } else {
            Twitch.rawWrite("Error: Unknown admin command '" + args[0] + "'", msg.who, "", "twitch admin");
            return;
        }
    },

    usage: function (detailed) {
        var message = "<b>admin</b> [add|remove|check] $user [$character $commands]\n";
        if (detailed) {
            message += "    $user: Twitch user name\n";
            message += "    $character: First word of character name (or 'All' for general)\n";
            message += "    $commands: Comma separated list of allowed commands\n";
        }
        return message;
    },

    getTwitchCharacter: function (msg) {
        var objects = findObjs({
            _type: "character",
        });
        twitch = _.find(objects, function (obj) {
            return obj.get("name") == "Twitch Chat";
        });
        if (twitch === undefined) {
            Twitch.rawWrite("Error: 'Twitch Chat' character not found", msg.who, "", "twitch admin");
            return;
        }

        return twitch;
    },

    checkPermission: function (msg, twitch, username, character, command) {
        if (username.endsWith(" (GM)")) {
            username = username.substring(0, username.length - 5);
        }

        // Always true if character starts with username
        if (character.toLowerCase().startsWith(character.toLowerCase())) {
            return true;
        }

        var userPermissions = findObjs({
            _type: "ability",
            _characterid: twitch.id,
            name: username
        })[0];
        if (userPermissions === undefined) {
            Twitch.rawWrite("DEBUG: username=" + username, msg.who, "", "twitch admin");
            return false;
        }

        var permissions = this.getPermissions(userPermissions.get("action"));

        // Check for specific user under username
        var permission = undefined;
        Object.keys(permissions).forEach(function(key) {
            if (key.toLowerCase().startsWith(character.toLowerCase())) {
                permission = permissions[key];

            }
        })
        if (permission !== undefined && permission.indexOf(command) !== -1) {
            return true;
        }

        // Check for 'All' under username
        Object.keys(permissions).forEach(function(key) {
            if (key.toLowerCase() === "all") {
                permission = permissions[key];
            }
        })
        if (permission !== undefined && permission.indexOf(command) !== -1) {
            return true;
        }

        // TODO: DRY up this
        var userPermissions = findObjs({
            _type: "ability",
            _characterid: twitch.id,
            name: "All"
        })[0];
        var permissions = this.getPermissions(userPermissions.get("action"));

        // Check for specific user under username
        var permission = undefined;
        Object.keys(permissions).forEach(function(key) {
            if (key.toLowerCase().startsWith(character.toLowerCase())) {
                permission = permissions[key];

            }
        })
        if (permission !== undefined && permission.indexOf(command) !== -1) {
            return true;
        }

        // Check for 'All' under username
        Object.keys(permissions).forEach(function(key) {
            if (key.toLowerCase() === "all") {
                permission = permissions[key];
            }
        })
        if (permission !== undefined && permission.indexOf(command) !== -1) {
            return true;
        }

        return false;
    },

    getPermissions: function (lines) {
        var permissions = {};
        lines.split("\n").forEach( function(line) {
            var characterCommands = line.split(":");
            if (characterCommands[0] === undefined) {
                return;
            }
            character = characterCommands[0].trim();
            permissions[character] = [];
            characterCommands[1].split(",").forEach(function (command) {
                permissions[character].push(command.trim());
            });
        });
        return permissions;
    },

    setPermissions: function (permissions, msg) {
        var permissions = {};
        lines.split("\n").forEach( function(line) {
            var splitLine = line.split(":");
            if (splitLine[0] === undefined) {
                return;
            }
            permissions[splitLine[0]] = splitLine[1].split(",");
        });
        return permissions;
    }
};
