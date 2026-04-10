import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchListingById, updateListingApi } from '../services/listingService';
import { updateListingLocally } from '../store/slices/listingSlice';
import { useToast } from '../hooks/useToast';
import { PageLoader } from '../components/ui';

const EditListing = () => {
    const { id } = useParams();
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        country: '',
        category: 'Homestays & Guesthouses',
        tags: ''
    });

    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchListing = async () => {
            try {
                const response = await fetchListingById(id);
                const listing = response.data.listing;

                // Only owner can edit
                if (listing.user?._id !== user?._id && listing.user?.username !== user?.username && listing.user !== user?._id) {
                    navigate('/'); // or somewhere else
                }

                setFormData({
                    title: listing.title || '',
                    description: listing.description || '',
                    price: listing.price || '',
                    location: listing.location || '',
                    country: listing.country || '',
                    category: listing.category || 'Homestays & Guesthouses',
                    tags: listing.tags ? listing.tags.join(', ') : ''
                });

                if (listing.images && listing.images.length > 0) {
                    setExistingImages(listing.images);
                    setPreviews(listing.images.map(img => img.url));
                }
            } catch (err) {
                setError(err.message || "Failed to load listing");
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id, user, navigate]);

    useEffect(() => {
        return () => {
            previews.forEach(url => {
                if (url.startsWith('blob:')) URL.revokeObjectURL(url);
            });
        };
    }, [previews]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const totalAllowed = 7 - existingImages.length;
        if (totalAllowed <= 0) return;

        const addedFiles = files.slice(0, totalAllowed);
        const updatedNewImages = [...newImages, ...addedFiles].slice(0, 7 - existingImages.length);
        setNewImages(updatedNewImages);

        const localPreviews = updatedNewImages.map(file => URL.createObjectURL(file));
        setPreviews([...existingImages.map(img => img.url), ...localPreviews]);

        e.target.value = '';
    };

    const removeImage = (indexToRemove) => {
        if (indexToRemove < existingImages.length) {
            const updatedExisting = existingImages.filter((_, i) => i !== indexToRemove);
            setExistingImages(updatedExisting);
            const localPreviews = newImages.map(file => URL.createObjectURL(file));
            setPreviews([...updatedExisting.map(img => img.url), ...localPreviews]);
        } else {
            const newIndex = indexToRemove - existingImages.length;
            const updatedNew = newImages.filter((_, i) => i !== newIndex);
            setNewImages(updatedNew);
            const localPreviews = updatedNew.map(file => URL.createObjectURL(file));
            setPreviews([...existingImages.map(img => img.url), ...localPreviews]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError(null);

        // 1. Prepare data
        const data = new FormData();
        const tagsArray = formData.tags
            ? formData.tags.split(',').map(tag => tag.trim().toLowerCase())
            : ["wifi", "pool", "budget"];

        Object.keys(formData).forEach(key => {
            if (key !== 'tags') {
                data.append(`listing[${key}]`, formData[key]);
            }
        });

        tagsArray.forEach(tag => data.append('listing[tags][]', tag));
        data.append('remainingImages', JSON.stringify(existingImages));
        newImages.forEach(img => {
            data.append('images', img);
        });

        // 2. Navigate immediately so user doesn't wait
        navigate(`/`);

        // 2. Perform background update
        updateListingApi(id, data)
            .then(res => {
                if (res.data?.listing) {
                    dispatch(updateListingLocally(res.data.listing));
                    toast.success('Listing updated successfully!');
                }
            })
            .catch(err => {
                console.error(err);
                toast.error('Failed to update listing. Please try again.');
            });
    };

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Edit your place</h1>
                    <p className="text-slate-500">Update the details below to attract more guests.</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2rem] border shadow-sm">
                    {/* Title */}
                    <input
                        type="text"
                        placeholder="Title (e.g. Cozy Cabin in the woods)"
                        required
                        value={formData.title}
                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition"
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />

                    {/* Description */}
                    <textarea
                        placeholder="Description"
                        rows="4"
                        required
                        value={formData.description}
                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition"
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>

                    {/* Location & Country */}
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Location (City)"
                            required
                            value={formData.location}
                            className="p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition"
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Country"
                            required
                            value={formData.country}
                            className="p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition"
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                    </div>

                    {/* Price & Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <span className="absolute left-4 top-4 text-slate-400">₹</span>
                            <input
                                type="number"
                                placeholder="Price per night"
                                required
                                value={formData.price}
                                className="w-full p-4 pl-8 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition"
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <select
                            value={formData.category}
                            className="p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition bg-white"
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option>Homestays & Guesthouses</option>
                            <option>Hotels & Motels</option>
                            <option>Heritage & Unique Stays</option>
                        </select>
                    </div>

                    {/* Tags Input (New Field) */}
                    <div>
                        <input
                            type="text"
                            placeholder="Tags (e.g. wifi, pool, parking - separated by commas)"
                            value={formData.tags}
                            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition"
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        />
                        <p className="text-[10px] text-slate-400 mt-1 ml-1 uppercase tracking-wider font-bold">Separate tags with commas</p>
                    </div>

                    {/* Image Upload Area */}
                    <div>
                        <div className="border-2 border-dashed border-slate-200 p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-rose-300 transition group relative">
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <svg className="w-10 h-10 text-slate-400 group-hover:text-rose-500 transition mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            <p className="font-medium text-slate-700 group-hover:text-rose-600 transition">Drag & drop or click to replace images</p>
                            <p className="text-xs text-slate-400 mt-1">Leave empty to keep existing images</p>
                        </div>

                        {/* Selected Images Grid */}
                        {previews.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 shadow-sm">
                                        <img src={preview} className="w-full h-full object-cover" alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 scale-90 hover:scale-100"
                                            title="Remove image"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                        {index === 0 && (
                                            <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                                                Cover
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="cursor-pointer w-full py-4 bg-[#222222] text-white rounded-xl font-bold hover:bg-[#FF385C] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {uploading ? 'Processing...' : 'Save Edits '}
                    </button>
                </form>
            </div>

            {/* Right Side: Live Preview */}
            <div className="hidden lg:block sticky top-24 h-fit">
                <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Preview
                </p>
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 group transition-all duration-300 hover:-translate-y-1">
                    <div className="h-80 bg-slate-100 relative">
                        {previews[0] ? (
                            <img src={previews[0]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Preview" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                <span>No Image Available</span>
                            </div>
                        )}
                        <span className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                            {formData.category}
                        </span>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{formData.title || "Untitled Place"}</h3>
                            <p className="font-bold text-slate-900">₹{formData.price || 0}</p>
                        </div>
                        <p className="text-slate-500 text-sm line-clamp-2 mb-3">{formData.description || "Describe your beautiful place..."}</p>

                        {/* Location Preview */}
                        <p className="text-xs text-slate-400 font-medium mb-3">
                            📍 {formData.location ? `${formData.location}, ${formData.country}` : 'Location missing'}
                        </p>

                        {/* Tags Preview */}
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.split(',').map((tag, i) => tag.trim() && (
                                <span key={i} className="text-[10px] bg-slate-100 px-2 py-1 rounded-md text-slate-500 font-bold uppercase">
                                    #{tag.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditListing;
