/* exported TwitchSayCommand */
/* global Twitch:true */
/* global TwitchAdminCommand:true */

var TwitchSayCommand = {
    parseArgs: function(args) {
        /* eslint-disable no-undef */
        var parsed = Twitch.parse({
            "--help": Boolean,
            "--name": String,
            "-n": "--name"
        }, options = {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    },


    run: function (msg, params, args) {
        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch say");
            return;
        }
        if (args["--help"]) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch say");
            return;
        }

        var character = args["--name"];
        if (!character) {
            character = params["username"];
        }

        var allowed = TwitchAdminCommand.checkPermission(msg, params["username"], character, "say");
        if (!allowed) {
            log("DEBUG: permission denied");
            return;
        }

        sendChat(character, args["_"].join(" "));
    },


    usage: function (detailed, lineSeparator = "\n") {
        var message = "say [--name $name] $message" + lineSeparator;
        if (detailed) {
            message += "    --name | -n: Name to speak as" + lineSeparator;
            message += "    $message: Message to speak" + lineSeparator;
        }
        return message;
    }
};
