import { Router } from "express";
import { User } from "../models/user.model.js";
import { createHash } from "../utils/bcrypt.js";

const router = Router();

// Crear usuario
router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "El email ya existe" });
    }

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: createHash(password),
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// Obtener todos los usuarios
router.get("/", async (req, res) => {
  const users = await User.find().populate("cart");
  res.json(users);
});

// Obtener usuario por ID
router.get("/:uid", async (req, res) => {
  const user = await User.findById(req.params.uid).populate("cart");
  res.json(user);
});

// Actualizar usuario
router.put("/:uid", async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.uid, req.body, {
    new: true,
  });
  res.json(updated);
});

// Eliminar usuario
router.delete("/:uid", async (req, res) => {
  await User.findByIdAndDelete(req.params.uid);
  res.json({ message: "Usuario eliminado" });
});

export default router;