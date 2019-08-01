var Roll20SayCommand = {
    run: function(self, userstate, message) {
        return("!twitch [#####,username=" + userstate["display-name"] + "] " + message);
    }
};


var Roll20SayCommand = (function () {
    return {
        run: Roll20SayCommand.run
    };
}());

