/* global Twitch:true */
/* exported TwitchMoveCommand */

var TwitchMoveCommand = {

    parseArgs: function(args) {
        var parsed = {"_": []};

        if (args.length == 2) {
            var x = Number(args[0]);
            var y = Number(args[1]);
            if (Number.isInteger(x) && Number.isInteger(y)) {
                if (x < 0) {
                    parsed["--left"] = Math.abs(x);
                } else {
                    parsed["--right"] = Math.abs(x);
                }
                if (y < 0) {
                    parsed["--down"] = Math.abs(y);
                } else {
                    parsed["--up"] = Math.abs(y);
                }
                return parsed;
            }
        }

        parsed = Twitch.parse({
            "--help": Boolean,
            "--left": Number,
            "--right": Number,
            "--up": Number,
            "--down": Number,
            "-l": "--left",
            "-r": "--right",
            "-u": "--up",
            "-d": "--down"
        }, options = {
            argv: args,
            permissive: true
        });

        return parsed;
    },


    run: function(msg, params, args) {
        var name, x, y;

        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch move");
            return;
        }
        if (args["--help"]) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch move");
            return;
        }

        var character = TwitchAdminCommand.getTwitchCharacter(msg);
        name = args["_"][0];
        if (!name) {
            name = params["username"];
        }
        name = name.toLowerCase();
        var allowed = TwitchAdminCommand.checkPermission(msg, character, msg.who, name, "move");
        if (!allowed) {
            Twitch.rawWrite("Permission Denied", msg.who, "", "twitch move");
            return;
        }

        var object,
            objects = findObjs({
                _pageid: Campaign().get("playerpageid"),
                _type: "graphic",
            });
        object = _.find(objects, function (obj) {
            return obj.get("name").toLowerCase().startsWith(name);
        });
        if (object === undefined) {
            Twitch.rawWrite("Usage: (name not found) " + this.usage(false), msg.who, "", "twitch ping");
            return;
        }

        var deltaX = 0;
        if (args["--left"]) {
            deltaX = 0 - args["--left"];
        }
        if (args["--right"]) {
            deltaX = args["--right"];
        }
        var deltaY = 0;
        if (args["--up"]) {
            deltaY = 0 - args["--up"];
        }
        if (args["--down"]) {
            deltaY = args["--down"];
        }

        x = object.get("left");
        y = object.get("top");
        x = x + deltaX * 70;
        y = y + deltaY * 70;

        sendPing(x, y, Campaign().get('playerpageid'), undefined, false);
        object.set("top", y);
        object.set("left", x);
    },

    usage: function(detailed) {
        var message = "<b>move</b> $name [--left $n --right $n] [--up $n --down $n]\n";
        if (detailed) {
            message += "    $name: Object name to move, case insensitive\n";
            message += "    --left $n --right $n: Left and right tile offsets from $name\n";
            message += "    --up $n --down $n: Up and down tile offsets from $name\n";
        }
        return(message);
    }
};
