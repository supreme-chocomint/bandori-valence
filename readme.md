# Bandori Valence

## Overview

Visualizes the emotional valence of BanG Dream songs, which is provided by Spotify. Spotify defines valence as a measure of "musical positiveness", with higher-value songs sounding more positive (happy or cheery) and lower-value songs sounding more negative (depressed or angry).

## Technical Notes

`song-grabber.py` requires a file called `credentials.json` to work, which should have a Spotify `client_id` and `client_secret`. It generates two files: `band-songs.json` and `song-names.json`. Both required a few manual changes to be usable.

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

Japanese song names on Spotify use the English exclamation marks rather than Japanese ones (which are wider characters), but Japanese tildes (known as the wave dash: `〜`) rather than English tildes.