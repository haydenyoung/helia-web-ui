import { render as renderConnectedPeers } from "../connected-peers/index.js";
import { render as renderDiscoveredPeers } from "../discovered-peers/index.js";

export const render = (toElement, { helia }) => {
  toElement.innerHTML = `
<div class="card">      
 <div class="card-body">
   <h2 class="card-title">Peers</h2>
   <div class="container">
     <div class="row">
       <div class="col-xl-12">
         <div id="connectedPeers"></div>
       </div>
       <div class="col-xl-12"
         <div id="discoveredPeers"></div>
      </div>
    </div>
  </div>
</div>`;
  renderConnectedPeers(document.querySelector("#connectedPeers"), { helia });
  renderDiscoveredPeers(document.querySelector("#discoveredPeers"), { helia });
};
