var Roll20SayCommand = {
    run: function(self, userstate, message) {
        return("!twitch [#####] " + message);
    }
};

module.exports = function () {
    this.run = Roll20SayCommand.run;
}
