import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import type { Listing } from '../types';
import { campusCenters } from '../utils/campuses';
import { Link } from 'react-router-dom';
import type { CampusName } from '../types';

export function MapPanel({
  listings,
  campus
}: {
  listings: Listing[];
  campus?: CampusName;
}) {
  const center = campus ? campusCenters[campus] : listings[0] ? { lat: listings[0].latitude, lng: listings[0].longitude } : campusCenters.USC;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h3 className="text-base font-semibold">Map view</h3>
          <p className="text-sm text-ink/60">Listings plotted with OpenStreetMap tiles.</p>
        </div>
      </div>
      <div className="h-[520px]">
        <MapContainer center={[center.lat, center.lng]} zoom={campus ? 13 : 12} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {listings.map((listing) => (
            <CircleMarker
              key={listing.id}
              center={[listing.latitude, listing.longitude]}
              radius={8}
              pathOptions={{ color: '#10473f', fillColor: '#c96c4a', fillOpacity: 0.9 }}
            >
              <Popup>
                <div className="space-y-2">
                  <div className="font-semibold">{listing.title}</div>
                  <div className="text-sm text-ink/70">{listing.address}</div>
                  <Link to={`/listings/${listing.id}`} className="text-sm font-semibold text-moss">Open listing</Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
