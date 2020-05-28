# Bandori Valence

## Overview

Visualizes the emotional valence of original BanG Dream songs, which is provided by Spotify.

Spotify defines valence as a measure of "musical positiveness", with higher-value songs sounding more positive (happy or cheery) and lower-value songs sounding more negative (depressed or angry).

The data was collected using a Python script (found in `python/song-grabber.py`), and deposited into the `data` directory for use by the website.

## Getting and Updating Spotify Data

`python/song-grabber.py` requires a file called `credentials.json` to work, which should have a Spotify `client_id` and `client_secret`.

### Usage

1. Make a [Spotify Developer account](https://developer.spotify.com/dashboard/) and create a client ID/secret
2. Create `credentials.json` inside the `python` directory
3. Run `pip install -r python/requirements.txt` in the root directory
4. Run `python python/song-grabber.py <ARGUMENT>` in the root directory

The argument for the script defines the action to do; it may require additional values to be passed as well. Run `python python/song-grabber.py -h` for details.

If for some reason the script has to be run from the `python` directory rather than the root directory, the use of a context manager to call `main()` has to be removed from the bottom of the script.

### Example Arguments

- `--dump-band-songs` to dump all songs, using band playlists (see `python/constants.py` for playlist IDs)
- `--get-albums popipa` to print all albums by Poppin'Party (see `python/constants.py` for valid names/abbreviations)
- `--put-album-songs 3RKqfMngxktugTGzWQ5Be7 2etZzaMSi3pY0SISeNziWA` to add songs from albums by album ID to existing dump

### Manual Data Cleaning

The script was used to generate two files: `band-songs.json` and `song-names.json`. Both currently live in the `data` directory, and required a few manual changes to be usable.

Manual changes made to `band-songs.json`:
- Removed all instrumental, acoustic, and short versions of songs
- Renamed `ぽっぴん'しゃっふる` to `ぽっぴん しゃっふる` because JS seems to escape the single apostrophe in translations.json by replacing it with a single right quotation (`'` vs `’`)
- Renamed remastered versions of Roselia songs to non-remastered name, and removed non-remastered versions

Manual changes made to `song-names.json`:
- Removed all instrumental, acoustic, and short versions of songs, as above
- Renamed `ぽっぴん'しゃっふる` to `ぽっぴん しゃっふる`, as above
- Removed removed remastered versions
- Removed character songs and songs from temporary or minor bands (e.g. The Third, Glitter*Green) 
- Sorted songs to match actual album and single release dates (songs released in same single/album are in same order as single/album)

It was important to note that Japanese song names on Spotify use the English exclamation marks rather than Japanese ones (which are wider characters), but Japanese tildes (known as the wave dash: `〜`) rather than English tildes.