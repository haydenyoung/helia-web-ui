const connectedPeers = [];

function addConnectedPeer(item) {
  var index = connectedPeers.indexOf(item);
  if (index === -1) {
    connectedPeers.push(item);
  }
}

function removeConnectedPeer(item) {
  var index = connectedPeers.indexOf(item);
  if (index !== -1) {
    connectedPeers.splice(index, 1);
  }
}

function updateConnectedPeers() {
  var ul = document.querySelector("#connectedPeersList");

  ul.innerHTML = "";

  for (var i = 0; i < connectedPeers.length; i++) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(connectedPeers[i]));
    ul.appendChild(li);
  }

  document.querySelector("#connectedPeersCount").innerHTML =
    `(${connectedPeers.length})`;
}

export const render = (toElement, { helia }) => {
  toElement.innerHTML = `
      <h2>Connected Peers&nbsp;<span id="connectedPeersCount"></span></h2>
      <ul id="connectedPeersList"></ul>`;

  helia.libp2p.addEventListener("peer:connect", (event) => {
    addConnectedPeer(event.detail.toString());
    updateConnectedPeers();
  });

  helia.libp2p.addEventListener("peer:disconnect", (event) => {
    removeConnectedPeer(event.detail.toString());
    updateConnectedPeers();
  });
};
