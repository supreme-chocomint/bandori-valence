const POPIPA = "Poppin'Party";
const ROSELIA = "Roselia";
const AFTERGLOW = "Afterglow";
const PASUPARE = "Pastel*Palettes";
const HHW = "Hello, Happy World!";
const RAS = "Raise A Suilen";

async function makeChart() {

  const ctx = document.querySelector("#valence-chart");

  const translations = await getTranslations();
  const songReleaseIndices = await getSongReleaseIndices();

  const labels = Object.keys(songReleaseIndices).map(name => translateIfPossible(name, translations));
  const dataSets = await getDataSets(translations, songReleaseIndices);
  const options = getBarGraphStaticOptions(labels);

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: dataSets
    },
    options: options
  });

  // Add events afterwords, since they need reference to chart, 
  // and adding static options after chart creation disables animations.
  addEventOptions(chart);

  // Preserve original state to restore from chart state changes
  window.chartDataLabels = labels.slice();
  window.chartDatasetValues = dataSets.map(dataSet => dataSet.data.slice());

}

async function getSongData() {
  const response = await fetch("band-songs.json");
  if (!response.ok) console.log("Couldn't load song data!");
  return await response.json();
}

async function getTranslations() {
  const response = await fetch("translations.json");
  if (!response.ok) console.log("Couldn't load translation data!");
  return await response.json();
}

async function getSongReleaseIndices() {
  const response = await fetch("song-names.json");
  if (!response.ok) console.log("Couldn't load song release order data!");

  const data = await response.json();
  const indices = {};
  for (const [i, name] of Object.entries(data.names)) {
    indices[name] = i;
  }

  return indices;
}

function getSongsForBand(bandKey, songData, translations) {
  const songs = songData[bandKey];
  for (const song of songs) {
    song.native_name = song.name
    song.name = translateIfPossible(song.name, translations);
    console.log(song.name);
  }
  return songs;
}

function translateIfPossible(songName, translations) {
  const translation = translations[songName];
  if (translation) return translation;
  else return songName;
}

async function getDataSets(translations, songReleaseIndices) {

  const songData = await getSongData();

  return [
    {
      label: POPIPA,
      backgroundColor: '#FF5C92',
      borderColor: '#FF5C92',
      data: getSongsForBandAsPointArray(POPIPA, songData, translations, songReleaseIndices)
    },
    {
      label: ROSELIA,
      backgroundColor: "#3344AA",
      borderColor: "#3344AA",
      data: getSongsForBandAsPointArray(ROSELIA, songData, translations, songReleaseIndices)
    },
    {
      label: AFTERGLOW,
      backgroundColor: "#E53344",
      borderColor: "#E53344",
      data: getSongsForBandAsPointArray(AFTERGLOW, songData, translations, songReleaseIndices)
    },
    {
      label: PASUPARE,
      backgroundColor: "#85EBCC",
      borderColor: "#85EBCC",
      data: getSongsForBandAsPointArray(PASUPARE, songData, translations, songReleaseIndices)
    },
    {
      label: HHW,
      backgroundColor: "#FFDD00",
      borderColor: "#FFDD00",
      data: getSongsForBandAsPointArray(HHW, songData, translations, songReleaseIndices)
    },
    {
      label: RAS,
      backgroundColor: "#1D6563",
      borderColor: "#1D6563",
      data: getSongsForBandAsPointArray(RAS, songData, translations, songReleaseIndices)
    }
  ]
}

/**
 * For point-based line graphs without global labels, and scatter plots.
 */
function getSongsForBandAsPointObjects(bandKey, songData, translations, songReleaseIndices) {
  const songs = getSongsForBand(bandKey, songData, translations);
  const points = [];
  for (const song of songs) {
    const point = {
      x: songReleaseIndices[song.native_name ? song.native_name : song.name],
      y: song.features.valence,
      name: song.name
    };
    points.push(point);
  }
  return points.sort((a, b) => a.x - b.x);
}

/**
 * For bar graphs, and line graphs with global labels.
 */
function getSongsForBandAsPointArray(bandKey, songData, translations, songReleaseIndices) {
  const songs = getSongsForBand(bandKey, songData, translations);
  const points = [];
  for (const song of songs) {
    points[songReleaseIndices[song.native_name ? song.native_name : song.name]] = song.features.valence;
  }
  return points;
}

function getLineGraphStaticOptions() {
  return {
    scales: {
      xAxes: [{
        type: 'linear', // required to show more that 2 points
        gridLines: {
          //display: false,  // hides vertical grid lines
        },
        ticks: {
          //display: false,
          suggestedMax: 10,  // expands x-axis length 
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Valence'
        },
        ticks: {
          beginAtZero: false,
          suggestedMax: 1
        }
      }]
    },
    elements: {
      line: {
        fill: false,
        borderWidth: 2,
        tension: 0
      },
      point: {
        radius: 3,
        hoverRadius: 5
      }
    },
    tooltips: {
      callbacks: {
        title: function (tooltipItem, data) {
          return data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index].name;
        },
        label: function (tooltipItem, data) {
          return `Valence: ${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].y}`;
        }
      }
    },
    hover: {
      mode: 'point'  // makes hovering only activate the on-mouse point
    }
  }
}

function getBarGraphStaticOptions(labels) {
  return {
    scales: {
      xAxes: [{
        type: 'category',
        stacked: true,
        gridLines: {
          display: false
        },

      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Valence'
        },
        ticks: {
          beginAtZero: true,
          suggestedMax: 1
        }
      }]
    },
    tooltips: {
      callbacks: {
        title: function (tooltipItem, data) {
          return data.labels[tooltipItem[0].index];
        },
        label: function (tooltipItem, data) {
          return `Valence: ${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]}`;
        }
      }
    },
  }
}

function addEventOptions(chart) {

  chart.options.onClick = (event, activeElements) => {
    if (activeElements.length != 0) {
      const element = chart.getElementAtEvent(event)[0];  // active element != clicked element
      const datasetIndex = element._datasetIndex;
      const dataset = chart.data.datasets[datasetIndex];
      focus(dataset, chart);
    }
    else undoFocus(chart);
  }

}

function focus(focusedDataset, chart) {

  // If some datasets have no data, then already focusing on something
  if (chart.data.datasets.some(ds => ds.data.length == 0)) return

  // Remove non-focused datasets
  for (const dataset of chart.data.datasets) {
    if (dataset != focusedDataset) dataset.data = [];
  }

  // Remove labels not used by focused dataset.
  // In-place deletion to improve chart animation.
  let offset = 0;
  for (const [i, label] of Object.entries(chart.data.labels.slice())) {
    // If label has no corresponding value in data, delete that label in-place
    if (focusedDataset.data[i] == undefined) {
      chart.data.labels.splice(i - offset, 1);
      offset++;
    }
  }

  // Correct indexes so they match with new labels
  const clone = focusedDataset.data.slice();
  offset = 0;
  for (let i = 0; i < clone.length; i++) {
    // If data missing for index, "delete" it (i.e. actually just decrements all indices),
    // since corresponding label was previously removed
    if (clone[i] == undefined) {
      focusedDataset.data.splice(i - offset, 1);
      offset++;
    }
  }

  chart.update();

}

function undoFocus(chart) {

  // If every dataset has data, then already not focusing on anything
  if (chart.data.datasets.every(ds => ds.data.length != 0)) return

  // Restore labels
  chart.data.labels = window.chartDataLabels.slice();

  // Restore datasets
  // Done in-place for improved chart animations
  for (const [i, dataset] of Object.entries(chart.data.datasets)) {

    // If dataset was not in focus, restore everything
    if (dataset.data.length == 0) dataset.data.push(...window.chartDatasetValues[i]);

    // Otherwise, restore missing data in-place
    else {
      let workingDataIndex = 0;
      for (const value of window.chartDatasetValues[i]) {
        // If value undefined, then it was previously removed: put it back in.
        // This is done to increment all indices until they are at their original values.
        if (value == undefined) dataset.data.splice(workingDataIndex, 0, value);
        workingDataIndex++;
      }
      // Cleanup by deleting explicity undefined elements, which have served their purpose
      const clone = dataset.data.slice();
      for (let j = 0; j < clone.length; j++) {
        if (clone[j] == undefined) delete dataset.data[j];
      }
    }
  }

  chart.update();

}

makeChart();
