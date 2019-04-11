var Roll20AdminCommand = {
    run: function(self, userstate, message) {
        return("ADMIN COMMAND");
    }
};

module.exports = function () {
    this.run = Roll20AdminCommand.run;
}
