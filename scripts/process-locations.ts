import fs from 'fs';

interface GoogleCountry {
  country_code: string;
  country_name: string;
}

interface GoogleLocation {
  country_code: string;
  name: string;
  canonical_name: string;
  target_type: string;
}

interface Country {
  name: string;
  code: string;
  cities: string[];
}

console.log('معالجة البيانات الرسمية من Google...');

const countriesRaw: GoogleCountry[] = JSON.parse(
  fs.readFileSync('/tmp/google-countries.json', 'utf-8')
);

const locationsRaw: GoogleLocation[] = JSON.parse(
  fs.readFileSync('/tmp/locations.json', 'utf-8')
);

console.log(`تم تحميل ${countriesRaw.length} دولة`);
console.log(`تم تحميل ${locationsRaw.length} موقع`);

const citiesByCountry: Record<string, Set<string>> = {};

locationsRaw.forEach((location) => {
  if (location.target_type === 'City' && location.name) {
    const countryCode = location.country_code.toLowerCase();
    if (!citiesByCountry[countryCode]) {
      citiesByCountry[countryCode] = new Set();
    }
    citiesByCountry[countryCode].add(location.name);
  }
});

const countries: Country[] = [
  { name: 'Global', code: 'global', cities: [] }
];

countriesRaw.forEach((country) => {
  const code = country.country_code.toLowerCase();
  const cities = Array.from(citiesByCountry[code] || [])
    .sort()
    .slice(0, 10);
  
  countries.push({
    name: country.country_name,
    code: code,
    cities: cities
  });
});

console.log(`معالجة ${countries.length} دولة (مع مدنها)`);

const outputPath = 'client/src/data/google-locations.ts';
const output = `// هذا الملف تم إنشاؤه تلقائياً من البيانات الرسمية لـ Google/serper.dev
// المصدر: https://serpapi.com/google-countries.json و https://serpapi.com/locations.json
// آخر تحديث: ${new Date().toISOString().split('T')[0]}

export interface Country {
  name: string;
  code: string;
  cities: string[];
}

export const countriesData: Country[] = ${JSON.stringify(countries, null, 2)};
`;

fs.writeFileSync(outputPath, output, 'utf-8');
console.log(`✅ تم حفظ البيانات في: ${outputPath}`);
console.log(`إجمالي الدول: ${countries.length}`);
