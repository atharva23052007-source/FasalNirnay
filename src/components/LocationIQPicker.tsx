/// <reference types="vite/client" />
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Loader2, AlertCircle, Map as MapIcon } from 'lucide-react';
import L from 'leaflet';

interface LocationResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    village?: string;
    suburb?: string;
    city?: string;
    town?: string;
    municipality?: string;
    neighbourhood?: string;
    hamlet?: string;
    road?: string;
    county?: string;
    state_district?: string;
    city_district?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface LocationIQPickerProps {
  value: string;
  onChange: (locationName: string, coords?: { lat: number; lon: number }) => void;
  label?: string;
  placeholder?: string;
}

export const LocationIQPicker: React.FC<LocationIQPickerProps> = ({
  value,
  onChange,
  label = 'Farm / Village Location (LocationIQ GPS):',
  placeholder = 'Type village, city or APMC mandi...',
}) => {
  const [query, setQuery] = useState(value || '');
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({
    lat: 20.5937,  // India center fallback
    lon: 78.9629,
  });
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  const LOCATIONIQ_TOKEN =
    ((import.meta as any).env && (import.meta as any).env.VITE_LOCATIONIQ_TOKEN) ||
    'pk.87f2b6b039413f1737e408d6694602f3';

  // Sync query with prop value if externally updated
  useEffect(() => {
    if (value && value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Format clean human readable address from LocationIQ or OpenStreetMap JSON response
  const formatAddress = (data: any, fallbackLat: number, fallbackLon: number): string => {
    if (data && data.address) {
      const a = data.address;
      const place =
        a.village ||
        a.suburb ||
        a.town ||
        a.city ||
        a.municipality ||
        a.neighbourhood ||
        a.hamlet ||
        a.road ||
        '';
      const district = a.county || a.state_district || a.city_district || a.district || '';
      const state = a.state || a.country || '';
      const parts = Array.from(new Set([place, district, state].filter(Boolean)));
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
    if (data && data.display_name) {
      const items = data.display_name.split(', ');
      return items.slice(0, 3).join(', ');
    }
    return `Location (${fallbackLat.toFixed(3)}, ${fallbackLon.toFixed(3)})`;
  };

  // Dynamic reverse geocoding with multi-provider fallback (Never hardcodes "Nashik Region")
  const reverseGeocode = async (lat: number, lon: number) => {
    // 1. Try LocationIQ API
    try {
      const res = await fetch(
        `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_TOKEN}&lat=${lat}&lon=${lon}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        const addressStr = formatAddress(data, lat, lon);
        setQuery(addressStr);
        onChange(addressStr, { lat, lon });
        return;
      }
    } catch (e) {
      // continue to free fallback
    }

    // 2. Free OpenStreetMap Nominatim Fallback (Always accurate for any coordinate)
    try {
      const resNom = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      if (resNom.ok) {
        const dataNom = await resNom.json();
        const addressStr = formatAddress(dataNom, lat, lon);
        setQuery(addressStr);
        onChange(addressStr, { lat, lon });
        return;
      }
    } catch (e) {
      // continue
    }

    // 3. Coordinate fallback
    const fallback = `Coordinates (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    setQuery(fallback);
    onChange(fallback, { lat, lon });
  };

  // Initialize Always-Visible Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lon],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; LocationIQ / OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      const marker = L.marker([coords.lat, coords.lon], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      marker.bindPopup('<b>Farm Location Pin</b><br/>Drag pin or click map to select location.').openPopup();

      // Map click event
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setCoords({ lat, lon: lng });
        marker.setLatLng([lat, lng]);
        map.panTo([lat, lng]);
        reverseGeocode(lat, lng);
      });

      // Marker drag event
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setCoords({ lat: position.lat, lon: position.lng });
        reverseGeocode(position.lat, position.lng);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Auto-center map on user's real GPS location on init
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            // Guard: check map is still mounted before touching it
            if (!mapInstanceRef.current || !markerInstanceRef.current) return;
            setCoords({ lat: latitude, lon: longitude });
            markerInstanceRef.current.setLatLng([latitude, longitude]);
            mapInstanceRef.current.setView([latitude, longitude], 14);
            await reverseGeocode(latitude, longitude);
          },
          () => {
            // GPS denied or unavailable — keep the coords passed via props
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Map when coords update
  const updateMapMarker = (newLat: number, newLon: number) => {
    setCoords({ lat: newLat, lon: newLon });
    if (mapInstanceRef.current && markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([newLat, newLon]);
      mapInstanceRef.current.setView([newLat, newLon], 13);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Input typing search
  const handleQueryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val, coords);
    setErrorMsg('');

    if (val.trim().length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsLoading(true);
    setIsDropdownOpen(true);

    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_TOKEN}&q=${encodeURIComponent(
          val
        )}&format=json&limit=5&countrycodes=in`
      );

      if (response.ok) {
        const data: LocationResult[] = await response.json();
        setSuggestions(data);
      } else {
        // Fallback search via Nominatim
        const resNom = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            val
          )}&format=json&limit=5&countrycodes=in`
        );
        if (resNom.ok) {
          const dataNom: LocationResult[] = await resNom.json();
          setSuggestions(dataNom);
        }
      }
    } catch (err) {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  // Select suggestion from dropdown
  const handleSelectLocation = (loc: LocationResult) => {
    const cleanName = loc.display_name.split(', ').slice(0, 3).join(', ');
    const newLat = parseFloat(loc.lat);
    const newLon = parseFloat(loc.lon);

    setQuery(cleanName);
    setIsDropdownOpen(false);
    updateMapMarker(newLat, newLon);
    onChange(cleanName, { lat: newLat, lon: newLon });
  };

  // GPS Auto Detect
  const handleDetectDeviceLocation = () => {
    setErrorMsg('');
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        updateMapMarker(latitude, longitude);
        await reverseGeocode(latitude, longitude);
        setIsGpsLoading(false);
      },
      (error) => {
        setIsGpsLoading(false);
        setErrorMsg('Location permission denied or unavailable. Click any point on the map below.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-[#167A42]" /> {label}
      </label>

      {/* Input Field + GPS Button */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => query.length >= 2 && setIsDropdownOpen(true)}
            placeholder={placeholder}
            className="w-full text-xs font-semibold text-gray-900 border border-gray-300 rounded-xl p-2.5 pl-8 bg-white focus:ring-2 focus:ring-[#167A42] focus:border-[#167A42] outline-none shadow-sm transition-all"
            required
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          {isLoading && (
            <Loader2 className="w-3.5 h-3.5 text-[#167A42] animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
          )}
        </div>

        <button
          type="button"
          onClick={handleDetectDeviceLocation}
          disabled={isGpsLoading}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#167A42] hover:bg-[#126335] text-white rounded-xl text-xs font-extrabold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex-shrink-0"
        >
          {isGpsLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span>Detect GPS</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" /> {errorMsg}
        </p>
      )}

      {/* Autocomplete Dropdown */}
      {isDropdownOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 max-h-48 overflow-y-auto">
          {suggestions.map((item) => (
            <button
              key={item.place_id}
              type="button"
              onClick={() => handleSelectLocation(item)}
              className="w-full text-left p-2.5 hover:bg-emerald-50 text-xs font-medium text-gray-800 flex items-start gap-2 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#167A42] flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{item.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* ALWAYS VISIBLE LEAFLET MAP CONTAINER */}
      <div className="mt-2 rounded-2xl border border-gray-300 overflow-hidden shadow-sm bg-gray-100 relative">
        <div className="bg-[#167A42] text-white text-[11px] font-bold px-3 py-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapIcon className="w-3.5 h-3.5" /> LocationIQ Interactive OpenStreetMap
          </span>
          <span className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded-full">
            Click map or drag pin to select farm
          </span>
        </div>
        <div
          ref={mapContainerRef}
          className="w-full h-48 z-0"
          style={{ minHeight: '192px' }}
        />
        <div className="bg-gray-50 text-gray-700 text-[11px] font-medium px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <span className="truncate">
            Selected: <strong className="text-gray-900">{query || 'Coordinates Pin'}</strong>
          </span>
          <span className="text-[10px] text-gray-500 font-mono flex-shrink-0">
            ({coords.lat.toFixed(4)}, {coords.lon.toFixed(4)})
          </span>
        </div>
      </div>
    </div>
  );
};
