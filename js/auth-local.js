/**
 * Client-only auth (no server) — mirrors TechVerse header auth UX for static hosting.
 * Demo: passwords stored in localStorage; do not use for real secrets.
 */
(function () {
  "use strict";

  var USERS_KEY = "gadgetlab_users_v1";
  var SESSION_KEY = "gadgetlab_session_v1";

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getUsers() {
    var u = readJson(USERS_KEY, []);
    return Array.isArray(u) ? u : [];
  }

  function saveUsers(users) {
    writeJson(USERS_KEY, users);
  }

  window.GadgetLabAuth = {
    getSession: function () {
      // Check for JWT token first (server-side auth)
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Decode JWT to get user info (simplified - in real app use proper JWT library)
          const payload = JSON.parse(atob(token.split('.')[1]));
          return {
            email: payload.user.email,
            name: payload.user.name,
            token: token
          };
        } catch (e) {
          // If JWT is invalid, fall back to localStorage users
          return readJson(SESSION_KEY, null);
        }
      }
      // Fall back to localStorage users
      return readJson(SESSION_KEY, null);
    },

    setSession: function (user) {
      if (!user) {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('authToken');
        return;
      }
      
      // If user has a JWT token, store it
      if (user.token) {
        localStorage.setItem('authToken', user.token);
      }
      
      // Also store in localStorage for compatibility
      writeJson(SESSION_KEY, {
        email: user.email,
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    },

    logout: function () {
      this.setSession(null);
      window.location.href = window.GadgetLab.homeUrl();
    },

    signup: function (name, email, password) {
      var users = getUsers();
      var em = String(email || "").trim().toLowerCase();
      if (!em || !password) return { ok: false, error: "Email and password required." };
      for (var i = 0; i < users.length; i++) {
        if (users[i].email === em) return { ok: false, error: "That email is already registered." };
      }
      users.push({
        email: em,
        password: String(password),
        name: String(name || "").trim(),
      });
      saveUsers(users);
      this.setSession({ email: em, name: String(name || "").trim() });
      return { ok: true };
    },

    login: function (email, password) {
      var em = String(email || "").trim().toLowerCase();
      var users = getUsers();
      for (var i = 0; i < users.length; i++) {
        if (users[i].email === em && users[i].password === String(password)) {
          var u = users[i];
          this.setSession({
            email: u.email,
            name: u.name || "",
            phone: u.phone || "",
            address: u.address || "",
          });
          return { ok: true };
        }
      }
      return { ok: false, error: "Invalid email or password." };
    },

    updateProfile: function (fields) {
      var s = this.getSession();
      if (!s) return { ok: false, error: "Not logged in." };
      var users = getUsers();
      var em = s.email;
      for (var i = 0; i < users.length; i++) {
        if (users[i].email === em) {
          if (fields.name != null) users[i].name = String(fields.name).trim();
          if (fields.phone != null) users[i].phone = String(fields.phone).trim();
          if (fields.address != null) users[i].address = String(fields.address).trim();
          saveUsers(users);
          this.setSession({
            email: em,
            name: users[i].name || "",
            phone: users[i].phone || "",
            address: users[i].address || "",
          });
          return { ok: true };
        }
      }
      this.setSession({
        email: em,
        name: fields.name != null ? String(fields.name).trim() : s.name,
        phone: fields.phone != null ? String(fields.phone).trim() : s.phone,
        address: fields.address != null ? String(fields.address).trim() : s.address,
      });
      return { ok: true };
    },

    renderAuthArea: function () {
      var GL = window.GadgetLab;
      if (!GL) return;
      var session = this.getSession();
      document.querySelectorAll("[data-auth-area]").forEach(function (area) {
        if (!session) {
          area.innerHTML =
            '<a href="' +
            GL.page("login.html") +
            '" class="header__account-link">Log in</a>' +
            '<a href="' +
            GL.page("signup.html") +
            '" class="header__account-link header__account-link--secondary">Sign up</a>';
          return;
        }
        var name = (session.name || session.email || "Account").replace(/</g, "<");
        area.innerHTML =
          '<a href="' +
          GL.page("profile.html") +
          '" class="header__account-link header__account-link--profile" data-auth-profile>' +
          name +
          "</a>";
      });
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.GadgetLabAuth.renderAuthArea();
  });
})();