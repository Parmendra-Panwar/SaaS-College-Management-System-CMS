import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchUserProfile } from '../store/slices/profileSlice';

import ProfileHeader from '../components/ProfileHeader';
import Modal from '../components/Modal';
import PostsTab from '../components/PostsTab';

import { PageLoader } from '../components/ui';

const ProfilePage = () => {
    const { username } = useParams();
    const dispatch = useDispatch();
    const { userData, stats, loading } = useSelector((state) => state.profile);
    const { user: currentUser } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState('listings');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Modals States (Restored)
    const [editAbout, setEditAbout] = useState("");
    const [selectedRole, setSelectedRole] = useState([]);

    const isOwnProfile = currentUser?.username === username;

    useEffect(() => {
        if (!userData || userData.username !== username) {
            dispatch(fetchUserProfile({ username, page: 1 }));
        }
    }, [dispatch, username, userData?.username]);

    // Populate Modals Data (Restored)
    useEffect(() => {
        if (userData) {
            setEditAbout(userData.about || "");
            setSelectedRole(userData.roles || ['NORMAL']);
        }
    }, [userData]);

    // Modals Handlers (Restored)
    const handleUpdateAbout = async () => {
        setIsEditOpen(false);
    };

    const handleUpdateRole = async () => {
        setIsSettingsOpen(false);
    };

    if (loading && !userData) return <PageLoader />;
    if (!userData) return <PageLoader />;

    const isNormal = userData.roles.includes('NORMAL');
    const isBusiness = userData.roles.includes('BUSINESS');

    return (
        <div className="max-w-[1305px] px-6 md:px-10 mx-auto w-full">
            <ProfileHeader userData={userData} stats={stats} onEdit={() => setIsEditOpen(true)} onSettings={() => setIsSettingsOpen(true)} />

            <div className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-20">
                <div className="flex justify-center gap-12">
                    <button onClick={() => setActiveTab('listings')} className={`cursor-pointer py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'listings' ? 'border-[#FF385C] text-[#FF385C]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>LISTINGS</button>
                </div>
            </div>

            <main className="p-8">
                {activeTab === 'listings' && isBusiness && <PostsTab username={username} type="listings" />}
            </main>

            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Profile">
                <div className="flex flex-col gap-4 p-2">
                    <p className="text-red-500 text-center">This feature is not available yet, please try again later sometime</p>
                    <label className="text-sm font-semibold text-slate-700">Bio / About</label>
                    <textarea
                        rows="4"
                        value={editAbout}
                        onChange={(e) => setEditAbout(e.target.value)}
                        placeholder="Tell the world about your travels..."
                        className="w-full border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-all resize-none bg-slate-50"
                    />
                    <button onClick={handleUpdateAbout} className="cursor-pointer w-full bg-[#222222] text-white py-3 rounded-xl font-bold hover:bg-[#FF385C] transition shadow-lg mt-2">
                        Save Changes
                    </button>
                </div>
            </Modal>

            <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Account Settings">
                <div className="flex flex-col gap-4 p-2">
                    <p className="text-red-500 text-center">This feature is not available yet, please try again later sometime</p>
                    <label className="text-sm font-semibold text-slate-700">Account Type</label>
                    <div className="grid grid-cols-1 gap-3">
                        {['NORMAL', 'BUSINESS', 'MIX'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role === 'MIX' ? ['NORMAL', 'BUSINESS'] : [role])}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${(role === 'MIX' ? (selectedRole.includes('BUSINESS') && selectedRole.includes('NORMAL')) : (selectedRole.length === 1 && selectedRole[0] === role))
                                    ? 'border-[#FF385C] bg-rose-50 text-[#FF385C]'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                    }`}
                            >
                                <p className="font-bold">{role === 'NORMAL' ? 'Traveler' : role === 'BUSINESS' ? 'Business Host' : 'Both'}</p>
                            </button>
                        ))}
                    </div>
                    <button onClick={handleUpdateRole} className="cursor-pointer w-full bg-[#222222] text-white py-3 rounded-xl font-bold hover:bg-[#FF385C] transition shadow-lg mt-2">
                        Update Role
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ProfilePage;