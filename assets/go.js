// 固定链接（D-38）：go.html#d文件编号。按编号取 assets/where/{编号 ÷ 1000}.json，跳到条目现在所在的页面；
// 补录挤到下一页、换了板块都找得到。分开说明三种失败（D-39）：
//   索引读到了、里面没有这个编号（或这一组索引不存在，404）→ 超出保留期或已移出网站；
//   网络出错、服务器出错、索引读不懂 → 暂时读不到，给「重试」，不冒充「已移除」；
//   地址里没有有效编号 → 链接不完整。
(function () {
  var box = document.querySelector(".go-status");
  var retry = document.querySelector(".go-retry");
  var m = /^#d(\d+)$/.exec(location.hash);
  if (!m) { box.textContent = box.dataset.bad; return; }
  var id = m[1];
  function gone() { box.textContent = box.dataset.gone; }
  function failed() { box.textContent = box.dataset.error; if (retry) retry.hidden = false; }
  function look() {
    if (retry) retry.hidden = true;
    fetch("../assets/where/" + Math.floor(Number(id) / 1000) + ".json", { cache: "no-cache" })
      .then(function (r) {
        if (r.status === 404) return {};
        if (!r.ok) throw new Error("http " + r.status);
        return r.json();
      })
      .then(function (where) {
        if (where[id]) location.replace(where[id] + "#d" + id);
        else gone();
      }, failed);
  }
  if (retry) retry.addEventListener("click", look);
  look();
})();
