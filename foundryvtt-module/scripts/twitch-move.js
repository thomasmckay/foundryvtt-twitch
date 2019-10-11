
class _TwitchMoveCommand {

    constructor() {
        // empty
    }


    parseArgs(args) {
        var parsed = {"_": []},
            x, y;

        if (args.length == 2) {
            x = Number(args[0]);
            y = Number(args[1]);
            if (Number.isInteger(x) && Number.isInteger(y)) {
                if (x < 0) {
                    parsed["--left"] = Math.abs(x);
                } else {
                    parsed["--right"] = Math.abs(x);
                }
                if (y < 0) {
                    parsed["--down"] = Math.abs(y);
                } else {
                    parsed["--up"] = Math.abs(y);
                }
                return parsed;
            }
        } else if (args.length == 3) {
            x = Number(args[1]);
            y = Number(args[2]);
            if (Number.isInteger(x) && Number.isInteger(y)) {
                if (x < 0) {
                    parsed["--left"] = Math.abs(x);
                } else {
                    parsed["--right"] = Math.abs(x);
                }
                if (y < 0) {
                    parsed["--down"] = Math.abs(y);
                } else {
                    parsed["--up"] = Math.abs(y);
                }
                parsed["_"] = [args[1]];
                return parsed;
            }
        }

        /* eslint-disable no-undef */
        parsed = Arg.parse({
            "--help": Boolean,
            "--left": Number,
            "--right": Number,
            "--up": Number,
            "--down": Number,
            "-l": "--left",
            "-r": "--right",
            "-u": "--up",
            "-d": "--down"
        }, {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    }


    async run(msg, params, args) {
        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch move");
            return;
        }
        if (args["--help"]) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch move");
            return;
        }

        let wasdRE = /^[wasd]+$/
        let startIndex = 0;
        let name = args["_"][0];
        if (!name || wasdRE.test(name)) {
            name = params["username"];
        } else {
            startIndex = 1;
        }
        if (!Twitch.checkPermission(params["username"], name, "move")) {
            console.log("DEBUG: 'move' permission denied");
            return;
        }

        let character = Twitch.getCharacter(name);
        if (!character) {
            console.log("arrow: character for name not found: " + name);
            return;
        }
        let token = Twitch.getCharacterToken(character.name);
        if (token === undefined) {
            console.log("move: token for name not found: " + name);
            return;
        }

        let prevX = token.data.x,
            prevY = token.data.y;

        for (let i = startIndex; i < args["_"].length; i++) {
            let deltaX = 0,
                deltaY = 0;

            for (let c = 0; c < args["_"][i].length; c++) {
                if (args["_"][i][c] === "w") {
                    deltaY = deltaY - 1;
                } else if (args["_"][i][c] === "s") {
                    deltaY = deltaY + 1;
                } else if (args["_"][i][c] === "a") {
                    deltaX = deltaX - 1;
                } else if (args["_"][i][c] === "d") {
                    deltaX = deltaX + 1;
                }
            }

            let nextX = prevX + deltaX * canvas.grid.w,
                nextY = prevY + deltaY * canvas.grid.h;

            if (token.checkCollision({x: nextX, y: nextY })) {
                break;
            }

            await token.update({
                x: nextX,
                y: nextY
            });
            prevX = nextX;
            prevY = nextY;
        }

        Twitch.sendScenePan();

        Twitch.addToBiography(character, "move", msg);
    }

    usage(detailed, lineSeparator = "\n") {
        var message = "move $name [--left $n --right $n] [--up $n --down $n]" + lineSeparator;
        if (detailed) {
            message += "    $name: Object name to move, case insensitive" + lineSeparator;
            message += "    --left $n --right $n: Left and right tile offsets from $name" + lineSeparator;
            message += "    --up $n --down $n: Up and down tile offsets from $name" + lineSeparator;
        }
        return message;
    }
}
