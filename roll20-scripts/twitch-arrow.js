/* exported TwitchArrowCommand */
/* global Twitch:true */
/* global TwitchAdminCommand:true */

var TwitchArrowCommand = {

    parseArgs: function(args) {
        var parsed;

        /* eslint-disable no-undef */
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
        /* eslint-enable no-undef */

        var x, y;

        if (!parsed["--left"] && !parsed["--right"] && !parsed["--up"] && !parsed["--down"]) {
            if (parsed["_"].length == 2) {
                x = Number(parsed["_"][0]);
                y = Number(parsed["_"][1]);
                parsed["_"].splice(0, 2);
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
                }
            } else if (parsed["_"].length == 3) {
                x = Number(parsed["_"][1]);
                y = Number(parsed["_"][2]);
                parsed["_"].splice(1, 2);
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
                }
            }
        }

        return parsed;
    },


    createArrow: function(name, startX, startY, endX, endY) {
        var controlledby, paths, token;

        controlledby = Twitch.sprintf("%s,all", name);
        paths = findObjs({
            type: "path",
            controlledby: controlledby,
        });
        _.each(paths, function (path) {
            path.remove();
        });
        token = createObj("path", {
            pageid: Campaign().get("playerpageid"),
            layer: "objects",
            controlledby: Twitch.sprintf("%s,all", name),
            stroke: "#FF0000",
            stroke_width: 5,
            path: Twitch.sprintf('{[["M", %s, %s], ["L", %s, %s]]}', startX, startY, endX, endY)
        });

        return token;
    },


    run: function(msg, params, args) {
        var name;

        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch arrow");
            return;
        }
        if (args["--help"]) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch arrow");
            return;
        }

        name = args["_"][0];
        if (!name) {
            name = params["username"];
        }
        name = name.toLowerCase();
        var allowed = TwitchAdminCommand.checkPermission(msg, params["username"], name, "arrow");
        if (!allowed) {
            log("DEBUG: permission denied");
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
            Twitch.rawWrite("Usage: (name not found): " + name, msg.who, "", "twitch arrow");
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

        var startX = object.get("left"),
            startY = object.get("top"),
            endX = startX + deltaX * 70,
            endY = startY + deltaY * 70;

        sendPing(endX, endY, Campaign().get('playerpageid'), undefined, false);
        this.createArrow(name, startX, startY, endX, endY);
    },

    usage: function(detailed, lineSeparator = "\n") {
        var message = "arrow $name [--left $n --right $n] [--up $n --down $n]" + lineSeparator;
        if (detailed) {
            message += "    $name: Object name to arrow, case insensitive" + lineSeparator;
            message += "    --left $n --right $n: Left and right tile offsets from $name" + lineSeparator;
            message += "    --up $n --down $n: Up and down tile offsets from $name" + lineSeparator;
        }
        return message;
    }
};
