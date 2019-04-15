/* global Twitch:true */
/* exported TwitchPingCommand */

var TwitchPingCommand = {
    run: function(msg, linkid, args) {
        var location, x, y;
        if (args.length === 0) {
            location = undefined;
        } else if (args.length === 1) {
            var name = args[0];
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
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch ping");
            return;
        }
        sendPing(x, y, Campaign().get('playerpageid'));
    },

    usage: function(detailed) {
        var message = "<b>ping</b> [ $name | $x $y ]\n";
        if (detailed) {
            message += "    $name: Object name to ping, case insensitive\n";
            message += "    $x $y: X,Y coordinates to ping\n";
        }
        return(message);
    }
};
