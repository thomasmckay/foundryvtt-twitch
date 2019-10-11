// const request = require('request');
// const fs = require('fs');
// const request = require('request');
// const { exec } = require('child_process');


var _FoundryVTTPlayCommand = {


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
        var message = "!play: Add or update your character to the game. '!play help' for more information.";
        return (message);
    },


    run: function(self, userstate, args) {
        // TODO: This should be a full search of the config.players and their role
        // if (config.viewers[0].name.toLowerCase() !== userstate.username.toLowerCase()) {
        //     client.say(config.twitch.channels[0], "@" + userstate.username +
        //                ": The 'play' command is for the GM. *waves at " + config.viewers[0].name +
        //                "*");
        //     return undefined;
        // }

        console.log("########################################");

        try {
            parsed = _FoundryVTTPlayCommand.parseArgs(args);
        } catch (e) {
            console.log("ERROR 'play' argument parsing failed: " + e);
            return undefined;
        }
        if (parsed["--help"]) {
            var usage = _FoundryVTTPlayCommand.usage(true, " // ");
            console.log(usage);
            client.say(config.twitch.channels[0], "@" + userstate.username + " " + usage);
            return undefined;
        }

        _FoundryVTTPlayCommand.saveProfileImage(userstate);

        return("!twitch [#####,username=" + userstate["display-name"] + "] play " + args.join(" "));
    },


    download: function(uri, filename, callback) {
        request(uri).pipe(fs.createWriteStream(filename)).on('finish', callback);
    },


    saveProfileImage: function(userstate) {
        new Promise(function(resolve, reject) {
            request({
                url: "https://api.twitch.tv/helix/users?login=" + userstate["display-name"],
                headers: {
                    "Client-ID": config.twitch.clientid
                }
            }, function(error, response, body) {
                resolve(body);
            });
        }).then(function(body) {
            results = JSON.parse(body);

            console.log(results.data[0].profile_image_url);
            imageName = config.foundryvtt.images + "/" + userstate["display-name"];
            _FoundryVTTPlayCommand.download(results.data[0].profile_image_url, imageName + ".jpg", function() {
                exec("/bin/convert " + imageName + ".jpg -gravity Center \\( -size 300x300 xc:Black -fill White -draw 'circle 150,150 150,1' -alpha Copy \\) -compose CopyOpacity -composite -trim " + imageName + ".png", (err, stdout, stderr) => {
                    if (err) {
                        console.log("ERROR: " + err);
                        return false;
                    }

                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);
                    return true;
                });
            });

        });
    }
};


var FoundryVTTPlayCommand = (function () {
    return {
        run: _FoundryVTTPlayCommand.run
    };
}());
