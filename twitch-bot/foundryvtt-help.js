
var _FoundryVTTHelpCommand = {


    parseArgs: function(args) {
        /* eslint-disable no-undef */
        var parsed = Arg.parse({
            "--help": String
        }, {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    },


    usage: function(detailed, lineSeparator = "\n") {
        var message = "!help: Detailed help for interactive chat commands !join, !play, !character, !roll, !move, !arrow, !rp, !leave";
        return (message);
    },


    run: function(self, userstate, args) {
        try {
            parsed = _FoundryVTTHelpCommand.parseArgs(args);
        } catch (e) {
            console.log("ERROR '!help' argument parsing failed: " + e);
            return undefined;
        }

        if (parsed["_"].length !== 1) {
            var usage = _FoundryVTTHelpCommand.usage(true, " // ");
            console.log(usage);
            client.say(config.twitch.channels[0], "@" + userstate.username + " " + usage);
        } else {
            let command = parsed["_"][0],
                message;
            if (command === "!roll" || command === "roll") {
                message = "Roll the dice! // !roll d20 // !roll 2d20+4"
            } else if (command === "!join" || command === "join") {
                message = "Join in the fun! Create 2nd level character with your Twitch name at dndbeyond.com, then join campaign https://ddb.ac/campaigns/join/5507601294619987 // !join // !join ac=18 hp=20"
            } else if (command === "!char" || command === "char" || command === "!character" || command === "character") {
                message = "Update your characters details // !char ac=18 hp=20"
            } else if (command === "!play" || command === "play") {
                message = "Play a character! NPCs and monsters are yours to control // !play kobold"
            } else if (command === "!leave" || command === "leave") {
                message = "Leave, removing your player token. // !leave"
            } else if (command === "!move" || command === "move") {
                message = "Move yourself! WASD your way around // !move wwee // !move ww aa ww"
            } else if (command === "!arrow" || command === "arrow") {
                message = "Draw arrow lines! WASD to location // !arrow wwee // !arrow ww aa ww"
            } else if (command === "!rp" || command === "rp") {
                message = "In-character chat shown live! // !rp *raises pint glass* to us! // !rp *sits at table*<br>pie of the day?"
            } else {
                message = _FoundryVTTHelpCommand.usage(true, " // ");
            }
            client.say(config.twitch.channels[0], "@" + userstate.username + " " + message);
        }

        return undefined;
    }
};


var FoundryVTTHelpCommand = (function () {
    return {
        run: _FoundryVTTHelpCommand.run
    };
}());
