(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("featured-grid");
    if (!grid || !window.GADGET_PRODUCTS) return;

    var featured = window.GADGET_PRODUCTS.filter(function (p) {
      return p.featured === true;
    });
    if (!featured.length) featured = window.GADGET_PRODUCTS.slice(0, 4);

    grid.innerHTML = featured
      .slice(0, 4)
      .map(function (p) {
        return window.gadgetProductCardHtml(p);
      })
      .join("");

    window.initProductCardButtons(grid);

    var nf = document.getElementById("newsletter-form");
    if (nf) {
      nf.addEventListener("submit", function (e) {
        e.preventDefault();
        nf.reset();
        window.GadgetLab.showToast("You’re subscribed to GadgetLab updates.");
      });
    }
  });
})();
