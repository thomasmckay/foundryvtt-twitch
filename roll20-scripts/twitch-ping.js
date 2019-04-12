/* global Twitch:true */
/* exported TwitchPingCommand */
// ?????

var TwitchPingCommand = {
    run: function(msg, linkid, args) {
        var location, x, y;
        if (args.length === 0) {
            location = undefined;
        } else if (args.length === 1) {
            location = args[0];
        } else if (args.length === 2) {
            x = Twitch.numify(args[0]);
            y = Twitch.numify(args[1]);
        }

        if (location === undefined && x === undefined && y === undefined) {
            Twitch.write("Usage: ping [ $location | $x $y ]", msg.who, "", "twitch ping");
            return;
        }
        sendPing(x, y, Campaign().get('playerpageid'));
    }
};
