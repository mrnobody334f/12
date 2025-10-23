// هذا الملف يستخدم API endpoints للخادم للحصول على بيانات Serper Locations
// المصدر: https://api.serper.dev/locations (عبر الخادم)

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

// دالة البحث الجديدة - تستخدم API الخادم
export async function searchLocations(
  searchQuery: string,
  countryCode?: string,
  limit: number = 10
): Promise<LocationResult[]> {
  if (!searchQuery || searchQuery.trim().length < 2) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: searchQuery,
      limit: limit.toString(),
    });
    
    if (countryCode) {
      params.append('countryCode', countryCode);
    }

    const response = await fetch(`/api/locations/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to search locations:', error);
    return [];
  }
}

// دالة للحصول على جميع الدول
export async function getAllCountries(): Promise<SerperLocation[]> {
  try {
    const response = await fetch('/api/locations/countries');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const countries = data.countries || [];
    
    // إضافة فلسطين يدوياً لأنها غير موجودة في قائمة الدول
    const palestine: SerperLocation = {
      name: "Palestine",
      canonicalName: "Palestine",
      googleId: 2275,
      countryCode: "PS",
      targetType: "Country"
    };
    
    // إضافة فلسطين إذا لم تكن موجودة
    const hasPalestine = countries.some((country: SerperLocation) => country.countryCode === "PS");
    if (!hasPalestine) {
      countries.push(palestine);
    }
    
    return countries;
  } catch (error) {
    console.error('Failed to get countries:', error);
    return [];
  }
}

// دالة للحصول على ولايات دولة معينة
export async function getStatesOfCountry(countryCode: string): Promise<SerperLocation[]> {
  try {
    const response = await fetch(`/api/locations/states/${countryCode}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.states || [];
  } catch (error) {
    console.error('Failed to get states:', error);
    return [];
  }
}

// دالة للحصول على مدن ولاية معينة
export async function getCitiesOfState(countryCode: string, stateName: string): Promise<SerperLocation[]> {
  try {
    const response = await fetch(`/api/locations/cities/${countryCode}/${encodeURIComponent(stateName)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.cities || [];
  } catch (error) {
    console.error('Failed to get cities:', error);
    return [];
  }
}

// دالة للحصول على مدن دولة معينة
export async function getCitiesOfCountry(countryCode: string): Promise<SerperLocation[]> {
  try {
    const response = await fetch(`/api/locations/cities/${countryCode}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.cities || [];
  } catch (error) {
    console.error('Failed to get cities:', error);
    return [];
  }
}

// دالة للحصول على دولة بواسطة الكود
export async function getCountryByCode(countryCode: string): Promise<SerperLocation | undefined> {
  try {
    const countries = await getAllCountries();
    return countries.find(loc => loc.countryCode === countryCode.toUpperCase());
  } catch (error) {
    console.error('Failed to get country by code:', error);
    return undefined;
  }
}

// دالة للحصول على ولاية بواسطة الكود
export async function getStateByCode(countryCode: string, stateName: string): Promise<SerperLocation | undefined> {
  try {
    const states = await getStatesOfCountry(countryCode);
    return states.find(loc => loc.name === stateName);
  } catch (error) {
    console.error('Failed to get state by code:', error);
    return undefined;
  }
}

// دالة لتهيئة البيانات عند بدء التشغيل
export async function initializeLocations(): Promise<void> {
  try {
    const response = await fetch('/api/locations/init');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Locations initialized: ${data.count} locations loaded`);
  } catch (error) {
    console.error('Failed to initialize locations:', error);
  }
}

// دالة للتحقق من حالة التحميل
export async function isLocationsLoaded(): Promise<boolean> {
  try {
    const response = await fetch('/api/locations/status');
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.loaded || false;
  } catch (error) {
    console.error('Failed to check locations status:', error);
    return false;
  }
}

// دالة للحصول على عدد المواقع المحملة
export async function getLocationsCount(): Promise<number> {
  try {
    const response = await fetch('/api/locations/status');
    
    if (!response.ok) {
      return 0;
    }
    
    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error('Failed to get locations count:', error);
    return 0;
  }
}