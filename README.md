# Pre Entrega 1

## Descripción
Este proyecto corresponde a la **pre entrega 1 del curso de Programación Backend II**.

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

La aplicación permite gestionar productos y carritos con persistencia en MongoDB, además de implementar un sistema de autenticación con registro, login y validación mediante JWT.

## 🚀 Funcionalidades

### Autenticación y autorización (`/api/sessions`)
- **POST /api/sessions/register** → Registra un nuevo usuario, encripta la contraseña con bcrypt y guarda el usuario en MongoDB.
- **POST /api/sessions/login** → Valida credenciales, genera un JWT y devuelve el token para autenticación.
- **GET /api/sessions/current** → Requiere token en header y devuelve los datos del usuario autenticado.


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

## 📦 Estructura del proyecto
```
PreEntrega1
┣ src
┃ ┣ config
┃ ┃ ┗ passport.config.js
┃ ┣ models
┃ ┃ ┣ cart.model.js
┃ ┃ ┣ product.model.js
┃ ┃ ┗ user.model.js
┃ ┣ public
┃ ┃ ┗ js
┃ ┃ ┃ ┣ login.js
┃ ┃ ┃ ┗ realTime.js
┃ ┣ routes
┃ ┃ ┣ carts.router.js
┃ ┃ ┣ products.router.js
┃ ┃ ┣ sessions.router.js
┃ ┃ ┣ users.router.js
┃ ┃ ┗ views.router.js
┃ ┣ utils
┃ ┃ ┗ bcrypt.js
┃ ┣ views
┃ ┃ ┣ layouts
┃ ┃ ┃ ┗ main.handlebars
┃ ┃ ┣ cart.handlebars
┃ ┃ ┣ login.handlebars
┃ ┃ ┣ products.handlebars
┃ ┃ ┗ realTimeProducts.handlebars
┃ ┗ app.js
┣ .gitignore
┣ package-lock.json
┣ package.json
┗ README.md
```

## 👨‍💻 Autor
- Desarrollado por Sebastian Navales Parra
- 📧 Contacto: sebastian.navalesp@gmail.com
- 🌐 Portafolio: [Repositorio GitHub](https://github.com/sebastianavales)