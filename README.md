# Entrega Final

## Descripción
Este proyecto corresponde a la **entrega final del curso de Programación Backend II**.

Se desarrolló un servidor con:

- Node.js
- Express
- MongoDB (Atlas)
- Mongoose
- Handlebars
- Passport
- JWT
- bcrypt
- Socket.io
- Nodemailer
- Dotenv

La aplicación permite gestionar productos y carritos con persistencia en MongoDB, además de implementar un sistema de autenticación con registro, login y validación mediante JWT.

## 🚀 Funcionalidades

### Variables de Entorno (.env)
El proyecto utiliza variables de entorno para:
  - Conexión a MongoDB
  - JWT secret
  - Credenciales de correo
  - Configuración general

### Recuperación de contraseña
- **POST /api/sessions/forgot-password** → Genera token de recuperación, envía correo con enlace de restablecimiento, token expira en 1 hora.
- **POST /api/sessions/reset-password** → Valida token, impide reutilizar contraseña anterior, actualiza contraseña encriptada.

### Control de Roles
Se implementó middleware de autorización integrado con JWT:
- **admin**
  - Puede crear, actualizar y eliminar productos
  - Puede realizar compras
- **user**
  - Puede agregar productos a su carrito
  - Puede realizar compras

### Patrón Repository
Se implementó el patrón Repository para desacoplar la capa de datos:
DAO → Repository → Router

### Sistema de Compras y Tickets
- **Se implementó lógica de compra avanzada:**
  - Verificación de stock por producto
  - Compra parcial si no hay stock suficiente
  - Descuento automático de inventario
  - Generación de Ticket por compra
  - Persistencia de tickets en MongoDB
- **Modelo Ticket incluye:**
  - código único
  - fecha de compra
  - monto total
  - comprador

### Autenticación y autorización (`/api/sessions`)
- **POST /api/sessions/register** → Registra un nuevo usuario, encripta la contraseña con bcrypt y guarda el usuario en MongoDB.
- **POST /api/sessions/login** → Valida credenciales, genera un JWT y devuelve el token para autenticación.
- **GET /api/sessions/current** → Requiere token en header y devuelve los datos del usuario autenticado.
- **GET /api/sessions/logout** → Elimina cookie JWT y cierra sesión.

### Rutas para manejo de productos (`/api/products`)
- **GET /** → Devuelve todos los productos.
- **GET /:pid** → Devuelve un producto específico según su ID.
- **POST /** → Agrega un nuevo producto (el `id` se genera automáticamente).
               Se emite una actualización en tiempo real a todos los clientes conectados.
- **PUT /:pid** → Actualiza los campos de un producto (sin modificar su `id`).
                  También actualiza la vista en tiempo real.
- **DELETE /:pid** → Elimina un producto según su ID.
                     Emite la actualización en tiempo real a todos los clientes.

### Rutas para manejo de carritos (`/api/carts`)
- **POST /** → Agrega un nuevo carrito vacío.
- **GET /:cid** → Devuelve un carrito especifico por su ID.
- **POST /:cid/product/:pid:** → Agregar un producto especifico por su ID a un carrito especifico.
- **PUT /:cid** → Actualiza todos los productos del carrito con un arreglo de productos.
- **PUT /:cid/products/:pid** → Actualiza la cantidad de un producto específico en el carrito.
- **DELETE /:cid** → Elimina todos los productos del carrito.

### Vistas con Handlebars
- **/ o /login** → Vista de login.
- **/products** → Muestra la lista de todos los productos almacenados hasta el momento.
- **/cart/:cid** → Muestra el contenido de un carrito específico, con cantidad de cada producto y total.
- **/realtimeproducts** → Renderiza la misma lista, pero conectada a Socket.io. Cada vez que se agrega, actualiza o elimina un producto desde la API, la vista se actualiza automáticamente sin recargar la página.
- **/forgotPassword** → Vista para diligenciar la recuperacion de contraseña.
- **/resetPassword** → Vista para el cambio de contraseña.

## 📦 Estructura del proyecto
```
EntregaFinal
├─ .env
├─ package-lock.json
├─ package.json
├─ README.md
└─ src
   ├─ app.js
   ├─ config
   │  ├─ env.config.js
   │  └─ passport.config.js
   ├─ dao
   │  └─ product.dao.js
   ├─ dto
   │  └─ user.dto.js
   ├─ middlewares
   │  └─ authorization.js
   ├─ models
   │  ├─ cart.model.js
   │  ├─ product.model.js
   │  ├─ ticket.model.js
   │  └─ user.model.js
   ├─ public
   │  └─ js
   │     ├─ cart.js
   │     ├─ login.js
   │     ├─ products.js
   │     └─ realTime.js
   ├─ repositories
   │  └─ product.repository.js
   ├─ routes
   │  ├─ carts.router.js
   │  ├─ products.router.js
   │  ├─ sessions.router.js
   │  ├─ users.router.js
   │  └─ views.router.js
   ├─ utils
   │  ├─ bcrypt.js
   │  ├─ mailer.js
   │  └─ ticketCode.js
   └─ views
      ├─ cart.handlebars
      ├─ forgotPassword.handlebars
      ├─ layouts
      │  └─ main.handlebars
      ├─ login.handlebars
      ├─ products.handlebars
      ├─ realTimeProducts.handlebars
      └─ resetPassword.handlebars

```

## 👨‍💻 Autor
- Desarrollado por Sebastian Navales Parra
- 📧 Contacto: sebastian.navalesp@gmail.com
- 🌐 Portafolio: [Repositorio GitHub](https://github.com/sebastianavales)