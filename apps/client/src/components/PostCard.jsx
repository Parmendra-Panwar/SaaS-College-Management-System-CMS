import React from 'react';
import { Link } from "react-router-dom";
import FallbackImage from './FallbackImage';

const PostCard = ({ id, title, label, images }) => {
    const imageUrl = images && images.length > 0 ? images[0].url : null;

    return (
        <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {/* Image Section */}
            <div className="h-48 w-full overflow-hidden bg-slate-100 relative">
                {imageUrl ? (
                    <FallbackImage
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                        <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-[10px] font-black text-blue-700 px-2 py-1 rounded-md uppercase tracking-widest shadow-sm border border-slate-100">
                        {label}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
                <h4 className="font-bold text-slate-800 text-lg leading-tight truncate group-hover:text-blue-600 transition-colors">
                    {title}
                </h4>
                <div className="mt-2 flex items-center text-slate-500 text-sm">
                    {/* Dynamic route based on label */}
                    <Link className="text-xs" to={`/${label.toLowerCase()}/${id}`}>
                        View Details →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PostCard;