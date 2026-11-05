# Tanlov Mahallasi - 3D Cyberpunk City Builder 🏙️✨

Mobil va kompyuterlar uchun mo'ljallangan futuristik 3D izometrik shahar qurish o'yini va Hokimiyat tizimli nazorat paneli.

---

## ⚡ Asosiy xususiyatlar

- **🎮 Interaktiv Shaharsozlik**:
  - Oddiy uy ($30)
  - Biznes binosi ($60)
  - Osmono'par bino (1 qavat $20, 20 qavat $120, 100 qavat $200)
  - Daraxt ($10), Yo'l ($5), Favvorali Park ($25)
  - Kiber fasad ranglari ($10 - $30)
  - 3D Izometrik va 2D tekis ko'rinish rejimi
  - Kunduzgi, Quyosh botishi (Sunset) va Tungi kiber-neon yorug'liklar
- **🤖 4 ta AI Agent**:
  - **Sardor** (Arxitektor / Dizayner 1) - Moviy neon fasadlari
  - **Laylo** (Dizayner 2) - Qirol binafshasi fasadlari
  - **Usta Rustam** - Aholi o'sishi bilan hududni avtomatik 16x16 gacha kengaytiradi
  - **Jamshid** - Hokimning bosh yordamchisi va hisoboti
- **👑 Hokim Huquqi (God-Mode)**:
  - Cheksiz byudjet, bepul binolar, shahar festivali va maxsus farmoyishlar
- **💾 Har soniya avtomatik saqlash**:
  - Har 1 soniyada va har bir foydalanuvchi harakatida (bino qurish, buzish, rang berish) `localStorage`ga to'liq saqlanadi
  - Sahifa yangilanganda barcha o'zgarishlar saqlanib qoladi
- **📸 Instagram Niklari Integratsiyasi**:
  - Har bir bino fuqarolarining Instagram niki (`@...`) bilan bog'langan
- **📧 Bog'lanish**:
  - Email: `tanlovmahallasi@gmail.com`
  - Rasmiy Instagram: `https://instagram.com/tanlovmahallasi`

---

## 🔑 API Kalit kerakmi? (Savolga javob)

**YO'Q! Ushbu ilovada hech qanday tashqi API kalit (IP/API Key) talab qilinmaydi.**
Barcha o'yin mantig'i, audio sintezatori (Web Audio API), grafiklar va ma'lumotlar saqlanishi to'liq foydalanuvchi brauzerining o'zida ishlaydi. Hech qanday maxfiy kalitlar yoki pullik xizmatlar ulanmagan.

---

## 🚀 Mahalliy kompyuterda ishga tushirish

1. Ushbu loyihani yuklab oling yoki klon qiling:
   ```bash
   git clone <REPO_URL>
   cd applet
   ```

2. Kerakli paketlarni o'rnating:
   ```bash
   npm install
   ```

3. Dasturni ishga tushiring:
   ```bash
   npm run dev
   ```

4. Brauzeringizda oching:
   `http://localhost:3000`

---

## 🌐 GitHub-ga yuklash usullari

### 1-usul: Google AI Studio interfeysidan 1 bosish orqali (Eng oson)
1. Google AI Studio ekranning yuqori o'ng burchagidagi **«Export»** yoki **«GitHub»** tugmasini bosing.
2. O'zingizning GitHub hisobingizni tanlang.
3. Yangi repository nomi (masalan: `tanlov-mahallasi-city-builder`) kiriting va **«Push / Export»** tugmasini bosing. Loyiha avtomatik sizning GitHub hisobingizga yuklanadi!

### 2-usul: Git buyruqlari orqali
1. [GitHub.com](https://github.com/new) saytiga kiring va yangi repository yarating (masalan: `tanlov-mahallasi`).
2. Terminalda quyidagi buyruqlarni bajaring:
   ```bash
   git remote add origin https://github.com/SIZNING_GITHUB_NIKINGIZ/tanlov-mahallasi.git
   git branch -M main
   git push -u origin main
   ```

---

## 📦 Loyiha tuzilishi

```
├── index.html                  # Asosiy HTML kirish fayli
├── package.json                # Loyiha sozlamalari va kutubxonalar
├── vite.config.ts              # Vite konfiguratsiyasi
├── src/
│   ├── main.tsx                # React entrypoint
│   ├── App.tsx                 # Boshqaruv va 1-soniyalik saqlash tsikli
│   ├── components/             # React komponentlari
│   │   ├── CityBuilder.tsx     # 3D shahar qurish o'yini
│   │   ├── MayorDashboard.tsx  # Hokimiyat nazorat paneli
│   │   ├── Navbar.tsx          # Navigatsiya va jonli saqlash indikatori
│   │   ├── HeroSection.tsx     # Bosh sahifa
│   │   ├── FeaturesSection.tsx # Xususiyatlar kartochkalari
│   │   ├── GallerySection.tsx  # 3D bino galereyasi
│   │   ├── Footer.tsx          # Instagram va email bog'lanishi
│   │   ├── ContactModal.tsx    # Email modal (tanlovmahallasi@gmail.com)
│   │   └── DownloadModal.tsx   # Yuklab olish modali
│   ├── game/
│   │   └── rules.ts            # O'yin qoidalari va narxlar hisobi
│   └── utils/
│       ├── audio.ts            # Sci-Fi Web Audio sintezatori
│       └── storage.ts          # LocalStorage xavfsiz saqlash tizimi
```
