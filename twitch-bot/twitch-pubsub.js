
import TwitchClient from "twitch";
import PubSubClient from "twitch-pubsub-client";
import ChatClient from 'twitch-chat-client';

import request from "request";
import { config } from "./config/config.js";

//import { promises as fs } from 'fs';
import fs from "fs";
import * as exec from "child_process";

import WebSocket from "ws";
import HTTPServ from "http";


(async () => {
    var app = null,
        cfg = {
            ssl: false,
            port: 30001
        },
        logfile = fs.createWriteStream(config.foundryvtt.logfile, {flags: "a"});

    var processRequest = function( req, res ) {
        res.writeHead(200);
        res.end("Request/Response\n");
    };

    app = HTTPServ.createServer( processRequest ).listen( cfg.port );

    const broadcast = (data) => {
        console.log(`BROADCASTING: ${data}`);
        if (foundryvtt) {
            foundryvtt.send(data)
        } else {
            console.log("BROADCASTING: FAILED, no foundryvtt");
        }
    };

    var wss = new WebSocket.Server( { server: app } );
    var ws = undefined;

    var foundryvtt = undefined;
    wss.on('connection', function connection(ws) {
        foundryvtt = ws;
        ws.on('message', function incoming(message) {
            broadcast("MESSAGE RECEIVED: " + message);

            if (message.indexOf(">>") == 0) {
                logfile.write(message + "\n");
            } else {
                chatClient.say(config.twitch.channels[0], message);
            }
        });
        ws.send('something');
    });



    const clientId = config.twitch.clientid;
    const clientSecret = config.twitch.clientsecret;

    // Bot
    let tokenData = {
	"accessToken": config.twitch.bot.access_token,
	"refreshToken": config.twitch.bot.refresh_token,
	"expiryTimestamp": config.twitch.bot.expires_in
    }
    const twitchBotClient = TwitchClient.withCredentials(clientId, tokenData.accessToken, undefined, {
        clientSecret,
        refreshToken: tokenData.refreshToken,
        expiry: tokenData.expiryTimestamp === null ? null : new Date(tokenData.expiryTimestamp),
        onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
            const newTokenData = {
                accessToken,
                refreshToken,
                expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
            };
            console.log(`BOT: ${JSON.stringify(newTokenData, null, 4)}`);
            //await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'UTF-8')
            config.twitch.bot.access_token = accessToken;
            config.twitch.bot.refresh_token = refreshToken;
            config.twitch.bot.expires_in = expiryDate === null ? null : expiryDate.getTime();
            fs.writeFile("config/config.js", "export const config = " + JSON.stringify(config, null, 4), (err) => {
                if (err) {
                    console.log(`Failed to save config: ${err}`);
                }
            });
        }
    });

    // Channel
    tokenData = {
	"accessToken": config.twitch.channel.access_token,
	"refreshToken": config.twitch.channel.refresh_token,
	"expiryTimestamp": config.twitch.channel.expires_in
    }
    const twitchChannelClient = TwitchClient.withCredentials(clientId, tokenData.accessToken, undefined, {
        clientSecret,
        refreshToken: tokenData.refreshToken,
        expiry: tokenData.expiryTimestamp === null ? null : new Date(tokenData.expiryTimestamp),
        onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
            const newTokenData = {
                accessToken,
                refreshToken,
                expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
            };
            console.log(`CHANNEL: ${JSON.stringify(newTokenData, null, 4)}`);
            //await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'UTF-8')
            config.twitch.channel.access_token = accessToken;
            config.twitch.channel.refresh_token = refreshToken;
            config.twitch.channel.expires_in = expiryDate === null ? null : expiryDate.getTime();
            fs.writeFile("config/config.js", "export const config = " + JSON.stringify(config, null, 4), (err) => {
                if (err) {
                    console.log(`Failed to save config: ${err}`);
                }
            });
        }
    });

    const chatClient = await ChatClient.forTwitchClient(twitchBotClient, { channels: ['pintandpie'] });
    await chatClient.connect();

    chatClient.onPrivmsg((channel, user, message) => {
        foundryVTT.processMessage(channel, user, message);
    });

    chatClient.onSub((channel, user) => {
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
    });
    chatClient.onResub((channel, user, subInfo) => {
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
    });
    chatClient.onSubGift((channel, user, subInfo) => {
        chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
    });

    const channel = await twitchBotClient.helix.users.getUserByName(config.twitch.channels[0]);

    const pubSubClient = new PubSubClient();
    await pubSubClient.registerUserListener(twitchChannelClient);

    pubSubClient.onRedemption(channel._data.id, (message) => {
        console.log(`${JSON.stringify(message, null, 4)}`);
        const color = message._data.data.redemption.reward.background_color.substring(1);
        let text = "";
        if (message._data.data.redemption.reward.title.startsWith("Heal")) {
            text = "Healed!";
        } else if (message._data.data.redemption.reward.title.startsWith("Give Advantage")) {
            text = "Advantage!";
        }
        let name = message._data.data.redemption.user_input.split(" ")[0];
        let user = message._data.data.redemption.user;
        broadcast(`!twitch [#####,username=${user.display_name}] ping ${name} color=${color} text=${text}`);
    });

    /*
    {
        "_data": {
            "data": {
                "user_name": "megylu",
                "channel_name": "pintandpie",
                "user_id": "181430464",
                "channel_id": "174053680",
                "time": "2020-06-13T15:29:04.973726163Z",
                "chat_message": "Cheer1",
                "bits_used": 1,
                "total_bits_used": 3,
                "is_anonymous": false,
                "context": "cheer",
                "badge_entitlement": {
                    "new_version": 0,
                    "previous_version": 0
                }
            },
            "version": "1.0",
            "message_type": "bits_event",
            "message_id": "4f1d7512-345c-5245-95e8-250a783d40ea"
        }
    }
    */
    pubSubClient.onBits(channel._data.id, (message) => {
        console.log(`${JSON.stringify(message, null, 4)}`);
    });

    class FoundryVTT {

        constructor() {
            this.commands = {};
        }


        addCommand(name, command) {
            this.commands[name] = command;
        }


        getCommand(name) {
            return this.commands[name.toLowerCase()];
        }


        async processMessage(channel, userName, message) {
            const tokens = message.split(" ");
            const fvttCommand = this.getCommand(tokens[0]);
            const args = tokens.slice(1);

            if (!fvttCommand) {
                return;
            }

            const user = (await twitchBotClient.helix.users.getUserByName(userName))._data;
            console.log(`${JSON.stringify(user, null, 4)}`);

            const command = fvttCommand.run(user, args);
            if (command.startsWith("!twitch")) {
                broadcast(command.substring(0, 500));
            } else if (command) {
                chatClient.say(channel, `@${userName} ${command}`);
            }
        }
    }
    const foundryVTT = new FoundryVTT();


    class Command {
        constructor(names) {
            if (!Array.isArray(names)) {
                names = [names];
            }
            this.name = names[0];

            names.forEach(name => foundryVTT.addCommand("!" + name, this));
        }


        run(user, args) {
            return `!twitch [#####,username=${user.display_name}] ${this.name} ${args.join(" ")}`;
        }


        download(uri, filename, callback) {
            request(uri).pipe(fs.createWriteStream(filename)).on('finish', callback);
        }


        saveProfileImage(user) {
            const imageName = config.foundryvtt.images + "/" + user.display_name;
            this.download(user.profile_image_url, imageName + ".jpg", function() {
                exec.exec("/bin/convert " + imageName + ".jpg -gravity Center \\( -size 300x300 xc:Black -fill White -draw 'circle 150,150 150,1' -alpha Copy \\) -compose CopyOpacity -composite -trim " + imageName + ".png", (err, stdout, stderr) => {
                    if (err) {
                        console.log("ERROR: " + err);
                        return false;
                    }
                    return true;
                });
            });
        }


        downloadDndbeyond(url) {
            new Promise(function(resolve, reject) {
                request({
                    url: url,
                    // ???? not needed any more?
                    headers: {
                        cookie: config.dndbeyond.cookie,
                    }
                }, function(error, response, body) {
                    if (error) {
                        console.log("ERROR: downloadJson: " + error);
                        return false;
                    }
                    resolve(body);
                });
            }).then(function(body) {
                return body;
                /*
                try {
                    results = JSON.parse(body);
                } catch (e) {
                    console.log("ERROR: downloadJson: failed to parse json: " + body);
                    return false;
                }

                return results;
                */
            })
        }


        saveCampaignCharacters() {
        }


        saveCharacterJson(link, name) {
            let json = this.downloadDndbeyond(link);

            if (!json) {
                return false;
            }

            console.log("???? " + config.foundryvtt.images + "/" + name + ".json");
            fs.writeFile(config.foundryvtt.images + "/" + name + ".json",
                 body, (err) => {
                     if (err) {
                         console.log("ERROR: saveCharacterJson: failed to save json: " + err);
                         return false;
                     }
                 }
            );
            return true;
        }
    }


    // !arrow
    //
    new Command(["arrow", "a"]);


    // !character
    //
    new Command(["character", "char", "c"]);


    // !ddal
    //
    class DDALCommand extends Command {
        run(user, args) {
            return "D&D Adventuers League Season 10 - Rime of the Frostmaiden // https://media.wizards.com/2020/dnd/downloads/AL_PGv_10_2.pdf // https://media.wizards.com/2020/dnd/downloads/ALPG_S10_FAQ.pdf"
        }
    }
    new DDALCommand(["ddal"]);


    // !discord
    //
    class DiscordCommand extends Command {
        run(user, args) {
            return `Join our discord community at ${config.discord.invite}`
        }
    }
    new DiscordCommand(["discord"]);


    // !dndbeyond
    //
    new Command(["dndbeyond", "dndb"]);


    // !gencon
    //
    class GenConCommand extends Command {
        run(user, args) {
            return "Gen Con 2020 Online: https://www.gencon.com/event_finder?search=FoundryVTT";
        }
    }
    new GenConCommand("gencon");


    // !help
    //
    class HelpCommand extends Command {
        run(user, args) {
            let message = "",
                command;

            if (args.length == 1) {
                command = args[0];
            } else {
                command = "help";
            }
            command = command.toLowerCase();

            if (command === "!roll" || command === "roll" || command === "!r" || command === "r") {
                message = "Roll the dice! // !roll d20 // !roll 2d20+4"
            } else if (command === "!join" || command === "join") {
                message = `Join in the fun! Create 1st level character with your Twitch name at dndbeyond.com, then join campaign ${config.dndbeyond.campaign} // Character creation rules '!help ddal' // !join https://dndbeyond.com/profile/...`
            } else if (command === "!char" || command === "char" || command === "!character" || command === "character") {
                message = "Update your characters details // !char ac=18 hp=20"
            } else if (command === "!play" || command === "play") {
                message = "Play a character! NPCs and monsters are yours to control // !play kobold"
            } else if (command === "!leave" || command === "leave") {
                message = "Leave, removing your player token. // !leave"
            } else if (command === "!move" || command === "move") {
                message = "Move yourself! WASD your way around // !move wwee // !move ww aa ww"
            } else if (command === "!arrow" || command === "arrow") {
                message = "Draw arrow lines! WASD to location // !arrow wwee // !arrow ww aa ww"
            } else if (command === "!rp" || command === "rp") {
                message = "In-character chat shown live! // !rp *raises pint glass* to us! // !rp *sits at table*<br>pie of the day?"
            } else if (command === "!discord" || command === "discord") {
                message = `Join our discord community at ${config.discord.invite}`
            } else if (command === "!dndbeyond" || command === "dndbeyond" || command === "!ddb" || command === "ddb") {
                message = "We use https://dndbeyond.com as the source-of-truth for characters and source material. '!help join' for more info // !dndbeyond https://dndbeyond.com/profile/..."
            } else if (command === "!ddal" || command === "ddal") {
                message = "D&D Adventuers League Season 10 - Rime of the Frostmaiden // https://media.wizards.com/2020/dnd/downloads/AL_PGv_10_2.pdf // https://media.wizards.com/2020/dnd/downloads/ALPG_S10_FAQ.pdf"
            } else {
                message = "!join, !roll, !play, !char, !rp, !move, !arrow, !dndbeyond, !discord, !ddal, !leave"
            }

            return message;
        }
    }
    new HelpCommand("help");


    // !join
    //
    // "https://character-service.dndbeyond.com/character/v3/character/" + characterId
    class JoinCommand extends Command {
        run(user, args) {
            this.saveProfileImage(user);

            if (args.length > 0 && args[0].startsWith("https://www.dndbeyond.com/profile/")) {
                let url = "https://character-service.dndbeyond.com/character/v3/character/" +
                    args[0].split("/")[args[0].split("/").length - 1];
                console.log("????? " + url);
                if (this.saveCharacterJson(url, user.display_name)) {
                    console.log("DEBUG: saved json " + user.display_name);
                } else {
                    console.log("DEBUG: failed to save json " + user.display_name);
                }
            }

            return `!twitch [#####,username=${user.display_name}] ${this.name} ${args.join(" ")}`;
        }
    }
    new JoinCommand("join");


    // !leave
    //
    new Command("leave");


    // !move
    //
    new Command(["move", "m"]);


    // !ping
    //
    new Command("ping");


    // !play
    //
    class PlayCommand extends Command {
        run(user, args) {
            this.saveProfileImage(user);

            return `!twitch [#####,username=${user.display_name}] ${this.name} ${args.join(" ")}`;
        }
    }
    new PlayCommand("play");


    // !roll
    //
    new Command(["roll", "r"]);


    // !rp
    //
    new Command("rp");

})();
