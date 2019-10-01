/* exported Twitch */

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
        if (parts) {
            return parts[1]+"thumb"+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    }

    function linkWrite(s, params, style, from) {
        sendChat(from, s.replace(/\n/g, "<br>"), function (ops) {
            sendChat(from, params["linkid"] + ops[0]["content"] + params["linkid"]);
        }, { noarchive: true });
    }

    function rawWrite(s, who, style, from) {
        sendChat(from, s.replace(/\n/g, "<br>"), undefined, style);
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
        var helpMsg = "<b>!twitch commands</b>:\n";
        _.each(TWITCH_COMMANDS, function (command) {
            helpMsg += command.usage(false);
        });
        rawWrite(helpMsg, who, "", "Twitch");
    }

    function handleTwitchMessage(tokens, msg) {
        var params = {},
            start = 1;

        if (tokens[1] && tokens[1].charAt(0) === "[") {
            args = tokens[1].substring(1, tokens[1].length-1).split(",");
            start = 2;

            params = {
                linkid: args[0]
            };
            for (let i = 1, len = args.length; i < len; i++) {
                if (args[i].startsWith("username=")) {
                    params["username"] = args[i].substring("username=".length);
                }
            }
        }

        var command = tokens[start];
        var args = tokens.slice(start + 1);

        if (command === undefined) {
            showHelp(msg.who);
            return;
        }

        if (command === "help") {
            showHelp(msg.who);
            return;
        } else if (TWITCH_COMMANDS[command] === undefined) {
            write("Unrecognized command '" + command + "'", msg.who, "", "Twitch");
            showHelp(msg.who);
            return;
        }

        TWITCH_COMMANDS[command].run(msg, params, args);

        return;
    }

    function handleChatMessage(msg) {
        if ((msg.type !== "api")) {
            return;
        }

        if (msg.content.indexOf("!beyond --import ") === 0) {
            Twitch.write(msg, msg.who, {noarchive: true}, "!beyond");
            return;
        }

        if (msg.content.indexOf(TWITCH_COMMAND) !== 0) {
            return;
        }
        return handleTwitchMessage(msg.content.split(" "), msg);
    }

    function registerCommands() {
        /* eslint-disable no-undef */
        TWITCH_COMMANDS["admin"] = TwitchAdminCommand;
        TWITCH_COMMANDS["join"] = TwitchJoinCommand;
        TWITCH_COMMANDS["move"] = TwitchMoveCommand;
        TWITCH_COMMANDS["ping"] = TwitchPingCommand;
        TWITCH_COMMANDS["query"] = TwitchQueryCommand;
        TWITCH_COMMANDS["roll"] = TwitchRollCommand;
        TWITCH_COMMANDS["say"] = TwitchSayCommand;
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

    // https://github.com/zeit/arg
    const flagSymbol = Symbol('arg flag');

    function arg(opts, {argv = [], permissive = false, stopAtPositional = false} = {}) {
        if (!opts) {
            throw new Error('Argument specification object is required');
        }

        const result = {_: []};

        const aliases = {};
        const handlers = {};

        for (const key of Object.keys(opts)) {
            if (!key) {
                throw new TypeError('Argument key cannot be an empty string');
            }

            if (key[0] !== '-') {
                throw new TypeError(`Argument key must start with '-' but found: '${key}'`);
            }

            if (key.length === 1) {
                throw new TypeError(`Argument key must have a name; singular '-' keys are not allowed: ${key}`);
            }

            if (typeof opts[key] === 'string') {
                aliases[key] = opts[key];
                continue;
            }

            let type = opts[key];
            let isFlag = false;

            if (Array.isArray(type) && type.length === 1 && typeof type[0] === 'function') {
                const [fn] = type;
                type = (value, name, prev = []) => {
                    prev.push(fn(value, name, prev[prev.length - 1]));
                    return prev;
                };
                isFlag = fn === Boolean || fn[flagSymbol] === true;
            } else if (typeof type === 'function') {
                isFlag = type === Boolean || type[flagSymbol] === true;
            } else {
                throw new TypeError(`Type missing or not a function or valid array type: ${key}`);
            }

            if (key[1] !== '-' && key.length > 2) {
                throw new TypeError(`Short argument keys (with a single hyphen) must have only one character: ${key}`);
            }

            handlers[key] = [type, isFlag];
        }

        for (let i = 0, len = argv.length; i < len; i++) {
            const wholeArg = argv[i];

            if (stopAtPositional && result._.length > 0) {
                result._ = result._.concat(argv.slice(i));
                break;
            }

            if (wholeArg === '--') {
                result._ = result._.concat(argv.slice(i + 1));
                break;
            }

            if (wholeArg.length > 1 && wholeArg[0] === '-') {
                /* eslint-disable operator-linebreak */
                const separatedArguments = (wholeArg[1] === '-' || wholeArg.length === 2)
                    ? [wholeArg]
                    : wholeArg.slice(1).split('').map(a => `-${a}`);
                /* eslint-enable operator-linebreak */

                for (let j = 0; j < separatedArguments.length; j++) {
                    const arg = separatedArguments[j];
                    const [originalArgName, argStr] = arg[1] === '-' ? arg.split('=', 2) : [arg, undefined];

                    let argName = originalArgName;
                    while (argName in aliases) {
                        argName = aliases[argName];
                    }

                    if (!(argName in handlers)) {
                        if (permissive) {
                            result._.push(arg);
                            continue;
                        } else {
                            const err = new Error(`Unknown or unexpected option: ${originalArgName}`);
                            err.code = 'ARG_UNKNOWN_OPTION';
                            throw err;
                        }
                    }

                    const [type, isFlag] = handlers[argName];

                    if (!isFlag && ((j + 1) < separatedArguments.length)) {
                        throw new TypeError(`Option requires argument (but was followed by another short argument): ${originalArgName}`);
                    }

                    if (isFlag) {
                        result[argName] = type(true, argName, result[argName]);
                    } else if (argStr === undefined) {
                        if (argv.length < i + 2 || (argv[i + 1].length > 1 && argv[i + 1][0] === '-')) {
                            const extended = originalArgName === argName ? '' : ` (alias for ${argName})`;
                            throw new Error(`Option requires argument: ${originalArgName}${extended}`);
                        }

                        result[argName] = type(argv[i + 1], argName, result[argName]);
                        ++i;
                    } else {
                        result[argName] = type(argStr, argName, result[argName]);
                    }
                }
            } else {
                result._.push(wholeArg);
            }
        }

        return result;
    }

    arg.flag = fn => {
        fn[flagSymbol] = true;
        return fn;
    };

    // Utility types
    arg.COUNT = arg.flag((v, name, existingCount) => (existingCount || 0) + 1);

    return {
        parse: arg,
        registerCommands: registerCommands,
        numify: numify,
        sprintf: sprintf,
        write: write,
        rawWrite: rawWrite,
        linkWrite: linkWrite,
        getCleanImgsrc: getCleanImgsrc
    };
}());
