import './proyect.css'
// frontend/main.js
// empresa/frontend/main.js
document.querySelector("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = e.target.name.value;
  const password = e.target.password.value;

  const res = await fetch("http://localhost:3000/login", {
    method: "POST",
    credentials: "include", // para enviar/recibir cookies
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password }),
  });

  if (res.redirected) {
    window.location.href = res.url; // si backend redirige, navega
  } else {
    const text = await res.text();
    alert(text);
  }
});

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');

    toggle.addEventListener('click', () => {
      menu.classList.toggle('nav-menu_visible');
    });
  });

