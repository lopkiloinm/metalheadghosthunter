import { useCallback, useEffect, useState } from 'react';
import {
  FALLBACK_ADDONS,
  FALLBACK_BUNDLES,
  FALLBACK_EQUIPMENT,
  FALLBACK_HOTSPOTS,
  FALLBACK_SIGHTINGS,
} from '../data/equipmentCatalog';
import { fetchInitialForgeData } from '../services/api';

const INITIAL = {
  online: false,
  storageMode: 'loading',
  equipment: FALLBACK_EQUIPMENT,
  addons: FALLBACK_ADDONS,
  bundles: FALLBACK_BUNDLES,
  hotspots: FALLBACK_HOTSPOTS,
  sightings: FALLBACK_SIGHTINGS,
};

export function useForgeData() {
  const [data, setData] = useState(INITIAL);

  useEffect(() => {
    let alive = true;
    fetchInitialForgeData().then((next) => alive && setData(next));
    return () => {
      alive = false;
    };
  }, []);

  const prependSighting = useCallback(
    (sighting) => setData((d) => ({ ...d, sightings: [sighting, ...d.sightings] })),
    []
  );

  return { ...data, prependSighting };
}
