var _FoundryVTTArrowCommand = {

    parseArgs: function(args) {
        /* eslint-disable no-undef */
        let parsed = Arg.parse({
            "--help": Boolean,
        }, {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    },


    usage: function(detailed, lineSeparator = "\n") {
        var message = "!arrow token with wasd" + lineSeparator;
        if (detailed) {
            message += "!arrow wwdd" + lineSeparator;
            message += "!arrow www ddd" + lineSeparator;
        }
        return message;
    },


    run: function(self, userstate, args) {
        try {
            parsed = _FoundryVTTArrowCommand.parseArgs(args);
        } catch (e) {
            console.log("ERROR 'arrow' argument parsing failed: " + e);
            return undefined;
        }
        if (parsed["--help"]) {
            var usage = _FoundryVTTArrowCommand.usage(true, " // ");
            console.log(usage);
            client.say(config.twitch.channels[0], "@" + userstate.username + " " + usage);
            return undefined;
        }

        return("!twitch [#####,username=" + userstate["display-name"] + "] arrow " + args.join(" "));
    }
};


var FoundryVTTArrowCommand = (function () {
    return {
        run: _FoundryVTTArrowCommand.run
    }
}());
