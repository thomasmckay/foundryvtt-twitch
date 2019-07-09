var Roll20PingCommand = {
    run: function(self, userstate, message) {
        return("!twitch [#####] " + message);
    }
};

module.exports = function () {
    this.run = Roll20PingCommand.run;
}
