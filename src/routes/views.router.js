import { Router } from "express";
import ProductModel from "../models/product.model.js";
import CartModel from "../models/cart.model.js";

const router = Router();

// Vista principal (products)
router.get(["/products"], async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);

    const filter = {};
    if (query) {
      if (query === "true" || query === "false")
        filter.status = query === "true";
      else filter.category = query;
    }

    const sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    else if (sort === "desc") sortOption.price = -1;

    const totalProducts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;

    const products = await ProductModel.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    let cart = await CartModel.findOne();
    if (!cart) {
      cart = await CartModel.create({ products: [] });
    }

    res.render("products", {
      products,
      page,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
      cartId: cart._id.toString(),
    });
  } catch (error) {
    res.status(500).send("Error al cargar productos");
  }
});

// Vista de productos en tiempo real
router.get("/realtimeproducts", async (req, res) => {
  try {
    // Obtener todos los productos desde MongoDB
    const products = await ProductModel.find().lean();

    res.render("realTimeProducts", {
      title: "Productos en tiempo real",
      products,
    });
  } catch (error) {
    console.log("Error cargando productos:", error);
    res.status(500).send("Error cargando productos");
  }
});

// Vista carrito
router.get("/cart/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartModel.findById(cid)
      .populate("products.product")
      .lean();

    if (!cart) return res.status(404).send("Carrito no encontrado");

    // Calcular subtotal de cada producto y total del carrito
    const productsWithSubtotal = cart.products.map((p) => ({
      ...p,
      subtotal: p.product.price * p.quantity,
    }));

    const total = productsWithSubtotal.reduce((sum, p) => sum + p.subtotal, 0);

    res.render("cart", {
      cart: { ...cart, products: productsWithSubtotal },
      total,
    });
  } catch (error) {
    res.status(500).send("Error cargando carrito");
  }
});

// Vista de login
router.get('/', (req, res) => {
    res.redirect('/login');
});
router.get('/login', (req, res) => {
    res.render('login');
});

export default router;