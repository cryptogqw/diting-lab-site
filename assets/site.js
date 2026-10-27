// 记住选择的语言；列表页的本页筛选
(function () {
  document.querySelectorAll(".lang-switch a[data-lang]").forEach(function (a) {
    a.addEventListener("click", function () {
      try { localStorage.setItem("diting-lang", a.dataset.lang); } catch (e) {}
    });
  });
  var input = document.querySelector("input.filter");
  if (!input) return;
  var items = Array.prototype.slice.call(document.querySelectorAll("article.item"));
  var days = Array.prototype.slice.call(document.querySelectorAll("section.day"));
  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();
    items.forEach(function (el) {
      el.classList.toggle("hidden", q !== "" && el.textContent.toLowerCase().indexOf(q) < 0);
    });
    days.forEach(function (sec) {
      sec.classList.toggle("hidden", !sec.querySelector("article.item:not(.hidden)"));
    });
  });
})();
