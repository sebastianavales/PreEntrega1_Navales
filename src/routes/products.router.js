import { Router } from "express";
import ProductModel from "../models/product.model.js";

const router = Router();

// GET /api/products
router.get("/", async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);

    // Construir filtro
    const filter = {};
    if (query) {
      // si es true/false, filtrar por status
      if (query === "true" || query === "false") {
        filter.status = query === "true";
      } else {
        // filtrar por categoría
        filter.category = query;
      }
    }

    // Construir opción de ordenamiento
    const sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    else if (sort === "desc") sortOption.price = -1;

    const totalProducts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;

    const products = await ProductModel.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // Construir links
    const baseUrl = `${req.protocol}://${req.get("host")}${req.path}`;
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    res.json({
      status: "success",
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage: prevPage !== null,
      hasNextPage: nextPage !== null,
      prevLink: prevPage ? `${baseUrl}?page=${prevPage}&limit=${limit}` : null,
      nextLink: nextPage ? `${baseUrl}?page=${nextPage}&limit=${limit}` : null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", error: "Error al obtener productos" });
  }
});

// GET /api/products/:pid
router.get("/:pid", async (req, res) => {
  try {
    const producto = await ProductModel.findById(req.params.pid);
    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json(producto);
  } catch {
    res.status(400).json({ error: "ID inválido" });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const nuevoProducto = await ProductModel.create(req.body);

    // Emitir actualización vía WebSocket
    const io = req.app.get("io");
    if (io) {
      const productosActualizados = await ProductModel.find();
      io.emit("updateProducts", productosActualizados);
    }

    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ error: "Datos inválidos o código duplicado" });
  }
});

// PUT /api/products/:pid
router.put("/:pid", async (req, res) => {
  try {
    const productoActualizado = await ProductModel.findByIdAndUpdate(
      req.params.pid,
      req.body,
      { new: true }
    );

    if (!productoActualizado)
      return res.status(404).json({ error: "Producto no encontrado" });

    const io = req.app.get("io");
    if (io) {
      const productosActualizados = await ProductModel.find();
      io.emit("updateProducts", productosActualizados);
    }

    res.json(productoActualizado);
  } catch {
    res.status(400).json({ error: "ID inválido" });
  }
});

// DELETE /api/products/:pid
router.delete("/:pid", async (req, res) => {
  try {
    const eliminado = await ProductModel.findByIdAndDelete(req.params.pid);

    if (!eliminado)
      return res.status(404).json({ error: "Producto no encontrado" });

    const io = req.app.get("io");
    if (io) {
      const productosActualizados = await ProductModel.find();
      io.emit("updateProducts", productosActualizados);
    }

    res.json({ message: "Producto eliminado correctamente" });
  } catch {
    res.status(400).json({ error: "ID inválido" });
  }
});

export default router;