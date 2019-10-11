var _FoundryVTTLeaveCommand = {

    parseArgs: function(args) {
        var parsed = Arg.parse({
            "--help": Boolean,
        }, {
            argv: args,
            permissive: true
        });

        return parsed;
    },


    usage: function(detailed, lineSeparator = "\n") {
        var message = "!leave: Remove your character token";
        return message;
    },


    run: function(self, userstate, args) {
        try {
            parsed = _FoundryVTTLeaveCommand.parseArgs(args);
        } catch (e) {
            console.log("ERROR 'leave' argument parsing failed: " + e);
            return undefined;
        }
        if (parsed["--help"]) {
            var usage = _FoundryVTTLeaveCommand.usage(true, " // ");
            console.log(usage);
            client.say(config.twitch.channels[0], "@" + userstate.username + " " + usage);
            return undefined;
        }

        return("!twitch [#####,username=" + userstate["display-name"] + "] leave " + args.join(" "));
    }
};


var FoundryVTTLeaveCommand = (function () {
    return {
        run: _FoundryVTTLeaveCommand.run
    };
}());
