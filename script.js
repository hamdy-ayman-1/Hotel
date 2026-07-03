/**
 * ============================================
 * SCRIPT.JS - إطلالة العزيزيه
 * Premium Luxury 3D Hotel Website
 * ============================================
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    WHATSAPP_NUMBER: '966551807954',
    ROOMS_JSON_PATH: 'rooms.json',
    ANIMATION_DURATION: 400,
    SCROLL_THRESHOLD: 50,
    PARTICLE_COUNT: 80,
    LOW_PERFORMANCE_THRESHOLD: 30,
    GALLERY_AUTOPLAY_INTERVAL: 5000
  };

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const state = {
    roomsData: [],
    currentRoom: null,
    currentImageIndex: 0,
    isLoading: true,
    isLowPerformance: false,
    isMobile: false,
    scrollY: 0,
    mouseX: 0,
    mouseY: 0,
    rafId: null,
    scrollRafId: null
  };

  // ============================================
  // DOM ELEMENTS CACHE
  // ============================================
  const DOM = {};

  function cacheDOMElements() {
    DOM.body = document.body;
    DOM.html = document.documentElement;

    // Loading screen
    DOM.loadingScreen = document.querySelector('.loading-screen');
    DOM.loadingProgressBar = document.querySelector('.loading-progress-bar');
    DOM.loadingPercent = document.querySelector('.loading-percent');

    // Page transition
    DOM.pageTransition = document.querySelector('.page-transition');

    // Cursor
    DOM.cursorMain = document.querySelector('.cursor-main');
    DOM.cursorTrail = document.querySelector('.cursor-trail');

    // Navbar
    DOM.navbar = document.getElementById('navbar');
    DOM.navToggle = document.getElementById('navToggle');
    DOM.navMenu = document.getElementById('navMenu');
    DOM.navLinks = document.querySelectorAll('.nav-link');

    // Sections
    DOM.sections = document.querySelectorAll('section[id]');

    // Rooms
    DOM.roomsGrid = document.getElementById('roomsGrid');

    // Modal
    DOM.modal = document.getElementById('roomModal');
    DOM.modalBody = document.getElementById('modalBody');
    DOM.modalClose = document.getElementById('modalClose');

    // Lightbox
    DOM.lightboxOverlay = document.getElementById('lightboxOverlay');
    DOM.lightboxImg = document.getElementById('lightboxImg');

    // Back to top
    DOM.backToTop = document.getElementById('backToTop');

    // 3D Canvas
    DOM.webglContainer = document.getElementById('webgl-container');
  }

  // ============================================
  // PERFORMANCE DETECTION
  // ============================================
  function detectPerformance() {
    // Check for mobile devices
    state.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth < 768;

    // Check for low-end devices
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    let gpuInfo = '';
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }

    // Detect low performance indicators
    const isLowEndGPU = /swift|intel.*hd|mali.*450|mali.*400|sgx|adreno.*3[0-9][0-9]/i.test(gpuInfo);
    const isOldDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const isLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;

    state.isLowPerformance = state.isMobile || isLowEndGPU || isOldDevice || isLowMemory;

    // Apply low performance mode if needed
    if (state.isLowPerformance) {
      DOM.body?.classList.add('low-performance');
      CONFIG.PARTICLE_COUNT = 30;
    }

    return state.isLowPerformance;
  }

  // ============================================
  // LOADING SCREEN
  // ============================================
  const LoadingManager = {
    progress: 0,

    setProgress(value) {
      this.progress = Math.min(100, Math.max(0, value));
      if (DOM.loadingProgressBar) {
        DOM.loadingProgressBar.style.width = `${this.progress}%`;
      }
      if (DOM.loadingPercent) {
        DOM.loadingPercent.textContent = `${Math.round(this.progress)}%`;
      }
    },

    complete() {
      this.setProgress(100);
      setTimeout(() => {
        if (DOM.loadingScreen) {
          DOM.loadingScreen.classList.add('hidden');
        }
        DOM.body?.classList.remove('loading');

        // Trigger page transition
        setTimeout(() => {
          if (DOM.pageTransition) {
            DOM.pageTransition.classList.add('active');
          }
        }, 200);

        // Trigger hero animations
        triggerHeroAnimations();
      }, 500);
    },

    init() {
      DOM.body?.classList.add('loading');

      // Simulate progress while loading resources
      const stages = [20, 40, 60, 80, 95];
      let stageIndex = 0;

      const progressInterval = setInterval(() => {
        if (stageIndex < stages.length) {
          this.setProgress(stages[stageIndex]);
          stageIndex++;
        } else {
          clearInterval(progressInterval);
        }
      }, 300);
    }
  };

  function triggerHeroAnimations() {
    const heroElements = document.querySelectorAll('.hero-tag, .hero-title, .hero-sub, .hero-cta, .hero-scroll-indicator');
    heroElements.forEach(el => {
      el.style.animationPlayState = 'running';
    });
  }

  // ============================================
  // CUSTOM CURSOR
  // ============================================
  const CursorManager = {
    mouseX: 0,
    mouseY: 0,
    cursorX: 0,
    cursorY: 0,
    trailX: 0,
    trailY: 0,

    init() {
      if (state.isLowPerformance || !DOM.cursorMain || !DOM.cursorTrail) return;

      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      });

      // Hover effects
      const hoverTargets = document.querySelectorAll('a, button, .glass-card, input, select, textarea, [role="button"]');
      hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
          DOM.cursorMain?.classList.add('hovering');
          DOM.cursorTrail?.classList.add('hovering');
        });
        target.addEventListener('mouseleave', () => {
          DOM.cursorMain?.classList.remove('hovering');
          DOM.cursorTrail?.classList.remove('hovering');
        });
      });

      this.animate();
    },

    animate() {
      if (state.isLowPerformance) return;

      // Smooth follow
      this.cursorX += (this.mouseX - this.cursorX) * 0.15;
      this.cursorY += (this.mouseY - this.cursorY) * 0.15;
      this.trailX += (this.mouseX - this.trailX) * 0.08;
      this.trailY += (this.mouseY - this.trailY) * 0.08;

      if (DOM.cursorMain) {
        DOM.cursorMain.style.transform = `translate(${this.cursorX - 6}px, ${this.cursorY - 6}px)`;
      }
      if (DOM.cursorTrail) {
        DOM.cursorTrail.style.transform = `translate(${this.trailX - 20}px, ${this.trailY - 20}px)`;
      }

      requestAnimationFrame(() => this.animate());
    }
  };

  // ============================================
  // 3D SCENE (Three.js Light Implementation)
  // ============================================
  const Scene3D = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,

    init() {
      if (state.isLowPerformance || !DOM.webglContainer) return;

      // Create canvas
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'scene-canvas';
      this.canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      `;
      DOM.webglContainer.appendChild(this.canvas);

      this.ctx = this.canvas.getContext('2d');
      this.resize();

      window.addEventListener('resize', () => this.resize());

      this.createParticles();
      this.animate();
    },

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    createParticles() {
      const count = state.isLowPerformance ? 30 : CONFIG.PARTICLE_COUNT;
      this.particles = [];

      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          radius: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.2,
          pulse: Math.random() * Math.PI * 2
        });
      }
    },

    animate() {
      if (!this.ctx || !this.canvas) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Mouse parallax offset
      const parallaxX = (state.mouseX - this.canvas.width / 2) * 0.02;
      const parallaxY = (state.mouseY - this.canvas.height / 2) * 0.02;

      // Update and draw particles
      this.particles.forEach(p => {
        // Update position
        p.x += p.speedX + parallaxX * 0.01;
        p.y += p.speedY + parallaxY * 0.01;
        p.pulse += 0.02;

        // Wrap around edges
        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
        if (p.y < 0) p.y = this.canvas.height;
        if (p.y > this.canvas.height) p.y = 0;

        // Pulse opacity
        const pulseOpacity = p.opacity + Math.sin(p.pulse) * 0.2;

        // Draw particle with glow
        const gradient = this.ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius * 4
        );
        gradient.addColorStop(0, `rgba(201, 168, 76, ${pulseOpacity})`);
        gradient.addColorStop(0.5, `rgba(201, 168, 76, ${pulseOpacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(201, 168, 76, 0)');

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Core
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(201, 168, 76, ${pulseOpacity + 0.3})`;
        this.ctx.fill();
      });

      // Draw connections between nearby particles
      this.ctx.strokeStyle = 'rgba(201, 168, 76, 0.05)';
      this.ctx.lineWidth = 0.5;

      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            this.ctx.globalAlpha = (120 - dist) / 120 * 0.15;
            this.ctx.beginPath();
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
          }
        }
      }
      this.ctx.globalAlpha = 1;

      // Add volumetric light effect in hero section
      this.drawVolumetricLight();

      this.animationId = requestAnimationFrame(() => this.animate());
    },

    drawVolumetricLight() {
      // Create god rays effect
      const gradient = this.ctx.createRadialGradient(
        this.canvas.width * 0.7, 0,
        0,
        this.canvas.width * 0.7, 0,
        this.canvas.height * 0.8
      );
      gradient.addColorStop(0, 'rgba(201, 168, 76, 0.03)');
      gradient.addColorStop(0.3, 'rgba(201, 168, 76, 0.01)');
      gradient.addColorStop(1, 'rgba(201, 168, 76, 0)');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  };

  // ============================================
  // PARALLAX EFFECTS
  // ============================================
  const ParallaxManager = {
    elements: [],

    init() {
      this.elements = document.querySelectorAll('[data-parallax]');
      if (this.elements.length === 0) return;

      window.addEventListener('scroll', () => this.update(), { passive: true });
    },

    update() {
      const scrolled = window.pageYOffset;

      this.elements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    }
  };

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================
  const ScrollAnimations = {
    observer: null,

    init() {
      // Create Intersection Observer for reveal animations
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      }, options);

      // Observe all reveal elements
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        this.observer.observe(el);
      });
    },

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  };

  // ============================================
  // NAVBAR
  // ============================================
  const NavbarManager = {
    isScrolled: false,
    isOpen: false,

    init() {
      window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

      // Mobile toggle
      if (DOM.navToggle) {
        DOM.navToggle.addEventListener('click', () => this.toggle());
      }

      // Close menu on link click
      DOM.navLinks?.forEach(link => {
        link.addEventListener('click', () => this.close());
      });

      // Close menu on click outside
      document.addEventListener('click', (e) => {
        if (this.isOpen && !DOM.navMenu?.contains(e.target) && !DOM.navToggle?.contains(e.target)) {
          this.close();
        }
      });

      // Update active link on scroll
      this.initActiveLinkObserver();
    },

    handleScroll() {
      const scrolled = window.scrollY > CONFIG.SCROLL_THRESHOLD;

      if (scrolled !== this.isScrolled) {
        this.isScrolled = scrolled;
        DOM.navbar?.classList.toggle('scrolled', scrolled);
      }
    },

    toggle() {
      this.isOpen = !this.isOpen;
      DOM.navToggle?.classList.toggle('active', this.isOpen);
      DOM.navMenu?.classList.toggle('open', this.isOpen);
      DOM.navToggle?.setAttribute('aria-expanded', String(this.isOpen));

      // Prevent body scroll when menu is open
      DOM.body?.classList.toggle('no-scroll', this.isOpen);
    },

    close() {
      this.isOpen = false;
      DOM.navToggle?.classList.remove('active');
      DOM.navMenu?.classList.remove('open');
      DOM.navToggle?.setAttribute('aria-expanded', 'false');
      DOM.body?.classList.remove('no-scroll');
    },

    initActiveLinkObserver() {
      const sections = document.querySelectorAll('section[id]');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            DOM.navLinks?.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      }, {
        rootMargin: '-20% 0px -70% 0px'
      });

      sections.forEach(section => observer.observe(section));
    }
  };

  // ============================================
  // BACK TO TOP
  // ============================================
  const BackToTop = {
    init() {
      if (!DOM.backToTop) return;

      window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
      DOM.backToTop.addEventListener('click', () => this.scrollToTop());
    },

    handleScroll() {
      const visible = window.scrollY > 400;
      DOM.backToTop?.classList.toggle('visible', visible);
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // ============================================
  // ROOMS DATA LOADER
  // ============================================
  const RoomsLoader = {
    async load() {
      try {
        const response = await fetch(CONFIG.ROOMS_JSON_PATH);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid or empty rooms data');
        }

        state.roomsData = data;
        LoadingManager.setProgress(100);
        return this.render();

      } catch (error) {
        console.error('Failed to load rooms:', error);
        return this.renderError(error.message);
      }
    },

    render() {
      if (!DOM.roomsGrid || state.roomsData.length === 0) return;

      // Create room cards with stagger animation
      DOM.roomsGrid.innerHTML = '';

      state.roomsData.forEach((room, index) => {
        const card = this.createRoomCard(room, index);
        DOM.roomsGrid.appendChild(card);
      });

      // Add reveal animation classes
      setTimeout(() => {
        DOM.roomsGrid.querySelectorAll('.room-card').forEach((card, i) => {
          card.style.animationDelay = `${i * 0.1}s`;
        });
      }, 100);
    },

    createRoomCard(room, index) {
      const card = document.createElement('div');
      card.className = 'room-card glass-card reveal';
      card.dataset.roomId = room.id;

      card.innerHTML = `
        <div class="room-img">
          <img src="${room.images[0]}" alt="${room.name}" loading="lazy">
        </div>
        <div class="room-info">
          <h3>${room.name}</h3>
          <p class="room-description">${room.description}</p>
          <span class="room-price">${room.price} <small>${room.currency}</small></span>
          <span class="room-status ${room.available ? 'available' : 'unavailable'}">
            ${room.available ? 'متاحة' : 'محجوزة'}
          </span>
          <div class="room-services-preview">
            ${room.services.slice(0, 4).map(s => `<span title="${s}">✦</span>`).join('')}
          </div>
          <button class="btn btn-sm-gold" data-room-id="${room.id}" style="margin-top: 12px;">
            عرض التفاصيل
          </button>
        </div>
      `;

      // Add 3D tilt effect on mouse move
      this.addTiltEffect(card);

      // Click events
      const btn = card.querySelector('.btn-sm-gold');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        ModalManager.open(room.id);
      });

      card.addEventListener('click', () => {
        ModalManager.open(room.id);
      });

      return card;
    },

    addTiltEffect(card) {
      if (state.isMobile || state.isLowPerformance) return;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    },

    renderError(message) {
      if (!DOM.roomsGrid) return;

      DOM.roomsGrid.innerHTML = `
        <div class="error-message" style="grid-column: 1/-1;">
          <h3>عذراً، حدث خطأ</h3>
          <p>لم نتمكن من تحميل بيانات الغرف. يرجى التحقق من اتصالك بالإنترنت أو المحاولة لاحقاً.</p>
          <button class="btn btn-outline-gold" onclick="location.reload()">
            إعادة المحاولة
          </button>
        </div>
      `;
    }
  };

  // ============================================
  // MODAL MANAGER
  // ============================================
  const ModalManager = {
    currentRoom: null,
    currentImageIndex: 0,
    galleryInterval: null,

    open(roomId) {
      const room = state.roomsData.find(r => r.id === roomId);
      if (!room) return;

      this.currentRoom = room;
      this.currentImageIndex = 0;

      this.renderContent(room);
      DOM.modal?.classList.add('active');
      DOM.body?.classList.add('no-scroll');

      // Add keyboard listener
      document.addEventListener('keydown', this.handleKeydown);
    },

    close() {
      DOM.modal?.classList.remove('active');
      DOM.body?.classList.remove('no-scroll');
      this.clearGalleryAutoplay();

      // Remove keyboard listener
      document.removeEventListener('keydown', this.handleKeydown);

      // Reset booking page
      const bookingPage = document.getElementById('bookingPage');
      if (bookingPage) {
        bookingPage.classList.remove('active');
      }
    },

    renderContent(room) {
      if (!DOM.modalBody) return;

      DOM.modalBody.innerHTML = `
        <button class="modal-close" id="modalCloseInner">✕</button>

        <h2 style="color: var(--gold-400); margin-bottom: 8px;">${room.name}</h2>
        <p>${room.description}</p>

        <!-- Gallery -->
        <div class="modal-gallery-main" id="galleryMain">
          <img class="main-slide" id="mainSlide" src="${room.images[0]}" alt="${room.name}">
          <button class="gallery-nav prev" id="galleryPrev">‹</button>
          <button class="gallery-nav next" id="galleryNext">›</button>
        </div>

        <div class="modal-gallery-thumbs" id="galleryThumbs">
          ${room.images.map((img, idx) => `
            <img src="${img}" alt="${room.name} ${idx + 1}" data-index="${idx}" class="${idx === 0 ? 'active-thumb' : ''}">
          `).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin: 16px 0;">
          <span style="font-size: 1.8rem; color: var(--gold-400);">${room.price} ${room.currency}</span>
          <span class="room-status ${room.available ? 'available' : 'unavailable'}">
            ${room.available ? '✅ متاحة' : '❌ محجوزة'}
          </span>
        </div>

        <div class="modal-services">
          ${room.services.map(s => `<span>${s}</span>`).join('')}
        </div>

        <div style="margin-top: 20px; border-top: 1px solid rgba(201,168,76,0.15); padding-top: 20px;">
          <button class="btn btn-gold btn-full" id="showBookingBtn" ${!room.available ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            ${room.available ? 'احجز الآن' : 'غير متاحة للحجز'}
          </button>
        </div>

        <!-- Booking Page -->
        <div class="booking-page" id="bookingPage">
          <div class="booking-header">
            <h3>حجز الغرفة</h3>
            <button class="btn btn-outline-gold" id="closeBookingBtn" style="padding: 6px 20px; font-size: 0.85rem;">✕ إغلاق</button>
          </div>
          ${this.createBookingForm(room)}
        </div>
      `;

      // Initialize gallery events
      this.initGallery();

      // Initialize booking events
      this.initBooking(room);

      // Close button event
      document.getElementById('modalCloseInner')?.addEventListener('click', () => this.close());
    },

    createBookingForm(room) {
      return `
        <form class="booking-form" id="bookingForm">
          <input type="hidden" name="roomName" value="${room.name}">
          <input type="hidden" name="roomPrice" value="${room.price}">

          <div class="form-group">
            <label for="guestName">الاسم الكامل</label>
            <input type="text" id="guestName" name="guestName" placeholder="أدخل اسمك" required>
          </div>

          <div class="form-group">
            <label for="guestPhone">رقم الهاتف (واتساب)</label>
            <input type="tel" id="guestPhone" name="guestPhone" placeholder="05xxxxxxxx" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="adults">عدد البالغين</label>
              <input type="number" id="adults" name="adults" min="1" max="10" value="2" required>
            </div>
            <div class="form-group">
              <label for="children">عدد الأطفال</label>
              <input type="number" id="children" name="children" min="0" max="6" value="0">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="checkin">تاريخ الوصول</label>
              <input type="date" id="checkin" name="checkin" required>
            </div>
            <div class="form-group">
              <label for="checkout">تاريخ المغادرة</label>
              <input type="date" id="checkout" name="checkout" required>
            </div>
          </div>

          <button type="submit" class="btn btn-gold btn-full" style="margin-top: 8px;">
            إرسال الحجز عبر واتساب
          </button>

          <div id="formMessage" class="form-message"></div>
        </form>
      `;
    },

    initGallery() {
      const mainSlide = document.getElementById('mainSlide');
      const thumbs = document.querySelectorAll('#galleryThumbs img');
      const prevBtn = document.getElementById('galleryPrev');
      const nextBtn = document.getElementById('galleryNext');

      if (!mainSlide || !this.currentRoom) return;

      // Click on main image to open lightbox
      mainSlide.addEventListener('click', () => {
        LightboxManager.open(mainSlide.src);
      });

      // Navigation buttons
      prevBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateGallery(-1);
      });

      nextBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateGallery(1);
      });

      // Thumbnail clicks
      thumbs.forEach(thumb => {
        thumb.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(thumb.dataset.index);
          this.setGalleryImage(index);
        });
      });

      // Touch swipe for gallery
      this.initGallerySwipe();
    },

    navigateGallery(direction) {
      if (!this.currentRoom) return;

      let newIndex = this.currentImageIndex + direction;
      if (newIndex < 0) newIndex = this.currentRoom.images.length - 1;
      if (newIndex >= this.currentRoom.images.length) newIndex = 0;

      this.setGalleryImage(newIndex);
    },

    setGalleryImage(index) {
      if (!this.currentRoom) return;

      this.currentImageIndex = index;
      const mainSlide = document.getElementById('mainSlide');
      const thumbs = document.querySelectorAll('#galleryThumbs img');

      if (mainSlide) {
        mainSlide.style.opacity = '0';
        setTimeout(() => {
          mainSlide.src = this.currentRoom.images[index];
          mainSlide.style.opacity = '1';
        }, 150);
      }

      thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('active-thumb', i === index);
      });
    },

    initGallerySwipe() {
      const galleryMain = document.getElementById('galleryMain');
      if (!galleryMain) return;

      let startX = 0;
      let startY = 0;
      let isDragging = false;

      galleryMain.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
      }, { passive: true });

      galleryMain.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        // Prevent scroll while swiping
        const diffX = Math.abs(e.touches[0].clientX - startX);
        const diffY = Math.abs(e.touches[0].clientY - startY);
        if (diffX > diffY) {
          e.preventDefault();
        }
      }, { passive: false });

      galleryMain.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;

        const endX = e.changedTouches[0].clientX;
        const diffX = endX - startX;

        if (Math.abs(diffX) > 50) {
          if (diffX > 0) {
            this.navigateGallery(-1); // Swipe right = previous
          } else {
            this.navigateGallery(1); // Swipe left = next
          }
        }
      }, { passive: true });
    },

    clearGalleryAutoplay() {
      if (this.galleryInterval) {
        clearInterval(this.galleryInterval);
        this.galleryInterval = null;
      }
    },

    initBooking(room) {
      const showBtn = document.getElementById('showBookingBtn');
      const closeBtn = document.getElementById('closeBookingBtn');
      const bookingPage = document.getElementById('bookingPage');
      const form = document.getElementById('bookingForm');

      showBtn?.addEventListener('click', () => {
        if (room.available && bookingPage) {
          bookingPage.classList.add('active');

          // Set min dates
          const today = new Date().toISOString().split('T')[0];
          const checkin = document.getElementById('checkin');
          const checkout = document.getElementById('checkout');

          if (checkin) checkin.min = today;
          if (checkout) checkout.min = today;
        }
      });

      closeBtn?.addEventListener('click', () => {
        bookingPage?.classList.remove('active');
      });

      form?.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleBookingSubmit(room);
      });
    },

    handleBookingSubmit(room) {
      const form = document.getElementById('bookingForm');
      const msgDiv = document.getElementById('formMessage');

      if (!form) return;

      const name = form.guestName?.value.trim();
      const phone = form.guestPhone?.value.trim();
      const adults = form.adults?.value;
      const children = form.children?.value || '0';
      const checkin = form.checkin?.value;
      const checkout = form.checkout?.value;

      // Validation
      if (!name || !phone || !checkin || !checkout) {
        this.showFormMessage('يرجى ملء جميع الحقول المطلوبة.', 'error');
        return;
      }

      if (phone.length < 9) {
        this.showFormMessage('رقم الهاتف غير صحيح.', 'error');
        return;
      }

      if (checkout <= checkin) {
        this.showFormMessage('تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول.', 'error');
        return;
      }

      // Create WhatsApp message
      const message = `🌹 *طلب حجز - إطلالة العزيزيه* 🌹%0A%0A` +
        `🏨 *الغرفة:* ${room.name}%0A` +
        `👤 *الاسم:* ${name}%0A` +
        `📞 *الجوال:* ${phone}%0A` +
        `👨 *البالغين:* ${adults}%0A` +
        `👶 *الأطفال:* ${children}%0A` +
        `📅 *الوصول:* ${checkin}%0A` +
        `📅 *المغادرة:* ${checkout}%0A` +
        `💰 *السعر:* ${room.price} SAR%0A%0A` +
        `✨ *شكراً لاختياركم إطلالة العزيزيه* ✨`;

      // Open WhatsApp
      window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`, '_blank');

      this.showFormMessage('✅ جاري تحويلك إلى واتساب...', 'success');

      setTimeout(() => {
        this.showFormMessage('', '');
      }, 5000);
    },

    showFormMessage(text, type) {
      const msgDiv = document.getElementById('formMessage');
      if (!msgDiv) return;

      if (text) {
        msgDiv.textContent = text;
        msgDiv.className = `form-message ${type}`;
      } else {
        msgDiv.className = 'form-message';
        msgDiv.textContent = '';
      }
    },

    handleKeydown: (e) => {
      if (!DOM.modal?.classList.contains('active')) return;

      switch (e.key) {
        case 'Escape':
          ModalManager.close();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          ModalManager.navigateGallery(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          ModalManager.navigateGallery(1);
          break;
      }
    }
  };

  // ============================================
  // LIGHTBOX MANAGER
  // ============================================
  const LightboxManager = {
    open(src) {
      if (!DOM.lightboxOverlay || !DOM.lightboxImg) return;

      DOM.lightboxImg.src = src;
      DOM.lightboxOverlay.classList.add('active');
      DOM.body?.classList.add('no-scroll');

      document.addEventListener('keydown', this.handleKeydown);
    },

    close() {
      DOM.lightboxOverlay?.classList.remove('active');
      DOM.body?.classList.remove('no-scroll');

      document.removeEventListener('keydown', this.handleKeydown);
    },

    handleKeydown: (e) => {
      if (e.key === 'Escape') {
        LightboxManager.close();
      }
    },

    init() {
      DOM.lightboxOverlay?.addEventListener('click', () => this.close());
    }
  };

  // ============================================
  // RIPPLE EFFECT
  // ============================================
  const RippleEffect = {
    init() {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn-gold, .btn-sm-gold, .btn-outline-gold, .btn');
        if (!target) return;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        target.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    }
  };

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = anchor.getAttribute('href');
          const target = document.querySelector(targetId);

          if (target) {
            const offsetTop = target.offsetTop - 80;

            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  };

  // ============================================
  // MOUSE TRACKING
  // ============================================
  const MouseTracker = {
    init() {
      document.addEventListener('mousemove', (e) => {
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
      });
    }
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  async function init() {
    // Cache DOM elements
    cacheDOMElements();

    // Detect performance capabilities
    detectPerformance();

    // Initialize loading screen
    LoadingManager.init();

    // Initialize mouse tracking
    MouseTracker.init();

    // Load rooms data
    await RoomsLoader.load();

    // Complete loading
    LoadingManager.complete();

    // Initialize all managers
    Scene3D.init();
    CursorManager.init();
    NavbarManager.init();
    BackToTop.init();
    ParallaxManager.init();
    ScrollAnimations.init();
    LightboxManager.init();
    RippleEffect.init();
    SmoothScroll.init();

    // Setup modal events
    DOM.modalClose?.addEventListener('click', () => ModalManager.close());
    DOM.modal?.addEventListener('click', (e) => {
      if (e.target === DOM.modal) {
        ModalManager.close();
      }
    });

    console.log('✨ إطلالة العزيزيه - Premium Luxury Hotel initialized');
  }

  // ============================================
  // GLOBAL ERROR HANDLER
  // ============================================
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
  });

  // ============================================
  // START
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
