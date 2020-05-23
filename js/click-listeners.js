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