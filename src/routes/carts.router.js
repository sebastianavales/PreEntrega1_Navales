import { Router } from "express";
import mongoose from "mongoose";
import CartModel from "../models/cart.model.js";
import ProductModel from "../models/product.model.js";
import passport from "passport";

// Instancia del router de Express
const router = Router();

// POST /api/carts - Crear un carrito vacío
router.post("/", async (req, res) => {
  try {
    const newCart = await CartModel.create({ products: [] });
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

// GET /api/carts/:cid - Obtener carrito por ID con productos
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(400).json({ error: "ID de carrito inválido" });
    }

    const cart = await CartModel.findById(cid).populate("products.product");

    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post(
  "/current/product/:pid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { pid } = req.params;
      const cid = req.user.cart;

      if (!mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({ error: "ID de producto inválido" });
      }

      const cart = await CartModel.findById(cid);
      if (!cart)
        return res.status(404).json({ error: "Carrito no encontrado" });

      const productExists = await ProductModel.findById(pid);
      if (!productExists)
        return res.status(404).json({ error: "Producto no encontrado" });

      const index = cart.products.findIndex(
        (p) => p.product.toString() === pid,
      );

      if (index !== -1) {
        cart.products[index].quantity += 1;
      } else {
        cart.products.push({ product: pid, quantity: 1 });
      }

      await cart.save();

      const updatedCart = await CartModel.findById(cid)
        .populate("products.product")
        .lean();

      res.json(updatedCart);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error al agregar producto al carrito",
      });
    }
  },
);

// DELETE /api/carts/:cid/products/:pid - Eliminar producto específico
router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(cid) ||
      !mongoose.Types.ObjectId.isValid(pid)
    ) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = cart.products.filter((p) => p.product.toString() !== pid);
    await cart.save();

    const updatedCart =
      await CartModel.findById(cid).populate("products.product");
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto del carrito" });
  }
});

// PUT /api/carts/:cid - Reemplazar todos los productos del carrito
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body; // Espera un array [{ product: id, quantity: number }]

    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(400).json({ error: "ID de carrito inválido" });
    }

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = products; // Reemplazar productos
    await cart.save();

    const updatedCart =
      await CartModel.findById(cid).populate("products.product");
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar carrito" });
  }
});

// PUT /api/carts/:cid/products/:pid - Actualizar cantidad de un producto específico
router.put("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(cid) ||
      !mongoose.Types.ObjectId.isValid(pid)
    ) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const productInCart = cart.products.find(
      (p) => p.product.toString() === pid,
    );
    if (!productInCart)
      return res
        .status(404)
        .json({ error: "Producto no encontrado en el carrito" });

    productInCart.quantity = quantity; // Actualizar cantidad
    await cart.save();

    const updatedCart =
      await CartModel.findById(cid).populate("products.product");
    res.json(updatedCart);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al actualizar cantidad del producto" });
  }
});

// DELETE /api/carts/:cid - Vaciar el carrito
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(400).json({ error: "ID de carrito inválido" });
    }

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = []; // Vaciar productos
    await cart.save();

    res.json({ message: "Carrito vaciado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al vaciar carrito" });
  }
});

export default router;