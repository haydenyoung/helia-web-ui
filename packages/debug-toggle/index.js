export const render = (toElement, { helia }) => {
  const debug = localStorage.getItem("debug") ? true : false;
  const label = debug ? "Stop debugging" : "Start debugging";
  const cssClass = `btn btn-${debug ? "success" : "secondary"}`;

  toElement.innerHTML = `<button id="debugToggle" class="btn ${cssClass}">${label}</button>`;

  const button = document.getElementById("debugToggle");

  button.addEventListener("click", async () => {
    if (debug) {
      localStorage.removeItem("debug");
      button.className = "btn btn-success";
    } else {
      localStorage.setItem("debug", "libp2p:*");
      button.className = "btn btn-secondary";
    }

    // would be good to hot reload libp2p but requires page refresh.
    window.location.reload();
  });
};
