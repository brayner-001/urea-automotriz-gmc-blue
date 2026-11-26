/* =========================================================
   GMC BLUE · AUTENTICACIÓN SUPABASE
   La publishable key es pública; los permisos reales dependen de RLS.
   ========================================================= */
(() => {
  const PROJECT_URL = 'https://agogxfbehbnfdoqgoocf.supabase.co';
  const PUBLISHABLE_KEY = 'sb_publishable_0mrwTwSjxxOZ9y_MbLyWAA_sQ9-32e8';

  const authApi = window.supabase;
  const accountButton = document.getElementById('accountToggle');
  const modal = document.getElementById('accountModal');
  const closeButton = document.getElementById('accountClose');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const authMessage = document.getElementById('authMessage');
  const accountSummary = document.getElementById('accountSummary');
  const logoutButton = document.getElementById('logoutButton');
  const viewButtons = document.querySelectorAll('[data-auth-view]');
  const supabaseStatus = document.getElementById('supabaseStatus');

  if (!authApi || !accountButton || !modal) {
    console.error('GMC BLUE: no se pudo inicializar el módulo de autenticación.');
    if (supabaseStatus) supabaseStatus.textContent = 'No se pudo cargar el servicio de autenticación.';
    return;
  }

  const client = authApi.createClient(PROJECT_URL, PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  // Cliente compartido de solo lectura para los módulos públicos de la web.
  window.gmcSupabaseClient = client;

  let currentUser = null;

  function showMessage(message, type = 'info') {
    if (!authMessage) return;
    authMessage.textContent = message;
    authMessage.dataset.type = type;
    authMessage.hidden = !message;
  }

  function setBusy(form, busy) {
    if (!form) return;
    form.querySelectorAll('button[type="submit"]').forEach(button => {
      button.disabled = busy;
      button.dataset.originalText ||= button.textContent.trim();
      button.textContent = busy ? 'Procesando…' : button.dataset.originalText;
    });
  }

  function openModal(view = 'login') {
    modal.hidden = false;
    document.body.classList.add('account-open');
    showMessage('');
    switchView(view);
    const firstInput = modal.querySelector(view === 'signup' ? '#signupName' : '#loginEmail');
    window.setTimeout(() => firstInput?.focus(), 40);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('account-open');
    showMessage('');
  }

  function switchView(view) {
    const signup = view === 'signup';
    loginForm.hidden = signup;
    signupForm.hidden = !signup;
    viewButtons.forEach(button => {
      const active = button.dataset.authView === view;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    showMessage('');
  }

  function updateAccountButton(user) {
    currentUser = user || null;
    if (!accountButton) return;
    const label = accountButton.querySelector('[data-account-label]');
    const icon = accountButton.querySelector('i');
    if (user) {
      if (label) label.textContent = 'Mi cuenta';
      if (icon) icon.className = 'fa-solid fa-circle-user';
      accountButton.setAttribute('aria-label', 'Abrir mi cuenta');
    } else {
      if (label) label.textContent = 'Mi cuenta';
      if (icon) icon.className = 'fa-regular fa-user';
      accountButton.setAttribute('aria-label', 'Iniciar sesión o registrarse');
    }
  }

  async function loadOrderHistory(user) {
    const list = document.getElementById('ordersList');
    const message = document.getElementById('ordersMessage');
    if (!list || !message) return;
    list.replaceChildren();
    message.textContent = 'Cargando historial…';
    const { data, error } = await client
      .from('orders')
      .select('id,status,total,created_at,order_items(product_name,quantity,unit_price)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      message.textContent = 'No se pudo cargar el historial en este momento.';
      console.warn('GMC BLUE orders:', error.message);
      return;
    }
    if (!data?.length) {
      message.textContent = 'Todavía no tienes pedidos registrados.';
      return;
    }
    message.textContent = `Últimos ${data.length} pedido(s)`;
    const statusLabels = { pending: 'Pendiente', confirmed: 'Confirmado', processing: 'En preparación', completed: 'Completado', cancelled: 'Cancelado' };
    data.forEach(order => {
      const card = document.createElement('article');
      card.className = 'order-card';
      const head = document.createElement('div'); head.className = 'order-card-head';
      const code = document.createElement('strong'); code.textContent = `Pedido #${String(order.id).slice(0,8).toUpperCase()}`;
      const status = document.createElement('span'); status.className = 'order-status'; status.textContent = statusLabels[order.status] || order.status || 'En revisión';
      head.append(code, status);
      const meta = document.createElement('div'); meta.className = 'order-card-meta';
      const date = order.created_at ? new Date(order.created_at).toLocaleString('es-PE') : 'Fecha no disponible';
      meta.textContent = `${date} · Total referencial: S/ ${Number(order.total || 0).toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
      const items = document.createElement('div'); items.className = 'order-items-summary';
      items.textContent = (order.order_items || []).map(item => `${item.product_name} × ${item.quantity}`).join(' · ') || 'Sin detalle disponible';
      card.append(head, meta, items); list.append(card);
    });
  }

  async function loadAccountDetails(user) {
    if (!user) {
      accountSummary.hidden = true;
      return;
    }
    const name = user.user_metadata?.full_name || 'Cliente GMC BLUE';
    const email = user.email || '';
    const nameNode = document.getElementById('accountName');
    const emailNode = document.getElementById('accountEmail');
    const roleNode = document.getElementById('accountRole');
    if (nameNode) nameNode.textContent = name;
    if (emailNode) emailNode.textContent = email;
    if (roleNode) roleNode.textContent = 'Cuenta autenticada';

    // La consulta respeta RLS: el usuario solo podrá leer su propio rol.
    const { data: roleData, error: roleError } = await client
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!roleError && roleData?.role && roleNode) {
      roleNode.textContent = roleData.role === 'admin' ? 'Administrador' : 'Cliente';
    }
    accountSummary.hidden = false;
    await loadOrderHistory(user);
    loginForm.hidden = true;
    signupForm.hidden = true;
    viewButtons.forEach(button => button.classList.remove('is-active'));
    showMessage('Has iniciado sesión correctamente.', 'success');
  }

  accountButton.addEventListener('click', async () => {
    if (currentUser) {
      openModal('login');
      await loadAccountDetails(currentUser);
    } else {
      accountSummary.hidden = true;
      openModal('login');
    }
  });

  closeButton?.addEventListener('click', closeModal);
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) closeModal();
  });
  viewButtons.forEach(button => button.addEventListener('click', () => {
    accountSummary.hidden = true;
    switchView(button.dataset.authView);
  }));

  signupForm?.addEventListener('submit', async event => {
    event.preventDefault();
    showMessage('');
    const fullName = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    if (!fullName) return showMessage('Escribe tu nombre completo.', 'error');
    if (password.length < 8) return showMessage('La contraseña debe tener al menos 8 caracteres.', 'error');

    setBusy(signupForm, true);
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    setBusy(signupForm, false);

    if (error) return showMessage(error.message, 'error');
    if (data.session && data.user) {
      await loadAccountDetails(data.user);
      return showMessage('Tu cuenta GMC BLUE está lista.', 'success');
    }
    showMessage('Registro recibido. Revisa tu correo para confirmar la cuenta y luego inicia sesión.', 'success');
    signupForm.reset();
    switchView('login');
  });

  loginForm?.addEventListener('submit', async event => {
    event.preventDefault();
    showMessage('');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    setBusy(loginForm, true);
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    setBusy(loginForm, false);
    if (error) return showMessage(error.message, 'error');
    await loadAccountDetails(data.user);
  });

  logoutButton?.addEventListener('click', async () => {
    logoutButton.disabled = true;
    const { error } = await client.auth.signOut();
    logoutButton.disabled = false;
    if (error) return showMessage(error.message, 'error');
    accountSummary.hidden = true;
    showMessage('Sesión cerrada correctamente.', 'success');
    updateAccountButton(null);
    switchView('login');
  });

  client.auth.getSession().then(({ data, error }) => {
    if (error) console.warn('GMC BLUE Auth:', error.message);
    const user = data?.session?.user || null;
    updateAccountButton(user);
  });

  client.auth.onAuthStateChange((_event, session) => {
    updateAccountButton(session?.user || null);
  });

  if (supabaseStatus) supabaseStatus.textContent = 'Servicio de autenticación conectado.';
})();
