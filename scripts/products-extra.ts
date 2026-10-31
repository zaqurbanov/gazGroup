const L = (az: string, en: string, ru: string) => ({ az, en, ru });

/** Liquid gases added after the first release. Liquid nitrogen already exists in the base seed. */
export const extraProducts = [
  {
    slug: "liquid-helium",
    formula: "LHe",
    category: "liquid-gases",
    name: L("Maye helium", "Liquid helium", "Жидкий гелий"),
    summary: L(
      "MRT aparatları və kriogen sistemlər üçün maye helium.",
      "Liquid helium for MRI scanners and cryogenic systems.",
      "Жидкий гелий для МРТ-аппаратов и криогенных систем.",
    ),
    description: L(
      "Maye helium təxminən −269 °C temperaturda saxlanılır. MRT aparatlarında superkeçirici maqnitlərin soyudulması, elmi tədqiqatlarda və kriogen sistemlərdə istifadə olunur. Xüsusi kriogen qablarda daşınır və yalnız təlim keçmiş heyət tərəfindən işlədilməlidir.",
      "Liquid helium is stored at about −269 °C. It is used to cool the superconducting magnets in MRI scanners, in scientific research and in cryogenic systems. It is transported in dedicated cryogenic vessels and must be handled by trained staff.",
      "Жидкий гелий хранится при температуре около −269 °C. Применяется для охлаждения сверхпроводящих магнитов в МРТ-аппаратах, в научных исследованиях и криогенных системах. Перевозится в специальных криогенных сосудах, работать с ним должен обученный персонал.",
    ),
    applications: L(
      "MRT aparatlarının soyudulması\nElmi tədqiqatlar\nKriogen sistemlər",
      "Cooling of MRI scanners\nScientific research\nCryogenic systems",
      "Охлаждение МРТ-аппаратов\nНаучные исследования\nКриогенные системы",
    ),
  },
  {
    slug: "liquid-oxygen",
    formula: "LO₂",
    category: "liquid-gases",
    name: L("Maye oksigen", "Liquid oxygen", "Жидкий кислород"),
    summary: L(
      "Böyük həcmli istifadə və sənaye prosesləri üçün maye oksigen.",
      "Liquid oxygen for bulk use and industrial processes.",
      "Жидкий кислород для крупнотоннажного применения и промышленных процессов.",
    ),
    description: L(
      "Maye oksigen təxminən −183 °C temperaturda saxlanılır və böyük həcmli oksigen təchizatında istifadə olunur. Metallurgiya, kimya və digər sənaye proseslərində tətbiq edilir. Güclü oksidləşdiricidir, yağ və üzvi maddələrlə təmasdan qorunmalı, yalnız kriogen qablarda daşınmalıdır.",
      "Liquid oxygen is stored at about −183 °C and is used for bulk oxygen supply. It is applied in metallurgy, chemical and other industrial processes. It is a strong oxidizer, must be kept away from oil and organic matter, and is transported only in cryogenic vessels.",
      "Жидкий кислород хранится при температуре около −183 °C и используется для крупнотоннажных поставок кислорода. Применяется в металлургии, химической и других отраслях. Сильный окислитель: необходимо исключить контакт с маслами и органическими веществами; перевозится только в криогенных сосудах.",
    ),
    applications: L(
      "Metallurgiya\nKimya sənayesi\nBöyük həcmli təchizat",
      "Metallurgy\nChemical industry\nBulk supply",
      "Металлургия\nХимическая промышленность\nКрупнотоннажные поставки",
    ),
  },
];
