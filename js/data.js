async function getSongData(translations) {
  const response = await fetch("data/band-songs.json");
  if (!response.ok) console.log("Couldn't load song data!");
  const songData = await response.json();

  for (const songs of Object.values(songData)) {
    for (const song of songs) {
      song.native_name = song.name
      song.name = translateIfPossible(song.name, translations);
      //console.log(song.name);
    }
  }

  return songData;
}

async function getTranslations() {
  const response = await fetch("data/translations.json");
  if (!response.ok) console.log("Couldn't load translation data!");
  return await response.json();
}

/**
 * Maps native/original song names to index, where index is
 * approximate release ordering (index 0 = first song released).
 * Ordering is approximate because of issues like songs being released 
 * on same day, previews being released ahead of actual releases, limited 
 * editions, remasters, etc.
 */
async function getSongReleaseIndices() {
  const response = await fetch("data/song-names.json");
  if (!response.ok) console.log("Couldn't load song release order data!");

  const data = await response.json();
  const indices = {};
  for (const [i, name] of Object.entries(data.names)) {
    indices[name] = i;
  }

  return indices;
}

/**
 * Maps native/original song names to index, where index is 
 * valence ordering (index 0 = song w/ lowest valence).
 */
function getSongValenceIndices(songData) {
  const songs = Object.values(songData).flat();
  const songNames = songs
    .sort((a, b) => a.features.valence - b.features.valence)
    .map(song => song.native_name);

  const indices = {};
  songNames.map((name, i) => indices[name] = i);
  return indices;
}

function getSongsForBand(bandKey, songData) {
  return songData[bandKey];
}

function translateIfPossible(songName, translations) {
  const translation = translations[songName];
  if (translation) return translation;
  else return songName;
}