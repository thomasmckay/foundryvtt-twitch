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
            var userPermissions = findObjs({
                _type: "ability",
                _characterid: twitch.id,
                name: username
            })[0];
            var permissions = this.getPermissions(userPermissions.get("action"));

            this.setPermissions(permissions, msg);
        } else if (args[0] === "remove") {
            Twitch.rawWrite("Error: 'remove' admin command not implemented", msg.who, "", "twitch admin");
            return;
        } else if (args[0] === "check") {
            if (args.length !== 4) {
                Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch admin");
                return;
            }

            var allowed = this.checkPermission(msg, params["username"], character, command);
            //TODO: output nice message
            Twitch.rawWrite("DEBUG: allowed=" + allowed, msg.who, "", "twitch admin");
        } else {
            Twitch.rawWrite("Error: Unknown admin command '" + args[0] + "'", msg.who, "", "twitch admin");
            return;
        }
    },

    usage: function (detailed) {
        var message = "admin [add|remove|check] $user [$character $commands]\n";
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
        var twitch = _.find(objects, function (obj) {
            return obj.get("name") == "Twitch Chat";
        });
        if (twitch === undefined) {
            Twitch.rawWrite("Error: 'Twitch Chat' character not found", msg.who, "", "twitch admin");
            return;
        }

        return twitch;
    },


    checkUserPermissions: function (twitch_id, username, character, command) {
        log(Twitch.sprintf("DEBUG: checkUserPermissions: username=%s, character=%s, command=%s",
            username, character, command));
        var userPermissions = findObjs({
            _type: "ability",
            _characterid: twitch_id,
            name: username.toLowerCase()
        })[0];
        if (userPermissions === undefined) {
            log(Twitch.sprintf("DEBUG: checkPermission: twitch character not found with permissions for: %s", username));
            return false;
        }

        var permissions = this.getPermissions(userPermissions.get("action"));

        // Check for specific user under username
        log("DEBUG: checkPermission: character.toLowerCase()=" + character.toLowerCase());
        var permission = undefined;
        Object.keys(permissions).forEach(function(key) {
            key = key.toLowerCase();
            if (key.startsWith(character.toLowerCase())) {
                permission = permissions[key];
            }
        })
        if (permission !== undefined && permission.indexOf(command) !== -1) {
            log("DEBUG: checkPermission: permission found, returning true");
            return true;
        }

        // Check for 'All' under username
        Object.keys(permissions).forEach(function(key) {
            key = key.toLowerCase();
            log(Twitch.sprintf("DEBUG: checkPermission: 'All' character permission: %s", key));
            if (key === "all") {
                permission = permissions[key];
            }
        })
        if (permission !== undefined && permission.indexOf(command) !== -1) {
            log(Twitch.sprintf("DEBUG: checkPermission: 'All' permission '%s', returning true", permission));
            return true;
        }

        log("DEBUG: checkPermission: returning false");
        return false;
    },


    checkPermission: function (msg, username, character, command) {
        if (username.endsWith(" (GM)")) {
            username = username.substring(0, username.length - 5);
        }
        var twitch = TwitchAdminCommand.getTwitchCharacter(msg);

        if (TwitchAdminCommand.checkUserPermissions(twitch.id, username, character, command) === true) {
            return true;
        }

        if (TwitchAdminCommand.checkUserPermissions(twitch.id, "All", character, command) === true) {
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
            if (characterCommands[0] !== undefined && characterCommands[1] !== undefined) {
                var character = characterCommands[0].trim();
                permissions[character] = [];
                characterCommands[1].split(",").forEach(function (command) {
                    permissions[character].push(command.trim());
                });
            }
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
