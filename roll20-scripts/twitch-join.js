/* exported TwitchJoinCommand */
/* global BeyondImporter:true */
/* global setDefaultTokenForCharacter:true */
/* global Twitch:true */
/* global TwitchAdminCommand:true */

var TwitchJoinCommand = {
    parseArgs: function(args) {
        /* eslint-disable no-undef */
        var parsed = Twitch.parse({
            "--help": Boolean,
            "--dndbeyond": String,
            "--img": String,
            "--hp": Number,
            "--ac": Number,
            // Hidden
            "--json": String,
        }, options = {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    },

    createToken: function(name) {
        var token = createObj("graphic", {
            _subtype: "token",
            pageid: Campaign().get("playerpageid"),
            layer: "objects",
            imgsrc: "https://s3.amazonaws.com/files.d20.io/images/86578903/SJ7h6YfYuTGBwKxQL2pctg/thumb.png?1563232063",
            top: 35, left: 35,
            width: 70, height: 70,
            name: name,
            showname: true,
            showplayers_name: true,
            showplayers_bar1: true,
            showplayers_bar2: true,
            playersedit_name: true,
            playersedit_bar1: true,
            playersedit_bar2: true
        });

        return token;
    },

    setAttribute: function(msg, character, token, bar, name, value, defaultValue) {
        var attribute = findObjs({
            _type: "attribute",
            _characterid: character.id,
            name: name
        })[0];
        if (attribute === undefined) {
            if (value === undefined) {
                value = defaultValue;
            }
            attribute = createObj("attribute", {
                name: name,
                current: value,
                characterid: character.id
            });
        }
        if (value === undefined) {
            value = attribute.get("current");
        } else {
            attribute.set("current", value);
        }
        token.set(bar + "_link", attribute.get("_id"));
        token.set(bar + "_max", value);
        token.set(bar + "_value", value);
    },

    run: function(msg, params, args) {
        var name, character, objects;

        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch join");
            return;
        }
        if (args["--help"]) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch join");
            return;
        }

        name = params["username"];
        character = undefined;
        objects = findObjs({
            _type: "character",
        });
        character = _.find(objects, function (obj) {
            return obj.get("name").toLowerCase().startsWith(name.toLowerCase());
        });
        var allowed = TwitchAdminCommand.checkPermission(msg, params["username"], name, "join");
        if (!allowed) {
            log("DEBUG: permission denied");
            return;
        }

        // This is handled in twitch and shouldn't reach here
        if (args["--dndbeyond"]) {
            return;
        }

        if (args["--json"]) {
            try {
                JSON.parse(msg.content.substring(msg.content.indexOf("--json") + 7));
            } catch (e) {
                log("Error parsing character JSON: " +
                    msg.content.substring(msg.content.indexOf("--json") + 7, 100));
                return;
            }
            BeyondImporter.import(msg, msg.content.substring(msg.content.indexOf("--json") + 7));
            return;
        }

        // Create character
        var token;
        if (!character) {
            character = createObj("character", {
                name: name,
                inplayerjournals: "all",
                controlledby: "all"
            });
            token = this.createToken(name);
        } else {
            objects = findObjs({
                _pageid: Campaign().get("playerpageid"),
                _type: "graphic",
            });
            token = _.find(objects, function (obj) {
                return obj.get("name").toLowerCase().startsWith(name.toLowerCase());
            });
            if (token === undefined) {
                token = this.createToken(name);
            }
        }

        if (!token) {
            return;
        }

        token.set("represents", character.id);

        this.setAttribute(msg, character, token, "bar1", "hp", args["--hp"], 10);
        this.setAttribute(msg, character, token, "bar2", "ac", args["--ac"], 10);

        setDefaultTokenForCharacter(character, token);

        objects = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
        });
        var startLocation = _.find(objects, function (obj) {
            return obj.get("name").toLowerCase().startsWith("!roll20 join");
        });
        if (startLocation) {
            token.set("top", startLocation.get("top"));
            token.set("left", startLocation.get("left"));
        } else {
            Twitch.write("DEBUG: no start token", msg.who, "", "DEBUG");
        }

        const style = "margin-left: 0px; overflow: hidden; background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;";
        sendChat("!roll20 join", '<div style="' + style + '">Player <b>' + name +
                 '</b> is ready!</div>', null, {noarchive: true});
    },

    usage: function(detailed, lineSeparator = "\n") {
        var message = "!roll20 join: Add or update your character to the game. '!roll20 help' for more information.";
        if (detailed) {
            message += lineSeparator;
            message += "    --hp: Set your PC's Hit Points" + lineSeparator;
            message += "    --ac: Set your PC's Armor Class" + lineSeparator;
        }
        return (message);
    }
};
