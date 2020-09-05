# Based on https://github.com/hexchat/hexchat-addons/blob/master/python/nicenicks/nicenicks.py
#################################################################
## Licensed under the WTFPL version 2.
##
## Type /HELP PLAYBYCHAT for usage info.
##

from __future__ import print_function

__module_name__ = "playbychat"
__module_version__ = "0.01"
__module_description__ = "Play-by-chat IRC nick coloring."

from collections import defaultdict
import os
import hexchat

import json

CONFIG_FILE = "code/foundryvtt-twitch/hexchat/config.js"
config = {}

def load_config():
    global config

    try:
        with open(CONFIG_FILE) as f:
            config = json.load(f)
        omsg("Config loaded")
    except BaseException as e:
        omsg("There was an error trying to loading config:", "ERR_FILEREAD")
        omsg(e, "ERR_FILEREAD")
        omsg("The file path we were trying to read from was:", "ERR_FILEREAD")
        omsg(os.path.abspath(CONFIG_FILE), "ERR_FILEREAD")


def save_config():
    global config

    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=4, sort_keys=True)
        omsg("Config saved")
    except BaseException as e:
        omsg("There was an error trying to save config:", "ERR_FILEWRITE")
        omsg(e, "ERR_FILEWRITE")
        omsg("The file path we were trying to write to was:", "ERR_FILEWRITE")
        omsg(os.path.abspath(CONFIG_FILE), "ERR_FILEWRITE")


######## GLOBALIZATION ########

if hexchat.get_prefs('text_color_nicks') == 1: # if user has enabled the
# colored nicks option in xchat...
    playbychat_enabled = True
else:
    playbychat_enabled = False
debug_enabled = False


# You can edit the following default colour table if you want the addon to use fewer colours
# (or more colours -- I left out all the ugly ones. :) The first colour in the table gets used first.
defaultcolortable = [ (11, None), (4, None), (13, None), (7, None), (8, None), (9, None), (10, None), (3, None), (12, None), (6, None), (14, None), (15, None) ]

chancolortable = {}


ec = defaultdict(str)

# This is used to specify control characters in the script.
ec.update({"b": "\002",  # bold
          "c": "\003",  # color
          "h": "\010",  # italics
          "u": "\037",  # underline
          "o": "\017",  # original attributes
          "r": "\026",  # reverse color
          "e": "\007",  # beep
          "i": "\035",  # italics
          "t": "\t"}  # tab
         )


######## MAKING STUFF HAPPEN FUNCS ########

color3_tabs = []
current_focus_tab = None

def jprint(*objects):
    hexchat.prnt("".join(objects))


def ecs(series):
    "return a series of escape codes"
    return "".join([ec[code] for code in series])


def col(foreground, background=None):
    if background is not None:
        return ec["c"] + str(foreground).zfill(2) + "," + str(background).zfill(2)
    else:
        return ec["c"] + str(foreground).zfill(2)

def dmsg(msg, desc="DEBUG", prefix="(pbc) "):
    if debug_enabled:
        omsg(msg, desc, prefix)


def omsg(msg, desc="Info", prefix="(pbc) "):
    "Other message -- Print 'msg', with 'desc' in column."
    jprint(ecs("b"), str(prefix), str(desc), ecs("bt"), str(msg))


def get_color(ctable, nick):
    color = None
    nick = nick.lower()

    # permanent colour
    pcolor = None
    if nick in config["colors"]:
        color = config["colors"][nick]
    else:
        for category in ["followers", "vips", "subscribers", "players"]:
            if nick in config[category]:
                color = config["colors"][category]

    return color


    # # iterate backwards through ctable
    # for i in range(len(ctable)-1,-1,-1):
    #     c, n = ctable[i]
    #     if pcolor != None and c == pcolor: # if we found this nick's permcolor
    #         # steal the color from whoever's using it
    #         ctable.pop(i)
    #         ctable.append((c, nick))
    #         dmsg("1: " + str(c) + " " + nick)
    #         return c
    #     elif n == nick:
    #         color = c
    #         # if this nick has a color in the table different from its permacolor
    #         # change the color in the color table
    #         if pcolor != None and c != pcolor:
    #             ctable.pop(i)
    #             c = color = pcolor
    #             ctable.append((c, nick))
    #             break
    #         else:
    #             # push nick to top of stack if it's in there
    #             dmsg(nick + "'s color was found in the colortable for this channel.", "GETCOLOR")
    #             ctable.append(ctable.pop(i))
    #             break

    # if color == None:
    #     # otherwise, add a new entry
    #     c, n = ctable.pop(0)
    #     n = nick
    #     ctable.append((c,n))
    #     color = c
    #     dmsg("A new entry was added to this colortable: " + nick + " -> " + str(c), "GETCOLOR")
    # dmsg("Resultant color: " + str(color), "GETCOLOR")
    # return color


######## XCHAT CALLBACKS ########


def color_table_command(word, word_eol, userdata):
    "Prints a color table."

    for color in range(32):
        jprint(ecs("o"), "Color #", str(color), "\t", col(color), "COLOR!")

    return hexchat.EAT_ALL


def set_nick_category(category, word, word_eol, userdata):
    paramcount = len(word) - 1 # number of parameters to this command

    if paramcount < 1: # no parameters, so display all the current nick colours
        items = config[category]
        if len(items) > 0:
            omsg("These are the current permanent mappings:", category)
            for name in items:
                jprint("\t   ", col(11), name, ecs("o"))
            omsg("To remove a user from this list, specify -nick", category)

        else:
            omsg("No nick mappings assigned.", category)
        return hexchat.EAT_ALL

    nick = word[1].lower() # get lowercase nick

    if nick[0] == "-": # remove the nick!
        nick = nick[1:] # get rid of that - at the beginning
        if nick in config[category]:
            config[category].remove(nick)
            omsg("Removed "+nick+" from "+category+" table", category)
            save_config()
        else:
            omsg(nick+" not in list", category)

        return hexchat.EAT_ALL

    if paramcount == 1: # just the nick was supplied
        if not nick in config[category]:
            config[category].append(nick)
            omsg("Added "+nick+" to "+category+" table", category)
            save_config()
        else:
            omsg(nick+" already in list", category)

    else:
        omsg("Too many parameters, guy!","ERRNOR")

    return hexchat.EAT_ALL


def setvip_command(word, word_eol, userdata):
    set_nick_category("vips", word, word_eol, userdata)


def setfollower_command(word, word_eol, userdata):
    set_nick_category("followers", word, word_eol, userdata)


def setsubscriber_command(word, word_eol, userdata):
    set_nick_category("subscribers", word, word_eol, userdata)


def setplayer_command(word, word_eol, userdata):
    set_nick_category("players", word, word_eol, userdata)


def setcolor_command(word, word_eol, userdata):
    "Callback for SETCOLOR command, which binds a nick to a specific color"

    paramcount = len(word) - 1 # number of parameters to this command

    if paramcount < 1: # no parameters, so display all the current nick colours
        items = config["colors"].items()
        if len(items) > 0:
            # print perma-color table
            omsg("These are the current permanent colour mappings:", "PERMA-COLORS")
            for name, color in items:
                jprint("\t   ", col(color), name, " = ", col(11), str(color), ecs("o"))
            omsg("To remove a user from this list, type /setcolor -nick", "NOTE")

        else:
            omsg("No nick colour mappings assigned. Type /HELP SETCOLOR for more info.", "PERMA-COLORS")
        return hexchat.EAT_ALL

    nick = word[1].lower() # get lowercase nick

    if nick[0] == "-": # remove the nick!
        nick = nick[1:] # get rid of that - at the beginning
        if nick in config["colors"]:
            config["colors"].pop(nick)
            omsg("Removed "+nick+" from color table", "BALEETED")
            save_config()
        else:
            omsg(nick+" ain't in dere, bey!", "ERRN0R")

        return hexchat.EAT_ALL

    if paramcount == 1: # just the nick was supplied
        if nick in config["colors"]:
            color = config["colors"].get(nick)
            dmsg("testing", "GUICOLOR")
            omsg(col(color) + nick + ecs("o") + " is color " + str(color), "INFO")
        else:
            omsg(col(11) + nick + ecs("o") + " isn't in the database", "INFO")

    elif paramcount == 2: # nick and parameter supplied

        color = int(word[2]) # get the color

        if 0 <= color <= 31:
            # give it a new color
            config["colors"][nick] = color
            omsg("".join(["New color -> ", col(color), nick, ecs("o")]), "SETCOLOR")

            save_config()
        else:
            omsg("Not a valid colour! Please pick one between 0 and 31. See the 'Preferences...' for the list of colours.", "ERROR")

    else:
        omsg("Too many parameters, guy!","ERRNOR")

    return hexchat.EAT_ALL


def reloadconfig_command(word, word_eol, userdata):
    load_config()


def playbychat_command(word, word_eol, userdata):
    "Enabler/disabler for the entire script"

    global playbychat_enabled

    if len(word) == 2:
        command = word[1].lower()
        if command == "on" or command == "true" or command == "1":
            playbychat_enabled = True
        if command == "off" or command == "false" or command == "0":
            playbychat_enabled = False

    print("+\tPlayByChat enabled:", playbychat_enabled)
    return hexchat.EAT_ALL


def nicedebug_command(word, word_eol, userdata):
    "Enabler/disabler for DEBUG INFO"

    global debug_enabled

    if len(word) == 2:
        command = word[1].lower()
        if command == "on" or command == "true" or command == "1":
            debug_enabled = True
        elif command == "off" or command == "false" or command == "0":
            debug_enabled = False

    print("+\tPlayByChat Debug enabled: ", debug_enabled or "Off")
    return hexchat.EAT_ALL


def tab_hilight_callback(word, word_eol, userdata, attributes):
    """Called when we expect a tab to be coloured '3', so we don't override that
    colour with the colour '2' in message_callback."""
    ctx = hexchat.get_context()
    if ctx != current_focus_tab:
        color3_tabs.append(ctx)
        dmsg("Got highlight. Added this context to color3_tabs.", "GUICOLOR")
    return hexchat.EAT_NONE


def is_color3_tab(our_ctx):
    for ctx in color3_tabs:
        if ctx == our_ctx:
            return True
    return False


def xxmessage_callback(word, word_eol, userdata, attributes):
    """"This function is called every time a new 'Channel Message' or
    'Channel Action' (like '/me hugs elhaym') event is going to occur.
    Here, we change the event in the way we desire then pass it along."""
    global chancolortable
    global defaultcolortable
    if playbychat_enabled:
        event_name = userdata
        nick = word[0]
        nick = hexchat.strip(nick, -1, 1) # remove existing colours

        # This bit prevents infinite loops.
        # Assumes nicks will never normally begin with "\017".
        if nick.startswith(ec["o"]):
            # We already did this event and are seeing it again, because this function gets triggered by events that even it generates.
            dmsg("Already-processed nick found: " + repr(nick), "LOOP")
            return hexchat.EAT_NONE

        dmsg("The time attribute for this event is {}".format(attributes.time), "PRINTEVENT")
        dmsg("COLORTABLE length = %d" % len(chancolortable), "PRINTEVENT")

        chan = hexchat.get_info("channel")
        net = hexchat.get_info("network")
        ctx = hexchat.get_context()
        if net not in chancolortable:
            # create an empty network entry
            dmsg("Making new network "+net, "COLORTABLE")
            chancolortable[net] = {}
            dmsg("chancolortable: %s" % (chancolortable))
        if chan not in chancolortable[net]:
            # make new color table
            dmsg("Making new color table for "+chan, "COLORTABLE")
            chancolortable[net][chan] = defaultcolortable[:]
            dmsg("chancolortable: %s" % (chancolortable))
        else:
            dmsg("Found COLORTABLE of length "+str(len(chancolortable[net][chan]))+" for channel "+chan+" on network "+net, "COLORTABLE")
        ctable = chancolortable[net][chan]
        dmsg("COLORTABLE for "+chan+" on "+net+" = " + str(ctable), "COLORTABLE")
        color = get_color(ctable, nick)
        newnick = ecs('o') + col(color) + nick
        word[0] = newnick
        #word[1] = "\002\026{0}{1}".format(col(color), word[1])
        word[1] = "\002\026{0}{1}".format(col(color), word[1])
        dmsg('Old nick: %s - New Nick: %s' % (nick, newnick))
        hexchat.emit_print(event_name, *word, time=attributes.time)
        #hexchat.emit_print(event_name, "\002\026{0}{1}".format(color, word_eol))
        if not is_color3_tab(ctx):
            hexchat.command("gui color 2") # required since HexChat 2.12.4
        return hexchat.EAT_ALL
    else:
        return hexchat.EAT_NONE



def message_callback(word, word_eol, userdata, attributes):
    global chancolortable
    global defaultcolortable

    event_name = userdata
    nick = word[0]
    nick = hexchat.strip(nick, -1, 1) # remove existing colours

    # This bit prevents infinite loops.
    # Assumes nicks will never normally begin with "\017".
    if nick.startswith(ec["o"]):
        # We already did this event and are seeing it again, because this function gets triggered by events that even it generates.
        dmsg("Already-processed nick found: " + repr(nick), "LOOP")
        return hexchat.EAT_NONE

    dmsg("The time attribute for this event is {}".format(attributes.time), "PRINTEVENT")
    dmsg("COLORTABLE length = %d" % len(chancolortable), "PRINTEVENT")

    chan = hexchat.get_info("channel")
    net = hexchat.get_info("network")
    ctx = hexchat.get_context()
    if net not in chancolortable:
        # create an empty network entry
        dmsg("Making new network "+net, "COLORTABLE")
        chancolortable[net] = {}
        dmsg("chancolortable: %s" % (chancolortable))
    if chan not in chancolortable[net]:
        # make new color table
        dmsg("Making new color table for "+chan, "COLORTABLE")
        chancolortable[net][chan] = defaultcolortable[:]
        dmsg("chancolortable: %s" % (chancolortable))
    else:
        dmsg("Found COLORTABLE of length "+str(len(chancolortable[net][chan]))+" for channel "+chan+" on network "+net, "COLORTABLE")
    ctable = chancolortable[net][chan]
    dmsg("COLORTABLE for "+chan+" on "+net+" = " + str(ctable), "COLORTABLE")
    color = get_color(ctable, nick)

    if not color:
        return hexchat.EAT_NONE

    newnick = ecs('o') + col(color) + nick
    word[0] = newnick
    #word[1] = "\002\026{0}{1}".format(col(color), word[1])
    word[1] = "\002\026{0}{1}".format(col(color), word[1])
    dmsg('Old nick: %s - New Nick: %s' % (nick, newnick))
    hexchat.emit_print(event_name, *word, time=attributes.time)
    #hexchat.emit_print(event_name, "\002\026{0}{1}".format(color, word_eol))
    if not is_color3_tab(ctx):
        hexchat.command("gui color 2") # required since HexChat 2.12.4
    return hexchat.EAT_ALL


########## HOOK IT UP ###########


load_config()


hexchat.hook_print_attrs("Channel Message", message_callback, "Channel Message", priority=hexchat.PRI_HIGHEST)
hexchat.hook_print_attrs("Channel Action", message_callback, "Channel Action", priority=hexchat.PRI_HIGHEST)
hexchat.hook_print_attrs("Channel Msg Hilight", tab_hilight_callback, priority=hexchat.PRI_LOW)
hexchat.hook_print_attrs("Channel Action Hilight", tab_hilight_callback, priority=hexchat.PRI_LOW)

hexchat.hook_command("PLAYBYCHAT", playbychat_command, None, hexchat.PRI_NORM, "PLAYBYCHAT INFO:\t\nThis script will colourize nicks of users automatically, using a 'least-recently-used' algorithm (to avoid two people having the same colour).\n\nFriends' nicks can be assigned a specific colour with the SETCOLOR command, a list of colours can be shown with the COLORTABLE command, and this script can be enabled/disabled with the PLAYBYCHAT command (/PLAYBYCHAT on or /PLAYBYCHAT off).\n\nAlso '/NICEDEBUG on'")
hexchat.hook_command("NICEDEBUG", nicedebug_command, None, hexchat.PRI_NORM, "Usage:\t/NICEDEBUG On to enable for all messages, /NICEDEBUG Off to disable, or to enable showing only debug messages with a certain description: '/NICEDEBUG description'. Remove a description: '/NICEDEBUG -description'")
hexchat.hook_command("SETCOLOR", setcolor_command, None, hexchat.PRI_NORM, "Usage:\t/SETCOLOR -- show colour mappings\n/SETCOLOR [nick] [color] -- permanently maps [color] to [nick] (stealing the colour from other users if necessary)\n/SETCOLOR -[nick] -- remove [nick] from colour mapping table")
hexchat.hook_command("COLORTABLE", color_table_command)

hexchat.hook_command("SETPLAYER", setplayer_command)
hexchat.hook_command("SETVIP", setvip_command)
hexchat.hook_command("SETSUBSCRIBER", setsubscriber_command)
hexchat.hook_command("SETFOLLOWER", setfollower_command)

hexchat.hook_command("RELOADCONFIG", reloadconfig_command)

omsg("PlayByChat version {} loaded!".format(__module_version__))
print("+\tPlayByChat enabled:", playbychat_enabled)
if not playbychat_enabled:
    print("+\tTo have PlayByChat enabled on start, do '/set text_color_nicks 1', or turn that setting on at:")
    print("+\tSettings → Preferences → Appearance → Colored nick names")
defctable = 'Default colour table:'
for c, n in defaultcolortable:
    defctable = '{0} \003{1:02d}{1:02d}'.format(defctable,c)
omsg(defctable)

