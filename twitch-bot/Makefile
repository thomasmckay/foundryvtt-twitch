BUILD_DIR=build

FOUNDRYVTT_FILES = \
	../foundryvtt-module/scripts/arg.js \
	foundryvtt-arrow.js \
	foundryvtt-character.js \
	foundryvtt-dndbeyond.js \
	foundryvtt-help.js \
	foundryvtt-join.js \
	foundryvtt-leave.js \
	foundryvtt-move.js \
	foundryvtt-play.js \
	foundryvtt-roll.js \
	foundryvtt-rp.js \
	foundryvtt.js \

TWITCH_FILES = \
	twitch.js

all: build

build: $(BUILD_DIR)/foundryvtt-build.js

$(BUILD_DIR)/foundryvtt-build.js: $(FOUNDRYVTT_FILES) $(TWITCH_FILES)
	mkdir -p $(@D)
	$(RM) $@
	cat $^ >> $@
