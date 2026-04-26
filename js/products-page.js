(function () {
  "use strict";

  var activeCategory = "all";
  var searchQuery = "";

  function getFiltered() {
    var q = searchQuery.trim().toLowerCase();
    var L = window.GADGET_CATEGORY_LABEL || {};
    return window.GADGET_PRODUCTS.filter(function (p) {
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      if (!q) return true;
      var cat = L[p.category] || "";
      return (
        p.name.toLowerCase().indexOf(q) !== -1 ||
        cat.toLowerCase().indexOf(q) !== -1
      );
    });
  }

  function render() {
    var grid = document.getElementById("product-grid");
    var countEl = document.getElementById("catalog-count");
    if (!grid) return;

    var list = getFiltered();
    if (countEl) {
      countEl.textContent =
        list.length === window.GADGET_PRODUCTS.length
          ? window.GADGET_PRODUCTS.length + " products"
          : list.length + " product" + (list.length === 1 ? "" : "s");
    }

    grid.innerHTML = list
      .map(function (p) {
        return window.gadgetProductCardHtml(p);
      })
      .join("");

    window.initProductCardButtons(grid);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    searchQuery = params.get("q") || "";
    var cat = params.get("category");
    if (cat) activeCategory = cat;

    var searchInput = document.getElementById("site-search");
    if (searchInput) searchInput.value = searchQuery;

    document.querySelectorAll(".chip").forEach(function (chip) {
      var c = chip.getAttribute("data-category");
      chip.classList.toggle("is-active", c === activeCategory);
      chip.setAttribute("aria-selected", c === activeCategory ? "true" : "false");
      chip.addEventListener("click", function () {
        document.querySelectorAll(".chip").forEach(function (x) {
          x.classList.toggle("is-active", x === chip);
          x.setAttribute("aria-selected", x === chip ? "true" : "false");
        });
        activeCategory = chip.getAttribute("data-category") || "all";
        render();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        searchQuery = searchInput.value;
        render();
      });
    }

    render();
  });
})();
