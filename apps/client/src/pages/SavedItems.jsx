import { useState, useEffect } from 'react';
import ListingCard from '../components/ListingCard';
import { fetchListingById } from '../services/listingService';
import { PageLoader } from '../components/ui';

const SavedItems = () => {
  const [activeTab, setActiveTab] = useState('listing');
  const [items, setItems] = useState({ listing: [] });
  const [loading, setLoading] = useState(true);

  // Re-fetch on mount, wait I need to load items dynamically
  const loadFavorites = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('user_favorites');
      const favorites = stored ? JSON.parse(stored) : { listing: [] };

      const [listingData ] = await Promise.all([
        Promise.all((favorites.listing || []).map(id => fetchListingById(id).then(res => res.data?.listing || res.data?.data || res.data).catch(() => null))),
      ]);

      setItems({
        listing: listingData.filter(item => item !== null),
      });
    } catch (err) {
      console.error("Error loading favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const renderContent = () => {
    if (loading) return <PageLoader />;

    const currentItems = items[activeTab] || [];

    if (currentItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
           <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
           <h2 className="text-xl font-semibold mb-2">No Saved Items</h2>
           <p>Any {activeTab} you save will appear here.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentItems.map((item, idx) => {
          if (activeTab === 'listing') return <ListingCard key={`listing-${item._id || item.id || idx}`} data={item} />;
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Saved Items</h1>
      
      <div className="flex space-x-6 border-b mb-8 overflow-x-auto">
        {['listing'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer pb-4 px-2 font-medium transition-colors whitespace-nowrap capitalize ${
              activeTab === tab 
                ? 'border-b-2 border-[#FF385C] text-[#FF385C]' 
                : 'text-gray-500 hover:text-slate-900'
            }`}
          >
            {tab}s <span className="ml-1 text-sm bg-gray-100 px-2 py-0.5 rounded-full">{items[tab].length}</span>
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
};

export default SavedItems;
