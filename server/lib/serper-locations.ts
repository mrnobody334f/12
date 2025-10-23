// هذا الملف يتعامل مع تحميل وإدارة بيانات Serper Locations
// المصدر: https://api.serper.dev/locations

export interface SerperLocation {
  name: string;
  canonicalName: string;
  googleId: number;
  countryCode: string;
  targetType: 'Country' | 'State' | 'City' | 'Region';
}

export interface LocationResult {
  city: string;
  state: string;
  country: string;
  countryCode: string;
  stateCode?: string;
  fullName: string; // للعرض: "Dallas, Texas, United States"
  canonicalName: string; // لـ Serper: "Dallas,Texas,United States"
  googleId: number;
  targetType: string;
}

// تحميل Serper Locations
let serperLocations: SerperLocation[] = [];
let isLoading = false;
let loadPromise: Promise<void> | null = null;

async function loadSerperLocations(): Promise<void> {
  if (isLoading && loadPromise) {
    return loadPromise;
  }
  
  if (serperLocations.length > 0) {
    return Promise.resolve();
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      console.log('🔄 Loading Serper locations from server...');
      const response = await fetch('https://api.serper.dev/locations');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      serperLocations = await response.json();
      console.log(`✅ Loaded ${serperLocations.length} locations from Serper`);
    } catch (error) {
      console.error('❌ Failed to load Serper locations:', error);
      // Fallback to empty array
      serperLocations = [];
    } finally {
      isLoading = false;
    }
  })();

  return loadPromise;
}

// دالة البحث
export function searchLocations(
  searchQuery: string,
  countryCode?: string,
  limit: number = 10
): LocationResult[] {
  if (!searchQuery || searchQuery.trim().length < 2) {
    return [];
  }

  const query = searchQuery.toLowerCase().trim();
  let results: LocationResult[] = [];

  // إذا لم يتم تحميل البيانات بعد، إرجاع مصفوفة فارغة
  if (serperLocations.length === 0) {
    // تحميل البيانات في الخلفية
    loadSerperLocations();
    return [];
  }

  // البحث في Serper locations
  const filteredLocations = serperLocations.filter(loc => {
    // فلترة حسب الدولة إذا تم تحديدها
    if (countryCode && loc.countryCode !== countryCode.toUpperCase()) {
      return false;
    }
    
    // البحث في الاسم
    return loc.name.toLowerCase().includes(query) || 
           loc.canonicalName.toLowerCase().includes(query);
  });

  // تحويل إلى LocationResult
  results = filteredLocations.slice(0, limit * 3).map(loc => {
    // تحليل canonicalName: "Dallas,Texas,United States"
    const parts = loc.canonicalName.split(',');
    
    let city = '';
    let state = '';
    let country = '';
    
    if (loc.targetType === 'Country') {
      country = loc.name;
    } else if (loc.targetType === 'State' || loc.targetType === 'Region') {
      state = parts[0] || '';
      country = parts[1] || loc.name;
    } else if (loc.targetType === 'City') {
      city = parts[0] || '';
      state = parts[1] || '';
      country = parts[2] || '';
    }
    
    // إنشاء fullName للعرض (بمسافات)
    const fullNameParts = loc.canonicalName.split(',');
    const fullName = fullNameParts.join(', ');
    
    return {
      city,
      state,
      country,
      countryCode: loc.countryCode,
      stateCode: undefined, // Serper لا يوفر stateCode منفصل
      fullName, // للعرض: "Dallas, Texas, United States"
      canonicalName: loc.canonicalName, // لـ Serper: "Dallas,Texas,United States"
      googleId: loc.googleId,
      targetType: loc.targetType
    };
  });

  // ترتيب النتائج
  return results
    .sort((a, b) => {
      // أولوية للولايات (States)
      if (a.targetType === 'State' && b.targetType !== 'State') return -1;
      if (a.targetType !== 'State' && b.targetType === 'State') return 1;
      
      // ثم المدن
      if (a.targetType === 'City' && b.targetType !== 'City') return -1;
      if (a.targetType !== 'City' && b.targetType === 'City') return 1;
      
      // ثم أبجدياً
      return a.fullName.localeCompare(b.fullName);
    })
    .slice(0, limit);
}

// دالة للحصول على جميع الدول
export function getAllCountries(): SerperLocation[] {
  if (serperLocations.length === 0) {
    // تحميل البيانات في الخلفية
    loadSerperLocations();
    return [];
  }
  
  return serperLocations.filter(loc => loc.targetType === 'Country');
}

// دالة للحصول على ولايات دولة معينة
export function getStatesOfCountry(countryCode: string): SerperLocation[] {
  if (serperLocations.length === 0) {
    return [];
  }
  
  return serperLocations.filter(loc => 
    loc.targetType === 'State' && loc.countryCode === countryCode.toUpperCase()
  );
}

// دالة للحصول على مدن ولاية معينة
export function getCitiesOfState(countryCode: string, stateName: string): SerperLocation[] {
  if (serperLocations.length === 0) {
    return [];
  }
  
  return serperLocations.filter(loc => 
    loc.targetType === 'City' && 
    loc.countryCode === countryCode.toUpperCase() &&
    loc.canonicalName.includes(stateName)
  );
}

// دالة للحصول على مدن دولة معينة
export function getCitiesOfCountry(countryCode: string): SerperLocation[] {
  if (serperLocations.length === 0) {
    return [];
  }
  
  return serperLocations.filter(loc => 
    loc.targetType === 'City' && loc.countryCode === countryCode.toUpperCase()
  );
}

// دالة للحصول على دولة بواسطة الكود
export function getCountryByCode(countryCode: string): SerperLocation | undefined {
  if (serperLocations.length === 0) {
    return undefined;
  }
  
  return serperLocations.find(loc => 
    loc.targetType === 'Country' && loc.countryCode === countryCode.toUpperCase()
  );
}

// دالة للحصول على ولاية بواسطة الكود
export function getStateByCode(countryCode: string, stateName: string): SerperLocation | undefined {
  if (serperLocations.length === 0) {
    return undefined;
  }
  
  return serperLocations.find(loc => 
    loc.targetType === 'State' && 
    loc.countryCode === countryCode.toUpperCase() &&
    loc.name === stateName
  );
}

// دالة لتحميل البيانات عند بدء التشغيل
export function initializeLocations(): Promise<void> {
  return loadSerperLocations();
}

// دالة للتحقق من حالة التحميل
export function isLocationsLoaded(): boolean {
  return serperLocations.length > 0;
}

// دالة للحصول على عدد المواقع المحملة
export function getLocationsCount(): number {
  return serperLocations.length;
}

