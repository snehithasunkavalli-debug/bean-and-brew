/* ===================================================================
   BEAN & BREW - CORE INTERACTIVITY & UI SCRIPTS (main.js)
   Navigation, Real-Time Café Status, Quiz Engine, Newsletter & Modals
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCafeLiveStatus();
  initNewsletter();
  initCoffeeQuiz();
  initTastingModal();
  initFAQ();
});

/* ================= Navigation & Mobile Menu ================= */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Sticky header shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('is-active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking outside or on a link
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        toggle.classList.remove('is-active');
      }
    });
  }

  // Set active link according to current page path
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ================= Real-Time Café Status ================= */
function initCafeLiveStatus() {
  const statusContainer = document.getElementById('liveCafeStatus');
  if (!statusContainer) return;

  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 6 is Saturday
  const currentHour = now.getHours() + (now.getMinutes() / 60);

  const isWeekend = (day === 0 || day === 6);
  const openTime = isWeekend ? 7.5 : 6.5; // 7:30 AM or 6:30 AM
  const closeTime = isWeekend ? 21.0 : 20.0; // 9:00 PM or 8:00 PM

  const isOpen = currentHour >= openTime && currentHour < closeTime;

  if (isOpen) {
    const closeDisplay = isWeekend ? '9:00 PM' : '8:00 PM';
    statusContainer.innerHTML = `
      <span class="status-pill open">
        <span class="status-dot"></span> Open Today until ${closeDisplay}
      </span>
    `;
  } else {
    const nextOpen = isWeekend ? '7:30 AM' : '6:30 AM';
    statusContainer.innerHTML = `
      <span class="status-pill closed">
        <span class="status-dot"></span> Café Opens at ${nextOpen}
      </span>
    `;
  }
}

/* ================= Newsletter Subscription ================= */
function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      const email = input?.value.trim();

      if (email && email.includes('@')) {
        if (window.cartManager) {
          window.cartManager.showToast(`✨ Welcome to the Roaster's Circle! 10% coupon "BREW10" sent to ${email}`, 'success');
        } else {
          alert('Welcome! Your 10% discount code is BREW10');
        }
        form.reset();
      } else {
        if (window.cartManager) {
          window.cartManager.showToast('Please enter a valid email address.', 'error');
        }
      }
    });
  });
}

/* ================= Interactive Coffee Taste Finder / Quiz ================= */
const QUIZ_QUESTIONS = [
  {
    title: 'How do you enjoy drinking your coffee?',
    subtitle: 'Step 1 of 3 — Preferred Profile',
    options: [
      { text: 'Pure & Black', icon: '☕', profile: 'clean' },
      { text: 'With Steamed / Oat Milk', icon: '🥛', profile: 'creamy' },
      { text: 'Over Ice & Chilled', icon: '🧊', profile: 'cold' },
      { text: 'Sweet & Syrupy', icon: '🍯', profile: 'sweet' }
    ]
  },
  {
    title: 'Which flavor notes excite your palate the most?',
    subtitle: 'Step 2 of 3 — Taste Dimensions',
    options: [
      { text: 'Jasmine, Floral & Peach Citrus', icon: '🌸', profile: 'floral' },
      { text: 'Caramel, Hazelnut & Milk Chocolate', icon: '🍫', profile: 'choc' },
      { text: 'Smoky Dark Cocoa & Roasted Walnut', icon: '🌰', profile: 'dark' },
      { text: 'Wild Berry, Vanilla & Lavender', icon: '🫐', profile: 'sweet' }
    ]
  },
  {
    title: 'What is your preferred brewing apparatus?',
    subtitle: 'Step 3 of 3 — Brewing Method',
    options: [
      { text: 'Pour Over (V60 / Chemex)', icon: '⏳', brew: 'pourover' },
      { text: 'Home Espresso Machine', icon: '⚙️', brew: 'espresso' },
      { text: 'French Press / AeroPress', icon: '🫖', brew: 'immersion' },
      { text: 'Cold Brewer / Ready to Drink', icon: '🍹', brew: 'coldbrew' }
    ]
  }
];

function initCoffeeQuiz() {
  const quizContainer = document.getElementById('coffeeQuizContainer');
  if (!quizContainer) return;

  let currentStep = 0;
  const userAnswers = [];

  function renderStep() {
    const q = QUIZ_QUESTIONS[currentStep];
    quizContainer.innerHTML = `
      <div class="quiz-box">
        <div class="text-center">
          <span class="subheading" style="color: var(--c-crema-light);">${q.subtitle}</span>
          <h2 style="color: var(--c-white); margin-bottom: 0.5rem;">${q.title}</h2>
          <div class="quiz-steps-nav">
            ${QUIZ_QUESTIONS.map((_, idx) => `
              <div class="quiz-step-indicator ${idx === currentStep ? 'active' : ''}"></div>
            `).join('')}
          </div>
        </div>

        <div class="quiz-options">
          ${q.options.map((opt, i) => `
            <button class="quiz-option-btn" data-index="${i}">
              <span class="icon">${opt.icon}</span>
              <span>${opt.text}</span>
            </button>
          `).join('')}
        </div>

        ${currentStep > 0 ? `
          <div style="text-align: center; margin-top: 1rem;">
            <button class="btn btn-outline-light btn-sm" id="quizPrevBtn">← Back to previous question</button>
          </div>
        ` : ''}
      </div>
    `;

    // Bind option click
    quizContainer.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        userAnswers[currentStep] = q.options[idx];

        if (currentStep < QUIZ_QUESTIONS.length - 1) {
          currentStep++;
          renderStep();
        } else {
          renderResult();
        }
      });
    });

    const prevBtn = document.getElementById('quizPrevBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
          currentStep--;
          renderStep();
        }
      });
    }
  }

  function renderResult() {
    // Intelligent recommendation logic based on choices
    let recProductId = 'colombian-huila-reserve';
    const first = userAnswers[0];
    const second = userAnswers[1];

    if (second.profile === 'floral' || first.profile === 'clean') {
      recProductId = 'ethiopian-yirgacheffe';
    } else if (second.profile === 'dark') {
      recProductId = 'sumatra-mandheling-dark';
    } else if (first.profile === 'creamy' || first.profile === 'sweet') {
      recProductId = 'signature-espresso-blend';
    }

    const rec = (window.COFFEE_PRODUCTS || []).find(p => p.id === recProductId) || window.COFFEE_PRODUCTS[0];

    quizContainer.innerHTML = `
      <div class="quiz-box">
        <div class="text-center">
          <span class="subheading" style="color: var(--c-crema-light);">Curated Taste Match</span>
          <h2 style="color: var(--c-white); margin-bottom: 0.75rem;">Your Signature Roast Awaits</h2>
          <p style="color: #dfd3c8; max-width: 550px; margin: 0 auto 2rem;">
            Based on your answers, our master roastmaster curated this bespoke profile specifically suited to your palate and daily ritual:
          </p>
        </div>

        <div style="background: rgba(255,255,255,0.08); border: 1.5px solid var(--c-crema); border-radius: var(--radius-lg); padding: 2rem; display: flex; flex-wrap: wrap; gap: 2rem; align-items: center;">
          <img src="${rec.image}" alt="${rec.name}" style="width: 140px; height: 140px; border-radius: var(--radius-md); object-fit: cover;" />
          <div style="flex: 1; min-width: 250px;">
            <div style="display:flex; gap:0.5rem; margin-bottom: 0.4rem;">
              <span class="tag" style="background: var(--c-crema); color: var(--c-espresso); font-weight:700;">${rec.roast}</span>
              <span class="tag" style="background: rgba(255,255,255,0.15); color: #fff;">${rec.origin}</span>
            </div>
            <h3 style="color: var(--c-white); font-size: 1.5rem; margin-bottom: 0.3rem;">${rec.name}</h3>
            <p style="color: var(--c-crema-light); font-size: 0.95rem; margin-bottom: 0.8rem;">
              <strong>Tasting Notes:</strong> ${rec.notes}
            </p>
            <p style="color: #c9bdb3; font-size: 0.9rem; margin-bottom: 1.25rem;">
              ${rec.description}
            </p>
            <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
              <span style="font-size: 1.5rem; font-weight: 800; color: var(--c-crema); font-family: var(--font-serif);">$${rec.price.toFixed(2)}</span>
              <button class="btn btn-primary" onclick="window.cartManager.addItem('${rec.id}');">
                Add Match to Cart
              </button>
              <button class="btn btn-outline-light btn-sm" id="restartQuizBtn">
                Retake Quiz ↺
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('restartQuizBtn')?.addEventListener('click', () => {
      currentStep = 0;
      userAnswers.length = 0;
      renderStep();
    });
  }

  renderStep();
}

/* ================= Tasting Notes Modal ================= */
function initTastingModal() {
  if (!document.getElementById('tastingModalOverlay')) {
    const modalHTML = `
      <div class="modal-overlay" id="tastingModalOverlay">
        <div class="modal-content" style="max-width: 580px;">
          <div class="modal-header">
            <h3 id="tastingModalTitle">Coffee Tasting Dossier</h3>
            <button class="close-btn" id="closeTastingModalBtn">&times;</button>
          </div>
          <div class="modal-body" id="tastingModalBody">
            <!-- Dynamic Content -->
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  const overlay = document.getElementById('tastingModalOverlay');
  const closeBtn = document.getElementById('closeTastingModalBtn');

  if (overlay && closeBtn) {
    closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  }

  window.openTastingNotes = function(productId) {
    const product = (window.COFFEE_PRODUCTS || []).find(p => p.id === productId);
    if (!product) return;

    const body = document.getElementById('tastingModalBody');
    body.innerHTML = `
      <div style="display:flex; gap:1.5rem; margin-bottom: 1.5rem; align-items: center;">
        <img src="${product.image}" alt="${product.name}" style="width: 120px; height: 120px; border-radius: var(--radius-md); object-fit: cover;" />
        <div>
          <span class="subheading">${product.roast}</span>
          <h3 style="font-size: 1.4rem; margin-bottom: 0.3rem;">${product.name}</h3>
          <p style="font-size: 0.85rem; color: var(--c-crema-hover); font-weight:600;">📍 ${product.origin}</p>
        </div>
      </div>
      <div style="background: var(--c-cream-bg); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
        <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--c-text-muted); margin-bottom: 0.3rem;">Cupping Notes:</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--c-roast);">${product.notes}</div>
      </div>
      <p style="color: var(--c-text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">
        ${product.description}
      </p>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--c-border); padding-top: 1rem;">
        <span style="font-size: 1.4rem; font-weight: 800; color: var(--c-roast); font-family: var(--font-serif);">$${product.price.toFixed(2)}</span>
        <button class="btn btn-primary" onclick="window.cartManager.addItem('${product.id}'); document.getElementById('tastingModalOverlay').classList.remove('open');">
          Add To Basket
        </button>
      </div>
    `;

    overlay.classList.add('open');
  };
}

/* ================= FAQ Accordion ================= */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other FAQs in the same group
      item.parentElement.querySelectorAll('.faq-item').forEach(other => {
        other.classList.remove('active');
        other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
