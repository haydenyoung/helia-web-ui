const discoveredPeers = [];

function addDiscoveredPeer(item) {
  var index = discoveredPeers.indexOf(item);
  if (index === -1) {
    discoveredPeers.push(item);
  }
}

function removeDiscoveredPeer(item) {
  var index = discoveredPeers.indexOf(item);
  if (index !== -1) {
    discoveredPeers.splice(index, 1);
  }
}

function updateDiscoveredPeers() {
  var ul = document.querySelector("#discoveredPeersList");

  ul.innerHTML = "";

  for (var i = 0; i < discoveredPeers.length; i++) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(discoveredPeers[i]));
    ul.appendChild(li);
  }

  document.querySelector("#discoveredPeersCount").innerHTML =
    `(${discoveredPeers.length})`;
}

export const render = (toElement, { helia }) => {
  toElement.innerHTML = `
      <h2>Discovered Peers&nbsp;<span id="discoveredPeersCount"></span></h2>
      <ul id="discoveredPeersList"></ul>`;

  helia.libp2p.addEventListener("peer:discovery", (event) => {
    addDiscoveredPeer(event.detail.id.toString());
    updateDiscoveredPeers();
  });
};
