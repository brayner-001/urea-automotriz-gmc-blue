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




// Pausa los demás videos cuando comienza una reproducción.
document.querySelectorAll('.video-grid video, .video-featured video').forEach(video => {
  video.addEventListener('play', () => {
    document.querySelectorAll('.video-grid video, .video-featured video').forEach(other => {
      if (other !== video && !other.paused) other.pause();
    });
  });
});

// Animaciones de entrada al desplazarse: si no hay soporte, el contenido sigue visible.
document.documentElement.classList.add('has-js-motion');
const revealItems = document.querySelectorAll(
  '.intro-grid, .stat, .product-card, .feature-split, .logistics-card, .equipment-grid figure, .recognition, .video-card, .gallery-grid figure, .quote-panel, .leader-photo, .leader-copy, .contact-card'
);
revealItems.forEach((item, index) => {
  item.classList.add('js-reveal');
  if (item.classList.contains('product-card') || item.classList.contains('video-card')) {
    item.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
  }
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

  document.querySelectorAll('.js-reveal').forEach(item => revealObserver.observe(item));
} else {
  document.querySelectorAll('.js-reveal').forEach(item => item.classList.add('is-visible'));
}


/* =========================================================
   GMC BLUE · VISOR DE FOTOGRAFÍAS (LIGHTBOX)
   Abre las imágenes en tamaño ampliado, con teclado y móvil.
   ========================================================= */
(() => {
  const images = [...document.querySelectorAll(
    'main img:not(.brand img):not(.footer-brand img)'
  )].filter(img => !img.closest('.brand, .footer-brand'));

  if (!images.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'gmc-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Visor de fotografías');
  overlay.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Cerrar imagen"><i class="fa-solid fa-xmark"></i></button>
    <button class="lightbox-prev" type="button" aria-label="Imagen anterior"><i class="fa-solid fa-chevron-left"></i></button>
    <figure class="lightbox-figure">
      <img class="lightbox-image" alt="">
      <figcaption class="lightbox-caption"></figcaption>
    </figure>
    <button class="lightbox-next" type="button" aria-label="Imagen siguiente"><i class="fa-solid fa-chevron-right"></i></button>
    <div class="lightbox-counter" aria-live="polite"></div>
    <p class="lightbox-hint">Usa ← → para navegar · ESC para cerrar</p>
  `;
  document.body.appendChild(overlay);

  const largeImage = overlay.querySelector('.lightbox-image');
  const caption = overlay.querySelector('.lightbox-caption');
  const counter = overlay.querySelector('.lightbox-counter');
  const closeButton = overlay.querySelector('.lightbox-close');
  let activeIndex = 0;
  let previousFocus = null;

  function showImage(index) {
    activeIndex = (index + images.length) % images.length;
    const source = images[activeIndex];
    largeImage.src = source.currentSrc || source.src;
    largeImage.alt = source.alt || 'Fotografía GMC BLUE';
    caption.textContent = source.alt || '';
    counter.textContent = `${activeIndex + 1} / ${images.length}`;
  }

  function openImage(index) {
    previousFocus = document.activeElement;
    showImage(index);
    overlay.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    closeButton.focus();
  }

  function closeImage() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    largeImage.removeAttribute('src');
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }

  images.forEach((img, index) => {
    img.classList.add('gmc-zoomable');
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Ampliar imagen: ${img.alt || 'fotografía GMC BLUE'}`);
    img.addEventListener('click', () => openImage(index));
    img.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openImage(index);
      }
    });
  });

  closeButton.addEventListener('click', closeImage);
  overlay.querySelector('.lightbox-prev').addEventListener('click', () => showImage(activeIndex - 1));
  overlay.querySelector('.lightbox-next').addEventListener('click', () => showImage(activeIndex + 1));
  overlay.addEventListener('click', event => {
    if (event.target === overlay) closeImage();
  });
  document.addEventListener('keydown', event => {
    if (!overlay.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeImage();
    if (event.key === 'ArrowRight') showImage(activeIndex + 1);
    if (event.key === 'ArrowLeft') showImage(activeIndex - 1);
  });
})();

// Respeta la preferencia del visitante por reducir animaciones.


/* Refuerzo de apertura para la galería: permite abrir la foto al pulsar cualquier
   zona de la tarjeta, no solamente el área exacta del elemento img. */
(() => {
  const gallery = document.querySelector('.gallery-grid');
  if (!gallery) return;
  gallery.querySelectorAll('figure').forEach(figure => {
    figure.setAttribute('tabindex', '0');
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', 'Ampliar fotografía');
    figure.addEventListener('click', event => {
      // El clic en la imagen ya lo gestiona el visor principal.
      // Si el clic cae en otra parte de la tarjeta, se activa la imagen asociada.
      if (event.target.closest('img')) return;
      const image = figure.querySelector('img');
      image?.click();
    });
    figure.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        figure.querySelector('img')?.click();
      }
    });
  });
})();
