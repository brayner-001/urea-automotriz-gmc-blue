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
  // Sin número comercial confirmado: WhatsApp permite elegir el destinatario.
  // Cuando GMC BLUE confirme su número, colócalo aquí con prefijo 51 y sin + ni espacios.
  const phone = '';
  const url = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
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
// Delegación de eventos: también funciona cuando el catálogo se renderiza desde Supabase.
document.querySelector('#productos .product-grid')?.addEventListener('click', event => {
  const button = event.target.closest('.add-quote');
  if (!button) return;
  const productName = button.dataset.product || 'Producto GMC BLUE';
  const catalogMatch = findCatalogProduct({ name: productName });
  addProductToCart({
    name: catalogMatch?.name || productName,
    price: catalogMatch ? Number(catalogMatch.price) : Math.max(0, Number(button.dataset.price) || 0),
    image: catalogMatch?.image_url || button.dataset.image || button.closest('.product-card')?.querySelector('img')?.getAttribute('src') || '',
    productId: button.dataset.productId || catalogMatch?.id || null,
    unit: 'unidad'
  });
  openCart();
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


/* =========================================================
   GMC BLUE · CARRITO DE COMPRAS
   Carrito local, cantidades, totales y pedido por WhatsApp.
   ========================================================= */
const GMC_PRODUCTS = [
  { name: 'Bidón automotriz 20 L', price: 65, image: 'assets/bidon_gmc.jpg' },
  { name: 'Caja de urea 20 L', price: 58, image: 'assets/caja_gmc.jpg' },
  { name: 'Cilindro industrial 208 L', price: 529, image: 'assets/cilindro_gmc.jpg' },
  { name: 'Contenedor IBC 1,000 L', price: 1600, image: 'assets/ibc_gmc.jpg', productId: 'f9e57a6c-ce47-4f7d-ac3f-4fd8e656e8eb' }
];
const CART_STORAGE_KEY = 'gmcBlueCartV2';
const normalizeProductName = value => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
let gmcCatalogProducts = Array.isArray(window.gmcCatalogProducts) ? window.gmcCatalogProducts : [];
function findCatalogProduct(item) {
  const key = normalizeProductName(item?.name);
  return gmcCatalogProducts.find(product =>
    normalizeProductName(product.name) === key
  ) || null;
}
function hydrateCartProductIds() {
  let changed = false;
  gmcCart.forEach(item => {
    const match = findCatalogProduct(item);
    if (match?.id && item.productId !== match.id) {
      item.productId = match.id;
      changed = true;
    }
    if (match) {
      item.name = match.name;
      item.price = Number(match.price);
      item.image = match.image_url || item.image;
    }
  });
  if (changed) saveCart();
  renderCart();
}
let gmcCart = [];
try {
  const previous = localStorage.getItem(CART_STORAGE_KEY)
    ?? localStorage.getItem('gmcBlueCartV1')
    ?? '[]';
  const stored = JSON.parse(previous);
  if (Array.isArray(stored)) gmcCart = stored.filter(item =>
    item && typeof item.name === 'string' && Number.isFinite(Number(item.price)) &&
    Number.isFinite(Number(item.qty)) && Number(item.qty) > 0
  );
} catch (_) { gmcCart = []; }

const cartDrawer = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const money = value => 'S/ ' + Number(value).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2});

function saveCart() {
  try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(gmcCart)); } catch (_) {}
}
function addProductToCart(product) {
  const existing = gmcCart.find(item => normalizeProductName(item.name) === normalizeProductName(product.name));
  if (existing) {
    existing.qty += 1;
    if (product.productId) existing.productId = product.productId;
    if (product.price !== undefined) existing.price = product.price;
    if (product.image) existing.image = product.image;
  } else gmcCart.push({ ...product, qty: 1 });
  saveCart();
  renderCart();
}
function changeCartQty(index, delta) {
  if (!gmcCart[index]) return;
  gmcCart[index].qty += delta;
  if (gmcCart[index].qty <= 0) gmcCart.splice(index, 1);
  saveCart();
  renderCart();
}
function removeCartItem(index) {
  gmcCart.splice(index, 1);
  saveCart();
  renderCart();
}
function renderCart() {
  if (!cartItemsEl) return;
  const totalQty = gmcCart.reduce((sum, item) => sum + item.qty, 0);
  const total = gmcCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (cartCountEl) cartCountEl.textContent = totalQty > 99 ? '99+' : String(totalQty);
  if (cartTotalEl) cartTotalEl.textContent = money(total);
  if (!gmcCart.length) {
    cartItemsEl.innerHTML = '<div class="cart-empty"><i class="fa-solid fa-cart-shopping"></i><b>Tu carrito está vacío</b><span>Agrega una presentación para comenzar tu pedido.</span></div>';
    return;
  }
  cartItemsEl.innerHTML = gmcCart.map((item, index) => `
    <article class="cart-item">
      <img src="${item.image}" alt="" loading="lazy">
      <div class="cart-item-main">
        <b>${escapeCartText(item.name)}</b>
        <span class="cart-item-price">${item.price > 0 ? money(item.price) + ' / unidad' : 'Precio a cotizar'}</span>
        <div class="cart-item-controls">
          <div class="cart-qty">
            <button type="button" data-cart-minus="${index}" aria-label="Disminuir cantidad">−</button>
            <span>${item.qty}</span>
            <button type="button" data-cart-plus="${index}" aria-label="Aumentar cantidad">+</button>
          </div>
          <button type="button" class="cart-remove" data-cart-remove="${index}">Eliminar</button>
        </div>
      </div>
      <strong class="cart-line-total">${item.price > 0 ? money(item.price * item.qty) : 'A cotizar'}</strong>
    </article>`).join('');
}
function escapeCartText(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function openCart() {
  cartDrawer?.classList.add('is-open');
  cartDrawer?.setAttribute('aria-hidden', 'false');
  cartBackdrop?.removeAttribute('hidden');
  document.body.classList.add('cart-open');
  document.getElementById('cartClose')?.focus();
}
function closeCart() {
  cartDrawer?.classList.remove('is-open');
  cartDrawer?.setAttribute('aria-hidden', 'true');
  cartBackdrop?.setAttribute('hidden', '');
  document.body.classList.remove('cart-open');
}
document.getElementById('cartToggle')?.addEventListener('click', openCart);
document.getElementById('cartClose')?.addEventListener('click', closeCart);
cartBackdrop?.addEventListener('click', closeCart);
cartItemsEl?.addEventListener('click', event => {
  const minus = event.target.closest('[data-cart-minus]');
  const plus = event.target.closest('[data-cart-plus]');
  const remove = event.target.closest('[data-cart-remove]');
  if (minus) changeCartQty(Number(minus.dataset.cartMinus), -1);
  if (plus) changeCartQty(Number(plus.dataset.cartPlus), 1);
  if (remove) removeCartItem(Number(remove.dataset.cartRemove));
});
document.getElementById('cartClear')?.addEventListener('click', () => {
  gmcCart = [];
  saveCart();
  renderCart();
});
document.getElementById('cartCheckout')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  if (!gmcCart.length) { openCart(); return; }
  const client = window.gmcSupabaseClient;
  const { data: sessionData } = client ? await client.auth.getSession() : { data: { session: null } };
  const user = sessionData?.session?.user;
  if (!user) {
    const lines = gmcCart.map(item => {
      const lineTotal = item.price > 0 ? money(item.price * item.qty) : 'A cotizar';
      return `• ${item.name} | Cantidad: ${item.qty} | ${lineTotal}`;
    });
    const total = gmcCart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const hasQuote = gmcCart.some(item => item.price <= 0);
    const messageBase = `Hola, GMC BLUE. Deseo solicitar este pedido:\n\n${lines.join('\n')}\n\nSubtotal referencial: ${money(total)}${hasQuote ? '\nHay productos pendientes de cotización.' : ''}\n\nPor favor, confirmen disponibilidad, precio final y condiciones de entrega.`;
    openWhatsApp(messageBase);
    return;
  }

  // Un usuario autenticado solo puede registrar productos sincronizados con
  // Supabase. Evita crear pedidos con tarjetas locales o datos desactualizados.
  if (window.gmcCatalogSyncStatus !== 'ready') {
    const reason = window.gmcCatalogSyncError || 'El catálogo todavía no ha confirmado sus productos activos.';
    alert(`No se puede registrar el pedido porque el catálogo no está sincronizado con Supabase. ${reason} Recarga la página y vuelve a intentarlo.`);
    return;
  }

  // Resolver UUIDs faltantes directamente desde Supabase antes de crear el pedido.
  // Esto también repara carritos antiguos guardados en localStorage.
  const normalizeNameForLookup = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const originalText = button.innerHTML;
  button.disabled = true;
  button.textContent = 'Registrando pedido…';
  try {
    const { data: activeProducts, error: productsError } = await client
      .from('products')
      .select('id,name,price,active')
      .eq('active', true);

    if (productsError) throw new Error(`No se pudo verificar el catálogo en Supabase: ${productsError.message}`);

    const productsByName = new Map(
      (activeProducts || []).map(product => [normalizeNameForLookup(product.name), product])
    );

    const items = [];
    for (const item of gmcCart) {
      let product = item.productId
        ? (activeProducts || []).find(candidate => candidate.id === item.productId)
        : null;

      if (!product) {
        product = productsByName.get(normalizeNameForLookup(item.name));
      }

      if (!product?.id) {
        throw new Error(`No se encontró "${item.name}" como producto activo en Supabase. Elimina ese artículo del carrito y agrégalo nuevamente desde el catálogo actualizado.`);
      }

      // Reconciliar el carrito con el UUID y precio actuales de la base de datos.
      item.productId = product.id;
      item.name = product.name;
      item.price = Number(product.price);
      items.push({ product_id: product.id, quantity: item.qty });
    }
    saveCart();
    renderCart();

    // Construir el resumen después de reconciliar los datos con Supabase,
    // para que el mensaje y el total no conserven precios antiguos del carrito.
    const lines = gmcCart.map(item => {
      const lineTotal = item.price > 0 ? money(item.price * item.qty) : 'A cotizar';
      return `• ${item.name} | Cantidad: ${item.qty} | ${lineTotal}`;
    });
    const total = gmcCart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const hasQuote = gmcCart.some(item => item.price <= 0);
    const messageBase = `Hola, GMC BLUE. Deseo solicitar este pedido:\n\n${lines.join('\n')}\n\nSubtotal referencial: ${money(total)}${hasQuote ? '\nHay productos pendientes de cotización.' : ''}\n\nPor favor, confirmen disponibilidad, precio final y condiciones de entrega.`;

    const { data: orderId, error } = await client.rpc('gmc_create_order', {
      p_items: items,
      p_notes: hasQuote ? 'Incluye producto(s) a cotizar. Confirmar precio final y disponibilidad por WhatsApp.' : 'Solicitud de cotización desde la web GMC BLUE.'
    });
    if (error) {
      if (error.code === '22023' && /producto.*disponible/i.test(error.message || '')) {
        const submitted = items.map(item => `${item.product_id} (cantidad ${item.quantity})`).join(', ');
        throw new Error(`La función de pedidos no encuentra como activo uno de estos UUID: ${submitted}. Verifica que la función y la tabla products estén en el mismo proyecto de Supabase. Detalle original: ${error.message}`);
      }
      throw error;
    }
    if (!orderId) throw new Error('Supabase no devolvió el identificador del pedido.');
    const orderMessage = `${messageBase}\n\nCódigo de pedido GMC BLUE: ${orderId}`;
    openWhatsApp(orderMessage);
    button.textContent = 'Pedido registrado ✓';
    // El carrito se conserva hasta que el cliente decida vaciarlo.
  } catch (error) {
    console.error('GMC BLUE: no se pudo registrar el pedido.', error);
    alert(`No se pudo registrar el pedido: ${error.message || 'Error de conexión'}. Tu carrito se conserva. Puedes volver a intentarlo.`);
    button.innerHTML = originalText;
  } finally {
    button.disabled = false;
  }
});
renderCart();
window.addEventListener('gmc:catalog-loaded', event => {
  gmcCatalogProducts = Array.isArray(event.detail?.products) ? event.detail.products : [];
  hydrateCartProductIds();
});

/* =========================================================
   GMC BLUE · SONIDO DE INTERACCIÓN
   Efecto breve tipo gota, opt-in y sin audio automático.
   ========================================================= */
let soundEnabled = false;
let audioContext = null;
const soundToggle = document.getElementById('soundToggle');
function playDropSound() {
  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioContext ||= new AudioCtx();
    if (audioContext.state === 'suspended') audioContext.resume();
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1050, now);
    oscillator.frequency.exponentialRampToValueAtTime(430, now + 0.11);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.075, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.17);
  } catch (_) {}
}
soundToggle?.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute('aria-pressed', String(soundEnabled));
  soundToggle.innerHTML = soundEnabled
    ? '<i class="fa-solid fa-droplet"></i><span>Sonido activado</span>'
    : '<i class="fa-solid fa-volume-xmark"></i><span>Sonido apagado</span>';
  if (soundEnabled) playDropSound();
});
document.addEventListener('click', event => {
  if (!soundEnabled) return;
  if (event.target.closest('button, .btn, .nav-cta, .text-link, .video-text-link, .back-top, .cart-trigger')) {
    playDropSound();
  }
}, true);

/* =========================================================
   GMC BLUE · GALERÍA TÁCTIL Y CIERRE DIRECTO
   Clic sobre cualquier zona de la foto ampliada = cerrar.
   ========================================================= */
(() => {
  const overlay = document.querySelector('.gmc-lightbox');
  if (!overlay) return;
  const image = overlay.querySelector('.lightbox-image');
  let touchStartX = 0;
  let touchStartY = 0;

  // Al tocar la propia fotografía ampliada se cierra el visor.
  image?.addEventListener('click', event => {
    event.stopPropagation();
    overlay.querySelector('.lightbox-close')?.click();
  });

  overlay.addEventListener('touchstart', event => {
    if (!overlay.classList.contains('is-open') || !event.changedTouches.length) return;
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });

  overlay.addEventListener('touchend', event => {
    if (!overlay.classList.contains('is-open') || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      overlay.querySelector(dx < 0 ? '.lightbox-next' : '.lightbox-prev')?.click();
    }
  }, { passive: true });
})();

// Escape cierra también el carrito cuando está abierto.
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('cart-open')) closeCart();
});
