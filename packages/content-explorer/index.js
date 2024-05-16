import { unixfs } from "@helia/unixfs";

export const render = async (toElement, { helia }) => {
  toElement.innerHTML = `
  <div class="row row-cols-lg-auto g-3 align-items-center">
    <div class="col-12">
      <input type="text" id="contentExplorerCID" class="form-control" placeholder="QmHash/bafyHash">
    </div>
    <div class="col-12">
      <button id="contentExplorerHashBrowse" class="btn btn-primary">Browse</button>
    </div>
  </div>
  <div>
    <div id="contentExplorerContentsCID"></div>
    <ul id="contentExplorerContents"></ul>
  </div>
  `;

  document
    .getElementById("contentExplorerHashBrowse")
    .addEventListener("click", async (event) => {
      const cid = document.getElementById("contentExplorerCID").value;
      document.getElementById("contentExplorerContentsCID").innerText = cid;
      const ul = document.querySelector("#contentExplorerContents");

      ul.innerHTML = "";

      const fs = unixfs(helia);
      const stats = await fs.stat(cid);
      console.log(stats);

      for await (const entry of fs.ls(cid)) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(entry.name));
        ul.appendChild(li);
      }
    });
};
