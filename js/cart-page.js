(function () {
  "use strict";

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function render() {
    var GL = window.GadgetLab;
    var cart = GL.getCart();
    var ids = Object.keys(cart).filter(function (id) {
      return (parseInt(cart[id], 10) || 0) > 0;
    });
    var listEl = document.getElementById("cart-page-lines");
    var emptyEl = document.getElementById("cart-page-empty");
    var sumEl = document.getElementById("cart-page-subtotal");
    var asideEl = document.getElementById("cart-page-summary");

    if (!listEl) return;

    if (!ids.length) {
      listEl.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      if (asideEl) asideEl.hidden = true;
      if (sumEl) sumEl.textContent = GL.formatMoney(0);
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    if (asideEl) asideEl.hidden = false;

    var subtotal = 0;
    listEl.innerHTML = ids
      .map(function (id) {
        var p = GL.getProductById(id);
        if (!p) return "";
        var q = parseInt(cart[id], 10) || 0;
        subtotal += p.price * q;
        return (
          '<li class="cart-page__row">' +
          '<a href="' +
          GL.productDetailUrl(id) +
          '" class="cart-page__thumb-wrap"><img class="cart-page__thumb" src="' +
          escapeAttr(p.image) +
          '" alt=""></a>' +
          '<div class="cart-page__info">' +
          '<a href="' +
          GL.productDetailUrl(id) +
          '" class="cart-page__name">' +
          escapeHtml(p.name) +
          "</a>" +
          "<p class=\"cart-page__unit\">" +
          GL.formatMoney(p.price) +
          " each</p>" +
          '<div class="cart-page__controls">' +
          '<button type="button" class="cart-line__qty-btn" data-cart-minus="' +
          id +
          '">−</button>' +
          '<span class="cart-line__qty-val">' +
          q +
          "</span>" +
          '<button type="button" class="cart-line__qty-btn" data-cart-plus="' +
          id +
          '">+</button>' +
          '<button type="button" class="cart-page__remove" data-cart-remove="' +
          id +
          '">Remove</button>' +
          "</div>" +
          "</div>" +
          '<div class="cart-page__line-total">' +
          GL.formatMoney(p.price * q) +
          "</div>" +
          "</li>"
        );
      })
      .join("");

    if (sumEl) sumEl.textContent = GL.formatMoney(subtotal);

    listEl.querySelectorAll("[data-cart-minus]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-cart-minus");
        var c = GL.getCart();
        if (!c[id]) return;
        c[id] -= 1;
        if (c[id] <= 0) delete c[id];
        GL.setCart(c);
        render();
      });
    });
    listEl.querySelectorAll("[data-cart-plus]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-cart-plus");
        var c = GL.getCart();
        c[id] = (c[id] || 0) + 1;
        GL.setCart(c);
        render();
      });
    });
    listEl.querySelectorAll("[data-cart-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-cart-remove");
        var c = GL.getCart();
        delete c[id];
        GL.setCart(c);
        render();
      });
    });
  }

  function escapeAttr(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    window.addEventListener("gadgetlab:cartchange", render);

    var co = document.getElementById("cart-checkout-btn");
    if (co) {
      co.addEventListener("click", function () {
        if (!window.GadgetLab.getCartItemCount()) return;
        window.location.href = window.GadgetLab.page("checkout.html");
      });
    }
  });
})();
