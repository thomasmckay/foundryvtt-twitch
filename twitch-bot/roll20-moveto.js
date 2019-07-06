var Roll20MovetoCommand = {
    run: function(self, userstate, message) {
        return("!twitch [#####] " + message);
    }
};

module.exports = function () {
    this.run = Roll20MovetoCommand.run;
}
