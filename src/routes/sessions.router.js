import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";
import CartModel from "../models/cart.model.js";
import { createHash } from "../utils/bcrypt.js";

const router = Router();

const SECRET = "secretJWT";

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

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, {
      expiresIn: "1h",
    });

    res
      .cookie("jwt", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // 1 hora
      })
      .json({
        message: "Login exitoso",
      });
  })(req, res, next);
});

// Current
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json({
      user: {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        role: req.user.role,
        cart: req.user.cart,
      },
    });
  },
);

export default router;