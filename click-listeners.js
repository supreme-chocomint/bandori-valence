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