import request from "request";
import { config } from "./config/config.js";


console.log("https://id.twitch.tv/oauth2/authorize" +
            "?client_id=" + config.twitch.clientid +
            "&redirect_uri=http://localhost" +
            "&response_type=code" +
            "&scope=chat:read+chat:edit+channel:read:redemptions+bits:read");
