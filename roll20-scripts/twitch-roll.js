/* global Twitch:true */
/* exported TwitchRollCommand */

var TwitchRollCommand = {
    run: function(msg, linkid, args) {
        var dice;
        if (args.length === 0) {
            dice = undefined;
        } else if (args.length === 1) {
            dice = args[0];
        }

        if (dice === undefined) {
            Twitch.write("Usage: $id roll $dice", msg.who, "", "twitch roll");
            return;
        }
        Twitch.linkWrite("/roll " + dice, linkid, "", "twitch roll");
    }
};
