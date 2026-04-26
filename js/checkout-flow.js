/**
 * Checkout + confirmation — Final Shop / TechVerse style order flow.
 */
(function () {
  "use strict";

  var ORDERS_KEY = "gadgetlab_orders_v1";
  var LAST_ORDER_KEY = "gadgetlab_last_order_id";

  function getOrders() {
    try {
      var raw = localStorage.getItem(ORDERS_KEY);
      var o = raw ? JSON.parse(raw) : [];
      return Array.isArray(o) ? o : [];
    } catch (e) {
      return [];
    }
  }

  function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function buildEstimatedDelivery() {
    return new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function cartToLines() {
    var GL = window.GadgetLab;
    var c = GL.getCart();
    var lines = [];
    Object.keys(c).forEach(function (id) {
      var q = parseInt(c[id], 10) || 0;
      if (q <= 0) return;
      var p = GL.getProductById(id);
      if (!p) return;
      lines.push({
        id: id,
        name: p.name,
        price: p.price,
        category: p.category,
        quantity: q,
        image: p.image,
      });
    });
    return lines;
  }

  function calculateTotals(lines) {
    var subtotal = lines.reduce(function (s, L) {
      return s + L.price * L.quantity;
    }, 0);
    var shipping = subtotal === 0 ? 0 : subtotal >= 75 ? 0 : 9.99;
    var tax = Math.round(subtotal * 0.065 * 100) / 100;
    var total = Math.round((subtotal + shipping + tax) * 100) / 100;
    return { subtotal: subtotal, shipping: shipping, tax: tax, total: total };
  }

  function renderCheckout() {
    var form = document.getElementById("checkout-form");
    var emptyEl = document.getElementById("checkout-empty");
    var summaryEl = document.getElementById("checkout-summary");
    if (!form || !emptyEl || !summaryEl) return;

    var lines = cartToLines();
    var GL = window.GadgetLab;

    if (!lines.length) {
      form.hidden = true;
      emptyEl.hidden = false;
      summaryEl.innerHTML =
        '<p class="checkout-summary__muted">No items — subtotal ' +
        GL.formatMoney(0) +
        "</p>";
      return;
    }

    form.hidden = false;
    emptyEl.hidden = true;
    var totals = calculateTotals(lines);
    var itemsHtml = lines
      .map(function (L) {
        return (
          '<div class="checkout-line">' +
          "<div><strong>" +
          escapeHtml(L.name) +
          "</strong><span> × " +
          L.quantity +
          "</span></div>" +
          "<div>" +
          GL.formatMoney(L.price * L.quantity) +
          "</div></div>"
        );
      })
      .join("");

    summaryEl.innerHTML =
      '<div class="checkout-line-list">' +
      itemsHtml +
      "</div>" +
      '<div class="checkout-totals">' +
      "<div><span>Subtotal</span><span>" +
      GL.formatMoney(totals.subtotal) +
      "</span></div>" +
      "<div><span>Shipping</span><span>" +
      (totals.shipping === 0 ? "Free" : GL.formatMoney(totals.shipping)) +
      "</span></div>" +
      "<div><span>Est. tax</span><span>" +
      GL.formatMoney(totals.tax) +
      "</span></div>" +
      "<div class=\"checkout-totals__total\"><span>Total</span><span>" +
      GL.formatMoney(totals.total) +
      "</span></div>" +
      "</div>";
  }

  function findOrder(id) {
    var orders = getOrders();
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id === id) return orders[i];
    }
    return null;
  }

  function renderConfirmation() {
    var container = document.getElementById("confirmation-details");
    if (!container) return;

    var params = new URLSearchParams(window.location.search);
    var orderId = params.get("order") || localStorage.getItem(LAST_ORDER_KEY) || "";
    var order = orderId ? findOrder(orderId) : null;
    if (!order && getOrders().length) {
      order = getOrders()[getOrders().length - 1];
    }

    if (!order) {
      container.innerHTML =
        '<div class="confirmation-empty">' +
        "<p>No order found. Browse products and complete checkout to see confirmation here.</p>" +
        '<a href="' +
        window.GadgetLab.page("products.html") +
        '" class="btn btn--primary">Browse products</a>' +
        "</div>";
      return;
    }

    var addr = [
      order.customer.address,
      order.customer.city,
      order.customer.region,
      order.customer.zipCode,
    ]
      .filter(Boolean)
      .join(", ");

    var itemCount = order.items.reduce(function (n, it) {
      return n + it.quantity;
    }, 0);

    container.innerHTML =
      '<div class="confirmation-grid">' +
      '<div class="confirmation-row"><span>Order ID</span><strong>' +
      escapeHtml(order.id) +
      "</strong></div>" +
      '<div class="confirmation-row"><span>Items</span><strong>' +
      itemCount +
      "</strong></div>" +
      '<div class="confirmation-row"><span>Total</span><strong>' +
      window.GadgetLab.formatMoney(order.total) +
      "</strong></div>" +
      '<div class="confirmation-row"><span>Status</span><strong>' +
      escapeHtml(order.status) +
      "</strong></div>" +
      '<div class="confirmation-row"><span>Est. delivery</span><strong>' +
      escapeHtml(order.estimatedDelivery) +
      "</strong></div>" +
      '<div class="confirmation-row"><span>Ship to</span><strong>' +
      escapeHtml(addr) +
      "</strong></div>" +
      '<div class="confirmation-row"><span>Payment</span><strong>Card ···· ' +
      escapeHtml(order.payment.last4) +
      "</strong></div>" +
      "</div>" +
      '<div class="confirmation-actions">' +
      '<a href="' +
      window.GadgetLab.page("index.html") +
      '" class="btn btn--ghost">Back to home</a>' +
      '<a href="' +
      window.GadgetLab.page("products.html") +
      '" class="btn btn--primary">Continue shopping</a>' +
      "</div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      renderCheckout();
      checkoutForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var lines = cartToLines();
        if (!lines.length) {
          window.location.href = window.GadgetLab.page("products.html");
          return;
        }
        if (!checkoutForm.checkValidity()) {
          checkoutForm.reportValidity();
          return;
        }

        var fd = new FormData(checkoutForm);
        var totals = calculateTotals(lines);
        var cardRaw = String(fd.get("cardNumber") || "").replace(/\s+/g, "");

        var order = {
          id: "GL-" + Date.now(),
          items: lines.map(function (L) {
            return {
              id: L.id,
              name: L.name,
              price: L.price,
              quantity: L.quantity,
              category: L.category,
            };
          }),
          customer: {
            fullName: String(fd.get("fullName") || "").trim(),
            email: String(fd.get("email") || "").trim(),
            address: String(fd.get("address") || "").trim(),
            city: String(fd.get("city") || "").trim(),
            region: String(fd.get("region") || "").trim(),
            zipCode: String(fd.get("zipCode") || "").trim(),
          },
          payment: {
            last4: cardRaw.slice(-4) || "0000",
          },
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          tax: totals.tax,
          total: totals.total,
          status: "Processing",
          estimatedDelivery: buildEstimatedDelivery(),
          createdAt: new Date().toISOString(),
        };

        var orders = getOrders();
        orders.push(order);
        saveOrders(orders);
        localStorage.setItem(LAST_ORDER_KEY, order.id);
        window.GadgetLab.setCart({});
        window.location.href =
          window.GadgetLab.page("confirmation.html") + "?order=" + encodeURIComponent(order.id);
      });
    }

    if (document.getElementById("confirmation-details")) {
      renderConfirmation();
    }
  });
})();
