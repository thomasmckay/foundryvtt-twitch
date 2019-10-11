var _FoundryVTTRPCommand = {


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
        var message = "!rp: Send role play description of actions, etc." + lineSeparator;
        if (detailed) {
            message += "    --name | -n: Start of character name to roll for" + lineSeparator;
        }
        return message;
    },


    run: function(self, userstate, args) {
        try {
            parsed = _FoundryVTTRPCommand.parseArgs(args);
        } catch (e) {
            console.log("ERROR 'rp' argument parsing failed: " + e);
            return undefined;
        }
        console.log("???? length=" + parsed["_"].length);
        console.log("???? 0=" + parsed["_"][0]);
        console.log("???? 1=" + parsed["_"][1]);
        if (parsed["--help"] || parsed["_"].length < 1) {
            var usage = _FoundryVTTRPCommand.usage(true, " // ");
            console.log(usage);
            client.say(config.twitch.channels[0], "@" + userstate.username + " " + usage);
            return undefined;
        }

        return("!twitch [#####,username=" + userstate["display-name"] + "] rp " + args.join(" "));
    }
};


var FoundryVTTRPCommand = (function () {
    return {
        run: _FoundryVTTRPCommand.run
    };
}());
