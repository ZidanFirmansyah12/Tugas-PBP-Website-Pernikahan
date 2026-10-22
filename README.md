# Mario & Princess Peach — Digital Wedding Invitation

Project tugas HTML, CSS, Bootstrap, dan JavaScript.

## Fitur
- Pilihan suara (menyala / mati) saat pertama dibuka
- Opening / cover invitation
- Nama tamu dinamis melalui URL
- Hero section
- Profil Mario & Princess Peach (klik untuk memilih mempelai)
- Love story / timeline
- Countdown menuju hari pernikahan
- Detail akad dan resepsi (lokasi berupa teks, tanpa Google Maps) + tombol salin lokasi
- Galeri foto dengan lightbox (thumbnail, panah keyboard, swipe, layar penuh)
- RSVP
- Ucapan & doa menggunakan localStorage
- Tombol musik
- Responsive untuk HP, tablet, dan desktop
- Bootstrap 5

## Struktur folder
```
mario-peach-wedding/
├── index.html      # struktur halaman
├── style.css       # gaya, diurutkan sesuai urutan section di halaman
├── script.js       # logika, satu fungsi init per fitur
├── README.md
└── assets/         # gambar (jpg/png), ornamen (svg), dan music.mp3
```

## Cara menjalankan
1. Buka `index.html` di browser.
2. Atau gunakan Live Server di VS Code agar lebih nyaman.

Butuh koneksi internet saat pertama dibuka karena Bootstrap, Bootstrap Icons,
dan Google Fonts dimuat lewat CDN.

## Mengubah data undangan
| Yang diubah | Lokasi |
|---|---|
| Tanggal & jam countdown | `WEDDING_DATE` di bagian atas `script.js` (zona waktu WIB) |
| Nama mempelai, orang tua, lokasi acara | `index.html` |
| Warna | variabel di `:root` pada `style.css` |
| Musik | ganti file `assets/music.mp3` |

## Nama tamu
Tambahkan parameter `?to=` pada URL.

Contoh:
`index.html?to=Fahmi`

## Catatan tugas
RSVP dan ucapan pada versi ini adalah demo front-end. Ucapan disimpan di browser
menggunakan localStorage (bukan database online), sedangkan RSVP hanya menampilkan
pesan konfirmasi.

## Aset gambar
Folder `assets/` berisi foto galeri (`gallery1.jpg`–`gallery6.jpg`), foto hero (`title.jpg`),
karakter (`mario.png`, `peach.png`), dan ilustrasi SVG dekorasi (jamur, bintang, hati, bunga,
cincin, awan, istana, topi, mahkota, bata).

Catatan: Gambar bertema Mario & Peach adalah milik Nintendo
