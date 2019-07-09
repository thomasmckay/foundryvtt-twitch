var Roll20MovetoCommand = {
    run: function(self, userstate, message) {
        return("!twitch [#####] " + userstate["display-name"] + " " + message);
    }
};

module.exports = function () {
    this.run = Roll20MovetoCommand.run;
}
