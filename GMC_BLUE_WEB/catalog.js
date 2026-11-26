/* =========================================================
   GMC BLUE · CATÁLOGO DINÁMICO
   Consume directamente la Data API de Supabase con acceso SELECT.
   Si Supabase no responde, conserva el catálogo del prototipo.
   ========================================================= */
(() => {
  'use strict';

  const grid = document.querySelector('#productos .product-grid');
  const quoteSelect = document.getElementById('productSelect');
  if (!grid) return;

  const money = value => 'S/ ' + Number(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const safeImage = value => {
    const source = String(value || '').trim();
    if (/^https:\/\//i.test(source) || /^(?:\.\/)?assets\/[\w./-]+$/i.test(source)) return source;
    return 'assets/bidon_gmc.jpg';
  };

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  };

  function renderProducts(products) {
    const fragment = document.createDocumentFragment();

    products.forEach(product => {
      const price = Number(product.price);
      const validPrice = Number.isFinite(price) && price >= 0 ? price : 0;
      const name = String(product.name || 'Producto GMC BLUE');
      const description = String(product.description || 'Consulta los detalles de esta presentación.');
      const imageUrl = safeImage(product.image_url);
      const sku = String(product.sku || '').trim();

      const card = node('article', 'product-card is-visible');
      const imageWrap = node('div', 'product-image');
      imageWrap.append(node('span', 'product-label', sku || 'GMC BLUE'));
      const image = node('img');
      image.src = imageUrl;
      image.alt = name;
      image.loading = 'lazy';
      image.onerror = () => { image.onerror = null; image.src = 'assets/bidon_gmc.jpg'; };
      imageWrap.append(image);

      const info = node('div', 'product-info');
      info.append(node('div', 'product-type', 'CATÁLOGO GMC BLUE'));
      info.append(node('h3', '', name));
      info.append(node('p', '', description));

      const priceRow = node('div', 'price-row');
      const priceLabel = node('div');
      priceLabel.append(node('small', '', validPrice > 0 ? 'Referencia desde' : 'Precio'));
      priceLabel.append(node('strong', '', validPrice > 0 ? money(validPrice) : 'A cotizar'));
      priceRow.append(priceLabel, node('span', 'price-unit', 'por unidad'));

      const button = node('button', 'product-button add-quote');
      button.type = 'button';
      button.dataset.product = name;
      button.dataset.price = String(validPrice);
      button.dataset.image = imageUrl;
      button.dataset.productId = String(product.id || '');
      button.append(document.createTextNode(validPrice > 0 ? 'Agregar a cotización' : 'Solicitar cotización'));
      const icon = document.createElement('i');
      icon.className = validPrice > 0 ? 'fa-solid fa-plus' : 'fa-solid fa-arrow-right';
      button.append(icon);

      info.append(priceRow, button);
      card.append(imageWrap, info);
      fragment.append(card);
    });

    grid.replaceChildren(fragment);
  }

  function syncQuoteSelect(products) {
    if (!quoteSelect) return;
    const previousName = quoteSelect.selectedOptions[0]?.dataset.name || '';
    const options = products.map(product => {
      const price = Number(product.price);
      const option = document.createElement('option');
      option.value = Number.isFinite(price) && price >= 0 ? String(price) : '0';
      option.dataset.name = String(product.name || 'Producto GMC BLUE');
      option.textContent = `${option.dataset.name}${Number(option.value) > 0 ? '' : ' (cotizar)'}`;
      return option;
    });
    if (!options.length) return;
    quoteSelect.replaceChildren(...options);
    const matching = options.find(option => option.dataset.name === previousName);
    if (matching) matching.selected = true;
    quoteSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function loadCatalog() {
    window.gmcCatalogSyncStatus = 'loading';
    try {
      // Reutiliza el cliente único creado por auth.js. No crear un segundo
      // cliente Supabase: así catálogo, sesión y pedidos comparten identidad.
      const client = window.gmcSupabaseClient;
      if (!client) throw new Error('El cliente compartido de Supabase no está inicializado.');

      const { data, error } = await client
        .from('products')
        .select('id,name,sku,description,price,image_url,active')
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!Array.isArray(data) || data.length === 0) {
        window.gmcCatalogSyncStatus = 'empty';
        console.error('GMC BLUE: Supabase respondió correctamente, pero no hay productos activos.');
        return;
      }

      const usable = data.filter(product =>
        product && typeof product.name === 'string' &&
        Number.isFinite(Number(product.price)) && Number(product.price) >= 0
      );
      if (!usable.length) {
        window.gmcCatalogSyncStatus = 'empty';
        console.error('GMC BLUE: Supabase no devolvió productos válidos.');
        return;
      }

      window.gmcCatalogProducts = usable;
      window.gmcCatalogSyncStatus = 'ready';
      renderProducts(usable);
      syncQuoteSelect(usable);
      window.dispatchEvent(new CustomEvent('gmc:catalog-loaded', { detail: { products: usable } }));
      console.info(`GMC BLUE: catálogo cargado desde Supabase (${usable.length} producto(s)).`);
    } catch (error) {
      window.gmcCatalogSyncStatus = 'error';
      window.gmcCatalogSyncError = error?.message || String(error);
      console.error('GMC BLUE: no se pudo sincronizar el catálogo con Supabase.', error);
    }
  }

  loadCatalog();
})();
