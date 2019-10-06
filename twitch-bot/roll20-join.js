var request = require('request');

var _Roll20JoinCommand = {
    run: function(self, userstate, message) {
        if (message.charAt(0) === '/') {
            message = message.substring(1);
        }

        // TODO: This should be a full search of the config.players and their role
        // if (config.viewers[0].name.toLowerCase() !== userstate.username.toLowerCase()) {
        //     client.say(config.twitch.channels[0], "@" + userstate.username +
        //                ": The 'join' command is for the GM. *waves at " + config.viewers[0].name +
        //                "*");
        //     return undefined;
        // }

        try {
            args = TwitchJoinCommand.parseArgs(message.split(" "));
        } catch (e) {
            console.log("ERROR 'join' argument parsing failed: " + e);
            return undefined;
        }
        if (args["--help"]) {
            var usage = TwitchJoinCommand.usage(true, " // ");
            console.log(usage);
            client.say(config.twitch.channels[0], "@" + userstate.username + " " + usage);
            return undefined;
        }

        if (args["--dndbeyond"]) {
            var link = args["--dndbeyond"];
            var campaign = "https://ddb.ac/campaigns/join/5507601129600937";
            if (!link.startsWith("https://www.dndbeyond.com/profile/")) {
                client.say(config.twitch.channels[0], "@" + userstate.username +
                           " URL must start with 'https://www.dndbeyond.com/profile/', " +
                           "and character must be in campaign " + campaign);
                return undefined;
            }
            request({
                headers: {
                    cookie: config.dndbeyond.cookie,
                },
                url: link + "/json"
            }, function (error, response, body) {
                if (error) {
                    client.say(config.twitch.channels[0], "@" + userstate.username +
                               " Error fetching character. " +
                               "Confirm that character is in campaign " + campaign);
                    return undefined;
                }

                try {
                    JSON.parse(body);
                } catch (e) {
                    client.say(config.twitch.channels[0], "@" + userstate.username +
                               " Error parsing character, please try again.");
                    return undefined;
                }
                client.say(config.twitch.channels[0], "@" + userstate.username +
                           " Importing character now! Run '!roll20 join' again to update token.");
                console.log("Running !beyond --import now");
                Roll20.processMessage(nightmare, self, userstate,
                                      "!roll20 join --json " + body);
                //return("!beyond --import " + body);
                // This has an error in roll20, perhaps due to nesting and some global var
                // not set correctly.
                // return("!twitch [#####,username=" + userstate["display-name"] + "] " +
                //        "join --json " + body);
            });
        }

        return("!twitch [#####,username=" + userstate["display-name"] + "] " + message);
    }
};


var Roll20JoinCommand = (function () {
    return {
        run: _Roll20JoinCommand.run
    };
}());
