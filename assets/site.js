// 本次浏览中记住手动选择的语言（新的浏览默认跟随浏览器语言）；手机上把当前板块按钮滑到可见处；
// 列表页的本页筛选、「只看值得关注」「只看加密相关」、匹配条数和没有结果时的提示。
// 筛选条件写进网址（?q=…&only=1），复制网址给别人能打开同样的结果；常见术语的中日英写法互通（D-37）。
// 切换语言时带上筛选条件和条目锚点；英文缩写别名按整词匹配（defi 不命中 definition）（D-38）。
// 网站超过 12 小时没有重新生成时，首页和列表页顶部提示内容可能不是最新的（D-39）。
(function () {
  try { localStorage.removeItem("diting-lang"); } catch (e) {}   // 旧版本永久记住的选择不再生效
  document.querySelectorAll(".lang-switch a[data-lang]").forEach(function (a) {
    a.addEventListener("click", function () {
      try { sessionStorage.setItem("diting-lang", a.dataset.lang); } catch (e) {}
    });
  });
  // 语言链接带上当前的筛选条件和锚点：换语言看的是同一批条目
  var langLinks = Array.prototype.slice.call(document.querySelectorAll(".lang-switch a[data-lang]"));
  langLinks.forEach(function (a) { a.dataset.base = a.getAttribute("href"); });
  function syncLangLinks() {
    langLinks.forEach(function (a) { a.setAttribute("href", a.dataset.base + location.search + location.hash); });
  }
  syncLangLinks();
  window.addEventListener("hashchange", syncLangLinks);
  // 网站超过 12 小时没生成就提示（D-39）：生成时间在 assets/built.json，按访客的时钟比对；读不到就不提示
  var stale = document.querySelector(".stale-note");
  if (stale && window.fetch) {
    fetch(stale.dataset.src, { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (info) {
        var built = info && Date.parse(info.built);
        if (built && Date.now() - built > 12 * 3600 * 1000) stale.hidden = false;
      })
      .catch(function () {});
  }
  var chips = document.querySelector(".chips");
  var active = chips && chips.querySelector("a[aria-current]");
  if (active && chips.scrollWidth > chips.clientWidth) {
    chips.scrollLeft = active.offsetLeft - (chips.clientWidth - active.offsetWidth) / 2;
  }
  var input = document.querySelector("input.filter");
  if (!input) return;
  // 同一组里的写法互相匹配：输入其中任何一个，就找含有组里任何一个的条目
  var ALIASES = [
    ["稳定币", "穩定幣", "stablecoin", "ステーブルコイン", "電子決済手段"],
    ["加密资产", "加密資產", "虚拟资产", "虛擬資產", "数字资产", "暗号資産", "仮想通貨", "crypto", "cryptoasset",
     "crypto-asset", "virtual asset", "digital asset"],
    ["代币化", "代幣化", "tokenization", "tokenisation", "tokenized", "tokenised", "トークン化"],
    ["区块链", "區塊鏈", "blockchain", "ブロックチェーン", "distributed ledger", "分布式账本", "分散型台帳"],
    ["零知识", "零知識", "zero-knowledge", "ゼロ知識", "zkp", "snark"],
    ["后量子", "後量子", "post-quantum", "耐量子", "量子耐性", "pqc"],
    ["去中心化金融", "defi", "分散型金融"],
    ["反洗钱", "反洗錢", "anti-money laundering", "aml", "マネー・ローンダリング", "マネロン"],
    ["比特币", "比特幣", "bitcoin", "ビットコイン"],
    ["以太坊", "ethereum", "イーサリアム"],
    ["央行数字货币", "cbdc", "central bank digital currency", "中央銀行デジタル通貨"],
    ["智能合约", "智能合約", "smart contract", "スマートコントラクト"],
    ["征求意见", "意见征集", "consultation", "意見募集", "パブリックコメント"],
  ];
  function group(q) {
    for (var i = 0; i < ALIASES.length; i++) {
      if (ALIASES[i].indexOf(q) >= 0) return ALIASES[i];
    }
    return null;
  }
  // 输入的是别名：组里的英文词（包括输入的这个）按整词匹配，defi 不命中 definition；其它输入按包含匹配
  function matcher(w, whole) {
    if (!whole || !/^[a-z0-9 .\-]+$/.test(w)) return function (s) { return s.indexOf(w) >= 0; };
    var re = new RegExp("(^|[^a-z0-9])" + w.replace(/[.\-]/g, "\\$&") + "(?:s|es)?([^a-z0-9]|$)");   // 允许复数
    return function (s) { return re.test(s); };
  }
  // 「只看值得关注」（论文）或「只看加密相关」（法规）：data-only 是条目上要有的样式类
  var only = document.querySelector(".only-toggle input");
  var items = Array.prototype.slice.call(document.querySelectorAll("article.item"));
  var picks = Array.prototype.slice.call(document.querySelectorAll("li.pick"));
  var days = Array.prototype.slice.call(document.querySelectorAll("section.day"));
  var picksBlock = document.querySelector("section.picks");
  var empty = document.querySelector(".filter-empty");
  var count = document.querySelector(".filter-count");
  var hint = document.querySelector(".alias-hint");
  var texts = new Map();
  function text(el) {
    if (!texts.has(el)) texts.set(el, el.textContent.toLowerCase());
    return texts.get(el);
  }
  function matches(el, tests) {
    if (!tests) return true;
    var s = text(el);
    return tests.some(function (f) { return f(s); });
  }
  function save(q, onlyOn) {
    try {
      var url = new URL(location.href);
      if (q) url.searchParams.set("q", q); else url.searchParams.delete("q");
      if (onlyOn) url.searchParams.set("only", "1"); else url.searchParams.delete("only");
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (e) {}
    syncLangLinks();
  }
  function apply() {
    var q = input.value.trim().toLowerCase();
    var g = q === "" ? null : group(q);
    var words = q === "" ? null : (g ? g.map(function (w) { return matcher(w, true); }) : [matcher(q, false)]);
    if (hint) {
      hint.hidden = !g;
      if (g) hint.textContent = hint.dataset.text.replace("{terms}", g.filter(function (w) { return w !== q; }).join(" / "));
    }
    var onlyOn = !!(only && only.checked);
    var shown = 0;
    items.forEach(function (el) {
      var hide = !matches(el, words) || (onlyOn && !el.classList.contains(only.dataset.only));
      el.classList.toggle("hidden", hide);
      if (!hide) shown++;
    });
    picks.forEach(function (el) { el.classList.toggle("hidden", !matches(el, words)); });   // 精选都是值得关注的，只按文字筛
    days.forEach(function (sec) {
      sec.classList.toggle("hidden", !sec.querySelector("article.item:not(.hidden)"));
    });
    if (picksBlock && picks.length) {
      picksBlock.classList.toggle("hidden", !picksBlock.querySelector("li.pick:not(.hidden)"));
    }
    var filtering = q !== "" || onlyOn;
    // 有条件时显示本页匹配几条；一条都不剩时说清楚，并给出清除按钮
    if (count) {
      count.hidden = !filtering || shown === 0;
      count.textContent = count.dataset.text.replace("{n}", shown);
    }
    if (empty) empty.hidden = !filtering || items.length === 0 ||
      !!document.querySelector("article.item:not(.hidden), li.pick:not(.hidden)");
    save(input.value.trim(), onlyOn);
  }
  var params = new URLSearchParams(location.search);
  if (params.get("q")) input.value = params.get("q");
  if (only && params.get("only") === "1") only.checked = true;
  input.addEventListener("input", apply);
  if (only) only.addEventListener("change", apply);
  var clear = document.querySelector(".filter-clear");
  if (clear) clear.addEventListener("click", function () {
    input.value = "";
    if (only) only.checked = false;
    apply();
    input.focus();
  });
  if (input.value || (only && only.checked)) apply();
})();
