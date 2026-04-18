import React from 'react';
import { useSelector } from 'react-redux';

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth);

    if (!user) return <div className="p-10 text-center">Please log in first.</div>;

    return (
        <div className="max-w-2xl mx-auto px-6 py-20 w-full animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">User Profile</h1>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                <div>
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Username</label>
                    <p className="text-lg font-medium text-gray-800">{user.username}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Email</label>
                    <p className="text-lg font-medium text-gray-800">{user.email}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Role Authority</label>
                    <div className="mt-1 inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold text-xs uppercase tracking-wider">
                        {user.role || 'Unspecified'}
                    </div>
                </div>
                {/* Future implementation of updating passwords or personal info */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <button className="bg-gray-100 px-6 py-2 rounded-xl text-gray-600 font-medium cursor-not-allowed">Edit Profile (Coming Soon)</button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;