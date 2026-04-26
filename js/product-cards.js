(function () {
  "use strict";

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function escapeAttr(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function starsHtml(rating) {
    var r = Math.round(Number(rating) || 0);
    r = Math.max(0, Math.min(5, r));
    return "★".repeat(r) + "☆".repeat(5 - r);
  }

  /**
   * @param {object} p - product from GADGET_PRODUCTS
   * @param {object} opts - { showDescription?: boolean }
   */
  window.gadgetProductCardHtml = function gadgetProductCardHtml(p, opts) {
    var GL = window.GadgetLab;
    var L = window.GADGET_CATEGORY_LABEL || {};
    var detailUrl = GL.productDetailUrl(p.id);
    var priceHtml = p.compareAt
      ? '<span class="product-card__price">' +
        escapeHtml(GL.formatMoney(p.price)) +
        "<s>" +
        escapeHtml(GL.formatMoney(p.compareAt)) +
        "</s></span>"
      : '<span class="product-card__price">' + escapeHtml(GL.formatMoney(p.price)) + "</span>";
    var badgeHtml = p.badge
      ? '<span class="product-card__badge">' + escapeHtml(p.badge) + "</span>"
      : "";
    var alt = escapeHtml(p.name);

    return (
      '<article class="product-card" data-product-id="' +
      escapeHtml(p.id) +
      '">' +
      '<a class="product-card__link" href="' +
      detailUrl +
      '"><span class="visually-hidden">View ' +
      alt +
      "</span></a>" +
      '<div class="product-card__media">' +
      badgeHtml +
      '<img src="' +
      escapeAttr(p.image) +
      '" alt="' +
      alt +
      '" width="600" height="600" loading="lazy">' +
      "</div>" +
      '<div class="product-card__body">' +
      '<p class="product-card__cat">' +
      escapeHtml(L[p.category] || p.category) +
      "</p>" +
      "<h3 class=\"product-card__name\">" +
      escapeHtml(p.name) +
      "</h3>" +
      '<div class="product-card__rating">' +
      '<span class="product-card__stars" aria-hidden="true">' +
      starsHtml(p.rating) +
      "</span>" +
      "<span>" +
      escapeHtml(String(p.rating)) +
      " (" +
      Number(p.reviews || 0).toLocaleString() +
      ")</span>" +
      "</div>" +
      '<div class="product-card__footer">' +
      priceHtml +
      '<button type="button" class="product-card__add" data-add-to-cart="' +
      escapeHtml(p.id) +
      '">Add to cart</button>' +
      "</div>" +
      "</div>" +
      "</article>"
    );
  };

  window.initProductCardButtons = function initProductCardButtons(root) {
    var el = root || document;
    el.querySelectorAll("[data-add-to-cart]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = btn.getAttribute("data-add-to-cart");
        if (!id || !window.GadgetLab) return;
        window.GadgetLab.addToCart(id, 1);
        var p = window.GadgetLab.getProductById(id);
        window.GadgetLab.showToast(p ? "Added " + p.name + " to cart" : "Added to cart");
      });
    });
  };
})();
