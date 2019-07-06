/* global Twitch:true */
/* exported TwitchSayCommand */

var TwitchSayCommand = {
    run: function (msg, linkid, args) {
        var name, object,
            objects = findObjs({
                _pageid: Campaign().get("playerpageid"),
                _type: "graphic",
            });

        if (args.length < 2) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch say");
            return;
        }

        var name = args[0].toLowerCase();
        args = args.slice(1)

        // Prevent non-text speaking
        if (args[0].charAt(0) === "/" || args[0].charAt(0) === "`" || args[0].charAt(0) === "[") {
            return;
        }

        object = _.find(objects, function (obj) {
            return obj.get("name").toLowerCase().startsWith(name);
        });
        if (object === undefined) {
            return;
        }
        sendChat(object.get("name"), args.join(" "));
    },

    usage: function (detailed) {
        var message = "<b>say</b> $name $message\n";
        if (detailed) {
            message += "    $name: Object name to speak as, case insensitive\n";
            message += "    $message: Message to speak\n";
        }
        return message;
    }
};
