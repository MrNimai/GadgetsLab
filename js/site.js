/**
 * Shared layout: paths, cart (localStorage), mobile nav, cart badge, toast.
 * Pattern aligned with TechVerse (multi-page + persistent cart).
 */
(function () {
  "use strict";

  var CART_KEY = "gadgetlab_cart_v1";

  function isInPagesFolder() {
    return /\/pages\//.test(window.location.pathname.replace(/\\/g, "/"));
  }

  window.GadgetLab = {
    isInPagesFolder: isInPagesFolder,

    /** Root-relative path to images, css, js from current page */
    asset: function asset(rel) {
      var prefix = isInPagesFolder() ? "../" : "./";
      return prefix + rel.replace(/^\.\//, "");
    },

    /** Home page (root `index.html`, not under `pages/`) */
    homeUrl: function homeUrl() {
      return isInPagesFolder() ? "../index.html" : "index.html";
    },

    /** Link to another site page (e.g. products.html, cart.html) */
    page: function page(file) {
      if (file === "index.html") return this.homeUrl();
      if (isInPagesFolder()) return file;
      return "pages/" + file;
    },

    productDetailUrl: function productDetailUrl(id) {
      var q = "id=" + encodeURIComponent(id);
      if (isInPagesFolder()) return "product-detail.html?" + q;
      return "pages/product-detail.html?" + q;
    },

    productsUrlWithQuery: function productsUrlWithQuery(params) {
      var base = this.page("products.html");
      var p = new URLSearchParams(params || {});
      var s = p.toString();
      return s ? base + "?" + s : base;
    },

    getCart: function getCart() {
      try {
        var raw = localStorage.getItem(CART_KEY);
        var obj = raw ? JSON.parse(raw) : {};
        return obj && typeof obj === "object" ? obj : {};
      } catch (e) {
        return {};
      }
    },

    setCart: function setCart(obj) {
      localStorage.setItem(CART_KEY, JSON.stringify(obj));
      this.updateCartBadges();
      window.dispatchEvent(new CustomEvent("gadgetlab:cartchange"));
    },

    getCartItemCount: function getCartItemCount() {
      var c = this.getCart();
      return Object.keys(c).reduce(function (sum, id) {
        return sum + (parseInt(c[id], 10) || 0);
      }, 0);
    },

    addToCart: function addToCart(productId, qty) {
      var n = parseInt(qty, 10) || 0;
      if (n <= 0) return;
      var c = this.getCart();
      c[productId] = (c[productId] || 0) + n;
      this.setCart(c);
    },

    updateCartBadges: function updateCartBadges() {
      var count = this.getCartItemCount();
      document.querySelectorAll("[data-cart-badge]").forEach(function (el) {
        el.textContent = String(count);
        el.hidden = count === 0;
      });
    },

    formatMoney: function formatMoney(n) {
      return Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
    },

    showToast: function showToast(msg) {
      var toastEl = document.getElementById("toast");
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.hidden = false;
      toastEl.classList.add("is-visible");
      clearTimeout(showToast._t);
      showToast._t = setTimeout(function () {
        toastEl.classList.remove("is-visible");
        setTimeout(function () {
          toastEl.hidden = true;
        }, 250);
      }, 2600);
    },

    getProductById: function getProductById(id) {
      var list = window.GADGET_PRODUCTS || [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) return list[i];
      }
      return null;
    },

    initMobileNav: function initMobileNav() {
      var menuBtn = document.querySelector(".header__menu-btn");
      var mobileNav = document.getElementById("mobile-nav");
      var mobileOverlay = document.getElementById("mobile-overlay");
      if (!menuBtn || !mobileNav || !mobileOverlay) return;

      function setOpen(open) {
        mobileNav.hidden = !open;
        mobileOverlay.hidden = !open;
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("nav-open", open);
      }

      menuBtn.addEventListener("click", function () {
        setOpen(mobileNav.hidden);
      });
      mobileOverlay.addEventListener("click", function () {
        setOpen(false);
      });
      mobileNav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          setOpen(false);
        });
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !mobileNav.hidden) setOpen(false);
      });
    },

    init: function init() {
      this.updateCartBadges();
      this.initMobileNav();
      var y = document.getElementById("year");
      if (y) y.textContent = String(new Date().getFullYear());
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    GadgetLab.init();
  });
})();