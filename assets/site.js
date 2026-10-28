// 本次浏览中记住手动选择的语言（新的浏览默认跟随浏览器语言）；手机上把当前板块按钮滑到可见处；列表页的本页筛选、「只看值得关注」「只看加密相关」和没有结果时的提示
(function () {
  try { localStorage.removeItem("diting-lang"); } catch (e) {}   // 旧版本永久记住的选择不再生效
  document.querySelectorAll(".lang-switch a[data-lang]").forEach(function (a) {
    a.addEventListener("click", function () {
      try { sessionStorage.setItem("diting-lang", a.dataset.lang); } catch (e) {}
    });
  });
  var chips = document.querySelector(".chips");
  var active = chips && chips.querySelector("a[aria-current]");
  if (active && chips.scrollWidth > chips.clientWidth) {
    chips.scrollLeft = active.offsetLeft - (chips.clientWidth - active.offsetWidth) / 2;
  }
  var input = document.querySelector("input.filter");
  if (!input) return;
  // 「只看值得关注」（论文）或「只看加密相关」（法规）：data-only 是条目上要有的样式类
  var only = document.querySelector(".only-toggle input");
  var items = Array.prototype.slice.call(document.querySelectorAll("article.item"));
  var picks = Array.prototype.slice.call(document.querySelectorAll("li.pick"));
  var days = Array.prototype.slice.call(document.querySelectorAll("section.day"));
  var picksBlock = document.querySelector("section.picks");
  var empty = document.querySelector(".filter-empty");
  function matches(el, q) { return q === "" || el.textContent.toLowerCase().indexOf(q) >= 0; }
  function apply() {
    var q = input.value.trim().toLowerCase();
    var onlyOn = only && only.checked;
    items.forEach(function (el) {
      el.classList.toggle("hidden", !matches(el, q) || (onlyOn && !el.classList.contains(only.dataset.only)));
    });
    picks.forEach(function (el) { el.classList.toggle("hidden", !matches(el, q)); });   // 精选都是值得关注的，只按文字筛
    days.forEach(function (sec) {
      sec.classList.toggle("hidden", !sec.querySelector("article.item:not(.hidden)"));
    });
    if (picksBlock) picksBlock.classList.toggle("hidden", !picksBlock.querySelector("li.pick:not(.hidden)"));
    // 有条件、本页却一条都不剩时说清楚，并给出清除按钮
    if (empty) empty.hidden = !(q !== "" || onlyOn) || items.length === 0 ||
      !!document.querySelector("article.item:not(.hidden), li.pick:not(.hidden)");
  }
  input.addEventListener("input", apply);
  if (only) only.addEventListener("change", apply);
  var clear = document.querySelector(".filter-clear");
  if (clear) clear.addEventListener("click", function () {
    input.value = "";
    if (only) only.checked = false;
    apply();
    input.focus();
  });
})();
