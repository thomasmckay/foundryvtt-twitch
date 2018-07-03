//var Twitch = Twitch || (function() {
var Twitch = (function () {
    var TWITCH_COMMAND = "!twitch";

    var TWITCH_COMMANDS = {};

    function numify(x){
        var xNum = x;
        if (typeof(x) == typeof("")){
            if (x.charAt(0) == "+"){ x = x.substring(1); }
            xNum = parseFloat(x);
        }
        if ("" + xNum == "" + x){ return xNum; }
        return x;
    }

    function getCleanImgsrc(imgsrc) {
        var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+"thumb"+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    }

    function linkWrite(s, linkid, style, from) {
        sendChat(from, s.replace(/\n/g, "<br>"), function (ops) {
            sendChat(from, linkid + ops[0]["content"] + linkid);
        }, { noarchive: true });
    }

    function rawWrite(s, who, style, from) {
        sendChat(from, s.replace(/\n/g, "<br>"));
    }

    function write(s, who, style, from) {
        return rawWrite(s.replace(/</g, "&lt;").replace(/>/g, "&gt;"), who, style, from);
    }

    // https://gist.github.com/kkragenbrink/5499147
    function sprintf(f) {
        var formatRegexp = /%[sdj%]/g;
        var args = Array.prototype.slice.call(arguments, 0);
        var argl = args.length;

        if (typeof f !== "string") {
            var objects = [];
            while (argl--) {
                objects.unshift(args[i].toString());
            }

            return objects.join(" ");
        }

        var i = 1;
        var str = String(f).replace(formatRegexp, function (x) {
            if (x === "%%") {
                return "%";
            }
            if (i >= args) {
                return x;
            }
            switch (x) {
            case "%s" : return String(args[i++]);
            case "%d" : return Number(args[i++]);
            case "%j" : return JSON.stringify(args[i++]);
            default:
                return x;
            }
        });

        var x;
        while (i++ < argl) {
            x = args[i];
            if (x === null || typeof x !== "object") {
                str = [str, x].join(" ");
            } else {
                str += [str, x.toString()].join();
            }
        }

        return str;
    }

    function showHelp(who) {
        var helpMsg = "";
        helpMsg += "TODO: print out allowed commands";
        write(helpMsg, who, "", "Twitch");
    }

    function handleTwitchMessage(tokens, msg) {
        var linkid = tokens[1];
        var command = tokens[2];
        var args = tokens.slice(3);

        if (command === undefined) {
            showHelp(msg.who);
            return;
        }

        if (TWITCH_COMMANDS[command] === undefined) {
            write("Unrecognized command '" + command + "'", msg.who, "", "Twitch");
            showHelp(msg.who);
            return;
        }

        TWITCH_COMMANDS[command].run(msg, linkid, args);

        return;
    }

    function handleChatMessage(msg) {
        if ((msg.type !== "api") || msg.content.indexOf(TWITCH_COMMAND) !== 0) {
            return;
        }

        return handleTwitchMessage(msg.content.split(" "), msg);
    }

    function registerCommands() {
        /* eslint-disable no-undef */
        TWITCH_COMMANDS["roll"] = TwitchRollCommand;
        TWITCH_COMMANDS["ping"] = TwitchPingCommand;
        /* eslint-enable no-undef */
        if ((typeof(Shell) != "undefined") && (Shell) && (Shell.registerCommand)) {
            Shell.registerCommand(TWITCH_COMMAND, "!twitch command", "Twitch command",
                                  handleTwitchMessage);
            /* eslint-disable no-func-assign */
            if (Shell.rawWrite) {
                rawWrite = Shell.rawWrite;
            }
            if (Shell.write) {
                write = Shell.write;
            }
            /* eslint-enable no-func-assign */
        } else {
            on("chat:message", handleChatMessage);
        }
    }

    var scenarioLevel = 1;

    return {
        scenarioLevel: scenarioLevel,
        registerCommands: registerCommands,
        numify: numify,
        sprintf: sprintf,
        write: write,
        rawWrite: rawWrite,
        linkWrite: linkWrite,
        getCleanImgsrc: getCleanImgsrc
    };
}());

on("ready", function () {
    Twitch.registerCommands();
});
