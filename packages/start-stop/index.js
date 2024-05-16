export const render = (toElement, { helia }) => {
  let started = helia.libp2p.status === 'started'
  const label = started ? "Stop Helia" : "Start Helia";
  const cssClass = `btn btn-${started ? "danger" : "success"}`;

  toElement.innerHTML = `<button id="startStopToggle" class="btn ${cssClass}">${label}</button>`;

  const button = document.getElementById("startStopToggle");

  button.addEventListener("click", async () => {
    if (started) {
      await helia.stop();
      button.className = "btn btn-success";
      button.innerText = "Start Helia";
    } else {
      await helia.start();
      button.className = "btn btn-danger";
      button.innerText = "Stop Helia";
    }
    
    started = helia.libp2p.status === 'started'
  });
};
