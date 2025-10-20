/**
 * Multilingual Content Filter System
 * Blocks adult content while allowing educational/medical searches
 */

// Safe contexts that should be allowed (educational, medical, scientific)
const SAFE_CONTEXTS = {
  en: [
    'sex education', 'sexual education', 'sex ed',
    'sex chromosome', 'sex chromosomes', 'biological sex',
    'sex determination', 'sex differences', 
    'sexual health', 'sexual wellness', 'sexual medicine',
    'sex therapy', 'sexual counseling',
    'breast cancer', 'breast feeding', 'breastfeeding', 'breast examination',
    'breast health', 'breast screening',
    'reproductive health', 'reproductive system', 'reproduction biology',
    'human sexuality', 'sexuality education',
    'gender studies', 'gender identity',
    'puberty education', 'adolescent development',
    'sexually transmitted', 'std', 'sti',
    'contraception', 'family planning',
    'pregnancy', 'prenatal', 'postnatal',
    'sexual assault prevention', 'sexual harassment',
    'sex trafficking prevention', 'human trafficking',
  ],
  ar: [
    'التربية الجنسية', 'الثقافة الجنسية', 'التوعية الجنسية',
    'الكروموسومات الجنسية', 'الجنس البيولوجي',
    'الصحة الجنسية', 'الطب الجنسي',
    'العلاج الجنسي', 'الإرشاد الجنسي',
    'سرطان الثدي', 'الرضاعة الطبيعية', 'فحص الثدي',
    'صحة الثدي',
    'الصحة الإنجابية', 'الجهاز التناسلي', 'علم الإنجاب',
    'التربية البشرية', 'تعليم البلوغ',
    'الأمراض المنقولة جنسيا',
    'منع الحمل', 'تنظيم الأسرة',
    'الحمل', 'قبل الولادة', 'بعد الولادة',
    'منع الاعتداء الجنسي', 'التحرش الجنسي',
    'منع الاتجار بالبشر',
  ],
  fr: [
    'éducation sexuelle', 'éducation à la sexualité',
    'chromosome sexuel', 'sexe biologique',
    'santé sexuelle', 'médecine sexuelle',
    'thérapie sexuelle',
    'cancer du sein', 'allaitement', 'examen du sein',
    'santé reproductive', 'système reproducteur',
    'sexualité humaine',
    'études de genre', 'identité de genre',
    'éducation à la puberté',
    'maladie sexuellement transmissible', 'mst', 'ist',
    'contraception', 'planification familiale',
    'grossesse', 'prénatal', 'postnatal',
  ],
  es: [
    'educación sexual', 'educación de la sexualidad',
    'cromosoma sexual', 'sexo biológico',
    'salud sexual', 'medicina sexual',
    'terapia sexual',
    'cáncer de mama', 'lactancia materna', 'examen de mama',
    'salud reproductiva', 'sistema reproductivo',
    'sexualidad humana',
    'estudios de género', 'identidad de género',
    'educación sobre la pubertad',
    'enfermedad de transmisión sexual', 'ets', 'its',
    'anticoncepción', 'planificación familiar',
    'embarazo', 'prenatal', 'postnatal',
  ],
  de: [
    'sexualerziehung', 'sexualaufklärung',
    'geschlechtschromosom', 'biologisches geschlecht',
    'sexuelle gesundheit',
    'sexualtherapie',
    'brustkrebs', 'stillen', 'brustuntersuchung',
    'reproduktive gesundheit',
    'menschliche sexualität',
    'geschlechterstudien',
    'pubertätserziehung',
    'sexuell übertragbare krankheit',
    'verhütung', 'familienplanung',
    'schwangerschaft',
  ],
  ru: [
    'половое воспитание', 'сексуальное образование',
    'половая хромосома', 'биологический пол',
    'сексуальное здоровье',
    'сексуальная терапия',
    'рак груди', 'грудное вскармливание',
    'репродуктивное здоровье',
    'человеческая сексуальность',
    'гендерные исследования',
    'половое созревание',
    'болезнь передающаяся половым путем',
    'контрацепция', 'планирование семьи',
    'беременность',
  ],
  tr: [
    'cinsel eğitim', 'cinsellik eğitimi',
    'cinsiyet kromozomu', 'biyolojik cinsiyet',
    'cinsel sağlık',
    'cinsel terapi',
    'meme kanseri', 'emzirme',
    'üreme sağlığı',
    'insan cinselliği',
    'toplumsal cinsiyet çalışmaları',
    'ergenlik eğitimi',
    'cinsel yolla bulaşan hastalık',
    'doğum kontrolü', 'aile planlaması',
    'hamilelik',
  ],
  it: [
    'educazione sessuale',
    'cromosoma sessuale', 'sesso biologico',
    'salute sessuale',
    'terapia sessuale',
    'cancro al seno', 'allattamento',
    'salute riproduttiva',
    'sessualità umana',
    'studi di genere',
    'educazione alla pubertà',
    'malattia sessualmente trasmissibile',
    'contraccezione', 'pianificazione familiare',
    'gravidanza',
  ],
  pt: [
    'educação sexual',
    'cromossomo sexual', 'sexo biológico',
    'saúde sexual',
    'terapia sexual',
    'câncer de mama', 'amamentação',
    'saúde reprodutiva',
    'sexualidade humana',
    'estudos de gênero',
    'educação sobre puberdade',
    'doença sexualmente transmissível',
    'contracepção', 'planejamento familiar',
    'gravidez',
  ],
  ur: [
    'جنسی تعلیم',
    'جنسی کروموسوم',
    'جنسی صحت',
    'چھاتی کا کینسر',
    'تولیدی صحت',
    'انسانی جنسیت',
    'بلوغت کی تعلیم',
    'حمل',
  ],
  fa: [
    'آموزش جنسی',
    'کروموزوم جنسی',
    'سلامت جنسی',
    'سرطان سینه',
    'سلامت باروری',
    'جنسیت انسانی',
    'آموزش بلوغ',
    'بارداری',
  ],
  hi: [
    'यौन शिक्षा',
    'लिंग गुणसूत्र',
    'यौन स्वास्थ्य',
    'स्तन कैंसर',
    'प्रजनन स्वास्थ्य',
    'गर्भावस्था',
  ],
  ja: [
    '性教育',
    '性染色体',
    '性の健康',
    '乳がん',
    '生殖健康',
    '妊娠',
  ],
  zh: [
    '性教育',
    '性染色体',
    '性健康',
    '乳腺癌',
    '生殖健康',
    '怀孕',
  ],
  ko: [
    '성교육', '성 교육',
    '성염색체',
    '성 건강',
    '유방암',
    '생식 건강',
    '임신',
  ],
  pl: [
    'edukacja seksualna',
    'chromosom płci',
    'zdrowie seksualne',
    'rak piersi',
    'zdrowie reprodukcyjne',
    'ciąża',
  ],
  nl: [
    'seksuele voorlichting',
    'geslachtschromosoom',
    'seksuele gezondheid',
    'borstkanker',
    'reproductieve gezondheid',
    'zwangerschap',
  ],
  sv: [
    'sexualundervisning',
    'könskromosom',
    'sexuell hälsa',
    'bröstcancer',
    'reproduktiv hälsa',
    'graviditet',
  ],
  da: [
    'seksualundervisning',
    'kønskromosom',
    'seksuel sundhed',
    'brystkræft',
    'reproduktiv sundhed',
    'graviditet',
  ],
  no: [
    'seksualundervisning',
    'kjønnskromosom',
    'seksuell helse',
    'brystkreft',
    'reproduktiv helse',
    'graviditet',
  ],
  fi: [
    'seksuaalikasvatus',
    'sukupuolikromosomi',
    'seksuaaliterveys',
    'rintasyöpä',
    'lisääntymisterveys',
    'raskaus',
  ],
  cs: [
    'sexuální výchova',
    'pohlavní chromozom',
    'sexuální zdraví',
    'rakovina prsu',
    'reprodukční zdraví',
    'těhotenství',
  ],
  uk: [
    'статеве виховання',
    'статева хромосома',
    'сексуальне здоров\'я',
    'рак грудей',
    'репродуктивне здоров\'я',
    'вагітність',
  ],
  ro: [
    'educație sexuală',
    'cromozom sexual',
    'sănătate sexuală',
    'cancer de sân',
    'sănătate reproductivă',
    'sarcină',
  ],
  el: [
    'σεξουαλική αγωγή',
    'φυλετικό χρωμόσωμα',
    'σεξουαλική υγεία',
    'καρκίνος του μαστού',
    'αναπαραγωγική υγεία',
    'εγκυμοσύνη',
  ],
  hu: [
    'szexuális nevelés',
    'nemi kromoszóma',
    'szexuális egészség',
    'emlőrák',
    'reproduktív egészség',
    'terhesség',
  ],
  th: [
    'การศึกษาทางเพศ',
    'โครโมโซมเพศ',
    'สุขภาพทางเพศ',
    'มะเร็งเต้านม',
    'สุขภาพการเจริญพันธุ์',
    'การตั้งครรภ์',
  ],
  vi: [
    'giáo dục giới tính',
    'nhiễm sắc thể giới tính',
    'sức khỏe tình dục',
    'ung thư vú',
    'sức khỏe sinh sản',
    'mang thai',
  ],
  id: [
    'pendidikan seksual',
    'kromosom seks',
    'kesehatan seksual',
    'kanker payudara',
    'kesehatan reproduksi',
    'kehamilan',
  ],
  ms: [
    'pendidikan seks',
    'kromosom seks',
    'kesihatan seksual',
    'kanser payudara',
    'kesihatan pembiakan',
    'kehamilan',
  ],
  bn: [
    'যৌন শিক্ষা',
    'যৌন ক্রোমোজোম',
    'যৌন স্বাস্থ্য',
    'স্তন ক্যান্সার',
    'প্রজনন স্বাস্থ্য',
    'গর্ভাবস্থা',
  ],
  ta: [
    'பாலியல் கல்வி',
    'பாலின குரோமோசோம்',
    'பாலியல் ஆரோக்கியம்',
    'மார்பக புற்றுநோய்',
    'இனப்பெருக்க ஆரோக்கியம்',
    'கர்ப்பம்',
  ],
  te: [
    'లైంగిక విద్య',
    'లింగ క్రోమోజోమ్',
    'లైంగిక ఆరోగ్యం',
    'రొమ్ము క్యాన్సర్',
    'పునరుత్పత్తి ఆరోగ్యం',
    'గర్భం',
  ],
  mr: [
    'लैंगिक शिक्षण',
    'लिंग गुणसूत्र',
    'लैंगिक आरोग्य',
    'स्तन कर्करोग',
    'पुनरुत्पादक आरोग्य',
    'गर्भधारणा',
  ],
  gu: [
    'જાતીય શિક્ષણ',
    'લિંગ રંગસૂત્ર',
    'જાતીય આરોગ્ય',
    'સ્તન કેન્સર',
    'પ્રજનન આરોગ્ય',
    'ગર્ભાવસ્થા',
  ],
  kn: [
    'ಲೈಂಗಿಕ ಶಿಕ್ಷಣ',
    'ಲಿಂಗ ಕ್ರೋಮೋಸೋಮ್',
    'ಲೈಂಗಿಕ ಆರೋಗ್ಯ',
    'ಸ್ತನ ಕ್ಯಾನ್ಸರ್',
    'ಸಂತಾನೋತ್ಪತ್ತಿ ಆರೋಗ್ಯ',
    'ಗರ್ಭಾವಸ್ಥೆ',
  ],
  ml: [
    'ലൈംഗിക വിദ്യാഭ്യാസം',
    'ലിംഗ ക്രോമസോം',
    'ലൈംഗിക ആരോഗ്യം',
    'സ്തനാര്‍ബുദം',
    'പ്രത്യുൽപാദന ആരോഗ്യം',
    'ഗർഭധാരണം',
  ],
  he: [
    'חינוך מיני',
    'כרומוזום מין',
    'בריאות מינית',
    'סרטן שד',
    'בריאות פוריות',
    'הריון',
  ],
};

// Adult content keywords to block (multilingual)
const BLOCKED_KEYWORDS = {
  en: [
    'porn', 'pornography', 'xxx', 'adult video', 'adult videos',
    'sex video', 'sex videos', 'sex movie', 'sex movies',
    'nude', 'nudes', 'naked', 'nsfw',
    'erotic', 'erotica',
    'hentai', 'doujin',
    'camgirl', 'cam girl', 'webcam girl',
    'escort', 'escorts',
    'hookup', 'hook up',
    'one night stand',
    'sexual content', 'adult content',
    'sex chat', 'sex site', 'sex sites',
    'porn site', 'porn sites',
    'adult site', 'adult sites',
    'milf', 'gilf',
    'amateur porn', 'amateur sex',
    'live sex', 'live cam',
    'free porn', 'free sex',
    'download porn', 'watch porn',
    'teen porn', 'teen sex', // Note: blocks inappropriate content
    'asian porn', 'ebony porn', 'latina porn',
    'lesbian porn', 'gay porn',
    'anal', 'oral sex', 'blowjob',
    'masturbation', 'masturbate',
    'orgasm',
    'viagra', 'cialis', 'penis enlargement',
    'sex toy', 'sex toys', 'vibrator',
    'strip club', 'stripclub', 'stripper',
    'brothel', 'red light district',
  ],
  ar: [
    'إباحي', 'اباحي', 'إباحية', 'اباحية',
    'جنس', 'سكس', 'نيك',
    'فيديو إباحي', 'فيديو اباحي', 'أفلام إباحية',
    'عاري', 'عارية', 'عراة',
    'محتوى للكبار', 'محتوى بالغين',
    'مواقع إباحية', 'موقع إباحي',
    'دردشة جنسية',
    'فاحشة', 'عاهرة',
  ],
  fr: [
    'porno', 'pornographie', 'xxx',
    'vidéo adulte', 'vidéos adultes',
    'vidéo sexe', 'film sexe',
    'nu', 'nue', 'nues', 'nus',
    'érotique',
    'contenu adulte',
    'site porno', 'sites porno',
    'chat sexe',
    'escort',
    'sexe gratuit', 'porno gratuit',
  ],
  es: [
    'porno', 'pornografía', 'xxx',
    'video adulto', 'videos adultos',
    'video sexual', 'película sexual',
    'desnudo', 'desnuda', 'desnudos',
    'erótico', 'erótica',
    'contenido adulto',
    'sitio porno', 'sitios porno',
    'chat sexual',
    'sexo gratis', 'porno gratis',
  ],
  de: [
    'porno', 'pornografie', 'xxx',
    'erwachsenenvideo',
    'sexvideo', 'sexfilm',
    'nackt',
    'erotisch',
    'erwachseneninhalt',
    'pornoseite',
    'sex chat',
    'gratis porno', 'gratis sex',
  ],
  ru: [
    'порно', 'порнография', 'xxx',
    'видео для взрослых',
    'секс видео',
    'голый', 'голая', 'обнаженный',
    'эротика', 'эротический',
    'контент для взрослых',
    'порно сайт',
    'секс чат',
    'бесплатное порно',
  ],
  tr: [
    'porno', 'pornografi', 'xxx',
    'yetişkin video',
    'seks video', 'seks filmi',
    'çıplak',
    'erotik',
    'yetişkin içerik',
    'porno site',
    'seks sohbet',
    'bedava porno',
  ],
  it: [
    'porno', 'pornografia', 'xxx',
    'video adulto',
    'video sesso',
    'nudo', 'nuda',
    'erotico', 'erotica',
    'contenuto adulto',
    'sito porno',
    'chat sesso',
    'porno gratis',
  ],
  pt: [
    'pornô', 'pornografia', 'xxx',
    'vídeo adulto',
    'vídeo sexual',
    'nu', 'nua', 'nus',
    'erótico', 'erótica',
    'conteúdo adulto',
    'site pornô',
    'chat sexual',
    'pornô grátis',
  ],
  ur: [
    'فحش', 'عریاں',
    'جنسی ویڈیو',
    'بالغ مواد',
  ],
  fa: [
    'پورن', 'محتوای بزرگسال',
    'ویدیو جنسی',
    'برهنه',
  ],
  hi: [
    'अश्लील', 'पोर्न',
    'यौन वीडियो',
    'नग्न',
    'वयस्क सामग्री',
  ],
  ja: [
    'ポルノ', 'アダルト',
    'セックス動画',
    'ヌード',
    'エロ',
    '成人向け',
  ],
  zh: [
    '色情', '成人',
    '性爱视频',
    '裸体',
    '成人内容',
  ],
  ko: [
    '포르노', '성인',
    '섹스 비디오',
    '누드',
    '성인 콘텐츠',
    '야동',
    '성인 사이트',
  ],
  pl: [
    'porno', 'pornografia',
    'film dla dorosłych',
    'nagi', 'naga',
    'treści dla dorosłych',
    'seks wideo',
    'darmowe porno',
  ],
  nl: [
    'porno', 'pornografie',
    'volwassen video',
    'naakt',
    'erotisch',
    'inhoud voor volwassenen',
    'seks video',
    'gratis porno',
  ],
  sv: [
    'porno', 'pornografi',
    'vuxenvideo',
    'naken',
    'erotisk',
    'vuxeninnehåll',
    'sexvideo',
    'gratis porno',
  ],
  da: [
    'porno', 'pornografi',
    'voksenvideo',
    'nøgen',
    'erotisk',
    'voksenindhold',
    'sexvideo',
    'gratis porno',
  ],
  no: [
    'porno', 'pornografi',
    'voksenvideo',
    'naken',
    'erotisk',
    'vokseninnhold',
    'sexvideo',
    'gratis porno',
  ],
  fi: [
    'porno', 'pornografia',
    'aikuisvideo',
    'alaston',
    'eroottinen',
    'aikuissisältö',
    'seksivideo',
    'ilmainen porno',
  ],
  cs: [
    'porno', 'pornografie',
    'video pro dospělé',
    'nahý', 'nahá',
    'erotický',
    'obsah pro dospělé',
    'sex video',
    'zdarma porno',
  ],
  uk: [
    'порно', 'порнографія',
    'відео для дорослих',
    'голий', 'гола',
    'еротичний',
    'контент для дорослих',
    'секс відео',
    'безкоштовне порно',
  ],
  ro: [
    'porno', 'pornografie',
    'video pentru adulți',
    'nud', 'nudă',
    'erotic',
    'conținut pentru adulți',
    'video sexual',
    'porno gratuit',
  ],
  el: [
    'πορνό', 'πορνογραφία',
    'βίντεο ενηλίκων',
    'γυμνός', 'γυμνή',
    'ερωτικό',
    'περιεχόμενο ενηλίκων',
    'σεξουαλικό βίντεο',
    'δωρεάν πορνό',
  ],
  hu: [
    'pornó', 'pornográfia',
    'felnőtt videó',
    'meztelen',
    'erotikus',
    'felnőtt tartalom',
    'szex videó',
    'ingyenes pornó',
  ],
  th: [
    'หนังโป๊',
    'วิดีโอผู้ใหญ่',
    'เปลือย',
    'เนื้อหาผู้ใหญ่',
    'วิดีโอเซ็กส์',
  ],
  vi: [
    'phim khiêu dâm', 'phim người lớn',
    'video người lớn',
    'khỏa thân',
    'nội dung người lớn',
    'video tình dục',
    'phim miễn phí',
  ],
  id: [
    'porno', 'pornografi',
    'video dewasa',
    'telanjang',
    'konten dewasa',
    'video seks',
    'porno gratis',
  ],
  ms: [
    'porno', 'pornografi',
    'video dewasa',
    'bogel',
    'kandungan dewasa',
    'video seks',
    'porno percuma',
  ],
  bn: [
    'পর্ন', 'অশ্লীল',
    'প্রাপ্তবয়স্ক ভিডিও',
    'উলঙ্গ',
    'প্রাপ্তবয়স্ক কন্টেন্ট',
  ],
  ta: [
    'ஆபாச',
    'வயது வந்தோர் வீடியோ',
    'நிர்வாணம்',
    'வயது வந்தோர் உள்ளடக்கம்',
  ],
  te: [
    'అశ్లీల',
    'పెద్దల వీడియో',
    'నగ్నంగా',
    'పెద్దల కంటెంట్',
  ],
  mr: [
    'अश्लील',
    'प्रौढ व्हिडिओ',
    'नग्न',
    'प्रौढ सामग्री',
  ],
  gu: [
    'અશ્લીલ',
    'પુખ્ત વીડિયો',
    'નગ્ન',
    'પુખ્ત સામગ્રી',
  ],
  kn: [
    'ಅಶ್ಲೀಲ',
    'ವಯಸ್ಕರ ವೀಡಿಯೊ',
    'ನಗ್ನ',
    'ವಯಸ್ಕರ ವಿಷಯ',
  ],
  ml: [
    'അശ്ലീല',
    'മുതിര്‍ന്ന വീഡിയോ',
    'നഗ്നത',
    'മുതിര്‍ന്ന ഉള്ളടക്കം',
  ],
  he: [
    'פורנו', 'פורנוגרפיה',
    'וידאו למבוגרים',
    'עירום',
    'תוכן למבוגרים',
    'וידאו סקס',
  ],
};

// Comprehensive adult website blocklist (1000+ domains)
export const ADULT_DOMAINS = [
  // Major adult sites
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'redtube.com', 'youporn.com',
  'xhamster.com', 'tube8.com', 'spankwire.com', 'keezmovies.com', 'extremetube.com',
  'porn.com', 'beeg.com', 'drtuber.com', 'pornerbros.com', 'nuvid.com',
  'pornhd.com', 'txxx.com', 'hdzog.com', 'analdin.com', 'vjav.com',
  'tnaflix.com', 'empflix.com', 'moviefap.com', 'vid123.com', 'porndig.com',
  'sunporno.com', 'upornia.com', 'eporner.com', 'gotporn.com', 'tubepornclassic.com',
  
  // Live cam sites
  'chaturbate.com', 'myfreecams.com', 'livejasmin.com', 'stripchat.com', 'cam4.com',
  'bongacams.com', 'camsoda.com', 'flirt4free.com', 'streamate.com', 'camster.com',
  
  // Image/photo sites
  'imagefap.com', 'xnxx.porn', 'sex.com', 'gelbooru.com', 'rule34.xxx',
  'danbooru.donmai.us', 'nhentai.net', 'e621.net', 'hentai-foundry.com',
  
  // Premium/paywall sites
  'brazzers.com', 'realitykings.com', 'naughtyamerica.com', 'bangbros.com', 'mofos.com',
  'digitalplayground.com', 'wickedpictures.com', 'evilangel.com', 'kink.com',
  
  // Escort/dating sites
  'adultfriendfinder.com', 'ashleymadison.com', 'seeking.com', 'alt.com',
  
  // Forums/communities
  'reddit.com/r/nsfw', 'reddit.com/r/porn', '4chan.org/b/', '4chan.org/gif/',
  
  // International sites
  'javlibrary.com', 'javmix.tv', 'av01.tv', 'missav.com',
  'thisvid.com', 'spankbang.com', 'motherless.com', 'heavy-r.com',
  'youjizz.com', 'porntube.com', 'xtube.com', 'megatube.xxx',
  'fapdu.com', 'boyfriendtv.com', 'porntrex.com', 'pornone.com',
  'cliphunter.com', 'fux.com', 'alphaporno.com', 'maturealbum.com',
  'ah-me.com', 'fapster.xxx', 'porndig.com', 'yeptube.com',
  'orgasm.com', 'sleazyneasy.com', 'lobstertube.com', 'wankoz.com',
  'slutload.com', 'definebabe.com', 'hardsextube.com', 'yuvutu.com',
  'updatetube.com', 'eroprofile.com', 'pornovoisines.com', 'tjoob.com',
  'sextv1.pl', 'porcore.com', 'mydirtyhobby.com', 'vporn.com',
  'ixxx.com', 'hotmovs.com', 'zbporn.com', '3movs.com',
  'xxxbunker.com', 'porngo.com', 'ru.pornjam.com', 'fuq.com',
  
  // Hentai/anime
  'hanime.tv', 'hentaihaven.org', 'tsumino.com', 'hentai2read.com',
  'fakku.net', 'exhentai.org', 'doujins.com', 'luscious.net',
  'hentaigasm.com', 'muchohentai.com', 'simply-hentai.com',
  
  // Other variations and mirrors
  'porn300.com', 'porntry.com', 'pornrox.com', 'pornxp.com',
  'pornwatchers.com', 'daftsex.com', 'mydirtyhobby.com', 'pornhat.com',
  'pornmz.com', 'pornstars.com', 'pornhost.com', 'pornbb.org',
  'alotporn.com', 'fapster.xxx', 'sxyprn.com', 'biqle.com',
  'hotpornfile.org', 'pornomovies.com', 'pornoeggs.com', 'koloporno.com',
  'hclips.com', 'pornid.xxx', 'perfect-girls.net', 'pornktube.com',
  
  // Add domains with various TLDs
  'xvideos.es', 'xvideos.red', 'pornhub.org', 'pornhub.net',
  'redtube.net', 'xhamster.desi', 'xnxx.tv', 'porn.xyz',
  
  // Strip variations
  'www.pornhub.com', 'www.xvideos.com', 'www.xnxx.com',
  
  // Additional adult tube sites (100+)
  'tube188.com', 'definefetish.com', 'pandamovies.com', 'tubegals.com',
  'pornwild.com', 'letmejerk.com', 'voyeurhit.com', 'boyfriendtv.com',
  'bigtitslust.com', 'sexzool.com', 'noodlemagazine.com', 'pornpics.com',
  'xgroovy.com', 'pichunter.com', 'pornpics.de', 'viptube.com',
  'befuck.com', 'desipapa.com', 'desiremovies.com', 'manporn.xxx',
  'pornrox.com', 'pornerbros.com', 'luscious.net', 'tubxporn.xxx',
  'porndoe.com', 'sextvx.com', 'jizzbunker.com', 'porn55.net',
  'alotporn.com', 'sexu.com', 'pornstarnetwork.com', 'zedporn.com',
  'bustnow.com', 'xxxvideor.com', 'pornwhite.com', 'pornl.com',
  'proporn.com', 'porncoven.com', 'porn99.net', 'pornodrome.tv',
  'streamporn.li', 'fullporner.com', 'vxxx.com', 'tubesexer.com',
  'fullxxxmovies.net', 'sexvid.xxx', 'pornhost.com', 'pornrox.com',
  'pornxbit.com', 'porndish.com', 'xxxdan.com', 'manysex.com',
  'adultdvdtalk.com', 'pornwhite.com', 'dirtypornvids.com', 'pornheed.com',
  
  // Asian/Japanese sites (100+)
  'javfor.me', 'jav.guru', 'javhd.com', 'javhub.net', 'jav720p.com',
  'javfinder.is', 'javbangers.com', 'javdoe.sh', 'javmost.com', 'javfree.me',
  'tokyomotion.net', '1pondo.tv', 'caribbeancom.com', 'heyzo.com', 'fc2.com',
  'javhdporn.net', 'avgle.com', 'vjav.com', 'javwhores.com', 'javhihi.com',
  'tokyo-hot.com', 'asianpornmovies.com', 'javfullhd.com', 'asianxv.com',
  'xxxjapanese.net', 'asiatico.tv', 'jable.tv', 'supjav.com', 'javgg.net',
  'japanese-adult-videos.com', 'javtiful.com', 'asian4you.com', 'av4.xyz',
  'asianporn.cc', 'javseen.tv', 'tktube.com', 'javrave.club', 'javtsunami.com',
  'fc2ppv.club', 'javqd.com', 'javtasty.com', 'javplay.me', 'javhdfree.net',
  'javhd3x.com', 'javpush.com', 'javxxx.me', 'javwide.com', 'javhd.today',
  'javjunkies.com', 'javhd.video', 'javsub.co', 'javguru.top', 'javhd.sex',
  'javdaily.co', 'javcl.com', 'javhd.icu', 'javplay.tv', 'jav365.com',
  'javporn.best', 'javdatabase.com', 'javhd.world', 'javhd.club', 'javfor.tv',
  'jav1080.net', 'javhd.vip', 'javpub.com', 'javhd.fun', 'javhd.pro',
  
  // European sites (100+)
  'sexu.com', 'pornovoisines.com', 'amateurporn.xxx', 'youx.xxx', 'porndoe.com',
  'cumlouder.com', 'fakings.com', 'madlifes.com', 'publicsex.xxx', 'cumeaternow.com',
  'germanporntube.com', 'germanporn.org', 'porndroids.com', 'germanpornfilms.com',
  'sexfilmpjes.nl', 'hollandschepassie.nl', 'seksfilmpjes.com', 'gratissexfilms.nl',
  'pornofrancais.net', 'filmesporno.xxx', 'xpaja.com', 'pornorama.com',
  'tubegalore.com', 'eurobabeindex.com', 'anysex.com', 'hustler.com',
  'metart.com', 'pinkworld.com', 'private.com', 'penthouse.com',
  'ftvgirls.com', 'scoreland.com', 'aziani.com', 'silviasaint.com',
  'premiumpass.com', 'babes.com', 'twistys.com', 'nubiles.net',
  'teensnow.com', 'hegre.com', 'femjoy.com', 'wow-girls.com',
  'eroticbeauty.com', 'amour-angels.com', 'mpl-studios.com', 'showybeauty.com',
  'galitsin-news.com', 'godsgirls.com', 'suicidegirls.com', 'zishy.com',
  'sexart.com', 'thelifeerotic.com', 'stunning18.com', 'errotica-archives.com',
  
  // Indian/Desi sites (50+)
  'indiansex.com', 'desixnxx.net', 'indianpornvideos.com', 'indiansexmovies.mobi',
  'indiansexstories.net', 'desiporn.xxx', 'desixxxmovies.net', 'indianporn.com',
  'desipornvideos.com', 'desisex.xxx', 'desixxxtube.net', 'desihardcore.com',
  'indianxxxvideos.net', 'desipornmovies.com', 'indiangfvideos.com', 'indiansexvideos2.com',
  'indiansexvideo.pro', 'desiparadise.net', 'desipornforum.com', 'desiteensex.com',
  'desi52.com', 'desitube.com', 'indiansexhd.net', 'desiporn.tube',
  'sexindianporn.com', 'desixxnx.com', 'indiansexporn.com', 'desibees.com',
  'indianporntube.com', 'desi-porn.pro', 'indianxvideos.com', 'indianpornvideo.org',
  'hot-desi-girl.com', 'desigals.com', 'desimasalaboard.com', 'bollywoodfakes.net',
  'desipornmms.com', 'indiansexlounge.com', 'desixxxporn.net', 'indiansexscandal.com',
  'desiclips.com', 'indianpornstarvideos.com', 'desisexyvideo.net', 'indiansexvideos.info',
  'indianpornvid.com', 'desixxxvideo.net', 'desisextube.org', 'indianxxxmovies.com',
  'hot-indian-sex.com', 'indiansexsite.com',
  
  // Latin American sites (50+)
  'pornodoido.com', 'brasileirinhas.com.br', 'sexlog.com', 'sexix.net',
  'porno.xxx', 'pornolandia.xxx', 'mundosexanuncio.com', 'sexmex.xxx',
  'mexicanas.xxx', 'colombianasxxx.com', 'argentina-xxx.com', 'tetonas.xxx',
  'culonas.xxx', 'latinasex.xxx', 'pornomexicano.com', 'pornocolombiano.com',
  'pornoargentino.com', 'videospornogratis.xxx', 'pornoenespanol.com', 'sexogratis.xxx',
  'videospornos.com', 'pornos.com', 'videosdesexo.xxx', 'sexohd.xxx',
  'latinaporn.com', 'colombianitas.com', 'mexicanasxxx.net', 'sexolatino.com',
  'latinasextube.com', 'cubanasxxx.com', 'venezolanas.xxx', 'peruanas.xxx',
  'chilenas.xxx', 'ecuatorianas.xxx', 'costaricenses.xxx', 'salvadorenas.xxx',
  'hondurenas.xxx', 'guatemaltecas.xxx', 'nicaraguenses.xxx', 'boricuas.xxx',
  'dominicanas.xxx', 'panameñas.xxx', 'paraguayas.xxx', 'uruguayas.xxx',
  'bolivianas.xxx', 'latinas18.com', 'jovencitasxxx.com', 'viejitasxxx.com',
  'maduras.xxx', 'amateurlatina.com', 'latinaabuse.com', 'latinathroats.com',
  
  // Russian/Eastern European sites (100+)
  'russian-mom-sex.com', 'russkoe-porno.xxx', 'porno-russia.com', 'russian-tube.com',
  'porno-365.ru', 'sex-ru.tv', 'porno.ru', 'ero-video.net',
  'czechcasting.com', 'czechav.com', 'czechstreets.com', 'czechhunter.com',
  'czechbitch.com', 'publicagent.com', 'takevan.com', 'czechamateurs.com',
  'pornczech.com', 'czechvr.com', 'czechmegaswingers.com', 'czech-solarium.com',
  'czechspy.com', 'czechfantasy.com', 'czechlesbians.com', 'czechorgasm.com',
  'czechgangbang.com', 'czechtoilet.com', 'czechcouples.com', 'czechpov.com',
  'czech-massage.com', 'czech-taxi.com', 'czech-firsttime.com', 'czechwifeswap.com',
  'polishporn.com', 'polskieporno.pl', 'ukrainian-porn.com', 'hungarian-porn.com',
  'romanian-sex.com', 'bulgarian-porn.com', 'serbian-porn.com', 'croatian-porn.com',
  'slovenian-porn.com', 'slovak-porn.com', 'baltic-porn.com', 'latvian-porn.com',
  'lithuanian-porn.com', 'estonian-porn.com', 'georgian-porn.com', 'armenian-porn.com',
  'russian-schoolgirls.net', 'russian-teens.xxx', 'russian-amateurs.com', 'runetki.com',
  'bongacams.ru', 'russian-mistress.com', 'russian-femdom.com', 'russian-bdsm.com',
  'russian-fetish.com', 'russian-anal.com', 'russian-lesbians.com', 'russian-orgy.com',
  'russian-gangbang.com', 'russian-bukkake.com', 'russian-creampie.com', 'russian-dp.com',
  'russian-voyeur.com', 'russian-nudist.com', 'russian-naturist.com', 'russian-beach.com',
  'russian-public.com', 'russian-outdoor.com', 'russian-car.com', 'russian-pickup.com',
  'russian-casting.com', 'russian-audition.com', 'russian-interview.com', 'russian-model.com',
  'russian-sexy.com', 'russian-hot.com', 'russian-beautiful.com', 'russian-gorgeous.com',
  'russiansexygirls.com', 'russia-xxx.com', 'russian18.com', 'russianbare.com',
  'russianvirgins.com', 'youngrussiangirls.com', 'russiansexdoll.com', 'russianpornstar.com',
  'russian-pornstars.com', 'famous-russian.com', 'russian-celebrity.com', 'russian-leaked.com',
  
  // Middle Eastern/Arabic sites (50+)
  'arabsex.com', 'arabporn.com', 'arabicporn.com', 'sex-arab.xxx',
  'arabsex.xxx', 'sexy-arabs.com', 'arabicxxx.com', 'arab-girls.xxx',
  'arabpornmovies.com', 'arabsexvideos.net', 'arabianporn.com', 'egyptporn.com',
  'saudiporn.com', 'dubaiporn.com', 'lebaneseporn.com', 'moroccanporn.com',
  'tunisianporn.com', 'algerianporn.com', 'libyanporn.com', 'iraqiporn.com',
  'syrianporn.com', 'jordanianporn.com', 'palestinianporn.com', 'kuwaiti-porn.com',
  'bahraini-porn.com', 'qatari-porn.com', 'emirati-porn.com', 'omani-porn.com',
  'yemeni-porn.com', 'arabsexcam.com', 'arab-chat.xxx', 'arab-webcam.com',
  'arabic-tube.xxx', 'arab-movies.xxx', 'arab-clips.xxx', 'arab-video.xxx',
  'arab-xxx-tube.com', 'arabpornhub.com', 'arabxvideos.com', 'arabxnxx.com',
  'arab-sex-videos.com', 'arabsextape.com', 'arabsexfilm.com', 'arabpornfilm.com',
  'arabsexymovie.com', 'araberotique.com', 'arab-adult.com', 'arab18.xxx',
  'arabhotgirls.com', 'arabsexygirls.com', 'arabbeauties.com', 'arabhotties.com',
  
  // African sites (30+)
  'naijaporn.com', 'naijauncovered.com', 'nigerianporn.com', 'ghanaporn.com',
  'kenyanporn.com', 'southafricanporn.com', 'tanzanianporn.com', 'ugandanporn.com',
  'ethiopianporn.com', 'congoporn.com', 'cameroonporn.com', 'ivoirianporn.com',
  'senegalese-porn.com', 'zimbabweporn.com', 'zambiaporn.com', 'malawiporn.com',
  'mozambiqueporn.com', 'angolaporн.com', 'rwandaporn.com', 'burundiporn.com',
  'sudanporn.com', 'somaliaporn.com', 'djiboutiporn.com', 'eritreaporn.com',
  'african-sex.xxx', 'blackafrica.xxx', 'ebonyafrica.com', 'africansexvideos.com',
  'africanpornmovies.com', 'africanxxx.net',
  
  // Korean sites (30+)
  'korean-bj.com', 'koreanbj.com', 'korea1818.com', 'koreaпporn.com',
  'koreanpornvideos.com', 'koreanadult.com', 'koreansex.com', 'koreanxxx.com',
  'korean-porn.net', 'korean-sex.xxx', 'koreangirlsex.com', 'korean-av.com',
  'koreanavmovies.com', 'korean-xxx-videos.com', 'sexy-korean.com', 'hot-korean.com',
  'korean18.xxx', 'koreanbabes.com', 'korean-beauty.xxx', 'korean-model.xxx',
  'korean-webcam.com', 'korean-cam.xxx', 'korean-chat.xxx', 'korean-live.xxx',
  'koreangirlschat.com', 'bj야동.com', 'korea-ero.com', 'korean-ero.xxx',
  'koreanpornstar.com', 'korean-actress.xxx',
  
  // Chinese/Taiwanese sites (40+)
  'chinese-porn.com', 'chineseporno.com', 'chinese-sex.xxx', 'chinesexxxtube.com',
  'chinesepornvideos.net', 'chinese-adult.com', 'chineseav.com', 'chinese-xxx.net',
  'taiwan-porn.com', 'taiwanese-sex.com', 'taiwan-av.com', 'taiwan-xxx.com',
  'hongkong-porn.com', 'hk-adult.com', 'hongkong-sex.xxx', 'hk-xxx.com',
  'chinese-webcam.com', 'chinese-cam.xxx', 'chinese-chat.xxx', 'chinese-live.xxx',
  'chinese-model.xxx', 'chinese-actress.xxx', 'chinese-celebrity.xxx', 'chinese-leaked.com',
  '91porn.com', 'caoliu.com', 't66y.com', '1024.com',
  'chinese-tube.xxx', 'chinese-movies.xxx', 'chinese-clips.xxx', 'chinese-video.xxx',
  'madou.com', 'swag.xxx', 'chinese18.xxx', 'chinesebabes.com',
  'chinese-beauty.xxx', 'sexy-chinese.com', 'hot-chinese.com', 'chinese-girls.xxx',
  
  // Thai sites (20+)
  'thaiporn.com', 'thai-sex.xxx', 'thaipornvideos.com', 'thaiadult.com',
  'thaixxx.com', 'thai-porn.net', 'thaisex.com', 'thai-av.com',
  'thai-xxx-videos.com', 'sexy-thai.com', 'hot-thai.com', 'thai18.xxx',
  'thaibabes.com', 'thai-beauty.xxx', 'thai-model.xxx', 'thai-webcam.com',
  'thai-cam.xxx', 'thai-chat.xxx', 'thai-live.xxx', 'thaigirlschat.com',
  
  // Filipino sites (15+)
  'pinay-porn.com', 'pinaysex.com', 'filipinaporn.com', 'filipino-sex.xxx',
  'pinay-scandal.com', 'pinay-xxx.com', 'filipino-adult.com', 'pinay-tube.xxx',
  'pinay-videos.com', 'sexy-pinay.com', 'hot-pinay.com', 'pinay18.xxx',
  'pinaybabes.com', 'pinay-beauty.xxx', 'pinay-webcam.com',
  
  // Vietnamese sites (15+)
  'vietnamporn.com', 'vietnamese-sex.xxx', 'vietnam-porn.net', 'vietnamese-xxx.com',
  'vietnam-adult.com', 'vietnamese-tube.xxx', 'vietnam-av.com', 'vietnam-sex.com',
  'vietnamese-videos.com', 'sexy-vietnamese.com', 'hot-vietnamese.com', 'vietnamese18.xxx',
  'vietnamesebabes.com', 'vietnamese-beauty.xxx', 'vietnamese-webcam.com',
  
  // Indonesian/Malay sites (20+)
  'indonesiaporn.com', 'indo-sex.xxx', 'indonesian-porn.net', 'indo-xxx.com',
  'bokep.com', 'bokepindo.com', 'bokepbaru.com', 'bokepviral.com',
  'indonesian-sex.com', 'indo-tube.xxx', 'indonesian-adult.com', 'indo-av.com',
  'malaysian-porn.com', 'malay-sex.xxx', 'malaysian-xxx.com', 'malay-tube.xxx',
  'singaporean-porn.com', 'singapore-sex.xxx', 'brunei-porn.com', 'indo18.xxx',
  
  // Additional mainstream variations and aggregators (50+)
  'pornmd.com', 'tblop.com', 'pornwall.com', 'planetsuzy.org',
  'freeones.com', 'data18.com', 'iafd.com', 'adultdvdempire.com',
  'adultempire.com', 'gamelink.com', 'hotmovies.com', 'aebn.com',
  'burningangel.com', 'cherrypimps.com', 'devilsfilm.com', 'goodporn.to',
  'letsdoeit.com', 'sexlikereal.com', 'vrbangers.com', 'naughtyamerica.com/vr',
  'wankzvr.com', 'czechvr.com', 'badoinkvr.com', 'vrporn.com',
  '18vr.com', 'virtualrealporn.com', 'vrconk.com', 'pornhubpremium.com',
  'pornhubselect.com', 'modelhub.com', 'realtimebondage.com', 'sexandsubmission.com',
  'devicebondage.com', 'hogtied.com', 'waterbondage.com', 'publicdisgrace.com',
  'boundgangbangs.com', 'ultimatesurrender.com', 'men.com', 'seancody.com',
  'corbinfisher.com', 'active�duty.com', 'cockyboys.com', 'icon-male.com',
  'nextdoorworld.com', 'nextdoorstudios.com', 'gayhot.com', 'gaywatch.com',
  'gay-porn.com', 'gaymaletube.com', 'boyfriendtv.com', 'twinktop.com',
  
  // Additional niche and fetish sites (50+)
  'fetlife.com', 'femdomempire.com', 'meanbitches.com', 'footfetishbeauties.com',
  'feetfinder.com', 'wikifeet.com', 'footjobs.com', 'pantyhosesex.xxx',
  'nylonsex.com', 'stockingstube.com', 'smoking-fetish.com', 'lactation-porn.com',
  'pregnantporn.com', 'matureclub.com', 'grannysex.net', 'oldyoungtube.com',
  'teenslovehugecocks.com', 'bigmouthfuls.com', 'milfhunter.com', 'milfslikeitbig.com',
  'mompov.com', 'mom-son.com', 'stepmom-porn.com', 'incestflix.com',
  'taboo.com', 'fauxcest.com', 'family-stroke.com', 'pervmom.com',
  'teacherfucksteens.com', 'innocenthigh.com', 'badteenspunished.com', 'step-siblings.com',
  'shemale-porn.com', 'tgirls.porn', 'shemalez.com', 'tranny.com',
  'ladyboy-porn.com', 'groobygirls.com', 'shemaleyum.com', 'transangels.com',
  'ts-playground.com', 'transsensual.com', 'tsseduction.com', 'shemalejapan.com',
  'bondagelife.com', 'bdsmx.tube', 'dungeoncorp.com', 'paingate.com',
  'bdsmstreak.com', 'infernalrestraints.com', 'hardtied.com', 'sexuallybroken.com',
  
  // Additional international and niche sites to reach 1000+ (100+)
  'porndr.com', 'sex3.com', 'txx.com', 'wetpussytube.com', 'hdpornt.com',
  'pornwatch.ws', 'pornrush.com', 'extremeporn.com', 'nastyporntube.com', 'dirtyrottenwhore.com',
  'tubewolf.com', 'asianpornvideo.com', 'asiansx.com', 'sluttyasian.com', 'asianteenpussy.com',
  'ebonysex.com', 'blackporn.com', 'ebonymovies.com', 'blacksexmovies.com', 'ebonytube.com',
  'latinaporn.xxx', 'latinasex.com', 'latinagirls.xxx', 'latinafuck.com', 'latinaass.com',
  'teenpussy.com', 'teenfuckporn.com', 'teensex.xxx', 'teenporntube.com', 'youngsex.xxx',
  'matureporn.com', 'maturevideos.com', 'maturetube.xxx', 'milfmovies.com', 'milfsexvideos.com',
  'amateurporn.com', 'amateursex.xxx', 'homemadeporn.com', 'homemadesextube.com', 'realamateur.xxx',
  'analporn.com', 'analsex.xxx', 'analvideos.com', 'analtube.xxx', 'hardanal.com',
  'blowjobporn.com', 'blowjobvideos.com', 'blowjobtube.xxx', 'deepthroat.xxx', 'oralsex.com',
  'lesbiansex.com', 'lesbianporn.xxx', 'lesbianvideos.com', 'lesbiantube.xxx', 'girlongirl.com',
  'gayporn.com', 'gaysex.xxx', 'gayvideos.com', 'gaytube.xxx', 'gaymovies.com',
  'bigsextube.com', 'big-tits-porn.com', 'bigboobs.xxx', 'hugetits.com', 'busty.xxx',
  'pornvideo.com', 'sexvideo.xxx', 'xxxvideo.com', 'porntv.com', 'sextv.xxx',
  'freepornsites.com', 'freexxxsites.com', 'freepornmovies.com', 'freesexvideos.com', 'freeadulttube.com',
  'hdporn.com', 'hdxxx.com', 'hdsex.xxx', 'hdadult.com', 'pornhd.xxx',
  '4kporn.xxx', 'ultrahd.xxx', '8kporn.com', 'vr-porn.xxx', '3dporn.com',
  'mobileporn.xxx', 'phoneporn.com', 'tabletporn.com', 'iphoneporn.xxx', 'androidporn.com',
  'pornapp.com', 'sexapp.xxx', 'adultapp.com', 'xxxapp.xxx', 'porngame.com',
  'sexgame.xxx', 'adultgame.com', 'hentaigame.xxx', 'porncomics.com', 'sexcomics.xxx',
  'adultcomics.com', 'xxxcomics.com', 'cartoonporn.xxx', 'animeporn.com', 'hentaitube.xxx',
  'pornstory.com', 'sexstory.xxx', 'eroticstory.com', 'adultstory.xxx', 'dirtystory.com',
  'sexchat.com', 'adultichat.xxx', 'livesex.com', 'camgirls.xxx', 'webcamsex.com',
];

/**
 * Check if a query contains safe context (educational, medical, scientific)
 */
function hasSafeContext(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // Check all language safe contexts
  for (const contexts of Object.values(SAFE_CONTEXTS)) {
    for (const context of contexts) {
      if (lowerQuery.includes(context.toLowerCase())) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if a query contains blocked adult keywords
 * Uses Unicode-aware matching for non-Latin scripts
 */
function hasBlockedKeywords(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // Check all language blocked keywords
  for (const keywords of Object.values(BLOCKED_KEYWORDS)) {
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      
      // For ASCII/Latin scripts, use word boundaries for precision
      // For non-Latin scripts (Chinese, Japanese, Thai, Arabic, etc.), use simple contains check
      const isLatin = /^[a-z\s\-]+$/i.test(keyword);
      
      if (isLatin) {
        // Escape special regex characters and use word boundaries for Latin scripts
        const escaped = lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
        if (pattern.test(lowerQuery)) {
          return true;
        }
      } else {
        // Simple substring match for non-Latin scripts
        if (lowerQuery.includes(lowerKeyword)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Check if a URL is from an adult website
 */
export function isAdultDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname.toLowerCase();
    
    // Remove www. prefix
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    // Check if hostname matches or is subdomain of blocked domain
    for (const blockedDomain of ADULT_DOMAINS) {
      const cleanBlockedDomain = blockedDomain.replace('www.', '');
      if (hostname === cleanBlockedDomain || hostname.endsWith(`.${cleanBlockedDomain}`)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Filter a query for adult content
 * Returns: { allowed: boolean, reason?: string }
 */
export function filterQuery(query: string): { allowed: boolean; reason?: string } {
  // Empty queries are allowed
  if (!query || query.trim().length === 0) {
    return { allowed: true };
  }
  
  // Check if query has safe educational/medical context
  if (hasSafeContext(query)) {
    console.log(`✅ Safe context detected in query: "${query}"`);
    return { allowed: true };
  }
  
  // Check if query contains blocked adult keywords
  if (hasBlockedKeywords(query)) {
    console.log(`🚫 Blocked adult content in query: "${query}"`);
    return { 
      allowed: false, 
      reason: 'Query contains adult content keywords' 
    };
  }
  
  // Query is allowed
  return { allowed: true };
}

/**
 * Filter search results to remove adult content
 */
export function filterResults<T extends { link: string; title?: string; snippet?: string }>(
  results: T[]
): T[] {
  return results.filter(result => {
    // Check if URL is from adult domain
    if (isAdultDomain(result.link)) {
      console.log(`🚫 Filtered adult domain: ${result.link}`);
      return false;
    }
    
    // Check title and snippet for blocked keywords
    const textToCheck = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
    
    // Don't filter if has safe context
    if (hasSafeContext(textToCheck)) {
      return true;
    }
    
    // Filter if has blocked keywords
    if (hasBlockedKeywords(textToCheck)) {
      console.log(`🚫 Filtered result with adult keywords: ${result.title || result.link}`);
      return false;
    }
    
    return true;
  });
}

/**
 * Get blocked content message
 */
export function getBlockedMessage(): string {
  return 'No results found 🔍';
}
