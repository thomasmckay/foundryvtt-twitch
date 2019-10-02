BUILD_DIR=build

ROLL20_FILES = \
	../roll20-scripts/twitch-admin.js \
	../roll20-scripts/twitch-arrow.js \
	../roll20-scripts/twitch-join.js \
	../roll20-scripts/twitch-move.js \
	../roll20-scripts/twitch-ping.js \
	../roll20-scripts/twitch-query.js \
	../roll20-scripts/twitch-roll.js \
	../roll20-scripts/twitch-say.js \
	../roll20-scripts/twitch.js

TWITCH_FILES = \
	roll20-admin.js \
	roll20-arrow.js \
	roll20-join.js \
	roll20-move.js \
	roll20-ping.js \
	roll20-roll.js \
	roll20-say.js \
	roll20.js \
	twitch.js

#BUILD_FILES := $(addprefix $(BUILD_DIR)/, $(ROLL20_FILES))

all: build

build: $(BUILD_DIR)/build.js

$(BUILD_DIR)/build.js: $(ROLL20_FILES) $(TWITCH_FILES)
	mkdir -p $(@D)
	$(RM) $@
	cat $^ >> $@
