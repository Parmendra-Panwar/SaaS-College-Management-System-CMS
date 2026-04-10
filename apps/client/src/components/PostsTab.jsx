import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../store/slices/profileSlice';
import PostCard from './PostCard';

const PostsTab = ({ username, type }) => {
    const dispatch = useDispatch();
    const { posts, loading, hasNext } = useSelector((state) => state.profile);
    const [page, setPage] = useState(1);

    const items = posts?.[type] || [];
    const canLoadMore = hasNext?.[type];

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        dispatch(fetchUserProfile({ username, page: nextPage }));
    };

    if (!items.length && !loading) {
        return (
            <div className="text-center py-20 text-slate-400">
                <p>No {type} to show yet.</p>
            </div>
        );
    }

    return (
        <section className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{type}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map(item => (
                    <PostCard key={item._id} id={item._id} title={item.title} label={type.slice(0, -1)} images={item.images} />
                ))}
            </div>

            {canLoadMore && (
                <div className="flex justify-center mt-8">
                    <button onClick={loadMore} disabled={loading} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200">
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </section>
    );
};

export default PostsTab;