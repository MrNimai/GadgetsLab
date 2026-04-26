(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("signup-form");
    var err = document.getElementById("signup-error");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (err) err.textContent = "";
      var fd = new FormData(form);
      var r = window.GadgetLabAuth.signup(
        fd.get("name"),
        fd.get("email"),
        fd.get("password")
      );
      if (r.ok) {
        window.location.href = window.GadgetLab.page("products.html");
        return;
      }
      if (err) err.textContent = r.error || "Could not sign up.";
    });
  });
})();
