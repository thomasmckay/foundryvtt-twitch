/* global Twitch:true */
/* exported TwitchPingCommand */

var TwitchPingCommand = {
    run: function(msg, linkid, args) {
        var name, x, y;

        try {
            args = Twitch.parse({
                "--help": Boolean,
                "--x": Number,
                "--y": Number,
                "-x": "--x",
                "-y": "--y"
            }, options = {
                argv: args,
                permissive: true
            });
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch roll");
            return;
        }
        if (args["--help"] || args["_"].length !== 1) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch roll");
            return;
        }

        name = args["_"][0];
        var allowed = TwitchAdminCommand.checkPermission(msg, TwitchAdminCommand.getTwitchCharacter(msg),
                                                         msg.who, name, "ping");
        if (!allowed) {
            Twitch.rawWrite("Permission Denied", msg.who, "", "twitch ping");
            return;
        }

        var deltaX = 0;
        if (args["--x"]) {
            deltaX = args["--x"];
        }
        var deltaY = 0;
        if (args["--y"]) {
            deltaY = args["--y"];
        }

        var name = args["_"][0].toLowerCase();
        var object,
            objects = findObjs({
                _pageid: Campaign().get("playerpageid"),
                _type: "graphic",
            });
        object = _.find(objects, function (obj) {
            return obj.get("name").toLowerCase().startsWith(name);
        });
        if (object !== undefined) {
            x = object.get("left");
            y = object.get("top");
        }
        x = x + deltaX * 70;
        y = y + deltaY * 70;

        sendPing(x, y, Campaign().get('playerpageid'), undefined, false);
    },

    usage: function(detailed) {
        var message = "<b>ping</b> $name [--x $x --y $y]\n";
        if (detailed) {
            message += "    $name: Object name to ping, case insensitive\n";
            message += "    --x $x --y $y: X,Y tile offsets from $name\n";
        }
        return(message);
    }
};
