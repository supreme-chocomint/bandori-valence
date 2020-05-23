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
  card.querySelector('a.icon').href = url;

  // Save indices so that card can trigger events in chart
  card.dataset.chartDatasetIndex = datasetIndex;
  card.dataset.chartIndex = index;

}

/**
 * When not focusing on a band anymore or sort order changes, 
 * need to update own index to keep showXInCard functions working.
 */
function notifyCardIndexChanged(chart) {
  const card = document.querySelector('#song-card')
  const songName = card.querySelector('.title').innerHTML;
  const labelIndex = chart.data.labels.findIndex(label => label == songName);
  card.dataset.chartIndex = labelIndex;
}

function showPreviousInCard(currentIndex, currentDatasetIndex, chart, isFocusing) {
  const [nextIndex, nextDatasetIndex] = calculateNextElementIndices(currentIndex, currentDatasetIndex, -1, chart, isFocusing);
  showInCard(nextIndex, nextDatasetIndex, chart);
  undoHighlight(chart);
  highlight(nextIndex, nextDatasetIndex, chart);
}

function showNextInCard(currentIndex, currentDatasetIndex, chart, isFocusing) {
  const [nextIndex, nextDatasetIndex] = calculateNextElementIndices(currentIndex, currentDatasetIndex, 1, chart, isFocusing);
  showInCard(nextIndex, nextDatasetIndex, chart);
  undoHighlight(chart);
  highlight(nextIndex, nextDatasetIndex, chart);
}

function calculateNextElementIndices(currentIndex, currentDatasetIndex, direction, chart, isFocusing) {

  // Next element's index always corresponds to next label (accounting for modding/wrap effect)
  // % is remainder operator in JS, not modulo
  const numLabels = chart.data.labels.length;
  const nextIndex = (((currentIndex + (1 * direction)) % numLabels) + numLabels) % numLabels;
  let nextDatasetIndex;

  if (isFocusing) {
    // Next element from same dataset
    nextDatasetIndex = currentDatasetIndex;
  }
  else {
    // Next element from dataset that has nextIndex actually defined
    nextDatasetIndex = chart.data.datasets.findIndex(ds => ds.data[nextIndex] != undefined)
  }

  return [nextIndex, nextDatasetIndex];

}

function highlight(index, datasetIndex, chart) {

  const point = chart.getDatasetMeta(datasetIndex).data[index].getCenterPoint();
  const rectangle = chart.canvas.getBoundingClientRect();

  const mouseEvent = new MouseEvent('mousemove', {
    clientX: rectangle.left + point.x,
    clientY: rectangle.top + point.y
  })
  chart.canvas.dispatchEvent(mouseEvent);

}

function undoHighlight(chart) {
  chart.canvas.dispatchEvent(new MouseEvent('mouseout'));
}