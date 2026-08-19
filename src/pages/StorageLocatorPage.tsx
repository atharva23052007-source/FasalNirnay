import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Snowflake,
  MapPin,
  Phone,
  Star,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Package,
  Thermometer,
  Droplets,
  IndianRupee,
  Search,
  SlidersHorizontal,
  Warehouse,
  X,
  Clock3,
  TrendingUp,
  Check,
  AlertTriangle,
  Scale,
  GitCompare,
  Eye,
  Navigation,
  Loader2,
  RefreshCcw,
} from 'lucide-react';

export const StorageLocatorPage: React.FC = () => {
  const {
    storageFacilities,
    setSelectedStorageFacility,
    selectedLocation,
    setSelectedLocation,
    user,
    userCoords,
    setUserCoords,
  } = useApp();

  // =========================================================
  // GPS / LOCATION STATE
  // =========================================================

  // userCoords comes from AppContext (shared, triggers storage re-fetch)
  const [userLocationLabel, setUserLocationLabel] = useState<string>(
    userCoords ? user.location : selectedLocation.name + ', ' + selectedLocation.state
  );
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // =========================================================
  // HAVERSINE FORMULA — real GPS distance in km
  // =========================================================

  const haversineDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return parseFloat((R * c).toFixed(1));
    },
    []
  );

  // Get the effective distance: gpsDistanceKm from API first, then GPS Haversine, then legacy fallback
  const getDistance = useCallback(
    (store: { lat?: number; lon?: number; name: string; distanceKm: number; gpsDistanceKm?: number }): number => {
      // 1. Best: server-computed MongoDB $geoNear distance
      if (store.gpsDistanceKm !== undefined) {
        return store.gpsDistanceKm;
      }
      // 2. Client-side Haversine if coords available
      if (userCoords && store.lat !== undefined && store.lon !== undefined) {
        return haversineDistance(userCoords.lat, userCoords.lon, store.lat, store.lon);
      }
      // 3. Legacy text-based fallback
      const storeNameLower = store.name.toLowerCase();
      const cityLower = selectedLocation.name.toLowerCase();
      if (cityLower === 'nashik') {
        if (storeNameLower.includes('lasalgaon')) return 44.5;
        return store.distanceKm;
      }
      if (cityLower === 'lasalgaon') {
        if (storeNameLower.includes('lasalgaon')) return 1.8;
        return 44.5;
      }
      if (cityLower === 'pune') {
        if (storeNameLower.includes('lasalgaon')) return 235.0;
        return 212.0;
      }
      if (cityLower === 'indore') {
        if (storeNameLower.includes('lasalgaon')) return 378.0;
        return 410.0;
      }
      if (cityLower === 'kolar') {
        if (storeNameLower.includes('lasalgaon')) return 965.0;
        return 980.0;
      }
      return store.distanceKm;
    },
    [userCoords, selectedLocation.name, haversineDistance]
  );

  // Reverse geocode coordinates → human label (Nominatim only — free, no key)
  const reverseGeocode = useCallback(async (lat: number, lon: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`
      );
      if (res.ok) {
        const d = await res.json();
        const a = d.address || {};
        const place = a.village || a.suburb || a.town || a.city || a.municipality || '';
        const district = a.county || a.state_district || '';
        const state = a.state || '';
        const parts = [place, district, state].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : d.display_name?.split(', ').slice(0, 3).join(', ') || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      }
    } catch {}
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }, []);

  // ================================================================
  // DETECT LIVE GPS — only called when user clicks the button
  // Uses enableHighAccuracy:true to request real hardware GPS
  // NO automatic fallback to any city if GPS fails
  // ================================================================
  const detectLiveGPS = useCallback(() => {
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('Your browser does not support GPS. Please use a modern browser.');
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;

        // Set shared GPS coords in AppContext — triggers storage API re-fetch
        setUserCoords({ lat, lon });

        // Reverse geocode to human label
        const label = await reverseGeocode(lat, lon);
        setUserLocationLabel(label);

        // Also update the global selectedLocation so navbar shows detected city
        const parts = label.split(', ');
        const name = parts[0] || 'My Location';
        const state = parts[parts.length - 1] || '';
        setSelectedLocation({
          id: 'live',
          name,
          state,
          coordinates: { lat, lon },
        });

        setIsGpsLoading(false);
      },
      (err) => {
        setIsGpsLoading(false);
        // Show a clear, actionable error — no silent fallback to any hardcoded city
        if (err.code === 1 /* PERMISSION_DENIED */) {
          setGpsError('⚠️ Location access denied. Please enable location permissions in your browser settings and try again.');
        } else if (err.code === 2 /* POSITION_UNAVAILABLE */) {
          setGpsError('⚠️ GPS signal unavailable. Make sure location services are enabled on your device.');
        } else if (err.code === 3 /* TIMEOUT */) {
          setGpsError('⚠️ GPS timed out. Move to an open area for better signal and try again.');
        } else {
          setGpsError('⚠️ Could not detect GPS location. Please enable location permissions and try again.');
        }
      },
      {
        enableHighAccuracy: true, // request real GPS hardware, not IP/WiFi approximation
        timeout: 15000,           // 15 seconds for hardware GPS to lock
        maximumAge: 0,            // always get fresh position, never cached
      }
    );
  }, [reverseGeocode, setUserCoords, setSelectedLocation]);

  // Auto-detect GPS when page opens — fires immediately so user sees real location
  // "Detect GPS" button re-runs this on demand
  useEffect(() => {
    detectLiveGPS();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================
  // FILTERS
  // =========================================================

  const [stateFilter, setStateFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [cropFilter, setCropFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // =========================================================
  // FARMER REQUIREMENTS
  // =========================================================

  const [quantity, setQuantity] = useState<number>(500);
  const [quantityUnit, setQuantityUnit] = useState<
    'kg' | 'quintal' | 'ton'
  >('kg');

  const [storageDays, setStorageDays] = useState<number>(15);

  // =========================================================
  // SORT
  // =========================================================

  const [sortBy, setSortBy] = useState<
    'best' | 'distance' | 'price' | 'rating' | 'availability'
  >('best');

  // =========================================================
  // COMPARE
  // =========================================================

  const [compareIds, setCompareIds] = useState<string[]>([]);

  // =========================================================
  // DETAILS MODAL
  // =========================================================

  const [detailsFacility, setDetailsFacility] =
    useState<any | null>(null);

  // =========================================================
  // STORAGE TYPE
  // =========================================================

  type ExtendedStorageFacility =
    (typeof storageFacilities)[number] & {
      state?: string;
      city?: string;
      phone?: string;
      verified?: boolean;
    };

  const facilities =
    storageFacilities as ExtendedStorageFacility[];

// =========================================================
// STATE OPTIONS
// =========================================================

const states = useMemo(() => {
  const uniqueStates = Array.from(
    new Set(
      facilities.map((store) => store.state).filter((s): s is string => !!s)
    )
  ).sort();
  return ['All', ...uniqueStates];
}, [facilities]);

// =========================================================
// CITY OPTIONS
// =========================================================

const cities = useMemo(() => {
  const filteredByState = stateFilter === 'All'
    ? facilities
    : facilities.filter(
        (store) =>
          store.state === stateFilter ||
          (store.location && store.location.toLowerCase().includes(stateFilter.toLowerCase()))
      );

  const uniqueCities = Array.from(
    new Set(
      filteredByState.map((store) => store.city).filter((c): c is string => !!c)
    )
  ).sort();

  return ['All', ...uniqueCities];
}, [facilities, stateFilter]);

  // =========================================================
  // CROPS
  // =========================================================

  const crops = useMemo(() => {
    const uniqueCrops = Array.from(
      new Set(
        facilities.flatMap(
          (store) => store.suitableCrops || []
        )
      )
    ).sort();

    return ['All', ...uniqueCrops];
  }, [facilities]);

  // =========================================================
  // CROP STORAGE REQUIREMENTS
  // =========================================================

  const cropRequirements: Record<
    string,
    {
      temperature: string;
      humidity: string;
      minTemp: number;
      maxTemp: number;
    }
  > = {
    Tomato: {
      temperature: '10°C – 14°C',
      humidity: '85% – 95%',
      minTemp: 10,
      maxTemp: 14,
    },

    Onion: {
      temperature: '0°C – 4°C',
      humidity: '65% – 75%',
      minTemp: 0,
      maxTemp: 4,
    },

    Potato: {
      temperature: '4°C – 8°C',
      humidity: '90% – 95%',
      minTemp: 4,
      maxTemp: 8,
    },

    Apple: {
      temperature: '0°C – 4°C',
      humidity: '90% – 95%',
      minTemp: 0,
      maxTemp: 4,
    },

    Mango: {
      temperature: '10°C – 13°C',
      humidity: '85% – 90%',
      minTemp: 10,
      maxTemp: 13,
    },

    Banana: {
      temperature: '13°C – 15°C',
      humidity: '90% – 95%',
      minTemp: 13,
      maxTemp: 15,
    },

    Grapes: {
      temperature: '0°C – 2°C',
      humidity: '90% – 95%',
      minTemp: 0,
      maxTemp: 2,
    },

    'Leafy Vegetables': {
      temperature: '2°C – 6°C',
      humidity: '90% – 95%',
      minTemp: 2,
      maxTemp: 6,
    },

    Carrot: {
      temperature: '0°C – 4°C',
      humidity: '90% – 95%',
      minTemp: 0,
      maxTemp: 4,
    },

    Cabbage: {
      temperature: '0°C – 4°C',
      humidity: '90% – 95%',
      minTemp: 0,
      maxTemp: 4,
    },
  };

  // =========================================================
  // CONVERT QUANTITY TO TONNES
  // =========================================================

  const quantityInTonnes = useMemo(() => {
    if (quantity <= 0) return 0;

    if (quantityUnit === 'kg') {
      return quantity / 1000;
    }

    if (quantityUnit === 'quintal') {
      return quantity / 10;
    }

    return quantity;
  }, [quantity, quantityUnit]);

  // =========================================================
  // GET TEMPERATURE NUMBERS FROM STORAGE RANGE
  // =========================================================

  const getTemperatureRange = (value: string) => {
    const matches = value.match(/-?\d+(?:\.\d+)?/g);

    if (!matches || matches.length < 2) {
      return null;
    }

    return {
      min: Number(matches[0]),
      max: Number(matches[1]),
    };
  };

  // =========================================================
  // TEMPERATURE COMPATIBILITY
  // =========================================================

  const getTemperatureCompatibility = (
    store: ExtendedStorageFacility
  ) => {
    if (
      cropFilter === 'All' ||
      !cropRequirements[cropFilter]
    ) {
      return true;
    }

    const requirement =
      cropRequirements[cropFilter];

    const facilityTemperature =
      getTemperatureRange(
        store.tempRangeCelsius
      );

    if (!facilityTemperature) {
      return false;
    }

    return (
      facilityTemperature.min <=
        requirement.maxTemp &&
      facilityTemperature.max >=
        requirement.minTemp
    );
  };

  // =========================================================
  // CAPACITY
  // =========================================================

  const getAvailabilityPercent = (
    store: ExtendedStorageFacility
  ) => {
    if (!store.totalCapacityMT) return 0;

    return Math.min(
      100,
      Math.max(
        0,
        (store.availableCapacityMT /
          store.totalCapacityMT) *
          100
      )
    );
  };

  // =========================================================
  // QUANTITY AVAILABILITY
  // =========================================================

  const hasEnoughCapacity = (
    store: ExtendedStorageFacility
  ) => {
    return (
      store.availableCapacityMT >=
      quantityInTonnes
    );
  };

  // =========================================================
  // AVAILABILITY STATUS
  // =========================================================

  const getAvailabilityStatus = (
    store: ExtendedStorageFacility
  ) => {
    const percentage =
      getAvailabilityPercent(store);

    if (percentage >= 50) {
      return {
        label: 'High Availability',
        className:
          'bg-green-50 text-green-700 border-green-100',
      };
    }

    if (percentage >= 20) {
      return {
        label: 'Limited Space',
        className:
          'bg-amber-50 text-amber-700 border-amber-100',
      };
    }

    return {
      label: 'Almost Full',
      className:
        'bg-red-50 text-red-700 border-red-100',
    };
  };

  // =========================================================
  // ESTIMATED COST
  // =========================================================

  const calculateStorageCost = (
    store: ExtendedStorageFacility
  ) => {
    return (
      quantityInTonnes *
      store.pricePerTonPerDayRs *
      storageDays
    );
  };

  // =========================================================
  // BEST MATCH SCORE
  // =========================================================

  const getBestMatchScore = (
    store: ExtendedStorageFacility
  ) => {
    let score = 0;

    // Crop compatibility
    if (
      cropFilter !== 'All' &&
      store.suitableCrops?.some(
        (crop) =>
          crop.toLowerCase() ===
          cropFilter.toLowerCase()
      )
    ) {
      score += 35;
    }

    // Temperature
    if (getTemperatureCompatibility(store)) {
      score += 25;
    }

    // Capacity
    if (hasEnoughCapacity(store)) {
      score += 20;
    }

    // Rating
    score += Math.min(
      10,
      store.rating * 2
    );

    // Distance — use GPS Haversine if available
    const distance = getDistance(store);
    if (distance <= 10) {
      score += 10;
    } else if (distance <= 20) {
      score += 6;
    } else if (distance <= 50) {
      score += 4;
    } else {
      score += 2;
    }

    return Math.round(score);
  };

  // =========================================================
  // FILTER + SORT
  // =========================================================

  const filteredFacilities = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    const result = facilities.filter(
      (store) => {
        const matchesState =
          stateFilter === 'All' ||
          store.state === stateFilter ||
          (store.location && store.location.toLowerCase().includes(stateFilter.toLowerCase()));

        const matchesCity =
          cityFilter === 'All' ||
          store.city === cityFilter ||
          (store.location && store.location.toLowerCase().includes(cityFilter.toLowerCase()));

        const matchesCrop =
          cropFilter === 'All' ||
          (store.suitableCrops || []).some(
            (crop) =>
              crop.toLowerCase() ===
              cropFilter.toLowerCase()
          );

        const matchesSearch =
          !query ||
          store.name
            .toLowerCase()
            .includes(query) ||
          (store.city || '')
            .toLowerCase()
            .includes(query) ||
          store.location
            .toLowerCase()
            .includes(query) ||
          (store.state || '')
            .toLowerCase()
            .includes(query) ||
          (store.suitableCrops || []).some(
            (crop) =>
              crop
                .toLowerCase()
                .includes(query)
          );

        return (
          matchesState &&
          matchesCity &&
          matchesCrop &&
          matchesSearch
        );
      }
    );

    return [...result].sort(
      (a, b) => {
        if (sortBy === 'distance') {
          return getDistance(a) - getDistance(b);
        }

        if (sortBy === 'price') {
          return (
            a.pricePerTonPerDayRs -
            b.pricePerTonPerDayRs
          );
        }

        if (sortBy === 'rating') {
          return (
            b.rating - a.rating
          );
        }

        if (
          sortBy === 'availability'
        ) {
          return (
            b.availableCapacityMT -
            a.availableCapacityMT
          );
        }

        return (
          getBestMatchScore(b) -
          getBestMatchScore(a)
        );
      }
    );
  }, [
    facilities,
    stateFilter,
    cityFilter,
    cropFilter,
    searchQuery,
    sortBy,
    quantityInTonnes,
  ]);

  // =========================================================
  // BEST MATCH
  // =========================================================

  const bestMatch =
    filteredFacilities.length > 0
      ? filteredFacilities[0]
      : null;

  // =========================================================
  // RESET
  // =========================================================

  const resetFilters = () => {
    setStateFilter('All');
    setCityFilter('All');
    setCropFilter('All');
    setSearchQuery('');
    setQuantity(500);
    setQuantityUnit('kg');
    setStorageDays(15);
    setSortBy('best');
  };

  // =========================================================
  // STATE CHANGE
  // =========================================================

  const handleStateChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStateFilter(event.target.value);
    setCityFilter('All');
  };

  // =========================================================
  // COMPARE
  // =========================================================

  const toggleCompare = (
    facilityId: string
  ) => {
    setCompareIds((current) => {
      if (current.includes(facilityId)) {
        return current.filter(
          (id) => id !== facilityId
        );
      }

      if (current.length >= 3) {
        return current;
      }

      return [
        ...current,
        facilityId,
      ];
    });
  };

  const comparisonFacilities =
    facilities.filter((store) =>
      compareIds.includes(store.id)
    );

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (
    amount: number
  ) => {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }
    ).format(amount);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-7 shadow-sm">

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Snowflake className="w-6 h-6 text-blue-600" />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="font-heading font-extrabold text-2xl lg:text-3xl text-gray-900 tracking-tight">
                  Nearby Cold Storage Locator
                </h2>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Storage Network
                </span>

              </div>

              <p className="text-sm text-gray-500 font-medium mt-1">
                Find suitable storage based on
                location, crop, quantity and duration.
              </p>

            </div>

          </div>

          {/* GPS LOCATION BANNER */}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">

            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border flex-1 ${
              isGpsLoading ? 'bg-blue-50 border-blue-200'
              : userCoords ? 'bg-emerald-50 border-emerald-200'
              : gpsError ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
            }`}>

              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isGpsLoading ? 'bg-blue-100'
                : userCoords ? 'bg-emerald-100'
                : gpsError ? 'bg-red-100'
                : 'bg-amber-100'
              }`}>
                {isGpsLoading ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                ) : (
                  <MapPin className={`w-4 h-4 ${
                    userCoords ? 'text-[#167A42]'
                    : gpsError ? 'text-red-500'
                    : 'text-amber-600'
                  }`} />
                )}
              </div>

              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
                    {isGpsLoading ? 'Detecting GPS…' : userCoords ? 'Your GPS Location' : 'Location'}
                  </p>
                  {userCoords && !isGpsLoading && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold">
                      <Navigation className="w-2.5 h-2.5" /> GPS Active
                    </span>
                  )}
                </div>

                <p className={`text-sm font-bold truncate ${
                  isGpsLoading ? 'text-blue-700 animate-pulse'
                  : gpsError ? 'text-red-600'
                  : 'text-gray-800'
                }`}>
                  {isGpsLoading
                    ? 'Requesting your GPS location…'
                    : gpsError
                    ? 'GPS permission required'
                    : (userLocationLabel || 'Click “Detect GPS” to find your location')}
                </p>

                {userCoords && !isGpsLoading && (
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                    {userCoords.lat.toFixed(5)}°N, {userCoords.lon.toFixed(5)}°E
                  </p>
                )}

                {gpsError && !isGpsLoading && (
                  <p className="text-xs text-red-600 font-semibold mt-1 leading-tight">{gpsError}</p>
                )}

              </div>

            </div>

            <button
              type="button"
              onClick={detectLiveGPS}
              disabled={isGpsLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#167A42] hover:bg-[#126335] text-white text-xs font-extrabold transition-all shadow-sm active:scale-95 disabled:opacity-60 flex-shrink-0"
              title="Detect live GPS location"
            >
              {isGpsLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCcw className="w-3.5 h-3.5" />
              )}
              {isGpsLoading ? 'Detecting...' : 'Detect GPS'}
            </button>

          </div>

        </div>

        {/* ===================================================
            FARMER REQUIREMENT
        =================================================== */}

        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-100">

          <div className="flex items-center gap-2 mb-4">

            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Package className="w-4 h-4 text-[#167A42]" />
            </div>

            <div>

              <p className="text-sm font-extrabold text-gray-900">
                What do you need to store?
              </p>

              <p className="text-xs text-gray-500">
                Enter quantity and storage duration
                for a more accurate recommendation.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* QUANTITY */}

            <div>

              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                Quantity
              </label>

              <div className="flex">

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(
                        0,
                        Number(e.target.value)
                      )
                    )
                  }
                  className="w-full px-4 py-3 rounded-l-xl border border-gray-200 bg-white text-sm font-bold outline-none focus:border-green-500"
                />

                <select
                  value={quantityUnit}
                  onChange={(e) =>
                    setQuantityUnit(
                      e.target.value as
                        | 'kg'
                        | 'quintal'
                        | 'ton'
                    )
                  }
                  className="px-3 rounded-r-xl border-y border-r border-gray-200 bg-gray-50 text-xs font-bold outline-none"
                >
                  <option value="kg">
                    kg
                  </option>
                  <option value="quintal">
                    Quintal
                  </option>
                  <option value="ton">
                    Ton
                  </option>
                </select>

              </div>

            </div>

            {/* DURATION */}

            <div>

              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                Storage Duration
              </label>

              <div className="relative">

                <Clock3 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="number"
                  min="1"
                  value={storageDays}
                  onChange={(e) =>
                    setStorageDays(
                      Math.max(
                        1,
                        Number(
                          e.target.value
                        )
                      )
                    )
                  }
                  className="w-full pl-10 pr-16 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold outline-none focus:border-green-500"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  days
                </span>

              </div>

            </div>

            {/* REQUIRED QUANTITY */}

            <div className="rounded-xl bg-white border border-gray-200 px-4 py-3">

              <p className="text-[10px] uppercase font-bold text-gray-400">
                Required Capacity
              </p>

              <p className="text-lg font-extrabold text-gray-900 mt-1">
                {quantityInTonnes.toFixed(2)} MT
              </p>

            </div>

            {/* ESTIMATED RANGE */}

            <div className="rounded-xl bg-white border border-gray-200 px-4 py-3">

              <p className="text-[10px] uppercase font-bold text-gray-400">
                Storage Period
              </p>

              <p className="text-lg font-extrabold text-[#167A42] mt-1">
                {storageDays} days
              </p>

            </div>

          </div>

        </div>

        {/* ===================================================
            FILTERS
        =================================================== */}

        <div className="mt-6 pt-5 border-t border-gray-100">

          <div className="flex items-center gap-2 mb-4">

            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-gray-600" />
            </div>

            <div>

              <p className="text-sm font-bold text-gray-900">
                Find the right storage
              </p>

              <p className="text-xs text-gray-500">
                Select state, city and crop.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* STATE */}

            <div>

              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                State
              </label>

              <select
                value={stateFilter}
                onChange={handleStateChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 cursor-pointer"
              >

                {states.map((state) => (
                  <option
                    key={state}
                    value={state}
                  >
                    {state === 'All'
                      ? 'All States'
                      : state}
                  </option>
                ))}

              </select>

            </div>

            {/* CITY */}

            <div>

              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                City / Nearby Location
              </label>

              <select
                value={cityFilter}
                onChange={(e) =>
                  setCityFilter(
                    e.target.value
                  )
                }
                disabled={
                  stateFilter === 'All'
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 disabled:opacity-50 cursor-pointer"
              >

                {cities.map((city) => (
                  <option
                    key={city}
                    value={city}
                  >
                    {city === 'All'
                      ? stateFilter ===
                        'All'
                        ? 'Select State First'
                        : 'All Cities'
                      : city}
                  </option>
                ))}

              </select>

            </div>

            {/* CROP */}

            <div>

              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                Suitable Crop
              </label>

              <select
                value={cropFilter}
                onChange={(e) =>
                  setCropFilter(
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 cursor-pointer"
              >

                {crops.map((crop) => (
                  <option
                    key={crop}
                    value={crop}
                  >
                    {crop === 'All'
                      ? 'All Crops'
                      : crop}
                  </option>
                ))}

              </select>

            </div>

            {/* SEARCH */}

            <div>

              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                Search
              </label>

              <div className="relative">

                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  placeholder="Search storage..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
                />

              </div>

            </div>

          </div>

          {/* SORT */}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">

            <div className="flex items-center gap-2 text-xs text-gray-500">

              <Warehouse className="w-4 h-4 text-gray-400" />

              Showing

              <strong className="text-gray-800">
                {filteredFacilities.length}
              </strong>

              storage facilities

            </div>

            <div className="flex items-center gap-2">

              <span className="text-xs font-bold text-gray-500">
                Sort by
              </span>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | 'best'
                      | 'distance'
                      | 'price'
                      | 'rating'
                      | 'availability'
                  )
                }
                className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold outline-none"
              >

                <option value="best">
                  Best Match
                </option>

                <option value="distance">
                  Nearest
                </option>

                <option value="price">
                  Lowest Price
                </option>

                <option value="rating">
                  Highest Rating
                </option>

                <option value="availability">
                  Highest Availability
                </option>

              </select>

            </div>

          </div>

          {(stateFilter !== 'All' ||
            cityFilter !== 'All' ||
            cropFilter !== 'All' ||
            searchQuery) && (

            <div className="mt-3">

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600"
              >

                <X className="w-3.5 h-3.5" />

                Clear Filters

              </button>

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          CROP REQUIREMENT BANNER
      ===================================================== */}

      {cropFilter !== 'All' &&
        cropRequirements[cropFilter] && (

        <section className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">

                <Thermometer className="w-5 h-5 text-blue-600" />

              </div>

              <div>

                <p className="text-sm font-extrabold text-gray-900">
                  Recommended conditions for{' '}
                  {cropFilter}
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  Facilities are ranked higher when
                  their conditions match these
                  requirements.
                </p>

              </div>

            </div>

            <div className="flex flex-wrap gap-2">

              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold">
                <Thermometer className="w-3.5 h-3.5" />
                {cropRequirements[
                  cropFilter
                ].temperature}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold">
                <Droplets className="w-3.5 h-3.5" />
                {cropRequirements[
                  cropFilter
                ].humidity}
              </span>

            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          BEST MATCH
      ===================================================== */}

      {bestMatch && (
        <section className="relative overflow-hidden bg-[#167A42] rounded-3xl p-5 text-white shadow-md">

          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -right-4 -bottom-16 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">

            <div>

              <div className="flex items-center gap-2 mb-2">

                <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-[10px] font-extrabold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  BEST MATCH
                </span>

                <span className="text-xs text-green-100">
                  Score {getBestMatchScore(
                    bestMatch
                  )}/100
                </span>

              </div>

              <h3 className="font-heading font-extrabold text-xl">
                {bestMatch.name}
              </h3>

              <p className="text-sm text-green-100 mt-1 flex items-center gap-1 flex-wrap">
                <MapPin className="w-3.5 h-3.5" />
                {bestMatch.location}
                {' • '}
                {getDistance(bestMatch)}{' '}km away
                {userCoords && bestMatch.lat && (
                  <span className="inline-flex items-center gap-0.5 bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    <Navigation className="w-2.5 h-2.5" /> GPS
                  </span>
                )}
              </p>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

              <div className="bg-white/10 rounded-xl px-3 py-2">
                <p className="text-[9px] text-green-100 uppercase font-bold">
                  Rating
                </p>
                <p className="font-extrabold">
                  ⭐ {bestMatch.rating}
                </p>
              </div>

              <div className="bg-white/10 rounded-xl px-3 py-2">
                <p className="text-[9px] text-green-100 uppercase font-bold">
                  Available
                </p>
                <p className="font-extrabold">
                  {bestMatch.availableCapacityMT.toLocaleString()} MT
                </p>
              </div>

              <div className="bg-white/10 rounded-xl px-3 py-2">
                <p className="text-[9px] text-green-100 uppercase font-bold">
                  Rate
                </p>
                <p className="font-extrabold">
                  ₹{bestMatch.pricePerTonPerDayRs}
                </p>
              </div>

              <div className="bg-white/10 rounded-xl px-3 py-2">
                <p className="text-[9px] text-green-100 uppercase font-bold">
                  Est. Cost
                </p>
                <p className="font-extrabold">
                  {formatCurrency(
                    calculateStorageCost(
                      bestMatch
                    )
                  )}
                </p>
              </div>

            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          STORAGE CARDS
      ===================================================== */}

      {filteredFacilities.length > 0 ? (

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {filteredFacilities.map(
            (store, index) => {

              const availability =
                getAvailabilityPercent(
                  store
                );

              const availabilityStatus =
                getAvailabilityStatus(
                  store
                );

              const enoughCapacity =
                hasEnoughCapacity(
                  store
                );

              const temperatureCompatible =
                getTemperatureCompatibility(
                  store
                );

              const bestMatchScore =
                getBestMatchScore(
                  store
                );

              const isCompared =
                compareIds.includes(
                  store.id
                );

              const isBestMatch =
                index === 0 &&
                sortBy === 'best';

              return (

                <article
                  key={store.id}
                  className={`group bg-white border rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 ${
                    isBestMatch
                      ? 'border-green-300 ring-1 ring-green-100'
                      : 'border-gray-200'
                  }`}
                >

                  {/* BEST MATCH LABEL */}

                  {isBestMatch && (

                    <div className="mb-4">

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-[10px] font-extrabold">

                        <TrendingUp className="w-3.5 h-3.5" />

                        Best Match •{' '}
                        {bestMatchScore}/100

                      </span>

                    </div>

                  )}

                  {/* FACILITY HEADER */}

                  <div className="flex items-start gap-4">

                    {/* IMAGE */}

                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">

                      <img
                        src={store.image}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {store.verified !== false && (

                        <div className="absolute bottom-1.5 left-1.5 bg-white/95 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">

                          <CheckCircle2 className="w-3 h-3 text-green-600" />

                          <span className="text-[9px] font-bold text-green-700">
                            Verified
                          </span>

                        </div>

                      )}

                    </div>

                    {/* INFORMATION */}

                    <div className="flex-1 min-w-0">

                      <div className="flex items-start justify-between gap-2">

                        <div className="min-w-0">

                          <h3 className="font-heading font-extrabold text-base sm:text-lg text-gray-900 leading-tight">
                            {store.name}
                          </h3>

                          <div className="flex items-start gap-1 mt-1.5 text-xs text-gray-500">

                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />

                            <span>
                              {store.location}
                            </span>

                          </div>

                        </div>

                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full flex-shrink-0">

                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />

                          {store.rating}

                        </span>

                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">

                        {store.city &&
                          store.state && (

                          <span className="text-xs font-semibold text-gray-500">
                            {store.city},{' '}
                            {store.state}
                          </span>

                        )}

                        <span className="text-gray-300">
                          •
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#167A42]">
                          {getDistance(store)}{' '}km away
                          {userCoords && store.lat && (
                            <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              <Navigation className="w-2.5 h-2.5" />GPS
                            </span>
                          )}
                        </span>

                      </div>

                      {/* CONDITIONS */}

                      <div className="flex flex-wrap gap-2 mt-3">

                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-lg">

                          <Thermometer className="w-3.5 h-3.5" />

                          {store.tempRangeCelsius}

                        </span>

                        <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 font-bold text-xs px-2.5 py-1 rounded-lg">

                          <Droplets className="w-3.5 h-3.5" />

                          {store.humidityPercent}

                        </span>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      MATCH WARNINGS
                  ================================================= */}

                  {cropFilter !== 'All' && (

                    <div className="flex flex-wrap gap-2 mt-4">

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold ${
                          temperatureCompatible
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}
                      >

                        {temperatureCompatible ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}

                        {temperatureCompatible
                          ? 'Temperature Compatible'
                          : 'Temperature Mismatch'}

                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold ${
                          enoughCapacity
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}
                      >

                        {enoughCapacity ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}

                        {enoughCapacity
                          ? 'Quantity Available'
                          : 'Insufficient Space'}

                      </span>

                    </div>

                  )}

                  {/* STORAGE METRICS */}

                  <div className="mt-5 bg-gray-50 border border-gray-100 rounded-2xl p-4">

                    <div className="grid grid-cols-3 divide-x divide-gray-200">

                      {/* CAPACITY */}

                      <div className="text-center px-2">

                        <Package className="w-4 h-4 mx-auto text-gray-400 mb-1.5" />

                        <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
                          Total Capacity
                        </p>

                        <p className="text-sm font-extrabold text-gray-900 mt-1">
                          {store.totalCapacityMT.toLocaleString()} MT
                        </p>

                      </div>

                      {/* AVAILABLE */}

                      <div className="text-center px-2">

                        <CheckCircle2 className="w-4 h-4 mx-auto text-green-500 mb-1.5" />

                        <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
                          Available
                        </p>

                        <p className="text-sm font-extrabold text-green-700 mt-1">
                          {store.availableCapacityMT.toLocaleString()} MT
                        </p>

                      </div>

                      {/* RATE */}

                      <div className="text-center px-2">

                        <IndianRupee className="w-4 h-4 mx-auto text-gray-400 mb-1.5" />

                        <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
                          Rate / Ton / Day
                        </p>

                        <p className="text-sm font-extrabold text-gray-900 mt-1">
                          ₹
                          {
                            store.pricePerTonPerDayRs
                          }
                        </p>

                      </div>

                    </div>

                    {/* AVAILABILITY BAR */}

                    <div className="mt-4">

                      <div className="flex items-center justify-between mb-1.5">

                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          Storage Availability
                        </span>

                        <span className="text-[10px] font-extrabold text-gray-700">
                          {Math.round(
                            availability
                          )}
                          %
                        </span>

                      </div>

                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">

                        <div
                          className={`h-full rounded-full transition-all ${
                            availability >= 50
                              ? 'bg-green-500'
                              : availability >=
                                20
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${availability}%`,
                          }}
                        />

                      </div>

                      <div className="flex justify-between items-center mt-2">

                        <span
                          className={`inline-flex px-2 py-1 rounded-md border text-[9px] font-bold ${availabilityStatus.className}`}
                        >
                          {availabilityStatus.label}
                        </span>

                        <span className="text-[10px] text-gray-500 font-semibold">
                          Your requirement:{' '}
                          {quantityInTonnes.toFixed(
                            2
                          )}{' '}
                          MT
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* COST */}

                  <div className="mt-3 rounded-xl bg-green-50 border border-green-100 p-3 flex items-center justify-between gap-3">

                    <div className="flex items-center gap-2">

                      <IndianRupee className="w-4 h-4 text-[#167A42]" />

                      <div>

                        <p className="text-[10px] uppercase font-bold text-gray-400">
                          Estimated Storage Cost
                        </p>

                        <p className="text-sm font-extrabold text-[#167A42]">
                          {formatCurrency(
                            calculateStorageCost(
                              store
                            )
                          )}
                        </p>

                      </div>

                    </div>

                    <span className="text-[10px] font-semibold text-gray-500 text-right">
                      {quantityInTonnes.toFixed(
                        2
                      )}{' '}
                      MT × ₹
                      {
                        store.pricePerTonPerDayRs
                      }{' '}
                      × {storageDays} days
                    </span>

                  </div>

                  {/* CROPS + ACTIONS */}

                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-5">

                    <div className="flex-1">

                      <p className="text-[11px] font-bold text-gray-400 mb-2">
                        SUITABLE FOR
                      </p>

                      <div className="flex flex-wrap gap-1.5">

                        {store.suitableCrops.map(
                          (crop, cropIndex) => (

                            <span
                              key={`${store.id}-${cropIndex}`}
                              className="bg-green-50 border border-green-100 text-[#167A42] font-bold text-[10.5px] px-2.5 py-1 rounded-lg"
                            >
                              {crop}
                            </span>

                          )
                        )}

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center gap-2 flex-shrink-0">

                      {/* COMPARE */}

                      <button
                        type="button"
                        title="Compare facility"
                        onClick={() =>
                          toggleCompare(
                            store.id
                          )
                        }
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
                          isCompared
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >

                        {isCompared ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <GitCompare className="w-4 h-4" />
                        )}

                      </button>

                      {/* DETAILS */}

                      <button
                        type="button"
                        title="View details"
                        onClick={() =>
                          setDetailsFacility(
                            store
                          )
                        }
                        className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-[#167A42] transition"
                      >

                        <Eye className="w-4 h-4" />

                      </button>

                      {/* PHONE */}

                      {store.phone && (

                        <button
                          type="button"
                          title="Call storage facility"
                          onClick={() =>
                            window.open(
                              `tel:${store.phone}`
                            )
                          }
                          className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-[#167A42] transition"
                        >

                          <Phone className="w-4 h-4" />

                        </button>

                      )}

                      {/* RESERVE */}

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedStorageFacility(
                            store
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#167A42] hover:bg-[#126335] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all"
                      >

                        Reserve Space

                        <ArrowRight className="w-4 h-4" />

                      </button>

                    </div>

                  </div>

                </article>

              );
            }
          )}

        </div>

      ) : (

        /* EMPTY */

        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center">

            <Warehouse className="w-8 h-8 text-blue-500" />

          </div>

          <h3 className="font-heading font-extrabold text-xl text-gray-900 mt-5">
            No storage facilities found
          </h3>

          <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
            We couldn't find storage options
            matching your selected state,
            city, crop or quantity.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#167A42] hover:bg-[#126335] text-white text-xs font-bold transition"
          >
            Show All Storage Options
          </button>

        </div>

      )}

      {/* =====================================================
          COMPARE BAR
      ===================================================== */}

      {compareIds.length > 0 && (

        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-4xl">

          <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-4">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">

                  <GitCompare className="w-5 h-5" />

                </div>

                <div>

                  <p className="text-sm font-extrabold">
                    Compare Facilities
                  </p>

                  <p className="text-[11px] text-gray-400">
                    {compareIds.length}/3 facilities
                    selected
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setCompareIds([])
                  }
                  className="px-3 py-2 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/10"
                >
                  Clear
                </button>

                <button
                  type="button"
                  disabled={
                    comparisonFacilities.length <
                    2
                  }
                  onClick={() => {
                    if (
                      comparisonFacilities.length <
                      2
                    ) {
                      return;
                    }

                    document
                      .getElementById(
                        'storage-comparison'
                      )
                      ?.scrollIntoView({
                        behavior: 'smooth',
                      });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#167A42] disabled:opacity-40 text-xs font-bold"
                >
                  Compare Now
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          COMPARISON TABLE
      ===================================================== */}

      {comparisonFacilities.length >= 2 && (

        <section
          id="storage-comparison"
          className="bg-white border border-gray-200 rounded-3xl p-5 lg:p-6 shadow-sm"
        >

          <div className="flex items-center justify-between gap-3 mb-5">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">

                <Scale className="w-5 h-5 text-blue-600" />

              </div>

              <div>

                <h3 className="font-heading font-extrabold text-lg text-gray-900">
                  Facility Comparison
                </h3>

                <p className="text-xs text-gray-500">
                  Compare your selected storage
                  options side-by-side.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setCompareIds([])
              }
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px] text-sm">

              <thead>

                <tr className="border-b border-gray-100">

                  <th className="text-left py-3 pr-4 text-xs font-bold text-gray-400 uppercase">
                    Feature
                  </th>

                  {comparisonFacilities.map(
                    (store) => (

                      <th
                        key={store.id}
                        className="text-left py-3 px-3"
                      >

                        <p className="font-extrabold text-gray-900">
                          {store.name}
                        </p>

                        <p className="text-[10px] text-gray-500 mt-1">
                          {store.city},{' '}
                          {store.state}
                        </p>

                      </th>

                    )
                  )}

                </tr>

              </thead>

              <tbody>

                <tr className="border-b border-gray-50">

                  <td className="py-3 font-bold text-gray-500">
                    Distance
                  </td>

                  {comparisonFacilities.map(
                    (store) => (
                      <td
                        key={store.id}
                        className="py-3 px-3 font-bold"
                      >
                        {getDistance(store)}{' '}km
                      </td>
                    )
                  )}

                </tr>

                <tr className="border-b border-gray-50">

                  <td className="py-3 font-bold text-gray-500">
                    Rating
                  </td>

                  {comparisonFacilities.map(
                    (store) => (
                      <td
                        key={store.id}
                        className="py-3 px-3 font-bold text-amber-600"
                      >
                        ⭐ {store.rating}
                      </td>
                    )
                  )}

                </tr>

                <tr className="border-b border-gray-50">

                  <td className="py-3 font-bold text-gray-500">
                    Temperature
                  </td>

                  {comparisonFacilities.map(
                    (store) => (
                      <td
                        key={store.id}
                        className="py-3 px-3"
                      >
                        {store.tempRangeCelsius}
                      </td>
                    )
                  )}

                </tr>

                <tr className="border-b border-gray-50">

                  <td className="py-3 font-bold text-gray-500">
                    Humidity
                  </td>

                  {comparisonFacilities.map(
                    (store) => (
                      <td
                        key={store.id}
                        className="py-3 px-3"
                      >
                        {store.humidityPercent}
                      </td>
                    )
                  )}

                </tr>

                <tr className="border-b border-gray-50">

                  <td className="py-3 font-bold text-gray-500">
                    Total Capacity
                  </td>

                  {comparisonFacilities.map(
                    (store) => (
                      <td
                        key={store.id}
                        className="py-3 px-3 font-bold"
                      >
                        {store.totalCapacityMT.toLocaleString()}{' '}
                        MT
                      </td>
                    )
                  )}

                </tr>

                <tr className="border-b border-gray-50">

                  <td className="py-3 font-bold text-gray-500">
                    Available
                  </td>

                  {comparisonFacilities.map(
                    (store) => (
                      <td
                        key={store.id}
                        className="py-3 px-3 font-bold text-green-700"
                      >
                        {store.availableCapacityMT.toLocaleString()}{' '}
                        MT
                      </td>
                    )
                  )}

                </tr>

                <tr className="border-b border-gray-50">

                  <td className="py-3 font-bold text-gray-500">
                    Rate / Ton / Day
                  </td>

                  {comparisonFacilities.map(
                    (store) => (
                      <td
                        key={store.id}
                        className="py-3 px-3 font-bold"
                      >
                        ₹
                        {
                          store.pricePerTonPerDayRs
                        }
                      </td>
                    )
                  )}

                </tr>

                <tr>

                  <td className="py-3 font-bold text-gray-500">
                    Estimated Cost
                  </td>

                  {comparisonFacilities.map(
                    (store) => (
                      <td
                        key={store.id}
                        className="py-3 px-3 font-extrabold text-[#167A42]"
                      >
                        {formatCurrency(
                          calculateStorageCost(
                            store
                          )
                        )}
                      </td>
                    )
                  )}

                </tr>

              </tbody>

            </table>

          </div>

        </section>
      )}

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {detailsFacility && (

        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() =>
            setDetailsFacility(null)
          }
        >

          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="relative">

              <img
                src={
                  detailsFacility.image
                }
                alt={
                  detailsFacility.name
                }
                className="w-full h-48 object-cover"
              />

              <button
                type="button"
                onClick={() =>
                  setDetailsFacility(null)
                }
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center text-gray-600 hover:text-red-500"
              >

                <X className="w-5 h-5" />

              </button>

              <div className="absolute bottom-4 left-5">

                <span className="bg-white/95 px-3 py-1.5 rounded-xl text-[10px] font-extrabold text-green-700">
                  Storage Facility
                </span>

              </div>

            </div>

            <div className="p-5 lg:p-6">

              <div className="flex items-start justify-between gap-3">

                <div>

                  <h3 className="font-heading font-extrabold text-2xl text-gray-900">
                    {detailsFacility.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">

                    <MapPin className="w-4 h-4" />

                    {detailsFacility.location}

                  </p>

                </div>

                <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1.5 rounded-xl text-sm font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {detailsFacility.rating}
                </span>

              </div>

              {/* DETAIL GRID */}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">

                <div className="p-3 rounded-xl bg-blue-50">

                  <Thermometer className="w-4 h-4 text-blue-600 mb-2" />

                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Temperature
                  </p>

                  <p className="font-extrabold text-gray-900">
                    {
                      detailsFacility.tempRangeCelsius
                    }
                  </p>

                </div>

                <div className="p-3 rounded-xl bg-purple-50">

                  <Droplets className="w-4 h-4 text-purple-600 mb-2" />

                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Humidity
                  </p>

                  <p className="font-extrabold text-gray-900">
                    {
                      detailsFacility.humidityPercent
                    }
                  </p>

                </div>

                <div className="p-3 rounded-xl bg-green-50">

                  <Package className="w-4 h-4 text-green-600 mb-2" />

                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Capacity
                  </p>

                  <p className="font-extrabold text-gray-900">
                    {detailsFacility.totalCapacityMT.toLocaleString()}{' '}
                    MT
                  </p>

                </div>

                <div className="p-3 rounded-xl bg-emerald-50">

                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-2" />

                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Available
                  </p>

                  <p className="font-extrabold text-gray-900">
                    {detailsFacility.availableCapacityMT.toLocaleString()}{' '}
                    MT
                  </p>

                </div>

                <div className="p-3 rounded-xl bg-amber-50">

                  <IndianRupee className="w-4 h-4 text-amber-600 mb-2" />

                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Rate
                  </p>

                  <p className="font-extrabold text-gray-900">
                    ₹
                    {
                      detailsFacility.pricePerTonPerDayRs
                    }
                    /ton/day
                  </p>

                </div>

                <div className="p-3 rounded-xl bg-gray-50">

                  <Navigation className="w-4 h-4 text-gray-600 mb-2" />

                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Distance
                  </p>

                  <p className="font-extrabold text-gray-900">
                    {getDistance(detailsFacility)}{' '}km
                    {userCoords && detailsFacility.lat && (
                      <span className="text-[10px] font-bold text-emerald-600 ml-1">(GPS)</span>
                    )}
                  </p>

                </div>

              </div>

              {/* CROPS */}

              <div className="mt-6">

                <p className="text-[11px] uppercase font-bold text-gray-400 mb-2">
                  Suitable Crops
                </p>

                <div className="flex flex-wrap gap-2">

                  {detailsFacility.suitableCrops.map(
                    (
                      crop: string
                    ) => (

                      <span
                        key={crop}
                        className="px-3 py-1.5 rounded-lg bg-green-50 border border-green-100 text-green-700 text-xs font-bold"
                      >
                        {crop}
                      </span>

                    )
                  )}

                </div>

              </div>

              {/* COST */}

              <div className="mt-6 p-4 rounded-2xl bg-green-50 border border-green-100">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] uppercase font-bold text-gray-400">
                      Estimated Cost
                    </p>

                    <p className="text-xl font-extrabold text-[#167A42]">
                      {formatCurrency(
                        calculateStorageCost(
                          detailsFacility
                        )
                      )}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-[10px] text-gray-400 font-bold">
                      YOUR REQUIREMENT
                    </p>

                    <p className="text-sm font-extrabold text-gray-800">
                      {quantityInTonnes.toFixed(
                        2
                      )}{' '}
                      MT × {storageDays} days
                    </p>

                  </div>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex gap-3 mt-6">

                {detailsFacility.phone && (

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `tel:${detailsFacility.phone}`
                      )
                    }
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                  >

                    <Phone className="w-4 h-4" />

                    Call Facility

                  </button>

                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedStorageFacility(
                      detailsFacility
                    );
                    setDetailsFacility(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#167A42] hover:bg-[#126335] text-white text-sm font-bold flex items-center justify-center gap-2"
                >

                  Reserve Space

                  <ArrowRight className="w-4 h-4" />

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};