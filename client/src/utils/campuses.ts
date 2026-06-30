import type { CampusName } from '../types';

export const campuses: CampusName[] = ['USC', 'UCLA', 'NYU', 'Columbia', 'Boston University'];

export const campusCenters: Record<CampusName, { lat: number; lng: number }> = {
  USC: { lat: 34.0224, lng: -118.2851 },
  UCLA: { lat: 34.0689, lng: -118.4452 },
  NYU: { lat: 40.7295, lng: -73.9965 },
  Columbia: { lat: 40.8075, lng: -73.9626 },
  'Boston University': { lat: 42.3505, lng: -71.1069 }
};

