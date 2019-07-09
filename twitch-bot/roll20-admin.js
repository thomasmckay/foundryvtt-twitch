var Roll20AdminCommand = {
    run: function(self, userstate, message) {
        return("!twitch [#####] " + message);
    }
};

module.exports = function () {
    this.run = Roll20AdminCommand.run;
}
