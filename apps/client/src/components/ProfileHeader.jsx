import { Link } from 'react-router-dom';
import FallbackImage from './FallbackImage';

const ProfileHeader = ({ userData, stats, onEdit, onSettings }) => {
    return (
        <header className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-8 items-center md:items-start bg-white">
            <div className="flex-shrink-0">
                <FallbackImage
                    src="https://pfpmaker.com/content/img/profile-pictures/aesthetic/2.png"
                    alt={userData.username}
                    className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 shadow-sm"
                />
            </div>

            <div className="flex-grow flex flex-col md:items-start items-center">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full">
                    <h1 className="text-2xl font-bold text-slate-900">{userData.username}</h1>
                    <div className="flex gap-3">
                        <Link to="/saved" className="px-4 py-1.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-200 transition">
                            Saved
                        </Link>
                        <button onClick={onEdit} className="px-4 py-1.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-200 transition">
                            Edit Profile
                        </button>
                        <button onClick={onSettings} className="p-1.5 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="flex gap-6 mt-4 text-slate-700">
                    <span className="font-medium"><strong className="text-slate-900">{stats.followers}</strong> followers</span>
                    <span className="font-medium"><strong className="text-slate-900">{stats.following}</strong> following</span>
                </div>

                <div className="mt-4 max-w-lg text-slate-600 text-sm leading-relaxed text-center md:text-left">
                    {userData.about || "No bio available."}
                </div>
            </div>
        </header>
    );
};

export default ProfileHeader;