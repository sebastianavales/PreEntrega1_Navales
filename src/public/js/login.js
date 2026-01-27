const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  const user = {
    email: data.get("email"),
    password: data.get("password"),
  };

  const response = await fetch("/api/sessions/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  const result = await response.json();

  if (response.ok) {
    localStorage.setItem("token", result.token);
    window.location.href = "/products";
  } else {
    message.innerText = result.error;
  }
});