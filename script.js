/* ==========================================================
   Mario & Peach — Digital Wedding Invitation

   Struktur file:
   1. Konfigurasi
   2. Helper (DOM, toast, localStorage)
   3. Fitur (satu fungsi init per fitur)
   4. Inisialisasi
   ========================================================== */

"use strict";

/* ---------- 1. Konfigurasi ---------- */

// Waktu akad dalam WIB (UTC+7). Ubah di sini jika tanggal pernikahan berubah.
const WEDDING_DATE = new Date("2027-06-20T09:00:00+07:00");

const WISHES_STORAGE_KEY = "marioPeachWishes";
const OPENING_FADE_MS = 600;   // samakan dengan transition .opening-screen di CSS
const SOUND_GATE_FADE_MS = 500; // samakan dengan transition .sound-gate di CSS
const TOAST_MS = 2500;

/* ---------- 2. Helper ---------- */

const byId = id => document.getElementById(id);

let toastTimer;
function showToast(text) {
  const toast = byId("toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), TOAST_MS);
}

// localStorage bisa gagal (mode privat, data rusak), jadi selalu dibungkus try/catch.
function readWishes() {
  try {
    const data = JSON.parse(localStorage.getItem(WISHES_STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveWishes(wishes) {
  try {
    localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(wishes));
    return true;
  } catch {
    return false;
  }
}

/* ---------- 3. Fitur ---------- */

// Nama tamu dari URL: index.html?to=Fahmi
function initGuestName() {
  const guest = new URLSearchParams(window.location.search).get("to");
  if (guest && guest.trim()) {
    byId("guestName").textContent = guest.trim();
  }
}

// Layar pembuka -> tampilkan konten utama
function initOpening() {
  const opening = byId("opening");

  byId("openInvitation").addEventListener("click", () => {
    opening.classList.add("is-closing");
    setTimeout(() => {
      opening.remove();
      byId("mainContent").classList.remove("d-none");
      window.scrollTo(0, 0);
    }, OPENING_FADE_MS);
  }, { once: true });
}

// Hitung mundur menuju hari pernikahan
function initCountdown() {
  const fields = {
    days: byId("days"),
    hours: byId("hours"),
    minutes: byId("minutes"),
    seconds: byId("seconds"),
  };
  const pad = n => String(n).padStart(2, "0");

  function update() {
    const totalSeconds = Math.floor(Math.max(0, WEDDING_DATE - Date.now()) / 1000);
    const values = {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
    for (const [unit, el] of Object.entries(fields)) {
      el.textContent = pad(values[unit]);
    }
    if (totalSeconds === 0) clearInterval(timer);
  }

  const timer = setInterval(update, 1000);
  update();
}

// Tombol "Salin Lokasi" (teks diambil dari atribut data-location)
function initCopyLocation() {
  document.querySelectorAll("[data-location]").forEach(button => {
    button.addEventListener("click", async () => {
      const text = button.dataset.location;
      try {
        await navigator.clipboard.writeText(text);
        showToast("Lokasi berhasil disalin!");
      } catch {
        showToast(text); // clipboard tidak tersedia -> tampilkan teksnya saja
      }
    });
  });
}

// RSVP (demo front-end, data tidak disimpan)
function initRsvp() {
  const form = byId("rsvpForm");
  const message = byId("rsvpMessage");

  form.addEventListener("submit", event => {
    event.preventDefault();

    const name = byId("rsvpName").value.trim();
    const attendance = byId("attendance").value;
    const guestCount = byId("guestCount").value;

    message.textContent = `Terima kasih, ${name}! RSVP "${attendance}" (${guestCount}) berhasil dicatat.`;
    message.classList.remove("d-none");
    form.reset();
  });
}

// Ucapan & doa (disimpan di localStorage browser)
function initWishes() {
  const form = byId("wishForm");
  const list = byId("wishList");

  function createWishItem({ name, text }) {
    const item = document.createElement("div");
    item.className = "wish-item";

    const author = document.createElement("strong");
    author.textContent = name; // textContent -> aman dari injeksi HTML

    const body = document.createElement("p");
    body.textContent = text;

    item.append(author, body);
    return item;
  }

  function render() {
    list.replaceChildren(...readWishes().reverse().map(createWishItem));
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    const name = byId("wishName").value.trim();
    const text = byId("wishText").value.trim();
    if (!name || !text) return;

    const wishes = readWishes();
    wishes.push({ name, text });

    if (!saveWishes(wishes)) {
      showToast("Ucapan tidak dapat disimpan di browser ini.");
      return;
    }

    form.reset();
    render();
    showToast("Ucapan berhasil ditambahkan!");
  });

  render();
}

// Musik latar. Mengembalikan { play } agar bisa dipakai oleh pilihan suara.
function initMusic() {
  const audio = byId("weddingMusic");
  const button = byId("musicButton");
  let playing = false;

  function setPlaying(state) {
    playing = state;
    button.textContent = state ? "❚❚" : "♪";
    button.setAttribute("aria-pressed", String(state));
  }

  async function play() {
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      showToast("Musik tidak dapat diputar.");
    }
  }

  function pause() {
    audio.pause();
    setPlaying(false);
  }

  button.addEventListener("click", () => (playing ? pause() : play()));

  return { play };
}

// Pilihan suara di tampilan awal
function initSoundGate(playMusic) {
  const gate = byId("soundGate");

  function close(withSound) {
    gate.classList.add("hide");
    setTimeout(() => gate.remove(), SOUND_GATE_FADE_MS);
    if (withSound) playMusic(); // dipanggil dari klik pengguna, jadi diizinkan browser
  }

  byId("soundOn").addEventListener("click", () => close(true));
  byId("soundOff").addEventListener("click", () => close(false));
}

// Tutup menu navbar (mobile) setelah salah satu link diklik
function initNavbar() {
  const menu = byId("navMenu");

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      if (menu.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });
}

// Mempelai: klik salah satu untuk menampilkan profilnya
function initCouplePicker() {
  const buttons = document.querySelectorAll(".pick-btn");
  const panels = document.querySelectorAll(".char-panel");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const who = button.dataset.who;

      buttons.forEach(b => b.setAttribute("aria-pressed", String(b === button)));

      panels.forEach(panel => {
        const active = panel.id === `panel-${who}`;
        panel.hidden = !active;
        panel.classList.remove("show");
        if (active) {
          void panel.offsetWidth; // paksa reflow agar animasi mulai ulang
          panel.classList.add("show");
        }
      });
    });
  });
}

// Galeri: klik foto untuk membuka lightbox (Bootstrap Modal)
function initGallery() {
  const modalEl = byId("lightboxModal");
  const modal = new bootstrap.Modal(modalEl);

  const images = [...document.querySelectorAll(".gallery-grid img")];
  const imgEl = byId("lightboxImg");
  const captionEl = byId("lightboxCaption");
  const counterEl = byId("lightboxCounter");
  const thumbsEl = byId("lightboxThumbs");
  let current = 0;

  // Thumbnail
  images.forEach((img, index) => {
    const thumb = document.createElement("img");
    thumb.src = img.src;
    thumb.alt = `Foto ${index + 1}`;
    thumb.addEventListener("click", () => show(index));
    thumbsEl.appendChild(thumb);
  });
  const thumbs = [...thumbsEl.children];

  function show(index) {
    current = (index + images.length) % images.length;
    const source = images[current];

    imgEl.classList.add("fade");
    setTimeout(() => {
      imgEl.src = source.src;
      imgEl.alt = source.alt;
      captionEl.textContent = source.alt;
      imgEl.classList.remove("fade");
    }, 120);

    counterEl.textContent = `${current + 1} / ${images.length}`;
    thumbs.forEach((thumb, i) => thumb.classList.toggle("active", i === current));
    thumbs[current].scrollIntoView({ block: "nearest", inline: "center" });
  }

  // Buka dari foto di galeri (klik atau Enter/Spasi)
  images.forEach((img, index) => {
    const open = () => { show(index); modal.show(); };
    img.addEventListener("click", open);
    img.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });

  byId("lightboxPrev").addEventListener("click", () => show(current - 1));
  byId("lightboxNext").addEventListener("click", () => show(current + 1));

  byId("lightboxFull").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else modalEl.requestFullscreen?.();
  });

  // Keyboard: panah kiri/kanan saat lightbox terbuka
  document.addEventListener("keydown", event => {
    if (!modalEl.classList.contains("show")) return;
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });

  // Swipe di HP
  let startX = 0;
  modalEl.addEventListener("touchstart", event => {
    startX = event.touches[0].clientX;
  }, { passive: true });
  modalEl.addEventListener("touchend", event => {
    const deltaX = event.changedTouches[0].clientX - startX;
    if (Math.abs(deltaX) > 50) show(current + (deltaX < 0 ? 1 : -1));
  }, { passive: true });

  modalEl.addEventListener("hidden.bs.modal", () => {
    if (document.fullscreenElement) document.exitFullscreen();
  });
}

/* ---------- 4. Inisialisasi ---------- */
// (script dimuat di akhir <body>, jadi seluruh elemen sudah tersedia)

initGuestName();
initOpening();
initCountdown();
initCopyLocation();
initRsvp();
initWishes();
initNavbar();
initCouplePicker();
initGallery();

const music = initMusic();
initSoundGate(music.play);
