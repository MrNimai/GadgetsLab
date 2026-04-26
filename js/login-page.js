(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("login-form");
    var err = document.getElementById("login-error");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (err) err.textContent = "";
      var fd = new FormData(form);
      var r = window.GadgetLabAuth.login(fd.get("email"), fd.get("password"));
      if (r.ok) {
        window.location.href = window.GadgetLab.homeUrl();
        return;
      }
      if (err) err.textContent = r.error || "Login failed.";
    });
  });
})();
