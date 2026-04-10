import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { ListingImage } from './FallbackImage';

const ListingCard = ({ data }) => {
    const id = data._id || data.id;
    const { isFavorite, toggleFavorite } = useFavorites('listing');
    const primaryImage = (data.images && data.images.length > 0 && data.images[0])
        ? data.images[0].url
        : (data.image?.url || data.image || "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=60");

    return (
        <Link to={`/listing/${id}`} className="group cursor-pointer block">
            <div className="relative aspect-[20/19] overflow-hidden rounded-[1.25rem] bg-[#EBEBEB] mb-3">
                <ListingImage
                    src={primaryImage}
                    alt={data.title}
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                />
                <button
                    onClick={(e) => toggleFavorite(e, id)}
                    className="absolute top-3 right-3 p-2 group-active:scale-90 transition-transform z-10"
                >
                    <svg className={`w-[28px] h-[28px] drop-shadow-md transition-colors ${isFavorite(id) ? 'text-red-500 fill-red-500' : 'text-white/80 hover:text-white'}`} fill={isFavorite(id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </button>
            </div>

            <div className="flex flex-col">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-[600] text-[#222222] text-[15px] leading-[19px] truncate">{data.location}, {data.country || 'India'}</h3>
                    <div className="flex items-center gap-1 shrink-0 mt-[2px]">
                        <svg className="w-3.5 h-3.5 text-[#222222]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.2 1.151-6.064 5.828 1.58 8.163L12 18.896l-7.384 3.882 1.58-8.163L.132 9.169l8.2-1.151z" /></svg>
                        <span className="font-[400] text-[14px] text-[#222222]">4.8</span>
                    </div>
                </div>
                <p className="text-[#717171] text-[15px] font-[400] mt-0.5 truncate">{data.title}</p>
                <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="font-[600] text-[#222222] text-[15px]">₹{(data?.price || 0)?.toLocaleString('en-IN')}</span>
                    <span className="text-[#222222] font-[400] text-[15px]">night</span>
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;