import { Link } from 'react-router-dom';
import { ListingImage, ActivityImage } from './FallbackImage';

const NearbyCard = ({ item, type }) => {
    // Type decide karega ki link kahan jayega (/listings/:id ya /activities/:id)
    const linkPath = `/${type === 'activity' ? 'activity' : 'listing'}/${item._id}`;

    return (
        <Link to={linkPath} className="group block cursor-pointer">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-4 bg-slate-100">
                {/* Thumbnail with smooth scale on hover */}
                {type === 'activity' ? (
                    <ActivityImage
                        src={item.thumbnail}
                        alt={item.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                ) : (
                    <ListingImage
                        src={item.thumbnail}
                        alt={item.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                )}

                {/* Distance Badge (Glassmorphism) */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1">
                    <svg className="w-3 h-3 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                    {item.distance} km
                </div>
            </div>

            {/* Content Details */}
            <div className="flex flex-col">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="font-semibold text-slate-900 text-base line-clamp-1 truncate" title={item.title}>
                        {item.title}
                    </h4>
                </div>
                <p className="text-slate-500 text-sm mt-0.5">
                    {item.difficulty || item.category} · {item.location?.split(',')[0] || "Location N/A"}
                </p>
                <p className="mt-2 text-slate-900 font-semibold">
                    ₹{(item?.price || 0)?.toLocaleString('en-IN')}
                    <span className="text-slate-500 font-normal text-sm"> {type === 'listing' ? '/ night' : '/ person'}</span>
                </p>
            </div>
        </Link>
    );
};

export default NearbyCard;