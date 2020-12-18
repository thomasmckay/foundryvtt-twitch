BUILD_DIR=build

FOUNDRYVTT_FILES = \
	twitch-arrow.js \
	twitch-character.js \
	twitch-dndbeyond.js \
	twitch-join.js \
	twitch-leave.js \
	twitch-move.js \
	twitch-ping.js \
	twitch-play.js \
	twitch-redeem.js \
	twitch-roll.js \
	twitch-rp.js \
	arg.js \
	twitch.js


all: build

build: $(BUILD_DIR)/build.js

install: build
	cp build/build.js ~/.local/share/FoundryVTT/Data/modules/foundryvtt-twitch/build.js
	cp module.json ~/.local/share/FoundryVTT/Data/modules/foundryvtt-twitch/module.json
	cp styles/foundryvtt-twitch.css ~/.local/share/FoundryVTT/Data/modules/foundryvtt-twitch/foundryvtt-twitch.css

$(BUILD_DIR)/build.js: $(addprefix scripts/, $(FOUNDRYVTT_FILES))
	mkdir -p $(@D)
	$(RM) $@
	echo "(async () => {" >> $@
	cat $^ >> $@
	echo "})();" >> $@
