import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const { userId } = useParams();
    const [data, setData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
        fetchTransactions();
    }, [userId]);

    const fetchTransactions = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/user/${userId}/transactions`);
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUserData = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/user/${userId}`);
            setData(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-gray-500 text-lg">Loading dashboard...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center mt-10">
                <p className="text-red-600 font-semibold">User not found</p>
            </div>
        );
    }

    // Fallbacks for profile data
    const profileData = data?.profile || {
        name: 'User',
        latest_credit_score: 'N/A',
        credit_limit: 0,
        remaining_credit: 0
    };

    const orders = data?.recent_orders || [];

    return (
        <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profileData.name}! 👋</h1>
                <p className="text-gray-600">Here's your credit profile and recent activity</p>
            </div>

            {/* Credit Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Credit Score Card */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/20 backdrop-blur p-3 rounded-lg">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-sm opacity-90 mb-1">Credit Score</div>
                    <div className="text-4xl font-bold mb-2">{profileData.latest_credit_score !== 'N/A' ? profileData.latest_credit_score : '720+'}</div>
                    <div className="text-xs opacity-75">Good rating</div>
                </div>

                {/* Credit Limit Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/20 backdrop-blur p-3 rounded-lg">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-sm opacity-90 mb-1">Credit Limit</div>
                    <div className="text-4xl font-bold mb-2">BDT {Number(profileData.credit_limit || 50000).toLocaleString()}</div>
                    <div className="text-xs opacity-75">Total available</div>
                </div>

                {/* Available Credit Card */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/20 backdrop-blur p-3 rounded-lg">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-sm opacity-90 mb-1">Available Credit</div>
                    <div className="text-4xl font-bold mb-2">BDT {Number(profileData.remaining_credit || profileData.credit_limit || 50000).toLocaleString()}</div>
                    <div className="text-xs opacity-75">Ready to use</div>
                </div>
            </div>

            {/* Recent Orders Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                            <p className="text-sm text-gray-600">Your latest purchase history</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {orders && orders.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-green-50 transition-all duration-300">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-gray-100 p-2 rounded">
                                                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="font-semibold text-gray-900">#{order.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">{new Date(order.created_at).toLocaleDateString('en-GB')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-lg font-bold text-gray-900">BDT {Number(order.total_amount).toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${order.status === 'Delivered'
                                                ? 'bg-green-100 text-green-800'
                                                : order.status === 'Pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {order.status === 'Delivered' && (
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="bg-gray-50 inline-flex p-4 rounded-full mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders yet</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">You haven't placed any orders yet. Start shopping to see your history here!</p>
                            <Link to="/" className="inline-block mt-4 text-green-600 font-bold hover:text-green-700 transition-colors">Browse Shop &rarr;</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction History Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-8">
                <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                            <p className="text-sm text-gray-600">Payments and records</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {transactions && transactions.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-blue-50 transition-all duration-300">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">{new Date(t.transaction_date).toLocaleDateString('en-GB')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-lg font-bold text-gray-900">BDT {Number(t.amount).toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{t.payment_method}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            No transaction records found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
