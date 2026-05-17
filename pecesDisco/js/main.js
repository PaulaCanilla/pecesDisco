
// Aplicar tema guardado antes de que se pinte la página (evita flash)
if (localStorage.getItem('aqua_theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
}

// =============================================
// Scroll en footer (fade-in con IntersectionObserver)
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    const footers = document.querySelectorAll('.footer');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.1 });

    footers.forEach(footer => observer.observe(footer));

    // =============================================
    // Menú hamburguesa (responsive)
    // Alterna la clase "open" en el nav al pulsar el botón
    // =============================================
    const navToggle = document.querySelector('.nav-toggle');
    const headerNav = document.querySelector('.header__nav');

    if (navToggle && headerNav) {
        navToggle.addEventListener('click', () => {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            headerNav.classList.toggle('open');
            navToggle.setAttribute('aria-label', !expanded ? 'Cerrar menú' : 'Abrir menú');
        });
    }

    // =============================================
    // Carrusel de fondo del hero (personalizado)
    // Cambia el background-image del hero via cross-fade de opacidad
    // =============================================
    const heroEl = document.getElementById('hero');
    if (heroEl) {
        const bgA     = document.getElementById('heroBgA');
        const bgB     = document.getElementById('heroBgB');
        const overlay = document.getElementById('heroOverlay');
        const dots    = heroEl.querySelectorAll('.hero__dot');
        const btnPrev = heroEl.querySelector('.hero__ctrl--prev');
        const btnNext = heroEl.querySelector('.hero__ctrl--next');

        // Definición de las 3 diapositivas
        const heroSlides = [
            {
                // Slide 1: imagen original del hero con texto y botón
                bg: "url('img/pexels-ekamelev-920163.png') center/cover no-repeat",
                overlay: true,
                showContent: true
            },
            {
                // Slide 2: disco rojo a pantalla completa, sin texto
                bg: "url('img/disco_rojo.png') center/cover no-repeat",
                overlay: false,
                showContent: false
            },
            {
                // Slide 3: disco azul a pantalla completa, sin texto
                bg: "url('img/disco_azul.png') center/cover no-repeat",
                overlay: false,
                showContent: false
            }
        ];

        const heroContenido = heroEl.querySelector('.hero__contenido');
        let currentSlide = 0;
        let activeLayer  = bgA;   // capa visible (opacity 1)
        let hiddenLayer  = bgB;   // capa oculta (opacity 0)

        // Inicializar: capa A con slide 0, capa B vacía
        bgA.style.background = heroSlides[0].bg;
        bgA.style.opacity = '1';
        bgB.style.opacity = '0';

        function heroGoTo(index) {
            if (index === currentSlide) return;
            currentSlide = index;
            const slide = heroSlides[currentSlide];

            // Actualizar puntos indicadores
            dots.forEach((d, i) => {
                d.classList.toggle('active', i === currentSlide);
                d.setAttribute('aria-current', i === currentSlide ? 'true' : 'false');
            });

            // Overlay: visible solo en slide 1
            overlay.classList.toggle('hero__overlay--hidden', !slide.overlay);

            // Mostrar u ocultar el contenido (texto + botón)
            if (heroContenido) {
                heroContenido.classList.toggle('hero__contenido--hidden', !slide.showContent);
            }

            // Cargar el fondo en la capa oculta y hacer cross-fade
            hiddenLayer.style.background = slide.bg;
            hiddenLayer.style.opacity = '1';
            activeLayer.style.opacity  = '0';

            // Intercambiar roles de las capas
            [activeLayer, hiddenLayer] = [hiddenLayer, activeLayer];
        }

        function heroNext() { heroGoTo((currentSlide + 1) % heroSlides.length); }
        function heroPrev() { heroGoTo((currentSlide - 1 + heroSlides.length) % heroSlides.length); }

        btnNext.addEventListener('click', heroNext);
        btnPrev.addEventListener('click', heroPrev);
        dots.forEach((d, i) => d.addEventListener('click', () => heroGoTo(i)));

        // Autoplay cada 5 segundos, se pausa al pasar el ratón
        let heroTimer = setInterval(heroNext, 5000);
        heroEl.addEventListener('mouseenter', () => clearInterval(heroTimer));
        heroEl.addEventListener('mouseleave', () => { heroTimer = setInterval(heroNext, 5000); });
    }

    // =============================================
    // Botón flotante ↑ Subir (scroll to top)
    // Se crea dinámicamente y se inserta al final del body
    // =============================================
    if (!document.querySelector('.btn-subir')) {
        const btnSubir = document.createElement('button');
        btnSubir.className = 'btn-subir';
        btnSubir.setAttribute('aria-label', 'Volver al inicio');
        btnSubir.setAttribute('title', 'Volver al inicio');
        btnSubir.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                 aria-hidden="true" width="20" height="20">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        `; // flecha chevron-up (SVG)
        document.body.appendChild(btnSubir);

        // Mostrar el botón cuando el usuario baja más de 300px
        // y reposicionarlo para que no tape el footer
        const footer = document.querySelector('.footer');
        const GAP = 16; // margen entre botón y footer

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btnSubir.classList.add('btn-subir--visible');
            } else {
                btnSubir.classList.remove('btn-subir--visible');
            }

            // Subir el botón cuando se acerca al footer
            if (footer) {
                const footerTop = footer.getBoundingClientRect().top;
                const viewportHeight = window.innerHeight;
                if (footerTop < viewportHeight) {
                    // Footer visible: posicionar el botón por encima de él
                    const overlapOffset = viewportHeight - footerTop + GAP;
                    btnSubir.style.bottom = overlapOffset + 'px';
                } else {
                    // Footer fuera de vista: volver a la posición normal
                    btnSubir.style.bottom = '32px';
                }
            }
        });

        // Scroll suave al pulsar
        btnSubir.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =============================================
    // Botón lupa → navega a la página de búsqueda
    // =============================================
    document.querySelectorAll('button[aria-label="Buscar"]').forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'busqueda.html';
        });
    });

    // =============================================
    // Atajo de teclado: Alt + B → ir a búsqueda
    // Se muestra un toast informativo la primera vez
    // =============================================
    // Crear toast dinámicamente si no existe
    if (!document.querySelector('.shortcut-toast')) {
        const toast = document.createElement('div');
        toast.className = 'shortcut-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = 'Alt + B → Página de búsqueda';
        document.body.appendChild(toast);
    }

    document.addEventListener('keydown', (e) => {
        // Ignorar si el foco está en un campo de texto
        const tag = document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        if (e.altKey && e.key === 'b') {
            e.preventDefault();
            window.location.href = 'busqueda.html';
        }

        // Atajo T → volver al inicio de la página con scroll suave
        if (e.key === 't' || e.key === 'T') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Mostrar pista del atajo al pulsar '?' (signo de interrogación)
        if (e.key === '?') {
            const toast = document.querySelector('.shortcut-toast');
            if (!toast) return;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    });

    // =============================================
    // BÚSQUEDA (busqueda.html)
    // Filtra el catálogo de peces al escribir en el input
    // =============================================
    const campoBusqueda   = document.getElementById('campoBusqueda');
    const resultadosEl    = document.getElementById('resultados');
    const sinResultadosEl = document.getElementById('sinResultados');

    if (campoBusqueda && resultadosEl) {

        const catalogo = [
            { nombre: 'Marlboro Red',      img: 'img/red_marlboro_medium.png',       url: 'compra.html' },
            { nombre: 'Cover Red',         img: 'img/red_cover_medium.png',          url: 'compra.html' },
            { nombre: 'Melon Red',         img: 'img/red_melon_medium.png',          url: 'compra.html' },
            { nombre: 'Snake Skin Red',    img: 'img/disco_rojo_medium.png',         url: 'compra.html' },
            { nombre: 'Alenquer Híbrido',  img: 'img/red_alenquer_hibrido_medium.png', url: 'compra.html' },
        ];

        function renderResultados(lista) {
            resultadosEl.innerHTML = '';

            if (lista.length === 0) {
                if (sinResultadosEl) sinResultadosEl.style.display = 'block';
                return;
            }

            if (sinResultadosEl) sinResultadosEl.style.display = 'none';

            lista.forEach(pez => {
                const card = document.createElement('a');
                card.className = 'busqueda-card';
                card.href = pez.url;
                card.setAttribute('tabindex', '0');
                card.innerHTML = `
                    <img src="${pez.img}" alt="${pez.nombre}" loading="lazy">
                    <p>${pez.nombre}</p>
                `;
                resultadosEl.appendChild(card);
            });
        }

        // Mostrar todos los peces al cargar la página
        renderResultados(catalogo);

        campoBusqueda.addEventListener('input', () => {
            const query = campoBusqueda.value.trim().toLowerCase();
            if (query === '') {
                renderResultados(catalogo);
                return;
            }
            const filtrados = catalogo.filter(p =>
                p.nombre.toLowerCase().includes(query)
            );
            renderResultados(filtrados);
        });
    }

    // =============================================
    // TOAST DE NOTIFICACIONES
    // =============================================
    let _notifTimer = null;
    function showNotif(msg, tipo) {
        let toast = document.querySelector('.notif-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'notif-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.toggle('notif-toast--error', tipo === 'error');
        toast.classList.add('notif-toast--visible');
        clearTimeout(_notifTimer);
        _notifTimer = setTimeout(() => toast.classList.remove('notif-toast--visible'), 3000);
    }

    // Nota: "Añadir al carrito" y badge lo gestiona cart-ui.js (módulo ES)

    // =============================================
    // FORMULARIO DE CONTACTO (informacion.html)
    // =============================================
    const contactoForm = document.getElementById('contactoForm');
    if (contactoForm) {
        contactoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre  = contactoForm.querySelector('#contacto-nombre').value.trim();
            const email   = contactoForm.querySelector('#contacto-email').value.trim();
            const mensaje = contactoForm.querySelector('#contacto-mensaje').value.trim();

            if (!nombre || !email || !mensaje) {
                showNotif('Por favor, completa los campos obligatorios.', 'error');
                return;
            }
            // Simula envío: limpia y confirma
            contactoForm.reset();
            showNotif('✓ Mensaje enviado. ¡Gracias por contactarnos!');
        });
    }

    // =============================================
    // ACORDEÓN (informacion.html — FAQ)
    // =============================================
    document.querySelectorAll('.accordion__btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            const panel = document.getElementById(btn.getAttribute('aria-controls'));

            // Colapsar todos los items del mismo acordeón
            const accordion = btn.closest('.accordion');
            accordion.querySelectorAll('.accordion__btn').forEach(b => {
                b.setAttribute('aria-expanded', 'false');
                const p = document.getElementById(b.getAttribute('aria-controls'));
                if (p) p.hidden = true;
            });

            // Si estaba cerrado, abrir el pulsado
            if (!isExpanded) {
                btn.setAttribute('aria-expanded', 'true');
                if (panel) panel.hidden = false;
            }
        });
    });

    // =============================================
    // PESTAÑAS (compra.html — detalles del producto)
    // =============================================
    document.querySelectorAll('.tabs-producto').forEach(tabsContainer => {
        const btns = tabsContainer.querySelectorAll('.tabs__btn');
        const panels = tabsContainer.querySelectorAll('.tabs__panel');

        // Marcar la primera pestaña como activa visualmente
        if (btns.length) btns[0].setAttribute('aria-selected', 'true');

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Desactivar todos
                btns.forEach(b => b.setAttribute('aria-selected', 'false'));
                panels.forEach(p => { p.hidden = true; });

                // Activar el pulsado
                btn.setAttribute('aria-selected', 'true');
                const panel = document.getElementById(btn.getAttribute('aria-controls'));
                if (panel) panel.hidden = false;
            });
        });
    });

    // =============================================
    // FUNCIONALIDAD 1: MODO OSCURO / CLARO
    // Switch simple debajo del icono del carrito
    // =============================================
    (function setupThemeToggle() {
        const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';

        function makeSwitch() {
            const sw = document.createElement('button');
            sw.className = 'theme-toggle-simple';
            sw.type = 'button';
            sw.setAttribute('aria-label', 'Cambiar tema');
            sw.setAttribute('data-active', activeTheme);
            sw.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme') || 'light';
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('aqua_theme', next);
                document.querySelectorAll('.theme-toggle-simple').forEach(s => {
                    s.setAttribute('data-active', next);
                });
            });
            return sw;
        }

        // ESCRITORIO: switch debajo del icono del carrito en .header__actions
        document.querySelectorAll('.header__actions').forEach(actions => {
            const cartBtn = actions.querySelector('button[aria-label="Ver carrito"]');
            if (!cartBtn) return;
            const wrapper = document.createElement('div');
            wrapper.className = 'cart-theme-wrapper';
            cartBtn.parentNode.insertBefore(wrapper, cartBtn);
            wrapper.appendChild(cartBtn);
            wrapper.appendChild(makeSwitch());
        });

        // MÓVIL: switch dentro del menú hamburguesa (.nav-icons-mobile)
        document.querySelectorAll('.nav-icons-mobile').forEach(mobileIcons => {
            mobileIcons.appendChild(makeSwitch());
        });
    })();

    // =============================================
    // FUNCIONALIDAD 2: VALORACIÓN CON ESTRELLAS
    // Solo en compra.html (detecta .product__info)
    // =============================================
    const productInfo = document.querySelector('.product__info');
    if (productInfo) {
        const PRODUCT_ID = 'snake-skin-red';
        const savedRating = parseInt(localStorage.getItem('rating_' + PRODUCT_ID)) || 0;
        const labels = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'];

        const widget = document.createElement('div');
        widget.className = 'stars-widget';
        widget.innerHTML = `
            <p class="stars-widget__label">Tu valoración</p>
            <div class="stars-widget__stars" role="group" aria-label="Valorar producto">
                ${[1, 2, 3, 4, 5].map(n =>
                    `<button class="star-btn" type="button" data-value="${n}"
                        aria-label="${n} estrella${n > 1 ? 's' : ''}">★</button>`
                ).join('')}
            </div>
            <p class="stars-widget__feedback" aria-live="polite"></p>
        `;
        productInfo.appendChild(widget);

        const starBtns = widget.querySelectorAll('.star-btn');
        const feedback  = widget.querySelector('.stars-widget__feedback');

        function highlightStars(n) {
            starBtns.forEach(b => b.classList.toggle('star-btn--active', +b.dataset.value <= n));
        }

        highlightStars(savedRating);
        if (savedRating > 0) feedback.textContent = labels[savedRating];

        starBtns.forEach(btn => {
            btn.addEventListener('mouseenter', () => highlightStars(+btn.dataset.value));
            btn.addEventListener('mouseleave', () => {
                const current = parseInt(localStorage.getItem('rating_' + PRODUCT_ID)) || 0;
                highlightStars(current);
            });
            btn.addEventListener('click', () => {
                const val = +btn.dataset.value;
                localStorage.setItem('rating_' + PRODUCT_ID, val);
                highlightStars(val);
                feedback.textContent = labels[val];
            });
        });
    }

    // =============================================
    // FUNCIONALIDAD 3: LEER MÁS / LEER MENOS
    // Solo en informacion.html (detecta .info-text)
    // =============================================
    const infoText = document.querySelector('.info-text');
    if (infoText) {
        const paras = Array.from(infoText.querySelectorAll('p'));
        if (paras.length > 1) {
            // Envuelve los párrafos extra en un div colapsable
            const extra = document.createElement('div');
            extra.className = 'info-text__extra';
            extra.hidden = true;
            paras.slice(1).forEach(p => extra.appendChild(p));
            infoText.appendChild(extra);

            // Botón de toggle
            const btnLeer = document.createElement('button');
            btnLeer.className = 'btn-leer-mas';
            btnLeer.type = 'button';
            btnLeer.setAttribute('aria-expanded', 'false');
            btnLeer.innerHTML = 'Leer más <em class="btn-leer-mas__icon" aria-hidden="true">▾</em>';

            btnLeer.addEventListener('click', () => {
                const expanded = btnLeer.getAttribute('aria-expanded') === 'true';
                extra.hidden = expanded;
                btnLeer.setAttribute('aria-expanded', String(!expanded));
                btnLeer.innerHTML = (expanded ? 'Leer más' : 'Leer menos')
                    + ' <em class="btn-leer-mas__icon" aria-hidden="true">▾</em>';
            });

            infoText.appendChild(btnLeer);
        }
    }

});

