import FallbackImage from './FallbackImage';

export default function ItineraryModal({ detailItem, detailType, currentImgIndex, setCurrentImgIndex, closeDetails }) {
    if (!detailItem) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative">

                <button onClick={closeDetails} className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur text-gray-800 hover:text-[#FF385C] p-2 rounded-full shadow-sm transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="w-full md:w-1/2 bg-gray-100 relative group flex flex-col">
                    <div className="relative h-64 md:h-full w-full">
                        <FallbackImage
                            src={detailItem.images?.[currentImgIndex]?.url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                            alt={detailItem.title}
                            className="w-full h-full object-cover"
                        />
                        {detailItem.images?.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(prev => (prev === 0 ? detailItem.images.length - 1 : prev - 1)); }}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-sm hover:bg-white transition opacity-0 group-hover:opacity-100"
                                >
                                    <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(prev => (prev === detailItem.images.length - 1 ? 0 : prev + 1)); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-sm hover:bg-white transition opacity-0 group-hover:opacity-100"
                                >
                                    <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                                    {detailItem.images.map((_, idx) => (
                                        <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentImgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[50vh] md:max-h-full">
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2 gap-4">
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{detailItem.title}</h2>
                            <div className="text-right shrink-0">
                                <p className="text-[#FF385C] font-bold text-xl">₹{detailItem.price}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {detailItem.location}{detailItem.country ? `, ${detailItem.country}` : ''}
                        </div>

                        {detailItem.category && (
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider mb-4">
                                {detailItem.category}
                            </span>
                        )}

                        <div className="prose prose-sm text-gray-600 mb-6">
                            <p className="leading-relaxed">{detailItem.description || "No detailed description provided."}</p>
                        </div>

                        {detailItem.tags && detailItem.tags.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Highlights</h4>
                                <div className="flex flex-wrap gap-2">
                                    {detailItem.tags.map(tag => (
                                        <span key={tag} className="bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-md capitalize">
                                            {tag.replace('-', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-100 mt-4">
                        <button
                            onClick={() => window.open(`/${detailType}/${detailItem._id}`, '_blank')}
                            className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            View Full Page
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}