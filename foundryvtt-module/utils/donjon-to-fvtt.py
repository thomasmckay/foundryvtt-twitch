import os
import uuid

GRID = 100

def fvtt_start(output_file, width, height):
    output_file.write("""
        {
            "name": "donjon",
            "sort": 100001,
            "flags": {
              "exportSource": {
                "world": "donjon",
                "system": "dnd5e",
                "coreVersion": "0.5.2",
                "systemVersion": 0.85
              }
            },
            "description": "",
            "navigation": true,
            "navOrder": 100001,
            "active": true,
            "initial": null,
            "width": %s,
            "height": %s,
            "backgroundColor": "#999999",
            "tiles": [],
            "gridType": 1,
            "grid": %s,
            "shiftX": %s,
            "shiftY": %s,
            "gridColor": "#000000",
            "gridAlpha": 0.2,
            "gridDistance": 5,
            "gridUnits": "ft",
            "tokens": [],
            "walls": [
    """ % (width * GRID + 2, height * GRID + 2, GRID,
           8 * GRID, 10 * GRID))


def fvtt_finish(output_file):
    output_file.write("""
            ],
            "tokenVision": true,
            "fogExploration": false,
            "lights": [],
            "globalLight": true,
            "darkness": 0,
            "sounds": [],
            "templates": [],
            "notes": [],
            "drawings": [],
            "_id": "%s",
            "journal": "",
            "img": "images/maps/donjon/donjon.png",
            "playlist": "",
            "weather": "",
            "navName": "",
            "thumb": null
        }
    """ % (uuid.uuid1()))



def get_lines(input_file):
    lines = []
    for line in input_file.readlines():
        lines.append(line.split("	"))

    return lines


def fvtt_write_wall(output_file, x1, y1, x2, y2, starting_comma=True, door=False, secret_door=False):
    if starting_comma:
        output_file.write(",")

    door_code = 0
    if door:
        door_code = "1,\n\"ds\": 0"
    if secret_door:
        door_code = "2,\n\"ds\": 0"

    output_file.write("""
        {
            "id": "%s",
            "flags": {},
            "c": [
                %s,
                %s,
                %s,
                %s
            ],
          "move": 1,
          "sense": 1,
          "door": %s
        }
    """ % (uuid.uuid1(), x1, y1, x2, y2, door_code))


def fvtt_border_walls(output_file, width, height):
    output_file.write("""
        {
            "id": "%s",
            "flags": {},
            "c": [
                %s,
                %s,
                %s,
                %s
            ],
          "move": 1,
          "sense": 1,
          "door": 0
        }
    """ % (uuid.uuid1(), 0, 0, width * GRID, 0))
    output_file.write(""",
        {
            "id": "%s",
            "flags": {},
            "c": [
                %s,
                %s,
                %s,
                %s
            ],
          "move": 1,
          "sense": 1,
          "door": 0
        }
    """ % (uuid.uuid1(), 0, 0, 0, height * GRID))
    output_file.write(""",
        {
            "id": "%s",
            "flags": {},
            "c": [
                %s,
                %s,
                %s,
                %s
            ],
          "move": 1,
          "sense": 1,
          "door": 0
        }
    """ % (uuid.uuid1(), 0, height * GRID, width * GRID, height * GRID))
    output_file.write(""",
        {
            "id": "%s",
            "flags": {},
            "c": [
                %s,
                %s,
                %s,
                %s
            ],
          "move": 1,
          "sense": 1,
          "door": 0
        }
    """ % (uuid.uuid1(), width * GRID, 0, width * GRID, height * GRID))


def fvtt_west_wall(output_file, x, y):
    fvtt_write_wall(output_file, x * GRID, y * GRID, x * GRID, y * GRID + GRID)


def fvtt_east_wall(output_file, x, y):
    fvtt_write_wall(output_file, x * GRID + GRID, y * GRID, x * GRID + GRID, y * GRID + GRID)


def fvtt_north_wall(output_file, x, y):
    fvtt_write_wall(output_file, x * GRID, y * GRID, x * GRID + GRID, y * GRID)


def fvtt_south_wall(output_file, x, y):
    fvtt_write_wall(output_file, x * GRID, y * GRID + GRID, x * GRID + GRID, y * GRID + GRID)


def fvtt_horizontal_door(output_file, x, y, secret_door=False):
    if not secret_door:
        fvtt_write_wall(output_file, x * GRID, y * GRID + GRID / 2, x * GRID + GRID, y * GRID + GRID / 2,
                        door=True)
    else:
        fvtt_write_wall(output_file, x * GRID, y * GRID, x * GRID + GRID, y * GRID, secret_door=True)
        fvtt_write_wall(output_file, x * GRID, y * GRID + GRID, x * GRID + GRID, y * GRID + GRID, secret_door=True)


def fvtt_vertical_door(output_file, x, y, secret_door=False):
    if not secret_door:
        fvtt_write_wall(output_file, x * GRID + GRID / 2, y * GRID, x * GRID + GRID / 2, y * GRID + GRID,
                        door=True)
    else:
        fvtt_write_wall(output_file, x * GRID, y * GRID, x * GRID, y * GRID + GRID, secret_door=True)
        fvtt_write_wall(output_file, x * GRID + GRID, y * GRID, x * GRID + GRID, y * GRID + GRID, secret_door=True)


def process_file(input_file_name, output_file_name):
    input_file = open(input_file_name)
    output_file = open(output_file_name, "w")

    lines = get_lines(input_file)

    fvtt_start(output_file, len(lines[0]), len(lines))
    fvtt_border_walls(output_file, len(lines[0]), len(lines))

    y = 1
    while y < len(lines) - 1:
        x = 1
        while x < len(lines[y]) - 1:
            if lines[y][x] != '':
                if lines[y][x] == 'F' or lines[y][x][0] == 'D':
                    if lines[y][x - 1] == '':
                        fvtt_west_wall(output_file, x, y)
                    if lines[y][x + 1] == '':
                        fvtt_east_wall(output_file, x, y)
                    if lines[y - 1][x] == '':
                        fvtt_north_wall(output_file, x, y)
                    if lines[y + 1][x] == '':
                        fvtt_south_wall(output_file, x, y)

                if lines[y][x] == 'DL' or lines[y][x] == 'DB' or lines[y][x] == 'DT':
                    if lines[y][x - 1] == '':
                        fvtt_horizontal_door(output_file, x, y)
                    if lines[y - 1][x] == '':
                        fvtt_vertical_door(output_file, x, y)

                if lines[y][x] == 'DPL' or lines[y][x] == 'DP' or lines[y][x] == 'DPT':
                    if lines[y][x - 1] == '':
                        fvtt_horizontal_door(output_file, x, y)
                    if lines[y - 1][x] == '':
                        fvtt_vertical_door(output_file, x, y)

                if lines[y][x] == 'DSL' or lines[y][x] == 'DSB' or lines[y][x] == 'DST':
                    if lines[y][x - 1] == '':
                        fvtt_horizontal_door(output_file, x, y, secret_door=True)
                    if lines[y - 1][x] == '':
                        fvtt_vertical_door(output_file, x, y, secret_door=True)

            x = x + 1
        y = y + 1

    fvtt_finish(output_file)

process_file("/home/thomasmckay/Downloads/donjon.txt",
             "/home/thomasmckay/Downloads/donjon.json")
