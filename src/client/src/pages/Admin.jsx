import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Admin = () => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/admin/stats');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">Merchant Performance</h2>
                    <p className="text-gray-500 text-sm">Revenue analytics based on delivered orders.</p>
                </div>
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">Merchant Name</th>
                            <th className="p-4">Total Orders</th>
                            <th className="p-4 text-right">Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((row, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{row.merchant_name}</td>
                                <td className="p-4">{row.total_orders}</td>
                                <td className="p-4 text-right font-bold text-green-600">৳{row.total_revenue}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;
