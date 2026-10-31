import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import { AdminUser, Category, Faq, Product, Service, SiteSettings } from "../models";

const L = (az: string, en: string, ru: string) => ({ az, en, ru });

const categories = [
  { slug: "industrial-gases", title: L("Sənaye qazları", "Industrial gases", "Промышленные газы"), description: L("Qaynaq, kəsim və istehsal prosesləri üçün texniki qazlar.", "Technical gases for welding, cutting and production.", "Технические газы для сварки, резки и производства.") },
  { slug: "special-gases", title: L("Xüsusi qazlar", "Specialty gases", "Специальные газы"), description: L("Laboratoriya və analitik cihazlar üçün yüksək təmizlikli qazlar.", "High-purity gases for laboratories and analytical instruments.", "Газы высокой чистоты для лабораторий и аналитических приборов.") },
  { slug: "liquid-gases", title: L("Maye qazlar", "Liquid gases", "Сжиженные газы"), description: L("Kriogen və böyük həcmli istifadə üçün maye qazlar.", "Liquefied gases for cryogenic and bulk use.", "Сжиженные газы для криогенного и крупнотоннажного применения.") },
];

const products = [
  { slug: "oxygen", formula: "O₂", category: "industrial-gases", name: L("Oksigen", "Oxygen", "Кислород"), summary: L("Qaynaq, kəsim və yanma prosesləri üçün texniki oksigen.", "Technical oxygen for welding, cutting and combustion.", "Технический кислород для сварки, резки и процессов горения."), description: L("Texniki oksigen metal emalı, qaz-alov kəsimi və yanma proseslərinin intensivləşdirilməsində istifadə olunur. Oksidləşdirici maddədir, yağ və piylə təmasdan qorunmalıdır.", "Technical oxygen is used in metal processing, oxy-fuel cutting and to intensify combustion. It is an oxidizer and must be kept away from oil and grease.", "Технический кислород применяется при обработке металлов, газовой резке и для интенсификации горения. Является окислителем, его нельзя допускать к контакту с маслами и жирами."), applications: L("Qaz-alov kəsimi\nQaynaq\nMetallurgiya", "Oxy-fuel cutting\nWelding\nMetallurgy", "Газовая резка\nСварка\nМеталлургия") },
  { slug: "nitrogen", formula: "N₂", category: "industrial-gases", name: L("Azot", "Nitrogen", "Азот"), summary: L("İnert mühit, təmizləmə və qablaşdırma üçün azot.", "Nitrogen for inert atmospheres, purging and packaging.", "Азот для инертной среды, продувки и упаковки."), description: L("Azot inert qazdır. Reaksiyaların oksigensiz mühitdə aparılması, boru və tutumların təmizlənməsi və qida qablaşdırmasında istifadə edilir. Laboratoriyalarda yüksək təmizlikli növü tətbiq olunur.", "Nitrogen is an inert gas. It is used to create oxygen-free atmospheres, purge pipes and vessels and in food packaging. High-purity grades are used in laboratories.", "Азот является инертным газом. Применяется для создания бескислородной среды, продувки трубопроводов и ёмкостей и в упаковке пищевых продуктов. В лабораториях используются марки высокой чистоты."), applications: L("İnert mühit\nBoruların təmizlənməsi\nQablaşdırma\nLaboratoriya", "Inert atmosphere\nPipe purging\nPackaging\nLaboratory", "Инертная среда\nПродувка трубопроводов\nУпаковка\nЛаборатория") },
  { slug: "argon", formula: "Ar", category: "industrial-gases", name: L("Arqon", "Argon", "Аргон"), summary: L("TIG/MIG qaynağı üçün qoruyucu inert qaz.", "Inert shielding gas for TIG/MIG welding.", "Инертный защитный газ для сварки TIG/MIG."), description: L("Arqon kimyəvi cəhətdən inert qazdır. Qaynaq zamanı metalı havanın təsirindən qoruyur, həmçinin laboratoriya və xüsusi istehsal proseslərində istifadə olunur.", "Argon is chemically inert. It shields metal from air during welding and is also used in laboratory and specialised manufacturing processes.", "Аргон химически инертен. Защищает металл от воздействия воздуха при сварке, а также используется в лабораторных и специализированных производственных процессах."), applications: L("TIG və MIG qaynağı\nLaboratoriya\nXüsusi istehsal", "TIG and MIG welding\nLaboratory\nSpecialised manufacturing", "Сварка TIG и MIG\nЛаборатория\nСпециальное производство") },
  { slug: "carbon-dioxide", formula: "CO₂", category: "industrial-gases", name: L("Karbon qazı", "Carbon dioxide", "Углекислый газ"), summary: L("Qaynaq, soyutma və qida sənayesi üçün CO₂.", "CO₂ for welding, cooling and the food industry.", "CO₂ для сварки, охлаждения и пищевой промышленности."), description: L("Karbon qazı qaynaq qarışıqlarında qoruyucu mühit kimi, içkilərin qazlaşdırılmasında və soyutma proseslərində tətbiq edilir.", "Carbon dioxide is used as a shielding component in welding mixtures, for beverage carbonation and in cooling processes.", "Углекислый газ применяется как защитный компонент сварочных смесей, для газирования напитков и в процессах охлаждения."), applications: L("Qaynaq qarışıqları\nİçkilərin qazlaşdırılması\nSoyutma", "Welding mixtures\nBeverage carbonation\nCooling", "Сварочные смеси\nГазирование напитков\nОхлаждение") },
  { slug: "helium", formula: "He", category: "special-gases", name: L("Helium", "Helium", "Гелий"), summary: L("Sızıntı aşkarlanması və xromatoqrafiya üçün helium.", "Helium for leak detection and chromatography.", "Гелий для поиска утечек и хроматографии."), description: L("Helium yüngül və inert qazdır. Sızıntı axtarışı, qaz xromatoqrafiyasında daşıyıcı qaz kimi və kriogen tətbiqlərdə istifadə olunur.", "Helium is a light, inert gas. It is used for leak detection, as a carrier gas in gas chromatography and in cryogenic applications.", "Гелий лёгкий инертный газ. Используется для поиска утечек, как газ-носитель в газовой хроматографии и в криогенных применениях."), applications: L("Sızıntı aşkarlanması\nQaz xromatoqrafiyası\nKriogen tətbiqlər", "Leak detection\nGas chromatography\nCryogenic applications", "Поиск утечек\nГазовая хроматография\nКриогенные применения") },
  { slug: "hydrogen", formula: "H₂", category: "special-gases", name: L("Hidrogen", "Hydrogen", "Водород"), summary: L("Laboratoriya cihazları və texnoloji proseslər üçün hidrogen.", "Hydrogen for laboratory instruments and technological processes.", "Водород для лабораторных приборов и технологических процессов."), description: L("Hidrogen alışan qazdır və xüsusi təhlükəsizlik tələbləri ilə saxlanılır. Laboratoriya detektorlarında yanacaq qazı və bəzi termik proseslərdə istifadə edilir.", "Hydrogen is flammable and must be handled under specific safety requirements. It is used as a fuel gas in laboratory detectors and in some thermal processes.", "Водород горюч и требует соблюдения специальных мер безопасности. Используется как горючий газ в лабораторных детекторах и в некоторых термических процессах."), applications: L("Laboratoriya detektorları\nTermik proseslər", "Laboratory detectors\nThermal processes", "Лабораторные детекторы\nТермические процессы") },
  { slug: "liquid-nitrogen", formula: "LN₂", category: "liquid-gases", name: L("Maye azot", "Liquid nitrogen", "Жидкий азот"), summary: L("Kriogen soyutma və saxlama üçün maye azot.", "Liquid nitrogen for cryogenic cooling and storage.", "Жидкий азот для криогенного охлаждения и хранения."), description: L("Maye azot çox aşağı temperaturda saxlanılır və kriogen soyutma, nümunələrin saxlanması və bəzi sənaye proseslərində tətbiq edilir. Xüsusi qablarla daşınır.", "Liquid nitrogen is stored at very low temperature and is used for cryogenic cooling, sample storage and some industrial processes. It is transported in dedicated vessels.", "Жидкий азот хранится при очень низкой температуре и применяется для криогенного охлаждения, хранения образцов и в некоторых промышленных процессах. Перевозится в специальных сосудах."), applications: L("Kriogen soyutma\nNümunələrin saxlanması", "Cryogenic cooling\nSample storage", "Криогенное охлаждение\nХранение образцов") },
];

const services = [
  { slug: "gas-sales", title: L("Qaz satışı və təchizatı", "Gas sales and supply", "Продажа и поставка газа"), summary: L("Texniki, xüsusi və maye qazların satışı.", "Sale of technical, specialty and liquid gases.", "Продажа технических, специальных и сжиженных газов."), description: L("Sənaye və laboratoriya ehtiyacları üçün qazların satışı və müntəzəm təchizatı. Həcm və qrafikə uyğun plan hazırlanır.", "Sale and regular supply of gases for industrial and laboratory needs. A plan is prepared to match volume and schedule.", "Продажа и регулярная поставка газов для промышленных и лабораторных нужд. План составляется под объём и график.") },
  { slug: "cylinder-filling", title: L("Balonların doldurulması", "Cylinder filling", "Наполнение баллонов"), summary: L("Müxtəlif ölçülü balonların qazla doldurulması.", "Filling cylinders of different sizes.", "Наполнение баллонов различных размеров."), description: L("Müxtəlif növ və ölçülü balonların təhlükəsizlik qaydalarına uyğun doldurulması.", "Filling of cylinders of various types and sizes in line with safety rules.", "Наполнение баллонов различных типов и размеров с соблюдением правил безопасности.") },
  { slug: "delivery", title: L("Çatdırılma", "Delivery", "Доставка"), summary: L("Balonların təhlükəsiz daşınması və çatdırılması.", "Safe transport and delivery of cylinders.", "Безопасная перевозка и доставка баллонов."), description: L("Balonların müştərinin ünvanına təhlükəsizlik tələblərinə uyğun çatdırılması.", "Delivery of cylinders to the customer's address in line with safety requirements.", "Доставка баллонов по адресу клиента с соблюдением требований безопасности.") },
  { slug: "technical-consulting", title: L("Texniki məsləhət", "Technical consulting", "Техническая консультация"), summary: L("Qaz seçimi və istifadəsi üzrə məsləhət.", "Advice on gas selection and use.", "Консультации по выбору и применению газа."), description: L("Prosesə uyğun qazın, təmizlik dərəcəsinin və təchizat sxeminin seçilməsində dəstək.", "Support in choosing the right gas, purity grade and supply scheme for your process.", "Поддержка в выборе подходящего газа, степени чистоты и схемы поставки для вашего процесса.") },
];

const faqs = [
  { question: L("Qazın təmizlik dərəcəsini necə seçməliyəm?", "How do I choose the purity grade?", "Как выбрать степень чистоты газа?"), answer: L("Təmizlik dərəcəsi tətbiqdən asılıdır. Qaynaq üçün texniki dərəcə kifayət edə bilər, analitik cihazlar isə adətən yüksək təmizlikli qaz tələb edir. Cihazınızın tələbini bizə bildirin, uyğun variantı məsləhət görək.", "The grade depends on the application. Technical grade may be enough for welding, while analytical instruments usually need high-purity gas. Tell us your requirement and we will recommend a suitable option.", "Степень чистоты зависит от применения. Для сварки может быть достаточно технической, а аналитическим приборам обычно нужен газ высокой чистоты. Сообщите ваши требования, и мы подскажем подходящий вариант.") },
  { question: L("Xüsusi qaz qarışıqları hazırlayırsınız?", "Do you prepare custom gas mixtures?", "Готовите ли вы специальные газовые смеси?"), answer: L("Bəli, tələb olunan tərkib üçün sorğu göndərin. Mümkünlük və müddət barədə cavab verəcəyik.", "Yes. Send a request with the required composition and we will confirm feasibility and lead time.", "Да. Отправьте запрос с необходимым составом, и мы подтвердим возможность и сроки.") },
  { question: L("Balonlar necə çatdırılır?", "How are cylinders delivered?", "Как доставляются баллоны?"), answer: L("Balonlar təhlükəsizlik qaydalarına uyğun daşınır. Çatdırılma şərtləri ünvan və həcmə görə razılaşdırılır.", "Cylinders are transported in line with safety rules. Delivery terms are agreed according to address and volume.", "Баллоны перевозятся в соответствии с правилами безопасности. Условия доставки согласуются в зависимости от адреса и объёма.") },
  { question: L("Sifarişi necə verə bilərəm?", "How can I place an order?", "Как оформить заказ?"), answer: L("Əlaqə səhifəsindəki forma, telefon və ya WhatsApp vasitəsilə müraciət edə bilərsiniz.", "You can reach us via the contact form, by phone or on WhatsApp.", "Вы можете обратиться через форму на странице контактов, по телефону или в WhatsApp.") },
];

async function main() {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || password.length < 8) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ chars) in .env.local");

  await AdminUser.updateOne({ email }, { $set: { passwordHash: await bcrypt.hash(password, 12) } }, { upsert: true });

  // Content is only seeded into empty collections so re-running never overwrites admin edits.
  await SiteSettings.updateOne(
    { key: "main" },
    {
      $setOnInsert: {
        key: "main",
        siteName: "Caspian Gaz Group",
        address: L("Bakı, Azərbaycan", "Baku, Azerbaijan", "Баку, Азербайджан"),
        hours: L("B.e. - Cümə, 09:00 - 18:00", "Mon - Fri, 09:00 - 18:00", "Пн - Пт, 09:00 - 18:00"),
      },
    },
    { upsert: true },
  );

  if ((await Category.countDocuments()) === 0)
    await Category.insertMany(categories.map((c, i) => ({ ...c, order: i })));
  if ((await Product.countDocuments()) === 0)
    await Product.insertMany(products.map((p, i) => ({ ...p, order: i, stockStatus: "on_request" })));
  if ((await Service.countDocuments()) === 0)
    await Service.insertMany(services.map((s, i) => ({ ...s, order: i })));
  if ((await Faq.countDocuments()) === 0) await Faq.insertMany(faqs.map((f, i) => ({ ...f, order: i })));

  console.log(`Seed done. Admin: ${email}`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
