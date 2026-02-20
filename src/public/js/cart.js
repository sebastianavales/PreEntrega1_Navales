document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("purchaseBtn");

  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/carts/current/purchase", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        alert("Compra realizada. Ticket: " + data.ticket.code);
        window.location.reload();
      } else {
        alert(data.error || "Error en la compra");
      }
    } catch (err) {
      alert("Error en la compra");
    }
  });
});