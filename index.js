// login completo con seguridad mejorada
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcrypt");
const session = require("express-session");
const validator = require("validator");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const User = require("./mongodb");

const app = express();
const templatePath = path.join(__dirname, "../templates");


// Configuraciones generales
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CORS para frontend Vite
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Sesiones
app.use(session({
  secret: "clave_secreta_segura",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // cambia a true con HTTPS
    httpOnly: true,
    sameSite: "lax"
  }
}));

// Limitador de intentos en login (anti fuerza bruta)
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5,
  message: "Demasiados intentos. Intenta de nuevo en 5 minutos"
});

// Verificación de sesión para frontend
app.get("/api/check-auth", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, name: req.session.user.name });
  } else {
    res.json({ loggedIn: false });
  }
});

// GET login
app.get("/", (req, res) => {
  if (req.session.user) return res.redirect("/home");
  res.render("login");
});

// GET signup
app.get("/signup", (req, res) => {
  res.render("signup");
});

// POST signup
app.post("/signup", async (req, res) => {
  const rawName = req.body.name?.trim();
  const rawPassword = req.body.password?.trim();

  if (!rawName || !rawPassword) return res.send("Todos los campos son obligatorios");

  const name = validator.escape(rawName);
  const password = rawPassword;

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const passwordRegex = /^.{6,}$/;

  if (!usernameRegex.test(name)) {
    return res.send("Nombre inválido. Solo letras, números y guiones bajos (3-20 caracteres)");
  }
  if (!passwordRegex.test(password)) {
    return res.send("Contraseña muy corta. Mínimo 6 caracteres");
  }

  const existingUser = await User.findOne({ name });
  if (existingUser) {
    return res.send("Nombre de usuario ya registrado");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name, password: hashedPassword });

  res.redirect("/");
});

// POST login con protección
app.post("/login", loginLimiter, async (req, res) => {
  const rawName = req.body.name?.trim();
  const rawPassword = req.body.password?.trim();

  if (!rawName || !rawPassword) return res.send("Todos los campos son obligatorios");

  const name = validator.escape(rawName);
  const user = await User.findOne({ name });

  if (!user) return res.send("Usuario no encontrado");

  const isMatch = await bcrypt.compare(rawPassword, user.password);
  if (!isMatch) return res.send("Contraseña incorrecta");

  req.session.user = { id: user._id, name: user.name };
  res.redirect("/home");
});

// Ruta protegida home
app.get("/home", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.render("home", { name: req.session.user.name });
});

// Ruta protegida comunidad
app.get("/comunidad", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.render("comunidad", { name: req.session.user.name });
});

// Logout seguro
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("http://localhost:5173/");
  });
});

// Inicio del servidor
app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
