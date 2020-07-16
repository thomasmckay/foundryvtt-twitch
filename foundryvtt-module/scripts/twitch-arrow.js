class _TwitchArrowCommand {

    constructor() {
        this._arrows = {};
        this._rulers = {};
    }


    parseArgs(args) {
        /* eslint-disable no-undef */
        let parsed = Arg.parse({
            "--help": Boolean,
        }, {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    }


    async clearArrows(arrows) {
        if (!arrows) {
            return;
        }
        arrows = arrows instanceof Array ? arrows : [arrows];
        if (arrows && arrows.length > 0) {
            await canvas.scene.deleteEmbeddedEntity("Drawing", arrows.map(a => a._id));
        }
        return;
    }


    createArrowDrawing(user, startX, startY, endX, endY) {
        return({
            author: user._id,
            type: CONST.DRAWING_TYPES.FREEHAND,
            x: 0,
            y: 0,
            points: [[startX, startY], [endX, endY]],
            strokeAlpha: 1.0,
            strokeWidth: 8,
            strokeColor: user.data.color,
            fillAlpha: 0.5,
            fillType: 0,
            fillColor: user.data.color
        });
    }


    async createArrows(name, token, startIndex, args) {
        let user = Twitch.getUser(name);
        await this.clearArrows(this._arrows[name]);
        this._arrows[name] = [];

        let prevX = token.data.x + canvas.grid.w / 2,
            prevY = token.data.y + canvas.grid.w / 2;

        let arrowDrawings = [];
        for (let i = startIndex; i < args["_"].length; i++) {
            let deltaX = 0,
                deltaY = 0;

            if (args["_"][i].length < 1) {
                break;
            }

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
            arrowDrawings.push(this.createArrowDrawing(user, prevX, prevY, nextX, nextY));
            prevX = nextX;
            prevY = nextY;
        }

        if (arrowDrawings.length > 0) {
            this._arrows[name] = await canvas.scene.createEmbeddedEntity("Drawing", arrowDrawings);
        }
    }


    _animate() {
        // empty
    }


    async run(msg, params, args) {
        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch arrow");
            return;
        }
        if (args["--help"]) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch arrow");
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
        if (!Twitch.checkPermission(params["username"], name, "arrow")) {
            console.log("DEBUG: 'arrow' permission denied");
            return;
        }

        let character = Twitch.getCharacter(name);
        if (!character) {
            console.log("arrow: character for name not found: " + name);
            return;
        }
        let token = Twitch.getCharacterToken(character.name);
        if (token === undefined) {
            console.log("arrow: token for name not found: " + name);
            return;
        }

        await this.createArrows(name, token, startIndex, args);

        Twitch.addToBiography(character, "arrow", msg);
    }


    usage(detailed, lineSeparator = "\n") {
        var message = "arrow $name [--left $n --right $n] [--up $n --down $n]" + lineSeparator;
        if (detailed) {
            message += "    $name: Object name to arrow, case insensitive" + lineSeparator;
            message += "    --left $n --right $n: Left and right tile offsets from $name" + lineSeparator;
            message += "    --up $n --down $n: Up and down tile offsets from $name" + lineSeparator;
        }
        return message;
    }

    macroClearSelectedArrows() {
        for (let token of canvas.tokens.controlled) {
            this.clearArrows(this._arrows[token.name]);
        }
    }


    macroMeasureSelectedArrows() {
        for (let token of canvas.tokens.controlled) {
            let arrows = this._arrows[token.name];
            if (arrows && arrows.length > 0) {
                let user = Twitch.getUser(token.name);
                let ruler = new Ruler(user);
                this._rulers[token.name] = ruler;

                let x = arrows[0].x,
                    y = arrows[0].y;
                let point = new PIXI.Point(x, y);
                ruler.measure(point);
                ruler.waypoints = [point];
                ruler.labels.addChild(new PIXI.Text("", CONFIG.canvasTextStyle));
                arrows.forEach((arrow) => {
                    x = x + arrow.points[1][0];
                    y = y + arrow.points[1][1];
                    point = new PIXI.Point(x, y);
                    ruler.measure(point);
                    ruler.waypoints = ruler.waypoints.concat([point]);
                    ruler.labels.addChild(new PIXI.Text("", CONFIG.canvasTextStyle));
                });
                ruler.measure(point);
                //ruler.waypoints = waypoints;
            }
        }
    }
}

