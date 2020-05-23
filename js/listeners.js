// "Sort by" button
document.querySelector("#sorter").onclick = (event) => {
  const el = event.srcElement;
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

document.querySelector("#song-card .navigation-left").onclick = () => {
  const card = document.querySelector("#song-card");
  showPreviousInCard(
    parseInt(card.dataset.chartIndex),
    parseInt(card.dataset.chartDatasetIndex),
    window.chart,
    window.chartAttributes.focusing
  );
}

document.querySelector("#song-card .navigation-right").onclick = () => {
  const card = document.querySelector("#song-card");
  showNextInCard(
    parseInt(card.dataset.chartIndex),
    parseInt(card.dataset.chartDatasetIndex),
    window.chart,
    window.chartAttributes.focusing
  );
}

document.querySelector("#song-card").onkeydown = (event) => {
  if (event.code == "ArrowLeft") document.querySelector("#song-card .navigation-left").onclick();
  else if (event.code == "ArrowRight") document.querySelector("#song-card .navigation-right").onclick();
  else if (event.code == "Escape") {
    // Simulate clicking empty space on chart
    window.chart.options.onClick(null, []);
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