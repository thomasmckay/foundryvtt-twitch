var _Roll20AdminCommand = {
    run: function(self, userstate, message) {
        return("!twitch [#####,username=" + userstate["display-name"] + "] " + message);
    }
};


var Roll20AdminCommand = (function () {
    return {
        run: _Roll20AdminCommand.run
    };
}());
