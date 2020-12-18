let RUMORS = [
    "The black market price of chardalyn has doubled recently",
    "Some rumors that duergar have been seen in the Ten-Towns after dark",
    "Whispers of a duergar fortress located in the Spine of the World",
    "In Caer-Konig, local establishments are beset by vandals and thieves that skulk about unseen.",
    "A ship's figurehead made of chardalyn was retrieved from Lac Dinneshere.",
    "A band of adventurers used a telekinesis spell to raise the figurehead from the depths of Lac Dinneshere a few months ago and hauled it to Easthaven, hoping for a reward.",
    "A ship's figurehead stored in Easthaven's town hall is rumored to be cursed.",
    "Several climbing groups have been had their ropes cut and base camps destroyed on Kelvin's Cairn",
    "Guides are declining to lead groups to the north and eastern sides of Kelvin's Cairn",
];

class _TwitchRedeemCommand {

    constructor() {
        // empty
    }


    parseArgs (args) {
        var parsed = Arg.parse({
            "--help": Boolean,
            "--name": String,
            "--color": String,
            "--text": String
        }, {
            argv: args,
            permissive: true
        });

	parsed["_"] = parsed["_"].filter(item => {
	    let arg = item.split("=");
            if (arg.length == 2) {
                parsed["--" + arg[0].toLowerCase()] = arg[1];
		return false;
            }
	    return true;
	});

        return parsed;
    }


    async run (msg, params, args) {
        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch redeem");
	    console.log(`ERROR: ${e}`);
            return;
        }
        if (args["--help"]) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch redeem");
            return;
        }

        let text = !args["--text"] ? "" : args["--text"];
        let color = !args["--color"] ? "0x58FF33" : "0x" + args["--color"];

        let targetName = !args["--name"] ? params["username"] : args["--name"];
        if (targetName[0] === "@") {
            targetName = targetName.substring(1);
        }
        let user = Twitch.getUser(targetName);
	if (!user) {
	    user = Twitch.getUser("Twitch");
	}

        if (text === "rumor") {
            let roll = new Roll(`1d${RUMORS.length}`);
            roll.toMessage({
                user: user.id
            });
            Twitch.socket.send(`@${params["username"]} (${roll.total}) ${RUMORS[roll.total - 1]}`);

            let token = Twitch.getCharacterToken("Twitch");
            if (!token) {
                console.log(`Twitch token not found`);
                return;
            }

            let message = `<div class="twitch-redeem-${text}">@${params["username"]} redeems channel points to hear rumor: ${RUMORS[roll.total - 1]}</div>`;
            await ChatMessage.create({
    		speaker: ChatMessage.getSpeaker({ token: token }),
    		user: user,
    		content: message,
    		type: CONST.CHAT_MESSAGE_TYPES.EMOTE
            }, {
    		chatBubble: false
            });
            return;
        }

        let token = Twitch.getCharacterToken(targetName);
        if (!token) {
            console.log(`Character ${targetName} token not found`);
            Twitch.socket.send(`@${params["username"]} token for "${targetName}" not found. First word in redemption message should be a PC or NPC's name`);
            return;
        }

        try {
            color = Number(color);
        } catch (error) {
            console.log(`Bad color ${color}`);
            color = 0x58FF33;
        }

        canvas.controls.pointer.ping({
	    position: {
		x: token.x + canvas.grid.w / 2,
		y: token.y + canvas.grid.w / 2
            }
	});

        if (!Twitch.checkPermission(params["username"], params["username"], "redeem")) {
            console.log("DEBUG: 'redeem' permission denied");
            return;
        }

	console.log(`DEBUG: div class="twitch-redeem" background="#${color}"`);
        let message = `<div class="twitch-redeem-${text}">@${params["username"]} redeems channel points to give @${targetName} ${text} ~ ${args["_"].join(" ")}</div>`;
        await ChatMessage.create({
		speaker: ChatMessage.getSpeaker({ token: token }),
		user: user,
		content: message,
		type: CONST.CHAT_MESSAGE_TYPES.EMOTE
        }, {
		chatBubble: false
        });
    }


    usage (detailed, lineSeparator = "\n") {
        var message = "!redeem" + lineSeparator;

        return message;
    }
}
