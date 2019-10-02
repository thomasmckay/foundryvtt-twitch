var _Roll20ArrowCommand = {
    run: function(self, userstate, message) {
        try {
            args = TwitchArrowCommand.parseArgs(message.split(" "));
        } catch (e) {
            console.log("ERROR 'arrow' argument parsing failed: " + e);
            return undefined;
        }
        if (args["--help"]) {
            var usage = TwitchArrowCommand.usage(true, " // ");
            console.log(usage);
            client.say(config.twitch.channels[0], "@" + userstate.username + " " + usage);
            return undefined;
        }

        return("!twitch [#####,username=" + userstate["display-name"] + "] " + message);
    }
};


var Roll20ArrowCommand = (function () {
    return {
        run: _Roll20ArrowCommand.run
    }
}());
