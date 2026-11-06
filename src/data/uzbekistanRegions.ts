/**
 * Official administrative regions and districts of Uzbekistan with exact Google Maps naming.
 */

export interface DistrictInfo {
  id: string;
  name: string;
  regionId: string;
  populationEstimate: number;
  description: string;
  centerCoordinates: [number, number]; // [lat, lng]
}

export interface RegionInfo {
  id: string;
  name: string;
  capital: string;
  districts: DistrictInfo[];
}

export const UZBEKISTAN_REGIONS: RegionInfo[] = [
  {
    id: 'tashkent_city',
    name: 'Toshkent shahri',
    capital: 'Toshkent',
    districts: [
      { id: 'chilonzor', name: 'Chilonzor tumani', regionId: 'tashkent_city', populationEstimate: 270000, description: 'Toshkentning yashil va sanoat-turar joy markazi', centerCoordinates: [41.2721, 69.2045] },
      { id: 'yunusobod', name: 'Yunusobod tumani', regionId: 'tashkent_city', populationEstimate: 360000, description: 'Katta biznes markazlari va teleminora joylashgan tuman', centerCoordinates: [41.3644, 69.2872] },
      { id: 'mirzo_ulugbek', name: 'Mirzo Ulug‘bek tumani', regionId: 'tashkent_city', populationEstimate: 290000, description: 'Fan, oliy ta’lim va IT park hududi', centerCoordinates: [41.3283, 69.3346] },
      { id: 'shayxontohur', name: 'Shayxontohur tumani', regionId: 'tashkent_city', populationEstimate: 350000, description: 'Qadimiy Chorsu bozori va tarixiy markaz', centerCoordinates: [41.3265, 69.2401] },
      { id: 'yakkasaroy', name: 'Yakkasaroy tumani', regionId: 'tashkent_city', populationEstimate: 120000, description: 'Shinam mahalla va elchixonalar maskani', centerCoordinates: [41.2842, 69.2562] },
      { id: 'mirobod', name: 'Mirobod tumani', regionId: 'tashkent_city', populationEstimate: 140000, description: 'Shimoliy vokzal va savdo-ko‘ngilochar markazlar', centerCoordinates: [41.2933, 69.2813] },
      { id: 'yashnobod', name: 'Yashnobod tumani', regionId: 'tashkent_city', populationEstimate: 260000, description: 'Katta texnopark va yerusti metro liniyasi', centerCoordinates: [41.2917, 69.3402] },
      { id: 'uchtepa', name: 'Uchtepa tumani', regionId: 'tashkent_city', populationEstimate: 280000, description: 'Farhod bozori va zamonaviy massivlar', centerCoordinates: [41.2954, 69.1764] },
      { id: 'olmazor', name: 'Olmazor tumani', regionId: 'tashkent_city', populationEstimate: 380000, description: 'Talabalar shaharchasi va Hazrati Imom majmuasi', centerCoordinates: [41.3524, 69.2241] },
      { id: 'sergeli', name: 'Sergeli tumani', regionId: 'tashkent_city', populationEstimate: 200000, description: 'Keng ko‘lamli yangi kiber turar-joylar', centerCoordinates: [41.2223, 69.2205] },
      { id: 'yangihayot', name: 'Yangihayot tumani', regionId: 'tashkent_city', populationEstimate: 150000, description: 'Yangi sanoat va innovatsion tuman', centerCoordinates: [41.1983, 69.2081] },
      { id: 'bektemir', name: 'Bektemir tumani', regionId: 'tashkent_city', populationEstimate: 55000, description: 'Qo‘yliq va yirik ishlab chiqarish zonalari', centerCoordinates: [41.2335, 69.3364] },
    ],
  },
  {
    id: 'samarkand',
    name: 'Samarqand viloyati',
    capital: 'Samarqand shahri',
    districts: [
      { id: 'samarkand_city', name: 'Samarqand shahri', regionId: 'samarkand', populationEstimate: 550000, description: 'Registon va Amir Temur maqbarasi joylashgan qadimiy shahar', centerCoordinates: [39.6542, 66.9597] },
      { id: 'urgut', name: 'Urgut tumani', regionId: 'samarkand', populationEstimate: 520000, description: 'Tog‘ bag‘ridagi ulkan savdo va hunarmandchilik markazi', centerCoordinates: [39.4042, 67.2425] },
      { id: 'kattaqorgon', name: 'Kattaqo‘rg‘on shahri', regionId: 'samarkand', populationEstimate: 95000, description: 'Samarqandning yirik sanoat va suv ombori markazi', centerCoordinates: [39.8972, 66.2575] },
      { id: 'payariq', name: 'Payariq tumani', regionId: 'samarkand', populationEstimate: 260000, description: 'Imom al-Buxoriy ziyoratgohi maskani', centerCoordinates: [39.9886, 66.8483] },
      { id: 'pastdargom', name: 'Pastdarg‘om tumani', regionId: 'samarkand', populationEstimate: 360000, description: 'Zarafshon daryosi bo‘yidagi hosildor zamin', centerCoordinates: [39.6925, 66.6978] },
      { id: 'bulungur', name: 'Bulung‘ur tumani', regionId: 'samarkand', populationEstimate: 190000, description: 'Samarqandning meva-sabzavot darvozasi', centerCoordinates: [39.7578, 67.2756] },
    ],
  },
  {
    id: 'bukhara',
    name: 'Buxoro viloyati',
    capital: 'Buxoro shahri',
    districts: [
      { id: 'bukhara_city', name: 'Buxoro shahri', regionId: 'bukhara', populationEstimate: 285000, description: 'Somoniylar va Minorai Kalon joylashgan muqaddas shahar', centerCoordinates: [39.7747, 64.4286] },
      { id: 'gijduvon', name: 'G‘ijduvon tumani', regionId: 'bukhara', populationEstimate: 310000, description: 'Mashhur G‘ijduvon kulolchiligi va shashliklari markazi', centerCoordinates: [40.1006, 64.6739] },
      { id: 'kogon', name: 'Kogon shahri', regionId: 'bukhara', populationEstimate: 62000, description: 'Amir saroyi va temir yo‘l chorrahasi', centerCoordinates: [39.7228, 64.5489] },
      { id: 'qorakol', name: 'Qorako‘l tumani', regionId: 'bukhara', populationEstimate: 170000, description: 'Gaz sanoati va mashhur qorako‘lchilik makoni', centerCoordinates: [39.5028, 63.8547] },
      { id: 'vobkent', name: 'Vobkent tumani', regionId: 'bukhara', populationEstimate: 145000, description: 'Vobkent minorasi va qadimiy karvon yo‘li', centerCoordinates: [40.0336, 64.5164] },
    ],
  },
  {
    id: 'fergana',
    name: 'Farg‘ona viloyati',
    capital: 'Farg‘ona shahri',
    districts: [
      { id: 'fergana_city', name: 'Farg‘ona shahri', regionId: 'fergana', populationEstimate: 300000, description: 'Chinorlar shahri va viloyat markazi', centerCoordinates: [40.3842, 71.7843] },
      { id: 'qoqon', name: 'Qo‘qon shahri', regionId: 'fergana', populationEstimate: 260000, description: 'Xudoyorxon o‘rdasi va hunarmandlar poytaxti', centerCoordinates: [40.5286, 70.9425] },
      { id: 'margilon', name: 'Marg‘ilon shahri', regionId: 'fergana', populationEstimate: 240000, description: 'Atlas va adras ipakchiligining jahon markazi', centerCoordinates: [40.4722, 71.7247] },
      { id: 'rishton', name: 'Rishton tumani', regionId: 'fergana', populationEstimate: 210000, description: 'Ko‘k sirlangan kulolchilik san’ati o‘chog‘i', centerCoordinates: [40.3567, 71.2828] },
      { id: 'quva', name: 'Quva tumani', regionId: 'fergana', populationEstimate: 270000, description: 'Al-Farg‘oniy vatani va anorzorlar makoni', centerCoordinates: [40.5233, 72.0678] },
    ],
  },
  {
    id: 'andijan',
    name: 'Andijon viloyati',
    capital: 'Andijon shahri',
    districts: [
      { id: 'andijan_city', name: 'Andijon shahri', regionId: 'andijan', populationEstimate: 450000, description: 'Zahiriddin Muhammad Bobur vatani', centerCoordinates: [40.7821, 72.3442] },
      { id: 'asaka', name: 'Asaka tumani', regionId: 'andijan', populationEstimate: 340000, description: 'O‘zbekiston avtomobilsozlik sanoati yuragi', centerCoordinates: [40.6417, 72.2389] },
      { id: 'shahrixon', name: 'Shahrixon tumani', regionId: 'andijan', populationEstimate: 300000, description: 'Mashhur pichoqchilik va savdo markazi', centerCoordinates: [40.7136, 72.0578] },
      { id: 'xojabod', name: 'Xo‘jaobod tumani', regionId: 'andijan', populationEstimate: 115000, description: 'Tog‘oldi so‘lim maskanlari va bog‘lar', centerCoordinates: [40.6694, 72.5639] },
    ],
  },
  {
    id: 'namangan',
    name: 'Namangan viloyati',
    capital: 'Namangan shahri',
    districts: [
      { id: 'namangan_city', name: 'Namangan shahri', regionId: 'namangan', populationEstimate: 650000, description: 'Gullar shahri va to‘qimachilik poytaxti', centerCoordinates: [40.9983, 71.6726] },
      { id: 'chust', name: 'Chust tumani', regionId: 'namangan', populationEstimate: 270000, description: 'Chust do‘ppisi va pichoqlari bilan dunyoga mashhur', centerCoordinates: [41.0078, 71.2294] },
      { id: 'pop', name: 'Pop tumani', regionId: 'namangan', populationEstimate: 220000, description: 'Qamchiq dovoni darvozasi va temir yo‘l tunneli', centerCoordinates: [40.8756, 71.1089] },
      { id: 'kosonsoy', name: 'Kosonsoy tumani', regionId: 'namangan', populationEstimate: 215000, description: 'Go‘zal tog‘ vodiysi va qadimiy obidalar', centerCoordinates: [41.2558, 71.5508] },
    ],
  },
  {
    id: 'kashkadarya',
    name: 'Qashqadaryo viloyati',
    capital: 'Qarshi shahri',
    districts: [
      { id: 'qarshi_city', name: 'Qarshi shahri', regionId: 'kashkadarya', populationEstimate: 280000, description: 'Nasaf diyori va Qarshi qadimiy ko‘prigi', centerCoordinates: [38.8606, 65.7892] },
      { id: 'shahrisabz', name: 'Shahrisabz shahri', regionId: 'kashkadarya', populationEstimate: 140000, description: 'Oqsaroy majmuasi va Amir Temur tug‘ilgan zamin', centerCoordinates: [39.0522, 66.8306] },
      { id: 'kitob', name: 'Kitob tumani', regionId: 'kashkadarya', populationEstimate: 270000, description: 'Kitob baland tog‘ observatoriyasi va tabiat qo‘riqxonasi', centerCoordinates: [39.1239, 66.8833] },
      { id: 'guzor', name: 'G‘uzor tumani', regionId: 'kashkadarya', populationEstimate: 210000, description: 'Sho‘rtan gaz kimyo majmuasi joylashgan hudud', centerCoordinates: [38.6214, 66.2514] },
    ],
  },
  {
    id: 'surkhandarya',
    name: 'Surxondaryo viloyati',
    capital: 'Termiz shahri',
    districts: [
      { id: 'termiz_city', name: 'Termiz shahri', regionId: 'surkhandarya', populationEstimate: 190000, description: 'Al-Hakim at-Termiziy va Amudaryo bo‘yidagi janubiy darvoza', centerCoordinates: [37.2242, 67.2783] },
      { id: 'denov', name: 'Denov tumani', regionId: 'surkhandarya', populationEstimate: 395000, description: 'Janubning eng yirik savdo va biznes shahri', centerCoordinates: [38.2742, 67.8978] },
      { id: 'boysun', name: 'Boysun tumani', regionId: 'surkhandarya', populationEstimate: 120000, description: 'YuNESKO nomoddiy madaniy merosi Boysun bahori', centerCoordinates: [38.2044, 67.2003] },
    ],
  },
  {
    id: 'khorezm',
    name: 'Xorazm viloyati',
    capital: 'Urganch shahri',
    districts: [
      { id: 'urganch_city', name: 'Urganch shahri', regionId: 'khorezm', populationEstimate: 200000, description: 'Jaloliddin Manguberdi va Al-Xorazmiy shahri', centerCoordinates: [41.5561, 60.6314] },
      { id: 'xiva_city', name: 'Xiva shahri', regionId: 'khorezm', populationEstimate: 95000, description: 'Ochiq osmon ostidagi muzey: Ichan Qal’a', centerCoordinates: [41.3783, 60.3639] },
      { id: 'xonqa', name: 'Xonqa tumani', regionId: 'khorezm', populationEstimate: 190000, description: 'Xorazm guruchi va qovunlari yetishtiriladigan zamin', centerCoordinates: [41.4722, 60.7722] },
    ],
  },
  {
    id: 'navoi',
    name: 'Navoiy viloyati',
    capital: 'Navoiy shahri',
    districts: [
      { id: 'navoi_city', name: 'Navoiy shahri', regionId: 'navoi', populationEstimate: 160000, description: 'Kimyo va metallurgiya sanoati poytaxti', centerCoordinates: [40.0844, 65.3792] },
      { id: 'zarafshon', name: 'Zarafshon shahri', regionId: 'navoi', populationEstimate: 85000, description: 'Qizilqum sahrosidagi Oltin shahar (Muruntov koni)', centerCoordinates: [41.5728, 64.2008] },
      { id: 'uchquduq', name: 'Uchquduq tumani', regionId: 'navoi', populationEstimate: 38000, description: 'Uch quduq afsonasi va konchilar shahri', centerCoordinates: [42.1564, 63.5558] },
    ],
  },
  {
    id: 'jizzakh',
    name: 'Jizzax viloyati',
    capital: 'Jizzax shahri',
    districts: [
      { id: 'jizzakh_city', name: 'Jizzax shahri', regionId: 'jizzakh', populationEstimate: 185000, description: 'Mashhur Jizzax somsasining vatani', centerCoordinates: [40.1158, 67.8422] },
      { id: 'zomin', name: 'Zomin tumani', regionId: 'jizzakh', populationEstimate: 165000, description: 'O‘zbekiston Shveytsariyasi: Zomin milliy bog‘i', centerCoordinates: [39.9606, 68.3958] },
      { id: 'gallaorol', name: 'G‘allaorol tumani', regionId: 'jizzakh', populationEstimate: 175000, description: 'G‘allakorlik va tog‘li manzaralar hududi', centerCoordinates: [40.0247, 67.5858] },
    ],
  },
  {
    id: 'sirdaryo',
    name: 'Sirdaryo viloyati',
    capital: 'Guliston shahri',
    districts: [
      { id: 'guliston_city', name: 'Guliston shahri', regionId: 'sirdaryo', populationEstimate: 95000, description: 'Mirzacho‘l gulshani va transport chorrahasi', centerCoordinates: [40.4897, 68.7842] },
      { id: 'yangiyer', name: 'Yangiyer shahri', regionId: 'sirdaryo', populationEstimate: 45000, description: 'Yangi yerlar o‘zlashtirilgan sanoat maskani', centerCoordinates: [40.2667, 68.8167] },
      { id: 'shirin', name: 'Shirin shahri', regionId: 'sirdaryo', populationEstimate: 19000, description: 'Sirdaryo IES va Farhod GES energetika markazi', centerCoordinates: [40.2247, 69.1306] },
    ],
  },
  {
    id: 'tashkent_region',
    name: 'Toshkent viloyati',
    capital: 'Nurafshon shahri',
    districts: [
      { id: 'chirchiq', name: 'Chirchiq shahri', regionId: 'tashkent_region', populationEstimate: 160000, description: 'Kimyo va og‘ir mashinasozlik sanoati shahri', centerCoordinates: [41.4689, 69.5822] },
      { id: 'olmaliq', name: 'Olmaliq shahri', regionId: 'tashkent_region', populationEstimate: 135000, description: 'Olmaliq kon-metallurgiya kombinati (OKMK)', centerCoordinates: [40.8528, 69.5989] },
      { id: 'angren', name: 'Angren shahri', regionId: 'tashkent_region', populationEstimate: 180000, description: 'Ko‘mir havzasi va GRES energetika majmuasi', centerCoordinates: [41.0167, 70.1436] },
      { id: 'bostonliq', name: 'Bo‘stonliq tumani', regionId: 'tashkent_region', populationEstimate: 175000, description: 'Chorvoq suv ombori va Amirsoy kiber kurorti', centerCoordinates: [41.6111, 70.0417] },
      { id: 'yangiyol', name: 'Yangiyo‘l shahri', regionId: 'tashkent_region', populationEstimate: 65000, description: 'Oziq-ovqat va vino sanoati markazi', centerCoordinates: [41.1167, 69.0500] },
    ],
  },
  {
    id: 'karakalpakstan',
    name: 'Qoraqalpog‘iston Respublikasi',
    capital: 'Nukus shahri',
    districts: [
      { id: 'nukus_city', name: 'Nukus shahri', regionId: 'karakalpakstan', populationEstimate: 330000, description: 'Mashhur Savitskiy nomidagi jahon muzeyi maskani', centerCoordinates: [42.4602, 59.6166] },
      { id: 'moynoq', name: 'Mo‘ynoq tumani', regionId: 'karakalpakstan', populationEstimate: 32000, description: 'Kemalar qabristoni va Orolbo‘yi eko-turizm markazi', centerCoordinates: [43.7683, 59.0214] },
      { id: 'qongirot', name: 'Qo‘ng‘irot tumani', regionId: 'karakalpakstan', populationEstimate: 135000, description: 'Ustyurt platosi va soda zavodi joylashgan tuman', centerCoordinates: [43.0417, 58.8500] },
      { id: 'beruniy', name: 'Beruniy tumani', regionId: 'karakalpakstan', populationEstimate: 200000, description: 'Abu Rayhon Beruniy vatani va Amudaryo vodiysi', centerCoordinates: [41.6911, 60.7525] },
      { id: 'xojayli_city', name: 'Xo‘jayli shahri', regionId: 'karakalpakstan', populationEstimate: 110000, description: 'Tarixiy Mizdaqxon majmuasi va hunarmandchilik markazi', centerCoordinates: [42.4042, 59.4583] },
      { id: 'taxiatosh', name: 'Taxiatosh tumani', regionId: 'karakalpakstan', populationEstimate: 80000, description: 'Taxiatosh IES energetika giganti va sanoat tumani', centerCoordinates: [42.3389, 59.5583] },
    ],
  },
];

export function findDistrictById(districtId: string): DistrictInfo | undefined {
  for (const region of UZBEKISTAN_REGIONS) {
    const found = region.districts.find(d => d.id === districtId);
    if (found) return found;
  }
  return undefined;
}

export const DEFAULT_DISTRICT_ID = 'chilonzor';
