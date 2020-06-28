import argparse
import json
import os
import sys
from contextlib import contextmanager
from functools import partial

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

from constants import BANDS, PLAYLIST_ID, CREDENTIALS_FILE, BAND_SONGS_FILE, SONG_NAMES_FILE


def main():
    with open(CREDENTIALS_FILE, 'r') as f:
        data = json.load(f)
        sp = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(
            client_id=data['client_id'],
            client_secret=data['client_secret']
        ))

    parser, args = get_arguments()
    if not args:
        return

    if args.dump_band_songs:
        dump_band_songs(sp, BAND_SONGS_FILE)

    if args.dump_song_names:
        dump_song_name_list(sp, SONG_NAMES_FILE)

    if args.band_with_albums:
        band_arg = args.band_with_albums
        band = find_band_by_string(band_arg)
        if band:
            get_albums(sp, band['id'])
        else:
            parser.error(f'Band "{band_arg}" not recognized.')

    if args.album_ids_to_put:
        put_album_songs(sp, args.album_ids_to_put)


def get_arguments():
    parser = argparse.ArgumentParser()

    parser.add_argument('--dump-band-songs',
                        action='store_true',
                        help=f'Dump all band songs to {BAND_SONGS_FILE} using playlists')

    parser.add_argument('--dump-song-names',
                        action='store_true',
                        help=f'Dump all song names to {SONG_NAMES_FILE} using master playlist')

    parser.add_argument('--get-albums',
                        type=str,
                        metavar='band',
                        dest='band_with_albums',
                        help='Get all albums by band name or abbreviation (e.g. ras, popipa, etc)')

    parser.add_argument('--put-album-songs',
                        type=str,
                        nargs='+',
                        metavar='album-id',
                        dest='album_ids_to_put',
                        help=f'Put album\'s songs under correct band in {BAND_SONGS_FILE}')

    if len(sys.argv) == 1:
        return parser, parser.print_help()
    else:
        return parser, parser.parse_args()


def dump_band_songs(spotify, out_filename):
    """
    Dump band songs into file using playlists.
    If playlist isn't defined (via spotify ID), skip the band.
    """
    data = dict()
    for band in BANDS:
        try:
            tracks = get_playlist_tracks_with_metadata(
                spotify, band['playlist_id'])
            data[band['name']] = tracks
        except KeyError:
            pass

    with open(out_filename, 'w') as f:
        json.dump(data, f, indent=4)


def dump_song_name_list(spotify, out_filename):
    playlist_tracks = collect(
        spotify, spotify.playlist_tracks(PLAYLIST_ID))
    tracks = list(
        map(lambda playlist_track: playlist_track['track'], playlist_tracks))
    tracks.reverse()

    data = []
    for track in tracks:
        data.append(track['name'])
        print(track['name'])

    with open(out_filename, 'w') as f:
        json.dump({'names': data}, f, indent=4)


def get_playlist_tracks_with_metadata(spotify, playlist_id):
    # Bind Spotify object to function: equivalent to Function.bind() in JavaScript
    _add_metadata_to_playlist_tracks = partial(
        add_metadata_to_playlist_tracks, spotify)

    playlist_tracks = collect(
        spotify,
        spotify.playlist_tracks(playlist_id=playlist_id),
        _add_metadata_to_playlist_tracks
    )
    tracks = list(
        map(lambda playlist_track: playlist_track['track'], playlist_tracks))

    for track in tracks:
        print(f'Track: {track["name"]}')

    return tracks


def add_metadata_to_playlist_tracks(spotify, playlist_tracks):
    features = spotify.audio_features(
        map(lambda t: t['track']['id'], playlist_tracks))
    for i, p_track in enumerate(playlist_tracks):
        p_track['track']['features'] = features[i]


def get_albums(spotify, artist_id):
    """
    Spotify defines albums as albums, singles, compilations, and appears-ons.
    Some may be duplicates due to being on multiple markets.

    :param spotify: Spotify
    :param artist_id: Spotify ID for an artist
    :return: List of albums as Dictionaries
    """
    albums = collect(spotify, spotify.artist_albums(artist_id=artist_id))

    for album in albums:
        print(f'Album: {album["name"]} / {",".join(album["available_markets"][:10])} / {album["id"]}')

    return albums


def get_album_tracks_with_metadata(spotify, albums):
    """
    :param spotify: Spotify
    :param albums: List of Dictionaries
    :return: List of tracks as Dictionaries or IDs
    """
    tracks = []

    if len(albums) == 0:
        return tracks

    # Transform IDs to albums if required. Assumes all elements are same type.
    if isinstance(albums[0], str):
        albums = spotify.albums(albums)['albums']

    for album in albums:
        # Bind Spotify and album objects to function: equivalent to Function.bind() in JavaScript
        _add_metadata_to_album_tracks = partial(
            add_metadata_to_album_tracks, spotify, album)

        # Collect tracks with metadata filled in
        tracks.extend(collect(spotify, spotify.album_tracks(
            album_id=album['id']), _add_metadata_to_album_tracks))

    return tracks


def add_metadata_to_album_tracks(spotify, album, tracks):
    """
    In-place mutation.

    :param spotify: Spotify
    :param album: Album as Dictionary
    :param tracks: List of tracks as Dictionaries
    :return: None
    """
    features = spotify.audio_features(map(lambda t: t['id'], tracks))
    for i, track in enumerate(tracks):
        print(f'Track: {track["name"]}')
        track['album_name'] = album['name']
        track['album_release_date'] = album['release_date']
        track['album_release_date_precision'] = album['release_date_precision']
        track['features'] = features[i]


def put_album_songs(spotify, albums_ids):
    tracks = get_album_tracks_with_metadata(spotify, albums_ids)

    with open(BAND_SONGS_FILE, 'r') as f:
        data = json.load(f)

        # Find band by ID and prepend track to band's song list.
        # Prepend song to keep reverse-chronological order.
        for track in tracks:
            artist_id = track['artists'][0]['id']
            matching_bands = list(filter(lambda b: b['id'] == artist_id, BANDS))
            if matching_bands:
                matching_band = matching_bands[0]['name']
                existing_tracks = data.get(matching_band, [])
                data[matching_band] = [track] + existing_tracks
            else:
                raise ValueError(f'Song "{track["name"]}" not from a recognized band.')

    with open(BAND_SONGS_FILE, 'w') as f:
        json.dump(data, f, indent=4)


def collect(spotify, results, page_operation=None):
    """
    :param spotify: Spotify
    :param results: API response as Dictionary
    :param page_operation: Function that has items from API response as parameter
    :return:
    """
    collection = []
    if page_operation:
        page_operation(results['items'])
    collection.extend(results['items'])

    while results['next']:
        results = spotify.next(results)
        if page_operation:
            page_operation(results['items'])
        collection.extend(results['items'])

    return collection


def remove_name_duplicates(array):
    res = []
    names = set()

    for item in array:
        if item['name'] not in names:
            res.append(item)
            names.add(item['name'])

    return res


def find_band_by_string(s):
    """
    Find band by name or abbreviation.
    """
    s = s.lower()
    for band in BANDS:
        if s in [band['name'].lower(), band.get('abbreviation', '').lower()]:
            return band
    return None


@contextmanager
def cd(new_dir):
    """
    Changes working directory.
    https://stackoverflow.com/a/24176022
    """
    previous_dir = os.getcwd()
    os.chdir(os.path.expanduser(new_dir))
    try:
        yield
    finally:
        os.chdir(previous_dir)


if __name__ == '__main__':
    with cd('python'):
        main()
