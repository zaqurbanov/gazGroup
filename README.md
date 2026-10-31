# Caspian Gaz Group

Sənaye və laboratoriya qazları şirkəti üçün çoxdilli (AZ / EN / RU) korporativ sayt. Next.js 16, Three.js 3D ssenarisi, MongoDB və öz admin paneli.

Referanslar: yanargroup.az (struktur, stok, xidmətlər), realgaz.com (layihələr, müştəri və tərəfdaşlar, FAQ). Mətn və şəkillər kopyalanmayıb.

## Tez başlanğıc

```bash
npm install
cp .env.example .env.local      # dəyərləri doldurun
docker run -d --name caspian_mongo -p 27017:27017 -v caspian_mongo_data:/data/db mongo:7   # və ya Atlas
npm run seed                    # admin istifadəçi + nümunə məzmun (təkrar işlədilə bilər)
npm run dev                     # http://localhost:3000
```

Production: `npm run build && npm start`. Build zamanı `MONGODB_URI` əlçatan olmalıdır, çünki səhifələr prerender olunur.

| Dəyişən | Təsvir |
|---|---|
| `MONGODB_URI` | MongoDB bağlantısı |
| `AUTH_SECRET` | Admin sessiyası üçün 32+ simvol gizli açar |
| `SITE_URL` | Sayt ünvanı (canonical, sitemap, OG üçün) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | `npm run seed` ilə yaradılan admin. Yayımdan əvvəl mütləq dəyişin |
| `TELEGRAM_BOT_TOKEN` | Yeni sifariş bildirişi üçün bot tokeni. Boş buraxılsa bildiriş söndürülür |
| `TELEGRAM_CHAT_ID` | Bir və ya bir neçə alıcı, vergüllə: `111,222,-100333`. Mövzulu qrup üçün `-100333:5` |

## Admin panel

`/admin`: məhsullar, kateqoriyalar, xidmətlər, layihələr, müştəri və tərəfdaşlar, sertifikatlar, FAQ, müraciətlər və tənzimləmələr (ad, loqo, əlaqə, rəqəmlər, SEO). Hər məzmun üç dildə redaktə olunur, AZ məcburidir. Şəkillər MongoDB GridFS-də saxlanılır.

Loqo hələ təsdiqlənməyib: **Tənzimləmələr → Loqo** bölməsindən yüklənənə qədər mətn loqosu göstərilir. Rəqəmlər (təcrübə, müştəri sayı və s.) və sertifikatlar boşdursa saytda göstərilmir.

Admin dəyişikliyindən sonra prerender olunmuş səhifələr ilk sorğuda köhnə, sonrakı sorğuda yeni məzmunu verir (stale-while-revalidate).

## Telegram bildirişi

Əlaqə formundan yeni sifariş və ya müraciət gələndə `lib/telegram.ts` strukturlu mesaj göndərir: ad, şirkət, telefon, e-poçt, məhsul, mesaj, dil, səhifə və vaxt (Asia/Baku). Müraciət əvvəlcə bazaya yazılır, Telegram sonra çağırılır, ona görə Telegram işləməsə də müraciət itmir. Admin → Müraciətlər bölməsində göndərilməyən bildirişlər qeyd olunur.

Quraşdırma: @BotFather ilə bot yaradın, botu çata əlavə edin, çatda mesaj yazın, sonra `https://api.telegram.org/bot<TOKEN>/getUpdates` ünvanından `chat.id` götürün və `.env.local`-a yazın. "Admində aç" düyməsi yalnız `SITE_URL` `https://` ilə başlayanda əlavə olunur.

## Dizayn

Palitra 2, "Analitik Dəqiqlik və Eko" (`docs/palitra.jpg`): `#0F3D5E`, `#10B981`, `#64748B`, `#FFFFFF`. Tokenlər `app/globals.css`-də. Zümrüd yaşıl ağ fonda kontrast tələbini ödəmir, ona görə yalnız tünd fonda mətn, ağ fonda isə dekor kimi işlənir.

## 3D ssenari: "Molekuldan balona"

`components/three/`. Fiksə olunmuş canvas scroll bölməsinə görə rejim dəyişir: hero və haqqımızda bölmələrində molekul (O₂), məhsullarda kart üzərinə gələndə molekul dəyişir (O₂, N₂, Ar, CO₂, He, H₂), stok və əlaqə bölmələrində hissəciklər balona yığılır.

- Səhifə yükləndikdən sonra lazy-load olunur, LCP-yə təsir etmir
- WebGL yoxdursa, `prefers-reduced-motion` və ya `saveData` aktivdirsə statik SVG göstərilir
- Mobildə hissəcik sayı azdır, DPR 1-dir
- Tab gizli olanda və canvas açıq bölmədə olmayanda render dayanır

## SEO

Server tərəfdə render olunan HTML, hər səhifə üçün `generateMetadata` (canonical, `hreflang` az/en/ru/x-default, Open Graph, Twitter), çoxdilli `sitemap.xml`, `robots.txt`, JSON-LD (`Organization`, `WebSite`, `LocalBusiness`, `Product`, `Service`, `FAQPage`, `BreadcrumbList`). Admində hər məhsul, xidmət və layihə üçün SEO başlıq və təsvir sahələri var.

## Quruluş

```
app/[lang]/      ictimai səhifələr (root layout)
app/admin/       admin panel (ayrı root layout)
app/actions/     ictimai Server Action-lar (əlaqə formu)
components/      sections, ui, three, admin
lib/             db, auth, data (cache), seo, i18n, admin/resources
models/          Mongoose modelləri
messages/        az.json, en.json, ru.json
proxy.ts         dil yönləndirməsi və admin üçün sürətli giriş yoxlaması
scripts/seed.ts  seed
```

Bu layihə `cacheComponents` ilə işləyir: verilənlər `use cache` və `cacheTag` ilə keşlənir, admin yazandan sonra `updateTag` ilə etibarsız edilir. Next.js 16 API-ləri üçün `node_modules/next/dist/docs/` oxuyun.

## Məlum məhdudiyyətlər

- Mövcud olmayan məhsul/xidmət/layihə ünvanına ilk dəfə daxil olanda 200 (App Shell), sonrakı sorğularda 404 qaytarılır, `noindex` ilə.
- Giriş və əlaqə formu üçün rate limit yaddaşdadır (bir server nüsxəsi üçün). Çox nüsxəli quraşdırmada paylaşılan saxlanc lazımdır.
