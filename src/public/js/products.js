document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".add-to-cart");

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.product;

      try {
        const res = await fetch(`/api/carts/current/product/${productId}`, {
          method: "POST",
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          alert("Producto agregado al carrito");
        } else {
          alert(data.error || "Error agregando producto");
        }
      } catch (err) {
        console.error(err);
        alert("Error agregando producto");
      }
    });
  });
});