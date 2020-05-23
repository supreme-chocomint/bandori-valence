const POPIPA = "Poppin'Party";
const ROSELIA = "Roselia";
const AFTERGLOW = "Afterglow";
const PASUPARE = "Pastel*Palettes";
const HHW = "Hello, Happy World!";
const RAS = "Raise A Suilen";

async function makeChart() {

  const ctx = document.querySelector("#valence-chart");

  const translations = await getTranslations();
  const songData = await getSongData(translations);
  const songReleaseIndices = await getSongReleaseIndices();
  const songValenceIndices = getSongValenceIndices(songData);

  const labels = Object.keys(songReleaseIndices).map(name => translateIfPossible(name, translations));
  const dataSets = getDataSets(songData, songReleaseIndices);
  const options = getBarGraphStaticOptions(labels);

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: dataSets
    },
    options: options
  });

  Chart.defaults.global.defaultFontFamily = "'Inter', sans-serif";

  // Add events afterwords, since they need reference to chart, 
  // and adding static options after chart creation disables animations.
  addEventOptions(chart);

  // Make chart accessible from DOM
  window.chart = chart;

  // Preserve original state to restore from chart state changes 
  // and allow sorting
  window.chartAttributes = {};
  window.chartAttributes.dataLabels = labels.slice();
  window.chartAttributes.datasetValues = dataSets.map(dataSet => dataSet.data.slice());
  window.chartAttributes.songData = songData;
  window.chartAttributes.translations = translations;
  window.chartAttributes.songReleaseIndices = songReleaseIndices;
  window.chartAttributes.songValenceIndices = songValenceIndices;
  window.chartAttributes.focusing = false;

}

function getDataSets(songData, songIndices) {

  return [
    {
      label: POPIPA,
      backgroundColor: '#FF5C92',
      borderColor: '#FF5C92',
      data: getSongsForBandAsPointArray(POPIPA, songData, songIndices)
    },
    {
      label: ROSELIA,
      backgroundColor: "#3344AA",
      borderColor: "#3344AA",
      data: getSongsForBandAsPointArray(ROSELIA, songData, songIndices)
    },
    {
      label: AFTERGLOW,
      backgroundColor: "#E53344",
      borderColor: "#E53344",
      data: getSongsForBandAsPointArray(AFTERGLOW, songData, songIndices)
    },
    {
      label: PASUPARE,
      backgroundColor: "#85EBCC",
      borderColor: "#85EBCC",
      data: getSongsForBandAsPointArray(PASUPARE, songData, songIndices)
    },
    {
      label: HHW,
      backgroundColor: "#FFDD00",
      borderColor: "#FFDD00",
      data: getSongsForBandAsPointArray(HHW, songData, songIndices)
    },
    {
      label: RAS,
      backgroundColor: "#1D6563",
      borderColor: "#1D6563",
      data: getSongsForBandAsPointArray(RAS, songData, songIndices)
    }
  ]
}

/**
 * For point-based line graphs without global labels, and scatter plots.
 */
function getSongsForBandAsPointObjects(bandKey, songData, songIndices) {
  const songs = getSongsForBand(bandKey, songData);
  const points = [];
  for (const song of songs) {
    const point = {
      x: songIndices[song.native_name ? song.native_name : song.name],
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
function getSongsForBandAsPointArray(bandKey, songData, songIndices) {
  const songs = getSongsForBand(bandKey, songData);
  const points = [];
  for (const song of songs) {
    points[songIndices[song.native_name ? song.native_name : song.name]] = song.features.valence;
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
    aspectRatio: 2.5,
    scales: {
      xAxes: [{
        type: 'category',
        stacked: true,
        gridLines: {
          display: false
        }
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
      displayColors: false,
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
      showInCard(element._index, datasetIndex, chart);
    }
    else {
      undoFocus(chart);
      notifyCardIndexChanged(chart);
    }
  }

  // Disable legend onClick because it is not fired consistently
  // when overwritten (standard onClick fired instead)
  chart.options.legend.onClick = null;

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

  window.chartAttributes.focusing = true;
  chart.update();

}

function undoFocus(chart) {

  // If every dataset has data, then already not focusing on anything
  if (chart.data.datasets.every(ds => ds.data.length != 0)) return

  // Restore labels
  chart.data.labels = window.chartAttributes.dataLabels.slice();

  // Restore datasets
  // Done in-place for improved chart animations
  for (const [i, dataset] of Object.entries(chart.data.datasets)) {

    // If dataset was not in focus, restore everything
    if (dataset.data.length == 0) dataset.data.push(...window.chartAttributes.datasetValues[i]);

    // Otherwise, restore missing data in-place
    else {
      let workingDataIndex = 0;
      for (const value of window.chartAttributes.datasetValues[i]) {
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

  window.chartAttributes.focusing = false;
  chart.update();

}

function sortGraphByValence(chart) {

  setGraphDataUsingIndices(
    chart,
    window.chartAttributes.songValenceIndices,
    window.chartAttributes.songData,
    window.chartAttributes.translations
  );

  // Update globals so that state changes adhere to new sort order
  window.chartAttributes.dataLabels = chart.data.labels.slice();
  window.chartAttributes.datasetValues = chart.data.datasets.map(dataSet => dataSet.data.slice());

}

function sortGraphByRelease(chart) {

  setGraphDataUsingIndices(
    chart,
    window.chartAttributes.songReleaseIndices,
    window.chartAttributes.songData,
    window.chartAttributes.translations
  );

  // Update globals so that state changes adhere to new sort order
  window.chartAttributes.dataLabels = chart.data.labels.slice();
  window.chartAttributes.datasetValues = chart.data.datasets.map(dataSet => dataSet.data.slice());

}

function setGraphDataUsingIndices(chart, indices, songData, translations) {

  const datasets = getDataSets(songData, indices);

  chart.data.labels = Object.keys(indices)
    .map(name => translateIfPossible(name, translations));

  chart.data.datasets = datasets;
  chart.update();

  window.chartAttributes.focusing = false;
  notifyCardIndexChanged(chart);

}

makeChart();
