/* global Twitch:true */
/* exported TwitchRollCommand */

var TwitchRollCommand = {
    run: function(msg, linkid, args) {
        var dice;
        var xargs;

        try {
            xargs = Twitch.parse({
                "--id": String,
                "--name": String,
                "-n": "--name"
            }, options = {
                argv: args,
                permissive: true
            });
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch roll");
            return;
        }
        log(xargs);
        return;

        var allowed = TwitchAdminCommand.checkPermission(msg, TwitchAdminCommand.getTwitchCharacter(msg),
                                                         msg.who, "All", "moveto");
        if (!allowed) {
            Twitch.rawWrite("Permission Denied", msg.who, "", "twitch roll");
            return;
        }

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
