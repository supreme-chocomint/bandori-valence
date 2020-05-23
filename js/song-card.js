function showInCard(index, datasetIndex, chart) {

  const name = chart.data.labels[index];
  const band = chart.data.datasets[datasetIndex].label;
  const song = window.chartAttributes.songData[band].find(song => song.name == name);

  const nativeName = song.native_name;
  const danceability = song.features.danceability;
  const energy = song.features.energy;
  const valence = song.features.valence;
  const url = song.external_urls.spotify;

  const card = document.querySelector('#song-card');
  card.style.display = 'block';

  card.querySelector('.title').innerHTML = name
  card.querySelector('.subtitle').innerHTML = band + (nativeName == name ? '' : ` / ${nativeName}`);
  card.querySelector('.valence-value').innerHTML = valence;
  card.querySelector('.danceability-value').innerHTML = danceability;
  card.querySelector('.energy-value').innerHTML = energy;
  card.querySelector('.bottom-right-link').href = url;

}