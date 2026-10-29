// 固定链接（D-38）：go.html#d文件编号。按编号取 assets/where/{编号 ÷ 1000}.json，跳到条目现在所在的页面；
// 补录挤到下一页、换了板块都找得到。找不到（超出保留期、已移出网站）就说明原因。
(function () {
  var box = document.querySelector(".go-status");
  var m = /^#d(\d+)$/.exec(location.hash);
  if (!m) { box.textContent = box.dataset.bad; return; }
  var id = m[1];
  fetch("../assets/where/" + Math.floor(Number(id) / 1000) + ".json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .catch(function () { return {}; })
    .then(function (where) {
      if (where[id]) location.replace(where[id] + "#d" + id);
      else box.textContent = box.dataset.gone;
    });
})();
