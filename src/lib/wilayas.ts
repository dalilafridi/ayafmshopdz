export interface Wilaya {
  code: string;
  name_fr: string;
  name_ar: string;
  name_en: string;
  communes: string[];
}

export const wilayas: Wilaya[] = [
  { code: '01', name_fr: 'Adrar', name_ar: 'أدرار', name_en: 'Adrar', communes: ['Adrar', 'Reggane', 'Timimoun', 'In Salah', 'Aoulef'] },
  { code: '02', name_fr: 'Chlef', name_ar: 'الشلف', name_en: 'Chlef', communes: ['Chlef', 'Ténès', 'El Karimia', 'Oued Fodda', 'Boukadir'] },
  { code: '03', name_fr: 'Laghouat', name_ar: 'الأغواط', name_en: 'Laghouat', communes: ['Laghouat', 'Aflou', 'Ksar El Hirane', 'Hassi R\'Mel'] },
  { code: '04', name_fr: 'Oum El Bouaghi', name_ar: 'أم البواقي', name_en: 'Oum El Bouaghi', communes: ['Oum El Bouaghi', 'Ain Beida', 'Ain M\'Lila', 'Sigus'] },
  { code: '05', name_fr: 'Batna', name_ar: 'باتنة', name_en: 'Batna', communes: ['Batna', 'Barika', 'N\'Gaous', 'Merouana', 'Arris'] },
  { code: '06', name_fr: 'Béjaïa', name_ar: 'بجاية', name_en: 'Béjaïa', communes: ['Béjaïa', 'Akbou', 'Sidi Aich', 'El Kseur', 'Amizour'] },
  { code: '07', name_fr: 'Biskra', name_ar: 'بسكرة', name_en: 'Biskra', communes: ['Biskra', 'Tolga', 'Ouled Djellal', 'Sidi Okba'] },
  { code: '08', name_fr: 'Béchar', name_ar: 'بشار', name_en: 'Béchar', communes: ['Béchar', 'Kenadsa', 'Abadla', 'Beni Ounif'] },
  { code: '09', name_fr: 'Blida', name_ar: 'البليدة', name_en: 'Blida', communes: ['Blida', 'Boufarik', 'Mouzaia', 'El Affroun', 'Bougara'] },
  { code: '10', name_fr: 'Bouira', name_ar: 'البويرة', name_en: 'Bouira', communes: ['Bouira', 'Lakhdaria', 'Sour El Ghozlane', 'M\'Chedallah'] },
  { code: '11', name_fr: 'Tamanrasset', name_ar: 'تمنراست', name_en: 'Tamanrasset', communes: ['Tamanrasset', 'In Guezzam', 'Abalessa'] },
  { code: '12', name_fr: 'Tébessa', name_ar: 'تبسة', name_en: 'Tébessa', communes: ['Tébessa', 'Bir El Ater', 'Cheria', 'El Aouinet'] },
  { code: '13', name_fr: 'Tlemcen', name_ar: 'تلمسان', name_en: 'Tlemcen', communes: ['Tlemcen', 'Maghnia', 'Ghazaouet', 'Remchi', 'Nedroma'] },
  { code: '14', name_fr: 'Tiaret', name_ar: 'تيارت', name_en: 'Tiaret', communes: ['Tiaret', 'Frenda', 'Sougueur', 'Ksar Chellala'] },
  { code: '15', name_fr: 'Tizi Ouzou', name_ar: 'تيزي وزو', name_en: 'Tizi Ouzou', communes: ['Tizi Ouzou', 'Azazga', 'Draa El Mizan', 'Ain El Hammam', 'Larbaa Nath Irathen'] },
  { code: '16', name_fr: 'Alger', name_ar: 'الجزائر', name_en: 'Algiers', communes: ['Alger Centre', 'Bab El Oued', 'Hussein Dey', 'El Harrach', 'Bir Mourad Rais', 'Bouzareah', 'Dar El Beida', 'Draria', 'Cheraga', 'Ain Benian'] },
  { code: '17', name_fr: 'Djelfa', name_ar: 'الجلفة', name_en: 'Djelfa', communes: ['Djelfa', 'Messaad', 'Ain Oussera', 'Hassi Bahbah'] },
  { code: '18', name_fr: 'Jijel', name_ar: 'جيجل', name_en: 'Jijel', communes: ['Jijel', 'El Milia', 'Taher', 'Texenna'] },
  { code: '19', name_fr: 'Sétif', name_ar: 'سطيف', name_en: 'Sétif', communes: ['Sétif', 'El Eulma', 'Ain Oulmene', 'Bougaa', 'Ain Arnat'] },
  { code: '20', name_fr: 'Saïda', name_ar: 'سعيدة', name_en: 'Saïda', communes: ['Saïda', 'Ain El Hadjar', 'Youb'] },
  { code: '21', name_fr: 'Skikda', name_ar: 'سكيكدة', name_en: 'Skikda', communes: ['Skikda', 'Collo', 'Azzaba', 'El Harrouch'] },
  { code: '22', name_fr: 'Sidi Bel Abbès', name_ar: 'سيدي بلعباس', name_en: 'Sidi Bel Abbès', communes: ['Sidi Bel Abbès', 'Telagh', 'Ain Tindamine'] },
  { code: '23', name_fr: 'Annaba', name_ar: 'عنابة', name_en: 'Annaba', communes: ['Annaba', 'El Bouni', 'El Hadjar', 'Berrahal'] },
  { code: '24', name_fr: 'Guelma', name_ar: 'قالمة', name_en: 'Guelma', communes: ['Guelma', 'Bouchegouf', 'Oued Zenati', 'Héliopolis'] },
  { code: '25', name_fr: 'Constantine', name_ar: 'قسنطينة', name_en: 'Constantine', communes: ['Constantine', 'El Khroub', 'Ain Smara', 'Hamma Bouziane', 'Didouche Mourad'] },
  { code: '26', name_fr: 'Médéa', name_ar: 'المدية', name_en: 'Médéa', communes: ['Médéa', 'Berrouaghia', 'Ksar El Boukhari', 'Tablat'] },
  { code: '27', name_fr: 'Mostaganem', name_ar: 'مستغانم', name_en: 'Mostaganem', communes: ['Mostaganem', 'Ain Tedeles', 'Hassi Mameche'] },
  { code: '28', name_fr: "M'Sila", name_ar: 'المسيلة', name_en: "M'Sila", communes: ["M'Sila", 'Bou Saada', 'Ain El Melh', 'Sidi Aissa'] },
  { code: '29', name_fr: 'Mascara', name_ar: 'معسكر', name_en: 'Mascara', communes: ['Mascara', 'Sig', 'Tighennif', 'Mohammadia'] },
  { code: '30', name_fr: 'Ouargla', name_ar: 'ورقلة', name_en: 'Ouargla', communes: ['Ouargla', 'Hassi Messaoud', 'Touggourt', 'Temacine'] },
  { code: '31', name_fr: 'Oran', name_ar: 'وهران', name_en: 'Oran', communes: ['Oran', 'Ain Turk', 'Es Senia', 'Bir El Djir', 'Arzew', 'Bethioua'] },
  { code: '32', name_fr: 'El Bayadh', name_ar: 'البيض', name_en: 'El Bayadh', communes: ['El Bayadh', 'Bougtob', 'Brezina'] },
  { code: '33', name_fr: 'Illizi', name_ar: 'إليزي', name_en: 'Illizi', communes: ['Illizi', 'Djanet', 'In Amenas'] },
  { code: '34', name_fr: 'Bordj Bou Arréridj', name_ar: 'برج بوعريريج', name_en: 'Bordj Bou Arréridj', communes: ['Bordj Bou Arréridj', 'Ras El Oued', 'Bir Kasdali'] },
  { code: '35', name_fr: 'Boumerdès', name_ar: 'بومرداس', name_en: 'Boumerdès', communes: ['Boumerdès', 'Bordj Menaiel', 'Dellys', 'Khemis El Khechna'] },
  { code: '36', name_fr: 'El Tarf', name_ar: 'الطارف', name_en: 'El Tarf', communes: ['El Tarf', 'El Kala', 'Bouhadjar', 'Ben M\'Hidi'] },
  { code: '37', name_fr: 'Tindouf', name_ar: 'تندوف', name_en: 'Tindouf', communes: ['Tindouf'] },
  { code: '38', name_fr: 'Tissemsilt', name_ar: 'تيسمسيلت', name_en: 'Tissemsilt', communes: ['Tissemsilt', 'Theniet El Had', 'Bordj Bounama'] },
  { code: '39', name_fr: 'El Oued', name_ar: 'الوادي', name_en: 'El Oued', communes: ['El Oued', 'Guemar', 'Robbah', 'Bayadha'] },
  { code: '40', name_fr: 'Khenchela', name_ar: 'خنشلة', name_en: 'Khenchela', communes: ['Khenchela', 'Kais', 'Ain Touila'] },
  { code: '41', name_fr: 'Souk Ahras', name_ar: 'سوق أهراس', name_en: 'Souk Ahras', communes: ['Souk Ahras', 'Sedrata', 'M\'Daourouch'] },
  { code: '42', name_fr: 'Tipaza', name_ar: 'تيبازة', name_en: 'Tipaza', communes: ['Tipaza', 'Koléa', 'Cherchell', 'Hadjout', 'Bou Ismail'] },
  { code: '43', name_fr: 'Mila', name_ar: 'ميلة', name_en: 'Mila', communes: ['Mila', 'Chelghoum Laid', 'Ferdjioua', 'Grarem Gouga'] },
  { code: '44', name_fr: 'Ain Defla', name_ar: 'عين الدفلى', name_en: 'Ain Defla', communes: ['Ain Defla', 'Khemis Miliana', 'El Attaf', 'Miliana'] },
  { code: '45', name_fr: 'Naâma', name_ar: 'النعامة', name_en: 'Naâma', communes: ['Naâma', 'Mecheria', 'Ain Sefra'] },
  { code: '46', name_fr: 'Ain Témouchent', name_ar: 'عين تموشنت', name_en: 'Ain Témouchent', communes: ['Ain Témouchent', 'El Malah', 'Beni Saf', 'Hammam Bou Hadjar'] },
  { code: '47', name_fr: 'Ghardaïa', name_ar: 'غرداية', name_en: 'Ghardaïa', communes: ['Ghardaïa', 'Metlili', 'El Meniaa', 'Berriane'] },
  { code: '48', name_fr: 'Relizane', name_ar: 'غليزان', name_en: 'Relizane', communes: ['Relizane', 'Oued Rhiou', 'Mazouna', 'Ammi Moussa'] },
  { code: '49', name_fr: 'El M\'Ghair', name_ar: 'المغير', name_en: 'El M\'Ghair', communes: ['El M\'Ghair', 'Djamaa', 'Still'] },
  { code: '50', name_fr: 'El Meniaa', name_ar: 'المنيعة', name_en: 'El Meniaa', communes: ['El Meniaa', 'Hassi Gara'] },
  { code: '51', name_fr: 'Ouled Djellal', name_ar: 'أولاد جلال', name_en: 'Ouled Djellal', communes: ['Ouled Djellal', 'Sidi Khaled', 'Doucen'] },
  { code: '52', name_fr: 'Bordj Badji Mokhtar', name_ar: 'برج باجي مختار', name_en: 'Bordj Badji Mokhtar', communes: ['Bordj Badji Mokhtar', 'Timiaouine'] },
  { code: '53', name_fr: 'Béni Abbès', name_ar: 'بني عباس', name_en: 'Béni Abbès', communes: ['Béni Abbès', 'El Ouata', 'Tamtert'] },
  { code: '54', name_fr: 'Timimoun', name_ar: 'تيميمون', name_en: 'Timimoun', communes: ['Timimoun', 'Charouine', 'Aougrout'] },
  { code: '55', name_fr: 'Touggourt', name_ar: 'تقرت', name_en: 'Touggourt', communes: ['Touggourt', 'Temacine', 'Megarine'] },
  { code: '56', name_fr: 'Djanet', name_ar: 'جانت', name_en: 'Djanet', communes: ['Djanet'] },
  { code: '57', name_fr: 'In Salah', name_ar: 'عين صالح', name_en: 'In Salah', communes: ['In Salah', 'In Ghar', 'Foggaret Ezzaouia'] },
  { code: '58', name_fr: 'In Guezzam', name_ar: 'عين قزام', name_en: 'In Guezzam', communes: ['In Guezzam', 'Tin Zaouatine'] },
  { code: '59', name_fr: 'Aflou', name_ar: 'أفلو', name_en: 'Aflou', communes: ['Aflou', 'Oued Morra', 'Gueltat Sidi Saad', 'Tadjmout'] },
  { code: '60', name_fr: 'Aïn Oussera', name_ar: 'عين وسارة', name_en: 'Aïn Oussera', communes: ['Aïn Oussera', 'Benhar', 'Hassi Bahbah', 'Guernini'] },
  { code: '61', name_fr: 'Barika', name_ar: 'بريكة', name_en: 'Barika', communes: ['Barika', 'Bitam', 'M\'Doukel', 'Djezzar'] },
  { code: '62', name_fr: 'Bir el-Ater', name_ar: 'بئر العاتر', name_en: 'Bir el-Ater', communes: ['Bir el-Ater', 'El Ogla', 'Ferkane', 'Negrine'] },
  { code: '63', name_fr: 'Bou Saâda', name_ar: 'بوسعادة', name_en: 'Bou Saâda', communes: ['Bou Saâda', 'Ouled Sidi Brahim', 'Ben Srour', 'Sidi Ameur'] },
  { code: '64', name_fr: 'El Abiodh Sidi Cheikh', name_ar: 'الأبيض سيدي الشيخ', name_en: 'El Abiodh Sidi Cheikh', communes: ['El Abiodh Sidi Cheikh', 'Brezina', 'Chellala'] },
  { code: '65', name_fr: 'El Aricha', name_ar: 'العريشة', name_en: 'El Aricha', communes: ['El Aricha', 'Sidi Medjahed', 'Bouihi'] },
  { code: '66', name_fr: 'El Kantara', name_ar: 'القنطرة', name_en: 'El Kantara', communes: ['El Kantara', 'Djemorah', 'Ain Zaatout', 'M\'Chounech'] },
  { code: '67', name_fr: 'Ksar Chellala', name_ar: 'قصر الشلالة', name_en: 'Ksar Chellala', communes: ['Ksar Chellala', 'Serghine', 'Ain Dheb'] },
  { code: '68', name_fr: 'Ksar El Boukhari', name_ar: 'قصر البخاري', name_en: 'Ksar El Boukhari', communes: ['Ksar El Boukhari', 'Tablat', 'Chahbounia', 'Saneg'] },
  { code: '69', name_fr: 'Messaad', name_ar: 'مسعد', name_en: 'Messaad', communes: ['Messaad', 'Deldoul', 'Guettara', 'Sed Rahal'] },
];

export function getWilayaName(wilaya: Wilaya, locale: string): string {
  switch (locale) {
    case 'ar': return wilaya.name_ar;
    case 'en': return wilaya.name_en;
    default: return wilaya.name_fr;
  }
}
