// Conexión al servidor de Socket.io
const socket = io();

// Mensaje en consola al conectar correctamente
socket.on("connect", () => {
  console.log("Conectado al servidor socket", socket.id);
});

// Escucha del evento para actualizar la lista de productos
socket.on("updateProducts", (products) => {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  // Recorre los productos y los muestra en la lista
  products.forEach((p) => {
    const li = document.createElement("li");
    li.id = `product-${p._id}`;
    li.innerHTML = `<strong>${p.title}</strong> - $${p.price}`;
    productList.appendChild(li);
  });
});