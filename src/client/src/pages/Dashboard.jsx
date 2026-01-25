import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Dashboard = () => {
    const { userId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/user/${userId}`);
            setData(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!data) return <div className="text-center mt-10 text-red-500">User not found</div>;

    const { profile, recent_orders } = data;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Credit Health Card */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg mb-8">
                <h1 className="text-3xl font-bold mb-2">Welcome, {profile.name}</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                        <div className="text-sm opacity-80">Credit Score</div>
                        <div className="text-4xl font-bold">{profile.latest_credit_score}</div>
                    </div>
                    <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                        <div className="text-sm opacity-80">Credit Limit</div>
                        <div className="text-4xl font-bold">৳{profile.credit_limit}</div>
                    </div>
                    <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                        <div className="text-sm opacity-80">Remaining Balance</div>
                        <div className="text-4xl font-bold">৳{profile.remaining_credit}</div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3">Order ID</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Total</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent_orders.map((order) => (
                                <tr key={order.id} className="border-b">
                                    <td className="p-3">#{order.id}</td>
                                    <td className="p-3">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="p-3 font-medium">৳{order.total_amount}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
