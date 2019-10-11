
var _FoundryVTTDnDBeyondCommand = {


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
        var message = "!character: Update your DnDBeyond character linke. '!help dndbeyond' for more information.";
        return (message);
    },


    run: function(self, userstate, args) {
        try {
            parsed = _FoundryVTTDnDBeyondCommand.parseArgs(args);
        } catch (e) {
            console.log("ERROR 'dndbeyond' argument parsing failed: " + e);
            return undefined;
        }
        if (parsed["--help"]) {
            var usage = _FoundryVTTDnDBeyondCommand.usage(true, " // ");
            console.log(usage);
            //client.say(config.twitch.channels[0], "@" + userstate.username + " " + usage);
            return undefined;
        }

        return("!twitch [#####,username=" + userstate["display-name"] + "] dndbeyond " + args.join(" "));
    },

};


var FoundryVTTDnDBeyondCommand = (function () {
    return {
        run: _FoundryVTTDnDBeyondCommand.run
    };
}());
