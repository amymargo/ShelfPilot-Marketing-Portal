document.getElementById("loginButton").addEventListener("click", async function (e) {
    e.preventDefault();
  
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("login-error");
    errorMsg.style.display = "none";
  
    if (!username || !password) {
      errorMsg.textContent = "Please fill in both fields.";
      errorMsg.style.display = "block";
      return;
    }
  
    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      // Try to parse JSON safely
      let data = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("No JSON response");
      }
  
      if (res.ok && data.success) {
        // Redirect to the correct dashboard
        if (data.account_type === "admin") {
          window.location.href = "admin-dashboard.html";
        } else if (data.account_type === "marketer") {
          window.location.href = "/marketer";
        } else {
          window.location.href = "index.html";
        }
      } else {
        errorMsg.textContent = data.message || "Incorrect username or password.";
        errorMsg.style.display = "block";
      }
    } catch (err) {
      console.warn("Offline/demo mode — showing error message instead of crash.", err);
      errorMsg.textContent =
        "Unable to log in. Please check your credentials or try again later.";
      errorMsg.style.display = "block";
    }
  });
  