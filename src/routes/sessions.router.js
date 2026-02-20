import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { User } from "../models/user.model.js";
import CartModel from "../models/cart.model.js";
import { createHash, isValidPassword } from "../utils/bcrypt.js";
import UserDTO from "../dto/user.dto.js";
import { transporter } from "../utils/mailer.js";

const router = Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    // Validar datos mínimos
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        error: "Faltan datos obligatorios",
      });
    }

    // Verificar email único
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        error: "El usuario ya existe",
      });
    }

    // Crear carrito automático
    const newCart = await CartModel.create({ products: [] });

    // Crear usuario con password hasheado
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: createHash(password),
      cart: newCart._id,
      role: "user",
    });

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        id: newUser._id,
        email: newUser.email,
        cart: newCart._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        error: info?.message || "Credenciales incorrectas",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res
      .cookie("jwt", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      })
      .json({
        message: "Login exitoso",
      });
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/login");
});

// Current
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const userDto = new UserDTO(req.user);
    res.json(userDto);
  },
);

// Forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "Si el email existe, se enviará link" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExp = Date.now() + 3600000;
  await user.save();

  const link = `${process.env.BASE_URL}/api/sessions/reset-password/${token}`;

  await transporter.sendMail({
    to: user.email,
    subject: "Recuperar contraseña",
    html: `
      <h2>Recuperar contraseña</h2>
      <a href="${link}">
        <button>Restablecer contraseña</button>
      </a>
    `,
  });

  res.json({ message: "Correo enviado" });
});

// Reset password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExp: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ error: "Token inválido o expirado" });
  }

  if (isValidPassword(user, newPassword)) {
    return res.status(400).json({
      error: "No puedes usar la misma contraseña",
    });
  }

  user.password = createHash(newPassword);
  user.resetToken = undefined;
  user.resetTokenExp = undefined;

  await user.save();

  res.json({ message: "Contraseña actualizada" });
});

// Change password
router.get("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  res.render("resetPassword", { token });
});

export default router;