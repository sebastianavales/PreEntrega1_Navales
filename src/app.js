import mongoose from "mongoose";
import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import cookieParser from "cookie-parser";

import "./config/env.config.js";
import ProductModel from "./models/product.model.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import { initializePassport } from "./config/passport.config.js";
import sessionsRouter from "./routes/sessions.router.js";
import usersRouter from "./routes/users.router.js";

// Conexión a MongoDB
try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Conectado a MongoDB");
} catch (err) {
  console.error("Error al conectar a MongoDB:", err);
}

// Configuración de paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialización de Express
const app = express();
const PORT = process.env.PORT;

// Inicialización de Passport
initializePassport();
app.use(passport.initialize());

// Inicialización de cookie parser
app.use(cookieParser());

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Motor de plantillas
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/users", usersRouter);

// Servidor HTTP + Socket.io
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const io = new Server(httpServer);
app.set("io", io);

// Socket.io: Productos en tiempo real
io.on("connection", async (socket) => {
  console.log("Cliente conectado", socket.id);

  try {
    // Enviar productos iniciales al cliente
    const products = await ProductModel.find().lean();
    socket.emit("updateProducts", products);
  } catch (error) {
    console.error("Error enviando productos iniciales:", error);
  }

  // Agregar producto
  socket.on("newProduct", async (productData) => {
    try {
      await ProductModel.create(productData);
      const products = await ProductModel.find().lean();
      io.emit("updateProducts", products);
    } catch (error) {
      console.error("Error agregando producto:", error);
    }
  });

  // Eliminar producto
  socket.on("deleteProduct", async (id) => {
    try {
      await ProductModel.findByIdAndDelete(id);
      const products = await ProductModel.find().lean();
      io.emit("updateProducts", products);
    } catch (error) {
      console.error("Error eliminando producto:", error);
    }
  });
});