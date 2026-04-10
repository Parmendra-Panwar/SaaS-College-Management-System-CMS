import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteListingApi, fetchListingById } from '../services/listingService';
import { removeListing } from '../store/slices/listingSlice';
import { useToast } from '../hooks/useToast';
import { PageLoader, PageError } from '../components/ui';

import ImageModal from '../components/ImageModal';
import ReviewSection from '../components/ReviewSection';
import MapSection from '../components/MapSection';
import ReserveBook from '../components/ReserveBook';
import ImageGallery from '../components/ImageGallery';
import NearbySection from '../components/NearbySection';

const SingleListing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user: currentUser } = useSelector((state) => state.auth);
    const toast = useToast();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImgIndex, setSelectedImgIndex] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef();

    // Close menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const response = await fetchListingById(id);
                setListing(response.data);
            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };
        if (id) loadData();
    }, [id]);

    const handleDelete = () => {
        if (window.confirm("Are you sure Want to delete?")) {
            setLoading(true);
            toast.success('Listing deleted successfully.');
            navigate('/');

            deleteListingApi(id)
                .then(() => {
                    dispatch(removeListing(id));
                })
                .catch((error) => {
                    console.error("Delete failed!", error);
                    toast.error('Failed to delete listing.');
                });
        }
    };

    const openModal = (index) => {
        setSelectedImgIndex(index);
        setIsModalOpen(true);
    };

    if (loading) return <PageLoader />;
    if (error) return <PageError message={error} />;

    const data = listing?.listing;
    const isOwner = currentUser && data?.user && currentUser.username === data.user.username;
    const displayTags = data?.tags?.length > 0 ? data.tags : ["wifi", "pool", "budget"];
    const nearbyActivities = listing?.nearbyActivities;
    const nearbyListings = listing?.nearbyListings;

    const lat = listing?.latitude || 20.5937;
    const lng = listing?.longitude || 78.9629;

    return (
        // Added relative positioning here as a base
        <div className="relative">

            {/* Modal is rendered OUTSIDE the main container layout to avoid z-index traps */}
            {isModalOpen && data?.images && (
                <ImageModal
                    images={data.images}
                    currentIndex={selectedImgIndex}
                    setCurrentIndex={setSelectedImgIndex}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

                {/* 1. Header Section */}
                <div className="flex justify-between items-start mb-6 relative">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">{data?.title}</h1>
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                            <span className="underline cursor-pointer hover:text-slate-900">{data?.location}, {data?.country}</span>
                        </div>
                    </div>

                    {isOwner && (
                        <div className="relative z-10" ref={menuRef}>
                            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 rounded-full transition">
                                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                                    <button onClick={() => navigate(`/edit-listing/${id}`)} className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 border-b">
                                        Edit Listing
                                    </button>
                                    <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50">
                                        Delete Listing
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. Image Gallery */}
                <ImageGallery images={data?.images} openModal={openModal} />

                {/* 3. Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative z-0">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="flex items-center gap-4 pb-8 border-b border-slate-200">
                            <div className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center text-xl font-bold shadow-md">
                                {data?.user?.username?.charAt(0).toUpperCase() || "H"}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Hosted by {data?.user?.username}</h2>
                                <p className="text-slate-500 text-sm">{data?.category}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">About this place</h2>
                            <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line">{data?.description}</p>
                        </div>

                        <div className="flex gap-3 flex-wrap pt-4">
                            {displayTags.map(tag => (
                                <span key={tag} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-semibold text-slate-700">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="border-t border-slate-200 pt-10">
                            <ReviewSection reviews={data?.reviews} entityType="listings" entityId={id} />
                        </div>
                    </div>

                    <ReserveBook price={data?.price} buttonText="Reserve Now" />
                </div>

                {/* 4. Map Section */}
                <MapSection lat={lat} lng={lng} location={data?.location} country={data?.country} />

                <NearbySection
                    title="Things to do nearby"
                    data={nearbyActivities}
                    type="activity"
                />

                <NearbySection
                    title="Similar stays nearby"
                    data={nearbyListings}
                    type="listing"
                />
            </div>
        </div>
    );
};

export default SingleListing;