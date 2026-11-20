export const NAV_LINKS = [
  { href: '#armoury', label: 'Armoury', chapter: 'II', primary: true },
  { href: '#bundles', label: 'Loadouts', chapter: 'III', primary: true },
  { href: '#hotspots', label: 'Raid Planner', chapter: 'IV', primary: true },
  { href: '#map', label: 'Map', chapter: 'IV·II', primary: true },
  { href: '#intel', label: 'Intel', chapter: 'V', primary: true },
  { href: '#field-logs', label: 'Field Logs', chapter: 'VI', primary: false },
];

export const PRIMARY_LINKS = NAV_LINKS.filter((l) => l.primary);
