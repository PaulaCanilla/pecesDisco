/**
 * cart-ui.js — Lógica de UI del carrito (ES module).
 * Gestiona: badge, drawer lateral, modal de confirmación, página carrito.html.
 */
import { ShoppingCart } from './ShoppingCart.mjs';

const cart = new ShoppingCart();

/* ================================================================
   INYECCIÓN DE HTML (drawer + modal)
   ================================================================ */
function injectUI() {
    document.body.insertAdjacentHTML('beforeend', `
        <!-- Drawer lateral del carrito -->
        <div class="cart-drawer" id="cartDrawer" aria-hidden="true">
            <div class="cart-drawer__backdrop" id="cartBackdrop"></div>
            <div class="cart-drawer__panel" role="dialog" aria-modal="true" aria-label="Resumen del carrito">
                <div class="cart-drawer__header">
                    <h2 class="cart-drawer__title">Tu carrito</h2>
                    <button class="cart-drawer__close" id="cartDrawerClose" aria-label="Cerrar carrito">✕</button>
                </div>
                <div class="cart-drawer__body" id="cartDrawerBody"></div>
                <div class="cart-drawer__footer">
                    <div class="cart-drawer__total-row">
                        <span>Total</span>
                        <span id="cartDrawerTotal">0,00 €</span>
                    </div>
                    <a href="carrito.html" class="cart-drawer__cta">Ver carrito completo</a>
                </div>
            </div>
        </div>

        <!-- Modal de confirmación -->
        <div class="cart-modal" id="cartModal" aria-hidden="true">
            <div class="cart-modal__backdrop" id="modalBackdrop"></div>
            <div class="cart-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
                <div class="cart-modal__header">
                    <h3 class="cart-modal__title" id="modalTitle">Confirmar acción</h3>
                </div>
                <div class="cart-modal__body">
                    <p id="modalMessage">¿Estás seguro de que quieres eliminar este producto del carrito?</p>
                </div>
                <div class="cart-modal__footer">
                    <button class="cart-modal__btn cart-modal__btn--cancel" id="modalCancel">Cancelar</button>
                    <button class="cart-modal__btn cart-modal__btn--confirm" id="modalConfirm">Confirmar</button>
                </div>
            </div>
        </div>
    `);
}

/* ================================================================
   BADGE — número de items sobre el icono del carrito
   ================================================================ */
function updateBadge() {
    // Eliminar badges anteriores
    document.querySelectorAll('.cart-badge').forEach(b => b.remove());
    const count = cart.count;
    if (count === 0) return;
    document.querySelectorAll('button[aria-label="Ver carrito"]').forEach(btn => {
        const badge = document.createElement('span');
        badge.className = 'cart-badge';
        badge.textContent = count > 99 ? '99+' : count;
        badge.setAttribute('aria-label', `${count} productos en el carrito`);
        btn.appendChild(badge);
    });
}

/* ================================================================
   DRAWER — renderizado y apertura/cierre
   ================================================================ */
function renderDrawer() {
    const body = document.getElementById('cartDrawerBody');
    const totalEl = document.getElementById('cartDrawerTotal');
    if (!body) return;

    const items = cart.items;
    if (items.length === 0) {
        body.innerHTML = '<p class="cart-drawer__empty">El carrito está vacío.</p>';
    } else {
        body.innerHTML = items.map(i => `
            <div class="cart-drawer__item" data-id="${i.id}">
                <img class="cart-drawer__img" src="${i.img}" alt="${i.name}" loading="lazy">
                <div class="cart-drawer__info">
                    <span class="cart-drawer__name">${i.name}</span>
                    <span class="cart-drawer__qty">Cantidad: ${i.qty}</span>
                </div>
                <span class="cart-drawer__price">${fmt(i.price * i.qty)}</span>
                <button class="cart-drawer__remove" data-id="${i.id}" aria-label="Eliminar ${i.name}">✕</button>
            </div>
        `).join('');
    }

    if (totalEl) totalEl.textContent = fmt(cart.total);
}

function openDrawer() {
    renderDrawer();
    const drawer = document.getElementById('cartDrawer');
    drawer?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open');
    // Trampa de foco: mover el foco al botón de cierre del drawer
    setTimeout(() => {
        document.getElementById('cartDrawerClose')?.focus();
    }, 50);
}

function closeDrawer() {
    document.getElementById('cartDrawer')?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-open');
    // Devolver el foco al botón del carrito que abrió el drawer
    document.querySelector('button[aria-label="Ver carrito"]')?.focus();
}

/* ================================================================
   MODAL de confirmación
   ================================================================ */
let _pendingId = null;

function openModal(id, title, message) {
    _pendingId = id;
    const el = document.getElementById('modalTitle');
    const msg = document.getElementById('modalMessage');
    if (el) el.textContent = title || 'Confirmar acción';
    if (msg) msg.textContent = message || '¿Estás seguro de que quieres eliminar este producto del carrito?';
    document.getElementById('cartModal')?.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    _pendingId = null;
    document.getElementById('cartModal')?.setAttribute('aria-hidden', 'true');
}

/* ================================================================
   TOAST (independiente de main.js)
   ================================================================ */
let _toastTimer = null;

function showToast(msg, type = 'success') {
    let toast = document.querySelector('.notif-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'notif-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.toggle('notif-toast--error', type === 'error');
    toast.classList.add('notif-toast--visible');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => toast.classList.remove('notif-toast--visible'), 3000);
}

/* ================================================================
   PÁGINA CARRITO (carrito.html)
   ================================================================ */
function fmt(n) {
    return n.toFixed(2).replace('.', ',') + ' €';
}

function renderCartPage() {
    const itemsEl = document.getElementById('carritoItems');
    const resumenEl = document.getElementById('carritoResumen');
    if (!itemsEl) return; // no estamos en la página de carrito

    const items = cart.items;

    if (items.length === 0) {
        itemsEl.innerHTML = `
            <div class="carrito-empty">
                <p>Tu carrito está vacío.</p>
                <p><a href="coleccion.html">Explorar la colección →</a></p>
            </div>`;
        if (resumenEl) resumenEl.style.display = 'none';
        return;
    }

    if (resumenEl) resumenEl.style.display = '';

    itemsEl.innerHTML = items.map(i => `
        <div class="carrito-item" data-id="${i.id}">
            <img class="carrito-item__img" src="${i.img}" alt="${i.name}" loading="lazy">
            <div class="carrito-item__info">
                <div class="carrito-item__name">${i.name}</div>
                <div class="carrito-item__price-unit">${fmt(i.price)} / ud.</div>
            </div>
            <div class="carrito-item__qty">
                <button class="carrito-item__qty-btn" data-id="${i.id}" data-delta="-1" aria-label="Reducir cantidad">−</button>
                <span class="carrito-item__qty-num">${i.qty}</span>
                <button class="carrito-item__qty-btn" data-id="${i.id}" data-delta="1" aria-label="Aumentar cantidad">+</button>
            </div>
            <div class="carrito-item__right">
                <span class="carrito-item__subtotal">${fmt(i.price * i.qty)}</span>
                <button class="carrito-item__remove" data-id="${i.id}">Eliminar</button>
            </div>
        </div>
    `).join('');

    // Resumen del pedido
    if (resumenEl) {
        const shipping = cart.total >= 80 ? 0 : 9.90;
        const total = cart.total + shipping;
        resumenEl.innerHTML = `
            <h2 class="carrito-resumen__title">Resumen del pedido</h2>
            <div class="carrito-resumen__row">
                <span>Subtotal</span><span>${fmt(cart.total)}</span>
            </div>
            <div class="carrito-resumen__row">
                <span>Gastos de envío</span>
                <span>${shipping === 0 ? '<strong>Gratis</strong>' : fmt(shipping)}</span>
            </div>
            ${shipping > 0 ? `<p class="carrito-resumen__shipping-hint">Envío gratuito a partir de 80,00 €</p>` : ''}
            <div class="carrito-resumen__row carrito-resumen__row--total">
                <span>Total</span><span>${fmt(total)}</span>
            </div>
            <button class="carrito-resumen__checkout" id="checkoutBtn">Finalizar compra</button>
            <button class="carrito-resumen__vaciar" id="vaciarBtn">Vaciar carrito</button>
        `;

        document.getElementById('checkoutBtn')?.addEventListener('click', () => {
            showToast('¡Gracias por tu pedido! En breve recibirás confirmación.');
        });
        document.getElementById('vaciarBtn')?.addEventListener('click', () => {
            openModal('__ALL__', 'Vaciar carrito', '¿Estás seguro de que quieres eliminar todos los productos del carrito?');
        });
    }

    // Eventos de cantidad y eliminación (delegación)
    itemsEl.addEventListener('click', e => {
        const deltaBtn = e.target.closest('.carrito-item__qty-btn');
        if (deltaBtn) {
            const id = deltaBtn.dataset.id;
            const item = cart.items.find(i => i.id === id);
            if (item) {
                cart.updateQty(id, item.qty + parseInt(deltaBtn.dataset.delta, 10));
                updateBadge();
                renderCartPage();
            }
            return;
        }
        const removeBtn = e.target.closest('.carrito-item__remove');
        if (removeBtn) {
            openModal(removeBtn.dataset.id, 'Eliminar producto', '¿Estás seguro de que quieres eliminar este producto del carrito?');
        }
    }, { once: true }); // evita acumulación de listeners en re-render
}

/* ================================================================
   BOTÓN "AÑADIR AL CARRITO" (compra.html)
   ================================================================ */
function setupAddToCart() {
    const btn = document.querySelector('.product__add');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const qtyInput = document.querySelector('.product__qty-input');
        const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
        cart.add({
            id: 'snake-skin-red',
            name: 'Snake Skin Red',
            price: 120,
            img: 'img/disco_rojo_medium.png',
            url: 'compra.html',
            qty
        });
        updateBadge();
        showToast('✓ Producto añadido al carrito');
    });
}

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    injectUI();
    updateBadge();
    setupAddToCart();
    renderCartPage();

    // Abrir drawer al pulsar icono del carrito
    document.querySelectorAll('button[aria-label="Ver carrito"]').forEach(btn => {
        btn.addEventListener('click', openDrawer);
    });

    // Cerrar drawer
    document.getElementById('cartDrawerClose')?.addEventListener('click', closeDrawer);
    document.getElementById('cartBackdrop')?.addEventListener('click', closeDrawer);

    // Eliminar item desde el drawer (delegación)
    document.getElementById('cartDrawerBody')?.addEventListener('click', e => {
        const removeBtn = e.target.closest('.cart-drawer__remove');
        if (!removeBtn) return;
        closeDrawer();
        openModal(removeBtn.dataset.id, 'Eliminar producto', '¿Estás seguro de que quieres eliminar este producto del carrito?');
    });

    // Modal: botones
    document.getElementById('modalCancel')?.addEventListener('click', closeModal);
    document.getElementById('modalBackdrop')?.addEventListener('click', closeModal);
    document.getElementById('modalConfirm')?.addEventListener('click', () => {
        if (_pendingId === '__ALL__') {
            cart.clear();
        } else if (_pendingId) {
            cart.remove(_pendingId);
        }
        updateBadge();
        closeModal();
        renderCartPage();  // actualiza página carrito si estamos en ella
        renderDrawer();    // actualiza drawer si estaba abierto
    });

    // Tecla ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeDrawer(); closeModal(); }
    });
});
