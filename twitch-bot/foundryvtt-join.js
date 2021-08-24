//const request = require('request');
const fs = require('fs');
const request = require('request');
const { exec } = require('child_process');


var _FoundryVTTJoinCommand = {


    parseArgs: function(args) {
        /* eslint-disable no-undef */
        var parsed = Arg.parse({
            "--help": Boolean,
        }, {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    },


    usage: function(detailed, lineSeparator = "\n") {
        var message = "!roll20 join: Add or update your character to the game. '!roll20 help' for more information.";
        if (detailed) {
            message += lineSeparator;
            message += "    --hp: Set your PC's Hit Points" + lineSeparator;
            message += "    --ac: Set your PC's Armor Class" + lineSeparator;
        }
        return (message);
    },


    run: function(self, userstate, args) {
        // TODO: This should be a full search of the config.players and their role
        // if (config.viewers[0].name.toLowerCase() !== userstate.username.toLowerCase()) {
        //     client.say(config.twitch.channels[0], "@" + userstate.username +
        //                ": The 'join' command is for the GM. *waves at " + config.viewers[0].name +
        //                "*");
        //     return undefined;
        // }

        try {
            parsed = _FoundryVTTJoinCommand.parseArgs(args);
        } catch (e) {
            console.log("ERROR 'join' argument parsing failed: " + e);
            return undefined;
        }
        if (parsed["--help"]) {
            var usage = _FoundryVTTJoinCommand.usage(true, " // ");
            console.log(usage);
            //client.say(config.twitch.channels[0], "@" + userstate.username + " " + usage);
            return undefined;
        }

        // Not useful since current stats are not explicitly embedded, they need to be calculated
        // if (parsed["_"].length == 1) {
        //     if (!_FoundryVTTJoinCommand.saveDndbeyond(parsed["_"][0], userstate)) {
        //         return undefined;
        //     }
        // }
        _FoundryVTTJoinCommand.saveProfileImage(userstate);

        return("!twitch [#####,username=" + userstate["display-name"] + "] join " + args.join(" "));
    },


    download: function(uri, filename, callback) {
        request(uri).pipe(fs.createWriteStream(filename)).on('finish', callback);
    },


    saveDndbeyond: function(link, userstate) {
        var campaign = "https://ddb.ac/campaigns/join/13728353864615861";

        if (!link.startsWith("https://www.dndbeyond.com/profile/")) {
            //client.say(config.twitch.channels[0], "@" + userstate["display-name"] +
            //           " See instructions for joining " + campaign);
            return false;
        }
        new Promise(function(resolve, reject) {
            request({
                url: link + "/json",
                headers: {
                    cookie: config.dndbeyond.cookie,
                }
            }, function(error, response, body) {
                if (error) {
                    //client.say(config.twitch.channels[0], "@" + userstate["display-name"] +
                    //           " Error fetching character. " +
                    //           "Confirm that character is in campaign " + campaign);
                    return false;
                }
                resolve(body);
            });
        }).then(function(body) {
            try {
                results = JSON.parse(body);
            } catch (e) {
                console.log("saveDndbeyond: failed to parse json");
                return false;
            }

            fs.writeFile(config.foundryvtt.images + "/" + userstate["display-name"] + ".json",
                         body, (err) => {
                             if (err) {
                                 console.log("saveDndbeyond: failed to save json: " + err);
                                 return false;
                             }
                         });
        })
        return true;
    },


    saveProfileImage: function(userstate) {
        new Promise(function(resolve, reject) {
            request({
                url: "https://api.twitch.tv/helix/users?login=" + userstate["display-name"],
                headers: {
                    "Client-ID": config.twitch.clientid,
                    "Authorization": "Bearer " + config.twitch.access_token
                }
            }, function(error, response, body) {
                if (error) {
                    console.log("saveProfileImage: ERROR " + error);
                }
                resolve(body);
            });
        }).then(function(body) {
            console.log("############ " + body);
            results = JSON.parse(body);

            console.log("############ " + results.data);
            console.log(results.data[0].profile_image_url);
            console.log("############ " + results.data[0].profile_image_url);
            imageName = config.foundryvtt.images + "/" + userstate["display-name"];
            _FoundryVTTJoinCommand.download(results.data[0].profile_image_url, imageName + ".jpg", function() {
                exec("/bin/convert " + imageName + ".jpg -gravity Center \\( -size 300x300 xc:Black -fill White -draw 'circle 150,150 150,1' -alpha Copy \\) -compose CopyOpacity -composite -trim " + imageName + ".png", (err, stdout, stderr) => {
                    if (err) {
                        console.log("ERROR: " + err);
                        return false;
                    }
                    return true;
                });
            });

        });
    }

};


var FoundryVTTJoinCommand = (function () {
    return {
        run: _FoundryVTTJoinCommand.run
    };
}());
