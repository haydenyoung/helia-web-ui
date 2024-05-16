export const render = (toElement, { helia }) => {
  let addresses = [];

  const updateListeningAddresses = () => {
    addresses = helia.libp2p.getMultiaddrs();

    var ul = document.querySelector("#listeningAddressesList");

    ul.innerHTML = "";

    for (var i = 0; i < addresses.length; i++) {
      var li = document.createElement("li");
      li.appendChild(document.createTextNode(addresses[i]));
      ul.appendChild(li);
    }

    document.querySelector("#listeningAddressesCount").innerHTML =
      `(${addresses.length})`;
  };

  toElement.innerHTML = `
    <div class="col text-start">
      <h3>Listening on&nbsp;<span id="listeningAddressesCount"></span></h3>
    </div>
    <div class="col text-start">
      <ul id="listeningAddressesList"></ul>
    </div>`;
  helia.libp2p.addEventListener("peer:connect", (event) => {
    updateListeningAddresses();
  });

  helia.libp2p.addEventListener("peer:discovery", (event) => {
    updateListeningAddresses();
  });

  helia.libp2p.addEventListener("peer:disconnect", (event) => {
    updateListeningAddresses();
  });
};
