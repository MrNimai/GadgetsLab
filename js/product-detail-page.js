(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var root = document.getElementById("detail-root");
    if (!root || !id || !window.GadgetLab) return;

    var p = window.GadgetLab.getProductById(id);
    if (!p) {
      root.innerHTML =
        '<p class="page-lede">Product not found. <a href="' +
        window.GadgetLab.page("products.html") +
        '">Back to shop</a></p>';
      return;
    }

    var L = window.GADGET_CATEGORY_LABEL || {};
    var compareHtml = p.compareAt
      ? '<p class="detail__compare">Was <s>' +
        window.GadgetLab.formatMoney(p.compareAt) +
        "</s></p>"
      : "";

    // Build gallery HTML
    var images = p.images || [p.image];
    var galleryHtml = '<div class="detail__gallery">';
    
    // Main image
    galleryHtml += '<div class="detail__main-image">';
    galleryHtml += '<img class="detail__img" src="' +
      escapeAttr(images[0]) +
      '" alt="' +
      escapeHtml(p.name) +
      '" data-gallery-index="0">';
    galleryHtml += '<button type="button" class="detail__lightbox-trigger" aria-label="View full size image">View full size</button>';
    galleryHtml += '</div>';
    
    // Thumbnails
    if (images.length > 1) {
      galleryHtml += '<div class="detail__thumbnails" role="tablist" aria-label="Product image thumbnails">';
      images.forEach(function (img, index) {
        galleryHtml += '<button type="button" class="detail__thumb-btn' + (index === 0 ? ' is-active' : '') + '" data-gallery-index="' + index + '" role="tab" aria-selected="' + (index === 0 ? 'true' : 'false') + '" aria-controls="detail-main-image">';
        galleryHtml += '<img src="' + escapeAttr(img) + '" alt="" class="detail__thumb">';
        galleryHtml += '</button>';
      });
      galleryHtml += '</div>';
    }
    
    galleryHtml += '</div>';

    root.innerHTML =
      '<div class="detail-grid">' +
      galleryHtml +
      '<div class="detail__info">' +
      '<p class="product-card__cat">' +
      escapeHtml(L[p.category] || p.category) +
      "</p>" +
      "<h1 class=\"detail__title\">" +
      escapeHtml(p.name) +
      "</h1>" +
      '<p class="detail__rating"><span class="product-card__stars" aria-hidden="true">' +
      stars(p.rating) +
      "</span> " +
      escapeHtml(String(p.rating)) +
      " · " +
      Number(p.reviews || 0).toLocaleString() +
      " reviews</p>" +
      '<div class="detail__price-row">' +
      '<span class="detail__price">' +
      window.GadgetLab.formatMoney(p.price) +
      "</span>" +
      compareHtml +
      "</div>" +
      '<p class="detail__desc">' +
      escapeHtml(p.description) +
      "</p>" +
      '<ul class="detail__specs">' +
      (p.specs || [])
        .map(function (s) {
          return "<li>" + escapeHtml(s) + "</li>";
        })
        .join("") +
      "</ul>" +
      '<div class="detail__buy">' +
      '<div class="qty detail__qty" role="group" aria-label="Quantity">' +
      '<button type="button" class="qty__btn" id="detail-minus" aria-label="Decrease">−</button>' +
      '<span class="qty__value" id="detail-qty">1</span>' +
      '<button type="button" class="qty__btn" id="detail-plus" aria-label="Increase">+</button>' +
      "</div>" +
      '<button type="button" class="btn btn--primary btn--lg" id="detail-add">Add to cart</button>' +
      "</div>" +
      '<p class="detail__back"><a href="' +
      window.GadgetLab.page("products.html") +
      '">← All products</a></p>' +
      "</div>" +
      "</div>";

    // Gallery functionality
    var mainImage = document.querySelector(".detail__img");
    var thumbButtons = document.querySelectorAll(".detail__thumb-btn");
    var lightboxTrigger = document.querySelector(".detail__lightbox-trigger");

    // Handle thumbnail clicks
    thumbButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var index = parseInt(btn.getAttribute("data-gallery-index"), 10);
        updateGallery(index);
      });
    });

    // Handle lightbox trigger
    if (lightboxTrigger) {
      lightboxTrigger.addEventListener("click", function () {
        openLightbox(parseInt(mainImage.getAttribute("data-gallery-index"), 10));
      });
    }

    // Handle main image click for lightbox
    if (mainImage) {
      mainImage.addEventListener("click", function () {
        openLightbox(parseInt(mainImage.getAttribute("data-gallery-index"), 10));
      });
    }

    function updateGallery(index) {
      if (!mainImage) return;
      
      var images = p.images || [p.image];
      if (index < 0 || index >= images.length) return;

      // Update main image
      mainImage.src = images[index];
      mainImage.setAttribute("data-gallery-index", index);

      // Update thumbnails
      thumbButtons.forEach(function (btn, i) {
        var isSelected = i === index;
        btn.setAttribute("aria-selected", isSelected ? "true" : "false");
        if (isSelected) {
          btn.classList.add("is-active");
        } else {
          btn.classList.remove("is-active");
        }
      });
    }

    function openLightbox(index) {
      var images = p.images || [p.image];
      if (index < 0 || index >= images.length) return;

      var lightbox = document.createElement("div");
      lightbox.className = "lightbox";
      lightbox.setAttribute("role", "dialog");
      lightbox.setAttribute("aria-modal", "true");
      lightbox.setAttribute("aria-label", "Product image gallery");
      
      lightbox.innerHTML = 
        '<div class="lightbox__overlay" data-lightbox-close></div>' +
        '<button type="button" class="lightbox__close" aria-label="Close gallery" data-lightbox-close>' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>' +
        '</button>' +
        '<div class="lightbox__content">' +
        '<button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Previous image" data-lightbox-prev>' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>' +
        '</button>' +
        '<img src="' + escapeAttr(images[index]) + '" alt="' + escapeHtml(p.name) + '" class="lightbox__img">' +
        '<button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Next image" data-lightbox-next>' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>' +
        '</button>' +
        '</div>' +
        '<div class="lightbox__counter">' + (index + 1) + ' / ' + images.length + '</div>';

      document.body.appendChild(lightbox);
      document.body.style.overflow = "hidden";

      // Close handlers
      lightbox.querySelectorAll("[data-lightbox-close]").forEach(function (el) {
        el.addEventListener("click", closeLightbox);
      });

      // Navigation handlers
      var prevBtn = lightbox.querySelector("[data-lightbox-prev]");
      var nextBtn = lightbox.querySelector("[data-lightbox-next]");
      
      if (prevBtn) {
        prevBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          var newIndex = index > 0 ? index - 1 : images.length - 1;
          updateLightboxImage(lightbox, newIndex, images, p.name);
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          var newIndex = index < images.length - 1 ? index + 1 : 0;
          updateLightboxImage(lightbox, newIndex, images, p.name);
        });
      }

      // Keyboard navigation
      document.addEventListener("keydown", handleLightboxKeydown);

      function closeLightbox() {
        document.body.removeChild(lightbox);
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleLightboxKeydown);
      }

      function handleLightboxKeydown(e) {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") {
          var newIndex = index > 0 ? index - 1 : images.length - 1;
          updateLightboxImage(lightbox, newIndex, images, p.name);
        }
        if (e.key === "ArrowRight") {
          var newIndex = index < images.length - 1 ? index + 1 : 0;
          updateLightboxImage(lightbox, newIndex, images, p.name);
        }
      }
    }

    function updateLightboxImage(lightbox, index, images, productName) {
      var img = lightbox.querySelector(".lightbox__img");
      var counter = lightbox.querySelector(".lightbox__counter");
      
      if (img) {
        img.src = images[index];
        img.alt = productName;
      }
      if (counter) {
        counter.textContent = (index + 1) + ' / ' + images.length;
      }
    }

    var qty = 1;
    var qtyEl = document.getElementById("detail-qty");
    document.getElementById("detail-minus").addEventListener("click", function () {
      qty = Math.max(1, qty - 1);
      if (qtyEl) qtyEl.textContent = String(qty);
    });
    document.getElementById("detail-plus").addEventListener("click", function () {
      qty += 1;
      if (qtyEl) qtyEl.textContent = String(qty);
    });
    document.getElementById("detail-add").addEventListener("click", function () {
      window.GadgetLab.addToCart(p.id, qty);
      window.GadgetLab.showToast("Added " + qty + " × " + p.name + " to cart");
    });

    document.title = p.name + " — GadgetLab";
  });

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

  function stars(rating) {
    var r = Math.round(Number(rating) || 0);
    r = Math.max(0, Math.min(5, r));
    return "★".repeat(r) + "☆".repeat(5 - r);
  }
})();
