var _Roll20RollCommand = {
    run: function(self, userstate, message) {
        if (message.charAt(0) === '/') {
            message = message.substring(1);
        }

        try {
            args = TwitchRollCommand.parseArgs(message.split(" "));
        } catch (e) {
            console.log("ERROR 'roll' argument parsing failed: " + e);
            return undefined;
        }
        if (args["--help"] || args["_"].length !== 2) {
            var usage = TwitchRollCommand.usage(true, " // ");
            console.log(usage);
            client.say(config.twitch.channels[0], "@" + userstate.username + " " + usage);
            return undefined;
        }

        return("!twitch [#####,username=" + userstate["display-name"] + "] " + message);
    }
};


var Roll20RollCommand = (function () {
    return {
        run: _Roll20RollCommand.run
    };
}());
