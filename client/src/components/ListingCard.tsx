import { Link } from 'react-router-dom';
import type { Listing } from '../types';
import { money, dateLabel } from '../utils/format';
import { listingPlaceholder } from '../utils/placeholders';

export function ListingCard({
  listing,
  onFavorite
}: {
  listing: Listing;
  onFavorite?: (listing: Listing) => void;
}) {
  const image = listing.images[0]?.url ?? listingPlaceholder('FlatBuddy');

  return (
    <article className="card overflow-hidden">
      <Link to={`/listings/${listing.id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-sand">
          <img src={image} alt={listing.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">{listing.title}</h3>
              <p className="text-sm text-ink/60">{listing.address}, {listing.city}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{money(listing.rent)}</div>
              <div className="text-xs text-ink/60">per month</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-ink/70">
            <span className="badge">{listing.bedrooms} bd</span>
            <span className="badge">{listing.bathrooms} ba</span>
            <span className="badge">{listing.areaSqft} sqft</span>
            <span className="badge">{listing.propertyType}</span>
            {listing.distanceMiles != null && <span className="badge">{listing.distanceMiles.toFixed(1)} mi away</span>}
          </div>
          <p className="line-clamp-2 text-sm text-ink/70">{listing.description}</p>
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-ink/60">Available {dateLabel(listing.availableFrom)}</div>
            {onFavorite && (
              <button
                type="button"
                className={`btn ${listing.isFavorite ? 'bg-moss text-white' : 'bg-white border border-line text-ink'}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onFavorite(listing);
                }}
              >
                {listing.isFavorite ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
