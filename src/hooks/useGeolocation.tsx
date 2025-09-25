import { useState, useCallback } from "react";

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface UseGeolocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  clearLocation: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolokatsiya brauzeringiz tomonidan qo'llab-quvvatlanmaydi");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Use coordinates as address since we can't use Mapbox API
      setLocation({
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Joylashuvga ruxsat berilmadi");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Joylashuv ma'lumoti mavjud emas");
            break;
          case err.TIMEOUT:
            setError("Joylashuvni aniqlash vaqti tugadi");
            break;
          default:
            setError("Joylashuvni aniqlashda xatolik yuz berdi");
            break;
        }
      } else {
        setError("Joylashuvni aniqlashda xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    clearLocation,
  };
};