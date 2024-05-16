import { render as renderListeningAddresses } from "../listening-addresses/index.js";
import { unmarshalPublicKey } from "@libp2p/crypto/keys";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

export const render = (toElement, { helia }) => {
  toElement.innerHTML = `
<div class="card">      
  <div class="card-body">
    <h2 class="card-title">Status</h2>
    <div class="container">
      <div class="row">
        <div class="col-md-3">
          <h3>Peer Id</h3>
        </div>
        <div class="col-md-8 text-start">
          <div id="peerId"></div>
        </div>
      </div>
      <div id="listeningAddresses" class="row"></div>
    </div>
  </div>
</div>`;

  window.addEventListener("load", (event) => {
    document.querySelector("#peerId").innerHTML =
      helia.libp2p.peerId.toString();

    renderListeningAddresses(document.querySelector("#listeningAddresses"), {
      helia,
    });
  });
};
