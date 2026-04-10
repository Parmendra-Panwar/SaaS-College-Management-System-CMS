import { useState } from 'react';
import NearbyCard from './NearbyCard';

const NearbySection = ({ title, data, type }) => {
    // Determine default tab based on data availability
    const has3km = data?.under3km?.length > 0;
    const has5km = data?.under5km?.length > 0;

    const [activeTab, setActiveTab] = useState(has3km ? 'under3km' : 'under5km');

    // If no data at all, don't render the section
    if (!has3km && !has5km) return null;

    const displayData = data[activeTab] || [];

    return (
        <div className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h3 className="text-2xl font-bold text-slate-900">{title}</h3>

                {/* Modern Pill Tabs */}
                {(has3km && has5km) && (
                    <div className="flex bg-slate-100 p-1 rounded-full w-fit">
                        <button
                            onClick={() => setActiveTab('under3km')}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'under3km' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Under 3 km
                        </button>
                        <button
                            onClick={() => setActiveTab('under5km')}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'under5km' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Under 5 km
                        </button>
                    </div>
                )}
            </div>

            {/* Grid Layout for Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayData.map((item) => (
                    <NearbyCard key={item._id} item={item} type={type} />
                ))}
            </div>
        </div>
    );
};

export default NearbySection;