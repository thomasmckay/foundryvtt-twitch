
var _FoundryVTTCharacterCommand = {


    parseArgs: function(args) {
        /* eslint-disable no-undef */
        var parsed = Arg.parse({
            "--help": Boolean,
        }, {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    },


    usage: function(detailed, lineSeparator = "\n") {
        var message = "!character: Update your character. '!help character' for more information.";
        if (detailed) {
            message += lineSeparator;
            message += "    hp=10: Set your PC's Hit Points" + lineSeparator;
            message += "    ac=10: Set your PC's Armor Class" + lineSeparator;
        }
        return (message);
    },


    run: function(self, userstate, args) {
        try {
            parsed = _FoundryVTTCharacterCommand.parseArgs(args);
        } catch (e) {
            console.log("ERROR 'character' argument parsing failed: " + e);
            return undefined;
        }
        if (parsed["--help"]) {
            var usage = _FoundryVTTCharacterCommand.usage(true, " // ");
            console.log(usage);
            //client.say(config.twitch.channels[0], "@" + userstate.username + " " + usage);
            return undefined;
        }

        return("!twitch [#####,username=" + userstate["display-name"] + "] character " + args.join(" "));
    },

};


var FoundryVTTCharacterCommand = (function () {
    return {
        run: _FoundryVTTCharacterCommand.run
    };
}());
