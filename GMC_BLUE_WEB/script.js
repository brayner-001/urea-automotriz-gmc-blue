const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle?.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  menuToggle.innerHTML = mainNav.classList.contains('open') ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
});
mainNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mainNav.classList.remove('open')));

const productSelect = document.getElementById('productSelect');
const quantityInput = document.getElementById('quantity');
const estimateValue = document.getElementById('estimateValue');
function updateEstimate() {
  const price = Number(productSelect.value);
  const qty = Math.max(1, Number(quantityInput.value) || 1);
  quantityInput.value = qty;
  estimateValue.textContent = price > 0
    ? 'S/ ' + (price * qty).toLocaleString('es-PE', {minimumFractionDigits:2, maximumFractionDigits:2})
    : 'A cotizar';
}
productSelect?.addEventListener('change', updateEstimate);
quantityInput?.addEventListener('input', updateEstimate);
document.getElementById('minusQty')?.addEventListener('click', () => { quantityInput.value = Math.max(1, Number(quantityInput.value) - 1); updateEstimate(); });
document.getElementById('plusQty')?.addEventListener('click', () => { quantityInput.value = Math.min(9999, Number(quantityInput.value) + 1); updateEstimate(); });

function openWhatsApp(message) {
  const phone = '573159056227'; // Aquí va tu número con código de país (51 para Perú) y sin el símbolo +
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

document.getElementById('sendQuote')?.addEventListener('click', () => {
  const option = productSelect.options[productSelect.selectedIndex];
  const name = option.dataset.name;
  const qty = Math.max(1, Number(quantityInput.value) || 1);
  const price = Number(productSelect.value);
  const total = price > 0 ? 'S/ ' + (price * qty).toFixed(2) : 'A cotizar';
  openWhatsApp(`Hola, GMC BLUE. Deseo solicitar una cotización.\\n\\nPresentación: ${name}\\nCantidad: ${qty}\\nEstimado referencial: ${total}\\n\\nPor favor, confirmen precio, disponibilidad y condiciones de entrega.`);
});
document.querySelectorAll('.add-quote').forEach(button => {
  button.addEventListener('click', () => {
    const product = button.dataset.product;
    const price = Number(button.dataset.price);
    openWhatsApp(`Hola, GMC BLUE. Me interesa la presentación ${product}. ${price > 0 ? 'Vi un precio referencial de S/ ' + price.toFixed(2) + '.' : 'Quisiera conocer el precio.'} ¿Podrían enviarme información y disponibilidad?`);
  });
});
const contactMessage = 'Hola, GMC BLUE. Quisiera recibir información sobre sus presentaciones de urea automotriz y condiciones de cotización.';
['contactWhatsapp','floatingWhatsapp'].forEach(id => document.getElementById(id)?.addEventListener('click', e => {
  e.preventDefault(); openWhatsApp(contactMessage);
}));
document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('contactEmail')?.addEventListener('click', function(e) {
  e.preventDefault();
  const email = 'gmcblue2020@gmail.com';
  const subject = encodeURIComponent('Solicitud de cotización - GMC BLUE');
  const body = encodeURIComponent('Hola, GMC BLUE.\n\nDeseo solicitar una cotización de urea automotriz.\n- Presentación de interés: \n- Cantidad estimada: \n- Ciudad de entrega: \n\nQuedo atento a su respuesta.');
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
  } else {
    const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + email + '&su=' + subject + '&body=' + body;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  }
});


