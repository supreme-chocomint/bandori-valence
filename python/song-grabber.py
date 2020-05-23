import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from functools import partial
import json
import constants


def main():

    credentials_filename = 'credentials.json'

    with open(credentials_filename, 'r') as f:
        data = json.load(f)
        sp = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(
            client_id=data['client_id'],
            client_secret=data['client_secret']
        ))

    dump_band_songs(sp, '../data/band-songs.json')
    dump_song_name_list(sp, '../data/song-names.json')


def dump_band_songs(spotify, out_filename):

    bands = [
        constants.ROSELIA,
        constants.PASTEL_PALETTES,
        constants.AFTERGLOW,
        constants.HELLO_HAPPY_WORLD,
        constants.POPPIN_PARTY,
        constants.RAISE_A_SUILEN
    ]

    data = dict()
    for band in bands:
        tracks = get_playlist_tracks_with_metadata(
            spotify, band['playlist_id'])
        data[band['name']] = tracks

    with open(out_filename, 'w') as f:
        json.dump(data, f, indent=4)


def dump_song_name_list(spotify, out_filename):

    playlist_tracks = collect(
        spotify, spotify.playlist_tracks(constants.PLAYLIST_ID))
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
        print(f'Album: {album["name"]}')

    return albums


def get_album_tracks_with_metadata(spotify, albums):
    """
    :param spotify: Spotify
    :param albums: List of Dictionaries
    :return: List of tracks as Dictionaries
    """
    tracks = []

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


if __name__ == '__main__':
    main()
