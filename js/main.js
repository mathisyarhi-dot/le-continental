(() => {
  'use strict';
  const lang = document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'fr';

  /* ── Badge ouvert / fermé (recalculé toutes les 60s) ── */
  function updateOpenBadge() {
    const el = document.getElementById('open-badge');
    if (!el) return;
    const hour = new Date().getHours();
    const isOpen = hour >= 9 || hour < 1;
    el.textContent =
      lang === 'fr'
        ? isOpen
          ? "Ouvert maintenant · jusqu'à minuit"
          : 'Fermé · ouvre à 9h00'
        : isOpen
          ? 'Open now · until midnight'
          : 'Closed · opens at 9:00 am';
  }
  updateOpenBadge();
  setInterval(updateOpenBadge, 60000);

  /* ── Burger / nav mobile ── */
  const burgerBtn = document.getElementById('burger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  function closeMobileNav() {
    mobileNav?.setAttribute('hidden', '');
    burgerBtn?.setAttribute('aria-expanded', 'false');
  }

  burgerBtn?.addEventListener('click', () => {
    if (!mobileNav) return;
    if (mobileNav.hasAttribute('hidden')) {
      mobileNav.removeAttribute('hidden');
      burgerBtn.setAttribute('aria-expanded', 'true');
    } else {
      closeMobileNav();
    }
  });
  mobileNav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMobileNav));

  /* ── Onglets de la carte ── */
  const tabButtons = document.querySelectorAll('#carte [data-cat-btn]');
  const panels = document.querySelectorAll('#carte [data-cat-panel]');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.catBtn;
      tabButtons.forEach((b) => b.setAttribute('aria-selected', b === btn ? 'true' : 'false'));
      panels.forEach((panel) => {
        const isMatch = panel.dataset.catPanel === cat;
        panel.hidden = !isMatch;
        if (isMatch) {
          panel.style.animation = 'none';
          void panel.offsetWidth;
          panel.style.animation = '';
        }
      });
    });
  });

  /* ── Import de photos par le client (maquette uniquement) ──
     Chaque emplacement encore vide (media-slot sans <img>, donc sans
     vraie photo dans /photos/) devient cliquable : le restaurateur
     choisit un fichier depuis son appareil pour voir le rendu avec ses
     propres photos. Tout reste dans le navigateur (localStorage) — rien
     n'est envoyé nulle part, et ça ne touche pas les vraies photos
     livrées dans /photos/ (ces emplacements-là, déjà des <img>, ne sont
     pas concernés). */
  const STORAGE_PREFIX = 'lcsp:demo-photo:';
  const MAX_DIM = 1600;
  const JPEG_QUALITY = 0.82;

  const t = {
    fr: { add: '+ Importer une photo', change: 'Changer la photo', tooLarge: "Ce fichier n'est pas une image.", quota: "Photo trop lourde pour l'aperçu local — réessayez avec une image plus légère.", reset: 'Réinitialiser les photos importées', confirmReset: 'Retirer toutes les photos importées et revenir aux emplacements vides ?' },
    en: { add: '+ Add a photo', change: 'Change photo', tooLarge: 'This file is not an image.', quota: 'Photo too large for the local preview — try a lighter image.', reset: 'Reset imported photos', confirmReset: 'Remove all imported photos and go back to empty placeholders?' },
  }[lang];

  function resizeToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('image-load-failed'));
      };
      img.src = objectUrl;
    });
  }

  function applyPhoto(slot, dataUrl, caption) {
    slot.querySelectorAll('span').forEach((s) => s.remove());
    let img = slot.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.loading = 'lazy';
      slot.appendChild(img);
    }
    img.src = dataUrl;
    img.alt = caption;
    const chip = document.createElement('span');
    chip.className = 'media-slot-add';
    chip.setAttribute('aria-hidden', 'true');
    chip.textContent = t.change;
    slot.appendChild(chip);
    slot.classList.add('has-photo');
  }

  const resetBtn = document.getElementById('reset-demo-photos');

  function updateResetVisibility() {
    if (!resetBtn) return;
    const any = Object.keys(localStorage).some((k) => k.startsWith(STORAGE_PREFIX));
    resetBtn.hidden = !any;
  }

  const editableSlots = Array.from(document.querySelectorAll('.media-slot[data-slot-key]')).filter((slot) => !slot.querySelector('img'));

  editableSlots.forEach((slot) => {
    const key = slot.dataset.slotKey;
    const caption = slot.dataset.caption || '';
    slot.classList.add('media-slot--upload');

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.className = 'media-slot-input';
    input.setAttribute('aria-label', `${t.add} — ${caption}`);
    slot.insertBefore(input, slot.firstChild);

    const addChip = document.createElement('span');
    addChip.className = 'media-slot-add';
    addChip.setAttribute('aria-hidden', 'true');
    addChip.textContent = t.add;
    slot.appendChild(addChip);

    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored) applyPhoto(slot, stored, caption);

    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert(t.tooLarge);
        input.value = '';
        return;
      }
      try {
        const dataUrl = await resizeToDataUrl(file);
        try {
          localStorage.setItem(STORAGE_PREFIX + key, dataUrl);
        } catch {
          alert(t.quota);
          return;
        }
        applyPhoto(slot, dataUrl, caption);
        updateResetVisibility();
      } catch {
        alert(t.tooLarge);
      } finally {
        input.value = '';
      }
    });
  });

  if (resetBtn) {
    resetBtn.textContent = t.reset;
    updateResetVisibility();
    resetBtn.addEventListener('click', () => {
      if (!confirm(t.confirmReset)) return;
      Object.keys(localStorage)
        .filter((k) => k.startsWith(STORAGE_PREFIX))
        .forEach((k) => localStorage.removeItem(k));
      location.reload();
    });
  }
})();
