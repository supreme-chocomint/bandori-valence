// "Sort by" button
document.querySelector("#sorter").onclick = () => {
  const el = document.querySelector("#sorter");
  if (el.innerHTML == "Sort By Valence") {
    // User asked to sort by valence
    sortGraphByValence(window.chart);
    el.innerHTML = "Sort By Release";
  }
  else if (el.innerHTML == "Sort By Release") {
    // User asked to sort by release
    sortGraphByRelease(window.chart);
    el.innerHTML = "Sort By Valence";
  }
}

// Left button in song card
document.querySelector("#song-card .navigation-left").onclick = () => {
  const card = document.querySelector("#song-card");
  showPreviousInCard(
    // if any index is undefined (i.e. card not built yet), use 0
    parseInt(card.dataset.chartIndex) || 0,
    parseInt(card.dataset.chartDatasetIndex) || 0,
    window.chart,
    window.chartAttributes.focusing
  );
}

// Right button in song card
document.querySelector("#song-card .navigation-right").onclick = () => {
  const card = document.querySelector("#song-card");
  showNextInCard(
    // if any index is undefined (i.e. card not built yet), use 0
    parseInt(card.dataset.chartIndex) || 0,
    parseInt(card.dataset.chartDatasetIndex) || 0,
    window.chart,
    window.chartAttributes.focusing
  );
}

// Toggle the focus state of the chart
document.onkeydown = (event) => {
  if (event.code == "Period") {
    document.querySelector("#valence-chart").focus();
  }
  else if (event.code == "Comma") {
    document.querySelector("#valence-chart").blur();
  }
}

// Focus given to chart
document.querySelector("#valence-chart").onfocus = () => {
  document.querySelector(".tag.valence-chart-focus").classList.remove("is-hidden");
}

// Focus taken away from chart
document.querySelector("#valence-chart").onblur = () => {
  document.querySelector(".tag.valence-chart-focus").classList.add("is-hidden");
}

// Keyboard navigation when chart is in focus
document.querySelector("#valence-chart").onkeydown = (event) => {

  switch (event.code) {

    case "ArrowLeft":
      document.querySelector("#song-card .navigation-left").onclick();
      break;

    case "ArrowRight":
      document.querySelector("#song-card .navigation-right").onclick();
      break;

    case "Backspace":
    case "Escape":
      // Simulate clicking empty space on chart
      window.chart.options.onClick(null, []);
      break;

    case "Enter":
    case "NumpadEnter":
      clickHoveringElement();
      break;

    case "Space":
      document.querySelector("#sorter").onclick();
      break;

    default:
      break;

  }

}

// Modal dismiss
for (const el of document.querySelectorAll(".modal")) {
  el.querySelector(".modal-background").onclick = () => {
    el.classList.remove("is-active");
  };
  el.querySelector(".delete").onclick = () => {
    el.classList.remove("is-active");
  }
}

// Help modal activation
document.querySelector("#launch-help-modal").onclick = () => {
  document.querySelector("#help-modal").classList.add("is-active");
}

/********************************************
 * HELPER FUNCTIONS START HERE
 ********************************************/

function clickHoveringElement() {
  const validActiveElement = window.chart.active.find(e =>
    window.chart.data.datasets[e._datasetIndex].data[e._index] != undefined
  );

  // Simulate clicking bar being hovered on in chart
  if (validActiveElement) {

    const elementMeta = window.chart
      .getDatasetMeta(validActiveElement._datasetIndex)
      .data[validActiveElement._index]

    let point = elementMeta.getCenterPoint();
    const rectangle = window.chart.canvas.getBoundingClientRect();

    const clickEvent = new MouseEvent('click', {
      clientX: rectangle.left + point.x,
      clientY: rectangle.top + point.y
    });

    // Do click and stop hovering
    window.chart.canvas.dispatchEvent(clickEvent);
    window.chart.canvas.dispatchEvent(new MouseEvent('mouseout'));

  }
}
