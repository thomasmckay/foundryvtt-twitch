var Roll20RollCommand = {
    run: function(self, userstate, message) {
        if (message.charAt(0) === '/') {
            message = message.substring(1);
        }
        return("!twitch [#####] " + message);
    }
};

module.exports = function () {
    this.run = Roll20RollCommand.run;
}
