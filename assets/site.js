// 本次浏览中记住手动选择的语言（新的浏览默认跟随浏览器语言）；手机上把当前板块按钮滑到可见处；列表页的本页筛选和「只看值得关注」
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
  var notable = document.querySelector(".only-notable input");
  var items = Array.prototype.slice.call(document.querySelectorAll("article.item"));
  var days = Array.prototype.slice.call(document.querySelectorAll("section.day"));
  function apply() {
    var q = input.value.trim().toLowerCase();
    var onlyNotable = notable && notable.checked;
    items.forEach(function (el) {
      var hide = (q !== "" && el.textContent.toLowerCase().indexOf(q) < 0) ||
                 (onlyNotable && !el.classList.contains("notable"));
      el.classList.toggle("hidden", hide);
    });
    days.forEach(function (sec) {
      sec.classList.toggle("hidden", !sec.querySelector("article.item:not(.hidden)"));
    });
  }
  input.addEventListener("input", apply);
  if (notable) notable.addEventListener("change", apply);
})();
