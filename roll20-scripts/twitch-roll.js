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
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch roll");
            return;
        }
        Twitch.linkWrite("/roll " + dice, linkid, "", "twitch roll");
    },

    usage: function(detailed) {
        var message = "<b>roll</b> [$id] roll $dice\n";
        if (detailed) {
            message += "    $id: Unique ID for return result to twitch\n";
            message += "    $dice: Dice to roll (eg. d20, 2d10, d6+2)\n";
        }
        return(message);
    }
};
