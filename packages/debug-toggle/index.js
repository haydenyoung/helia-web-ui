import { enabled, enable, disable } from '@libp2p/logger'

let debug = false
export const render = (toElement, { helia }) => {
  const debug = localStorage.getItem("debug") ? true : false;
  const label = debug ? "Stop debugging" : "Start debugging";
  const cssClass = `btn btn-${debug ? "success" : "secondary"}`;

  toElement.innerHTML = `<button id="debugToggle" class="btn ${cssClass}">${label}</button>`;

  const button = document.getElementById("debugToggle");

  button.addEventListener("click", async () => {
    if (localStorage.getItem("debug") ? true : false) {
      disable();
      button.innerText = "Start debugging";
      button.className = "btn btn-secondary";
    } else {
      enable("libp2p:*");
      button.innerText = "Stop debugging";
      button.className = "btn btn-success";
    }
  });
};
