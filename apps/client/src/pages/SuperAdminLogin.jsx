import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../store/slices/authSlice';
import { useToast } from '../hooks/useToast';
import axios from 'axios';

const SuperAdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Note: Since superadmin auth acts a bit differently and we want to use same Redux state,
            // we will directly call the endpoint and manually update state or patch Redux thunk.
            // But if our auth slice supports normal login, maybe we just bypass thunk for simplicity.

            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/base/superadmin/login`, {
                email, password
            });

            // If success, store token and redirect
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                // Dispatch action to update standard Redux user object
                dispatch({
                    type: 'auth/login/fulfilled',
                    payload: res.data
                });

                toast.success('System Overrode - Welcome Super Admin');
                navigate('/');
            }
            console.log("res.data>> ", res.data)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Access Denied');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto mb-4 flex items-center justify-center font-bold text-white shadow-lg">
                        SA
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Terminal</h1>
                    <p className="text-zinc-500 text-sm mt-1">Authorized personnel only</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Root Email</label>
                        <input
                            type="email"
                            className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="admin@cms.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Master Password</label>
                        <input
                            type="password"
                            className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                    >
                        {loading ? 'Authenticating...' : 'Override Protocol'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
