import {
  WebRTC,
  WebSockets,
  WebSocketsSecure,
  WebTransport,
  Circuit,
} from "@multiformats/multiaddr-matcher";
import { protocols } from "@multiformats/multiaddr";
import prettyMs from "pretty-ms";
import { sha256 } from "multiformats/hashes/sha2";
import { simpleMetrics } from "@libp2p/simple-metrics";
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import * as Utils from "./utils.js";
import { bootstrap } from "@libp2p/bootstrap";

const pings = {};
let queryController = new AbortController();

let totals = {
  readyErrored: 0,
  noiseErrored: 0,
  upgradeErrored: 0,
  readyTimedout: 0,
  noiseTimedout: 0,
  success: 0,
};

let stats = {
  pending: 0,
  open: 0,

  ready_error: 0,
  noise_error: 0,
  upgrade_error: 0,

  ready_timeout: 0,
  noise_timeout: 0,

  close: 0,
  abort: 0,
  remote_close: 0,
};

let lastStats = {
  pending: 0,
  ready_error: 0,
  noise_error: 0,
  upgrade_error: 0,
  close: 0,
  remote_close: 0,
  ready: 0,
  abort: 0,
  ready_timeout: 0,
  noise_timeout: 0,
  open: 0,
};

const chartColours = {
  // state of connections
  open: Utils.CHART_COLORS.green,
  pending: Utils.CHART_COLORS.yellow,

  // errors opening connections
  ready_error: Utils.CHART_COLORS.red,
  noise_error: "rgb(193, 69, 95)",
  upgrade_error: "rgb(149, 45, 67)",

  ready_timeout: Utils.CHART_COLORS.orange,
  noise_timeout: "rgb(167, 103, 40)",

  // how connections close
  close: Utils.CHART_COLORS.blue,
  abort: "rgb(43, 129, 187)",
  remote_close: "rgb(30, 100, 147)",
};

const maxPoints = 3 * 60;
const now = Date.now();

let openSessionEvents = [];
let maxOpenSessionsPerMinute = 0;

let chart, DOM;

const updateMetrics = (metrics) => {
  try {
    const webTransportEvents = metrics.libp2p_webtransport_dialer_events_total;
    const now = new Date();
    chart.data.labels.push(now.getTime());

    const newPending =
      (webTransportEvents.pending ?? 0) - (lastStats.pending ?? 0);
    const newReadyError =
      (webTransportEvents.ready_error ?? 0) - (lastStats.ready_error ?? 0);
    const newNoiseError =
      (webTransportEvents.noise_error ?? 0) - (lastStats.noise_error ?? 0);
    const newUpgradeError =
      (webTransportEvents.upgrade_error ?? 0) - (lastStats.upgrade_error ?? 0);
    const newClose = (webTransportEvents.close ?? 0) - (lastStats.close ?? 0);
    const newReady = (webTransportEvents.ready ?? 0) - (lastStats.ready ?? 0);
    const newAbort = (webTransportEvents.abort ?? 0) - (lastStats.abort ?? 0);
    const newReadyTimeout =
      (webTransportEvents.ready_timeout ?? 0) - (lastStats.ready_timeout ?? 0);
    const newNoiseTimeout =
      (webTransportEvents.noise_timeout ?? 0) - (lastStats.noise_timeout ?? 0);
    const newOpen = (webTransportEvents.open ?? 0) - (lastStats.open ?? 0);
    const newRemoteClose =
      (webTransportEvents.remote_close ?? 0) - (lastStats.remote_close ?? 0);

    stats.pending += newPending;
    stats.pending -= newReadyTimeout;
    stats.pending -= newNoiseTimeout;
    stats.pending -= newReadyError;
    stats.pending -= newNoiseError;
    stats.pending -= newUpgradeError;
    stats.pending -= newOpen;

    stats.open += newOpen;
    stats.open -= newClose;
    stats.open -= newRemoteClose;
    stats.open -= newAbort;

    // non-cumlative
    stats.ready_error = newReadyError;
    stats.noise_error = newNoiseError;
    stats.upgrade_error = newUpgradeError;
    stats.ready_timeout = newReadyTimeout;
    stats.noise_timeout = newNoiseTimeout;
    stats.close = newClose;
    stats.abort = newAbort;
    stats.remote_close = newRemoteClose;

    totals.success += newReady;
    totals.readyErrored += newReadyError;
    totals.noiseErrored += newNoiseError;
    totals.upgradeErrored += newUpgradeError;
    totals.readyTimedout += newReadyTimeout;
    totals.noiseTimedout += newNoiseTimeout;

    DOM.webTransportConnectionsSuccess().innerHTML = totals.success;
    DOM.webTransportConnectionsReadyError().innerHTML = totals.readyErrored;
    DOM.webTransportConnectionsNoiseError().innerHTML = totals.noiseErrored;
    DOM.webTransportConnectionsUpgradeError().innerHTML = totals.upgradeErrored;
    DOM.webTransportConnectionsReadyTimeout().innerHTML = totals.readyTimedout;
    DOM.webTransportConnectionsNoiseTimeout().innerHTML = totals.noiseTimedout;

    // work out connections in the last minute
    openSessionEvents.push(newPending);
    if (openSessionEvents.length > 60) {
      DOM.webTransportConnectionsPerUnit().innerText = "minute";
      openSessionEvents = openSessionEvents.slice(
        openSessionEvents.length - 60,
      );
    } else {
      DOM.webTransportConnectionsPerUnit().innerText = `${openSessionEvents.length} seconds`;
    }
    const openSessionEventCount = openSessionEvents.reduce(
      (acc, curr) => acc + curr,
      0,
    );
    DOM.webTransportConnectionsPerMinute().innerText = openSessionEventCount;

    // calculate max sessions opened per minute
    if (openSessionEventCount > maxOpenSessionsPerMinute) {
      maxOpenSessionsPerMinute = openSessionEventCount;
    }
    DOM.webTransportMaxConnectionsPerMinute().innerText =
      maxOpenSessionsPerMinute;

    // calculate failure rate
    const errors =
      totals.readyErrored + totals.noiseErrored + totals.upgradeErrored;
    const timeouts = totals.readyTimedout + totals.noiseTimedout;
    const failureRate = (
      ((errors + timeouts) / (errors + timeouts + totals.success)) *
      100
    ).toFixed(2);
    DOM.webTransportConnectionsFailureRate().innerText = `${failureRate}%`;

    Object.keys(stats).forEach((name, index) => {
      chart.data.datasets[index].data.push({
        x: now.getTime(),
        y: stats[name],
      });

      if (chart.data.datasets[index].data.length > maxPoints) {
        chart.data.datasets[index].data =
          chart.data.datasets[index].data.slice(-maxPoints);
      }
    });

    if (chart.data.labels.length > maxPoints) {
      chart.data.labels = chart.data.labels.slice(-maxPoints);
    }

    chart.update();
    lastStats = webTransportEvents;
  } catch (err) {
    console.error(err);
  }
};

function update(element, newContent) {
  if (element.innerHTML !== newContent) {
    element.innerHTML = newContent;
  }
}

export const config = {
  start: false,
  libp2p: {
    metrics: simpleMetrics({ onMetrics: updateMetrics }),
  },
};

export const render = (toElement, { helia }) => {
  toElement.innerHTML = `
  <div class="chart-container" style="position: relative; height:400px; width: 100vw">
    <canvas id="webtransport-stats"></canvas>
  </div>
  <ul>
    <li>Opened sessions in the last <span id="output-webtransport-opened-per-unit">0s</span>: <span id="output-webtransport-opened-per-minute">0</span></li>
    <li>Max opened connections per minute: <span id="output-webtransport-max-opened-per-minute">0</span></li>
    <li>Totals:
      <ul>
        <li>Success: <span id="output-webtransport-success">0</span></li>
        <li>Ready error: <span id="output-webtransport-ready-error">0</span></li>
        <li>Noise error: <span id="output-webtransport-noise-error">0</span></li>
        <li>Upgrade error: <span id="output-webtransport-upgrade-error">0</span></li>
        <li>Ready timeout: <span id="output-webtransport-ready-timeout">0</span></li>
        <li>Noise timeout: <span id="output-webtransport-noise-timeout">0</span></li>
        <li>Failure rate: <span id="output-webtransport-failure-rate">0</span></li>
      </ul>
    </li>
  </ul>
  `;
  DOM = {
    nodePeerTypes: () => document.getElementById("output-peer-types"),
    nodeAddresses: () => document.getElementById("output-addresses"),

    outputQuery: () => document.getElementById("output-query"),

    webTransportConnectionsPerMinute: () =>
      document.getElementById("output-webtransport-opened-per-minute"),
    webTransportConnectionsPerUnit: () =>
      document.getElementById("output-webtransport-opened-per-unit"),
    webTransportConnectionsSuccess: () =>
      document.getElementById("output-webtransport-success"),
    webTransportConnectionsReadyError: () =>
      document.getElementById("output-webtransport-ready-error"),
    webTransportConnectionsNoiseError: () =>
      document.getElementById("output-webtransport-noise-error"),
    webTransportConnectionsUpgradeError: () =>
      document.getElementById("output-webtransport-upgrade-error"),
    webTransportConnectionsReadyTimeout: () =>
      document.getElementById("output-webtransport-ready-timeout"),
    webTransportConnectionsNoiseTimeout: () =>
      document.getElementById("output-webtransport-noise-timeout"),
    webTransportMaxConnectionsPerMinute: () =>
      document.getElementById("output-webtransport-max-opened-per-minute"),
    webTransportConnectionsFailureRate: () =>
      document.getElementById("output-webtransport-failure-rate"),

    webTransportStatsGraph: () => document.getElementById("webtransport-stats"),
  };

  Chart.register(
    LineController,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Legend,
  );

  chart = new Chart(DOM.webTransportStatsGraph(), {
    type: "line",
    data: {
      labels: [now],
      datasets: Object.keys(stats).map((name) => {
        return {
          label: name,
          data: [{ x: now, y: 0 }],
          borderColor: chartColours[name],
          backgroundColor: Utils.transparentize(chartColours[name], 0.5),
        };
      }),
    },
    options: {
      animation: false,
      legend: {
        display: true,
        title: {
          display: true,
          text: "Legend Title",
        },
        position: "top",
        labels: {
          color: "rgb(255, 99, 132)",
        },
      },
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        x: {
          type: "time",
          suggestedMax: now + maxPoints * 1000,
        },
        y: {
          min: 0,
          suggestedMax: 30,
        },
      },
    },
  });

  helia.libp2p.addEventListener("peer:connect", (event) => {
    const ping = {
      latency: -1,
      lastPing: 0,
      controller: new AbortController(),
      interval: setInterval(async () => {
        try {
          ping.latency = await helia.libp2p.services.ping.ping(event.detail, {
            signal: ping.controller.signal,
          });
          ping.lastPing = Date.now();
        } catch (err) {
          console.error("error while running ping", err);
        }
      }, 5000),
    };

    pings[event.detail.toString()] = ping;
  });

  helia.libp2p.addEventListener("peer:disconnect", (event) => {
    const ping = pings[event.detail.toString()];

    if (ping == null) {
      return;
    }

    ping.controller.abort();
    clearInterval(ping.interval);
  });
};
