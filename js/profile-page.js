(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("profile-form");
    var ok = document.getElementById("profile-success");
    var err = document.getElementById("profile-error");
    var logoutButton = document.getElementById("logout-button");
    
    // Profile display elements
    var avatarInitials = document.getElementById("avatar-initials");
    var profileDisplayName = document.getElementById("profile-display-name");
    var profileDisplayEmail = document.getElementById("profile-display-email");
    
    // Tab navigation
    var navItems = document.querySelectorAll(".profile-nav-item");
    var tabs = document.querySelectorAll(".profile-tab");

    if (!form) return;

    var s = window.GadgetLabAuth.getSession();
    if (!s) {
      window.location.href = window.GadgetLab.page("login.html");
      return;
    }

    // Populate profile display
    var displayName = s.name || s.email || "User";
    var email = s.email || "";
    
    profileDisplayName.textContent = displayName;
    profileDisplayEmail.textContent = email;
    
    // Generate avatar initials
    var initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    avatarInitials.textContent = initials || "GL";

    // Populate form with user data
    document.getElementById("profile-name").value = s.name || "";
    document.getElementById("profile-email").value = s.email || "";
    document.getElementById("profile-phone").value = s.phone || "";
    document.getElementById("profile-address").value = s.address || "";

    // Tab navigation
    navItems.forEach(function(navItem) {
      navItem.addEventListener("click", function() {
        var tabId = this.getAttribute("data-tab");
        
        // Update active nav item
        navItems.forEach(item => item.classList.remove("is-active"));
        this.classList.add("is-active");
        
        // Update active tab
        tabs.forEach(tab => {
          if (tab.id === "tab-" + tabId) {
            tab.classList.add("is-active");
          } else {
            tab.classList.remove("is-active");
          }
        });
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (ok) ok.textContent = "";
      if (err) err.textContent = "";
      
      var fd = new FormData(form);
      var r = window.GadgetLabAuth.updateProfile({
        name: fd.get("name"),
        phone: fd.get("phone"),
        address: fd.get("address"),
      });
      
      if (r.ok) {
        if (ok) {
          ok.textContent = "Changes saved successfully!";
          ok.hidden = false;
          err.hidden = true;
        }
        
        // Update display name if changed
        var newName = fd.get("name");
        if (newName) {
          profileDisplayName.textContent = newName;
          var newInitials = newName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          avatarInitials.textContent = newInitials || "GL";
        }
        
        window.GadgetLabAuth.renderAuthArea();
        
        // Auto-hide success message after 3 seconds
        setTimeout(function() {
          ok.hidden = true;
        }, 3000);
      } else if (err) {
        err.textContent = r.error || "Could not save changes.";
        err.hidden = false;
        ok.hidden = true;
      }
    });

    if (logoutButton) {
      logoutButton.addEventListener("click", function () {
        if (confirm("Are you sure you want to log out?")) {
          window.GadgetLabAuth.logout();
        }
      });
    }

    // Initialize year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
  });
})();
