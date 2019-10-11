import request from "request";
import { config } from "./config/config.js";


new Promise(function(resolve, reject) {
    request({
        method: "POST",
        url: "https://id.twitch.tv/oauth2/token" +
            "?client_id=" + config.twitch.clientid +
            "&client_secret=" + config.twitch.clientsecret +
            "&code=" + config.twitch.channel.code +  // IMPORTANT: Edit this to bot or channel
            "&grant_type=authorization_code" +
            "&redirect_uri=http://localhost"
    }, function(error, response, body) {
        console.log(`${body}`);
        if (error) {
            console.log("saveProfileImage: ERROR " + error);
        }
        resolve(body);
    });
}).then(function(body) {
    try {
        var results = JSON.parse(body);
    } catch (e) {
        console.log("OAuth access_token: failed to parse json: " + e);
        return false;
    }

    config.twitch.access_token = results.access_token;
    config.twitch.refresh_token = results.refresh_token;
    config.twitch.expires_in = results.expires_in;
});
