var Roll20RollCommand = {
    run: function(self, userstate, message) {
        var slashChar = '';

        if (message.charAt(0) !== '/') {
            slashChar = '/';
        }
        return(slashChar + message);
    }
};

module.exports = function () {
    this.run = Roll20RollCommand.run;
}
