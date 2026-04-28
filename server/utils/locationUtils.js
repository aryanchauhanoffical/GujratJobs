const GUJARAT_CITIES = [
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Rajkot',
  'Gandhinagar',
  'Bhavnagar',
  'Jamnagar',
  'Junagadh',
  'Anand',
  'Navsari',
  'Morbi',
  'Surendranagar',
  'Mehsana',
  'Bharuch',
  'Porbandar',
  'Amreli',
  'Bhuj',
  'Gondal',
  'Veraval',
  'Botad',
  'Patan',
  'Dahod',
  'Valsad',
  'Godhra',
  'Palanpur',
  'Ankleshwar',
  'Vapi',
  'Gandhidham',
  'Jetpur',
  'Wadhwan',
  'Kalol',
  'Nadiad',
  'Himatnagar',
  'Kapadvanj',
  'Sidhpur',
  'Dhoraji',
  'Upleta',
  'Wankaner',
  'Vyara',
  'Mandvi',
];

const GUJARAT_CITY_COORDINATES = {
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Surat: { lat: 21.1702, lng: 72.8311 },
  Vadodara: { lat: 22.3072, lng: 73.1812 },
  Rajkot: { lat: 22.3039, lng: 70.8022 },
  Gandhinagar: { lat: 23.2156, lng: 72.6369 },
  Bhavnagar: { lat: 21.7645, lng: 72.1519 },
  Jamnagar: { lat: 22.4707, lng: 70.0577 },
  Junagadh: { lat: 21.5222, lng: 70.4579 },
  Anand: { lat: 22.5645, lng: 72.9289 },
  Navsari: { lat: 20.9467, lng: 72.9520 },
  Morbi: { lat: 22.8173, lng: 70.8375 },
  Surendranagar: { lat: 22.7278, lng: 71.6496 },
  Mehsana: { lat: 23.5880, lng: 72.3693 },
  Bharuch: { lat: 21.7051, lng: 72.9959 },
  Porbandar: { lat: 21.6424, lng: 69.6100 },
  Amreli: { lat: 21.6017, lng: 71.2218 },
  Bhuj: { lat: 23.2419, lng: 69.6669 },
  Gondal: { lat: 21.9616, lng: 70.7977 },
  Veraval: { lat: 20.9071, lng: 70.3622 },
  Botad: { lat: 22.1696, lng: 71.6657 },
};

// Validate if a location is in Gujarat
const isGujaratLocation = (city, state) => {
  if (state && state.toLowerCase() === 'gujarat') return true;

  if (city) {
    return GUJARAT_CITIES.some(
      (c) => c.toLowerCase() === city.toLowerCase().trim()
    );
  }

  return false;
};

// Get city coordinates
const getCityCoordinates = (city) => {
  const normalizedCity = Object.keys(GUJARAT_CITY_COORDINATES).find(
    (c) => c.toLowerCase() === city.toLowerCase().trim()
  );
  return normalizedCity ? GUJARAT_CITY_COORDINATES[normalizedCity] : null;
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get nearby cities within a radius
const getNearbyCities = (cityName, radiusKm = 50) => {
  const coords = getCityCoordinates(cityName);
  if (!coords) return [];

  return GUJARAT_CITIES.filter((city) => {
    if (city.toLowerCase() === cityName.toLowerCase()) return false;
    const cityCoords = getCityCoordinates(city);
    if (!cityCoords) return false;
    const distance = calculateDistance(coords.lat, coords.lng, cityCoords.lat, cityCoords.lng);
    return distance <= radiusKm;
  });
};

module.exports = {
  GUJARAT_CITIES,
  GUJARAT_CITY_COORDINATES,
  isGujaratLocation,
  getCityCoordinates,
  calculateDistance,
  getNearbyCities,
};
