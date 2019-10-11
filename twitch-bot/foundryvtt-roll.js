var _FoundryVTTRollCommand = {


    parseArgs: function(args) {
        /* eslint-disable no-undef */
        var parsed = Arg.parse({
            "--help": Boolean,
            "--name": String,
            "-n": "--name"
        }, {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    },


    usage: function(detailed, lineSeparator = "\n") {
        var message = "!roll dice" + lineSeparator;
        if (detailed) {
            message += "!roll d20+2" + lineSeparator;
            message += "!roll d20+2 # initiative" + lineSeparator;
            message += "!roll 2d8+2 # *slams mace down*" + lineSeparator;
        }
        return message;
    },


    run: function(self, userstate, args) {
        try {
            parsed = _FoundryVTTRollCommand.parseArgs(args);
        } catch (e) {
            console.log("ERROR 'roll' argument parsing failed: " + e);
            return undefined;
        }
        if (parsed["--help"] || parsed["_"].length < 1) {
            var usage = _FoundryVTTRollCommand.usage(true, " // ");
            console.log(usage);
            client.say(config.twitch.channels[0], "@" + userstate.username + " " + usage);
            return undefined;
        }

        return("!twitch [#####,username=" + userstate["display-name"] + "] roll " + args.join(" "));
    }
};


var FoundryVTTRollCommand = (function () {
    return {
        run: _FoundryVTTRollCommand.run
    };
}());
