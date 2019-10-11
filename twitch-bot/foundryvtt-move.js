var _FoundryVTTMoveCommand = {

    parseArgs: function(args) {
        var parsed = {"_": []},
            x, y;

        if (args.length == 2) {
            x = Number(args[0]);
            y = Number(args[1]);
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
        } else if (args.length == 3) {
            x = Number(args[1]);
            y = Number(args[2]);
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
                parsed["_"] = [args[0]];
                return parsed;
            }
        }

        /* eslint-disable no-undef */
        parsed = Arg.parse({
            "--help": Boolean,
            "--left": Number,
            "--right": Number,
            "--up": Number,
            "--down": Number,
            "-l": "--left",
            "-r": "--right",
            "-u": "--up",
            "-d": "--down"
        }, {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    },


    usage: function(detailed, lineSeparator = "\n") {
        var message = "!move token with wasd" + lineSeparator;
        if (detailed) {
            message += "!move wwdd" + lineSeparator;
        }
        return message;
    },


    run: function(self, userstate, args) {
        try {
            parsed = _FoundryVTTMoveCommand.parseArgs(args);
        } catch (e) {
            console.log("ERROR 'move' argument parsing failed: " + e);
            return undefined;
        }
        if (parsed["--help"]) {
            var usage = _FoundryVTTMoveCommand.usage(true, " // ");
            console.log(usage);
            client.say(config.twitch.channels[0], "@" + userstate.username + " " + usage);
            return undefined;
        }

        return("!twitch [#####,username=" + userstate["display-name"] + "] move " + args.join(" "));
    }
};


var FoundryVTTMoveCommand = (function () {
    return {
        run: _FoundryVTTMoveCommand.run
    };
}());
