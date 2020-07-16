var assert = require('assert');
var sinon = require('sinon');

global.WebSocket = require('ws');

require('./foundryvtt_stubs.js');
require('../build/build.js');


global.game = { actors: [] };

describe('Twitch', function () {
    describe('getCharacter', function () {
        const stubgame = {
            actors: {
                entities: [
                    twitchCharacter,
                    pintandpieCharacter
                ]
            }
        };
        global.game = stubgame;

        it("should match lowercase 'pintandpie'", function () {
            assert.equal(pintandpieCharacter, Twitch.getCharacter("pintandpie"));
        });
        it("should match full case 'PintAndPie'", function () {
            assert.equal(pintandpieCharacter, Twitch.getCharacter("PintAndPie"));
        });
        it("should not match 'noname'", function () {
            assert.equal(undefined, Twitch.getCharacter("noname"));
        });

        it("should allow permission pintandpie / pintandpie / rp", function () {
            assert.equal(true, Twitch.checkPermission("pintandpie", "pintandpie", "rp"));
        });
        it("should allow permission pintandpie / anyname / rp", function () {
            assert.equal(true, Twitch.checkPermission("pintandpie", "anyname", "rp"));
        });
        // it("should not allow permission pintandpie / anyname / roll", function () {
        //     assert.equal(true, Twitch.checkPermission("pintandpie", "anyname", "roll"));
        // });


        it("should allow permission:: Self: rp / pintandpie / pintandpie / rp", function () {
            let feats = "Self: rp";
            assert.equal(true, Twitch._checkPermission(feats, "pintandpie", "pintandpie", "rp"));
        });
        it("should not allow permission:: Self: rp / pintandpie / anyname / rp", function () {
            let feats = "Self: rp";
            assert.equal(false, Twitch._checkPermission(feats, "pintandpie", "anyname", "rp"));
        });
        it("should allow permission:: Self: rp / pintandpie / anyname / rp", function () {
            let feats = "Self: rp\nAll: rp";
            assert.equal(true, Twitch._checkPermission(feats, "pintandpie", "anyname", "rp"));
        });
        it("should allow permission:: Self: rp / pintandpie / durnan / rp", function () {
            let feats = "Self: rp\nDurnan: rp";
            assert.equal(true, Twitch._checkPermission(feats, "pintandpie", "durnan", "rp"));
        });
        it("should not allow permission:: Self: rp / pintandpie / notdurnan / rp", function () {
            let feats = "Self: rp\nDurnan: rp";
            assert.equal(false, Twitch._checkPermission(feats, "pintandpie", "anyname", "rp"));
        });
    });
});

/*
describe('xTwitch', function () {
    describe('checkPermission', function () {
        const stubgame = {
            actors: {
                entities: [
                    twitchCharacter
                ]
            }
        };
        global.game = stubgame;

        it("should allow permission pintandpie / pintandpie / rp", function () {
            assert.equal(true, Twitch.checkPermission("pintandpie", "pintandpie", "rp"));
        });
    });
});
*/
