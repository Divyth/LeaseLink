export function listingPlaceholder(label = 'FlatBuddy') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#f8f5ef"/>
        <stop offset="100%" stop-color="#eadfcf"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#g)"/>
    <circle cx="960" cy="150" r="170" fill="#10473f" opacity="0.10"/>
    <circle cx="180" cy="650" r="140" fill="#c96c4a" opacity="0.12"/>
    <text x="80" y="150" font-size="72" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#101828">${label}</text>
    <text x="80" y="220" font-size="32" font-family="Arial, Helvetica, sans-serif" fill="#3b4a5a">Student housing preview</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

