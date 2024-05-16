import {
  config as WWWLibp2pWebtranportsSessionConfig,
  render as renderWWWLibp2pWebTransportSessions,
} from "./packages/www-libp2p-webtransports-sessions/index.js";
import { render as renderStatus } from "./packages/status/index.js";
import { render as renderPeers } from "./packages/peers/index.js";
import { render as renderDebugToggle } from "./packages/debug-toggle/index.js";
import { render as renderStartStop } from "./packages/start-stop/index.js";
import { render as renderContentExplorer } from "./packages/content-explorer/index.js";
import { createHelia } from "helia";

let config = {};

const registerHeliaConfig = (c) => {
  config = { ...config, ...c };
};

registerHeliaConfig(WWWLibp2pWebtranportsSessionConfig);

const helia = await createHelia(config);

await helia.start();

window.addEventListener("beforeunload", () => {
  helia.stop();
});

document.querySelector("#app").innerHTML = `
  <div class="container px-2">
    
    <div class="row m-5">
      <div id="home" class="card">
        <div class="card-body">
          <h2 class="card-title">Home</h2>
          <div class="container text-center">
            <div class="row">
              <div class="col">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Start/Stop Debugging</h5>
                    <div id="toggleButton"></div>
                  </div>
                </div>
              </div>
              <div class="col">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Start/Stop Helia</h5>
                    <div id="startStopButton"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row m-5">
      <div id="discover" class="card">
        <div class="card-body">
          <h2 class="card-title">Discover</h2>
          <div id="contentExplorer"></div>
        </div>
      </div>
    </div>
    
    <div class="row m-5">
      <div id="status"></div>
    </div>
    
    <div class="row m-5">
      <div id="peers"></div>
    </div>
    
    <div class="row m-5">
      <div id="monitors" class="card">
        <div class="card-body">
          <h2 class="card-title">WebTransport Session Monitor</h2>    
          <div id="webtransport-sessions"></div>
        </div>
      </div>
    </div>
  </div>
`;

const DOM = {
  toggleButton: document.getElementById("toggleButton"),
  startStopButton: document.getElementById("startStopButton"),
  contentExplorer: document.getElementById("contentExplorer"),
  status: document.getElementById("status"),
  peers: document.getElementById("peers"),
  webTransportSessions: document.getElementById("webtransport-sessions"),
};

renderStartStop(DOM.startStopButton, { helia })
renderDebugToggle(DOM.toggleButton, { helia });
renderContentExplorer(DOM.contentExplorer, { helia });
renderStatus(DOM.status, { helia });
renderPeers(DOM.peers, { helia });
renderWWWLibp2pWebTransportSessions(DOM.webTransportSessions, { helia });
