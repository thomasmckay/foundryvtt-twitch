/* global Twitch:true */
/* exported TwitchMovetoCommand */

var TwitchMovetoCommand = {
    run: function(msg, linkid, args) {
        var location, x, y;
        if (args.length === 0) {
            location = undefined;
        } else if (args.length === 1) {
            var name = args[0].toLowerCase();
            var object,
                objects = findObjs({
                    _pageid: Campaign().get("playerpageid"),
                    _type: "graphic",
                });
            object = _.find(objects, function (obj) {
                return obj.get("name").toLowerCase().startsWith(name);
            });
            if (object !== undefined) {
                x = object.get("left");
                y = object.get("top");
            }
        } else if (args.length === 2) {
            x = Twitch.numify(args[0]);
            y = Twitch.numify(args[1]);
        }

        if (location === undefined && x === undefined && y === undefined) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch moveto");
            return;
        }
        sendPing(x, y, Campaign().get('playerpageid'), undefined, true);
    },

    usage: function(detailed) {
        var message = "<b>moveto</b> [ $name | $x $y ]\n";
        if (detailed) {
            message += "    $name: Object name to move view to, case insensitive\n";
            message += "    $x $y: X,Y coordinates to move view to\n";
        }
        return(message);
    }
};
