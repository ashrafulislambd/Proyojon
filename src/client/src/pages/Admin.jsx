import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Admin = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/admin/stats');
                setStats(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const totalRevenue = stats.reduce((sum, s) => sum + parseFloat(s.total_revenue || 0), 0);
    const totalOrders = stats.reduce((sum, s) => sum + parseInt(s.total_orders || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: '#FFFFFF' }}>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 mb-4"
                        style={{
                            border: '4px solid #E5E7EB',
                            borderTopColor: '#2196F3'
                        }}></div>
                    <div style={{ fontSize: '18px', color: '#1F2937', fontWeight: '600' }}>Loading Dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
            style={{
                background: '#FFFFFF',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            }}>

            {/* Decorative blue circles */}
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '350px',
                height: '350px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                opacity: 0.08,
                zIndex: 0
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '-150px',
                left: '-150px',
                width: '450px',
                height: '450px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #42A5F5 0%, #2196F3 100%)',
                opacity: 0.06,
                zIndex: 0
            }}></div>

            <div className="max-w-7xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: '800',
                        color: '#1F2937',
                        marginBottom: '8px',
                        letterSpacing: '-0.5px'
                    }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ fontSize: '16px', color: '#6B7280' }}>
                        Merchant performance and revenue analytics
                    </p>
                    <div style={{
                        width: '80px',
                        height: '4px',
                        margin: '16px auto 0',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #2196F3 0%, #42A5F5 100%)'
                    }}></div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Total Revenue Card */}
                    <div className="transition-all duration-300"
                        style={{
                            background: '#FFFFFF',
                            border: '2px solid #E5E7EB',
                            borderRadius: '20px',
                            padding: '32px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(33, 150, 243, 0.15)';
                            e.currentTarget.style.borderColor = '#2196F3';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                            e.currentTarget.style.borderColor = '#E5E7EB';
                        }}>
                        <div style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                            padding: '12px',
                            borderRadius: '12px',
                            marginBottom: '16px'
                        }}>
                            <svg style={{ width: '24px', height: '24px', color: '#FFFFFF' }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>Total Revenue</div>
                        <div style={{ fontSize: '32px', fontWeight: '800', color: '#1F2937', marginBottom: '4px' }}>
                            BDT {totalRevenue.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>From all merchants</div>
                    </div>

                    {/* Total Orders Card */}
                    <div className="transition-all duration-300"
                        style={{
                            background: '#FFFFFF',
                            border: '2px solid #E5E7EB',
                            borderRadius: '20px',
                            padding: '32px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(33, 150, 243, 0.15)';
                            e.currentTarget.style.borderColor = '#2196F3';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                            e.currentTarget.style.borderColor = '#E5E7EB';
                        }}>
                        <div style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                            padding: '12px',
                            borderRadius: '12px',
                            marginBottom: '16px'
                        }}>
                            <svg style={{ width: '24px', height: '24px', color: '#FFFFFF' }} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                            </svg>
                        </div>
                        <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>Total Orders</div>
                        <div style={{ fontSize: '32px', fontWeight: '800', color: '#1F2937', marginBottom: '4px' }}>
                            {totalOrders.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Successfully delivered</div>
                    </div>

                    {/* Active Merchants Card */}
                    <div className="transition-all duration-300"
                        style={{
                            background: '#FFFFFF',
                            border: '2px solid #E5E7EB',
                            borderRadius: '20px',
                            padding: '32px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(33, 150, 243, 0.15)';
                            e.currentTarget.style.borderColor = '#2196F3';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                            e.currentTarget.style.borderColor = '#E5E7EB';
                        }}>
                        <div style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                            padding: '12px',
                            borderRadius: '12px',
                            marginBottom: '16px'
                        }}>
                            <svg style={{ width: '24px', height: '24px', color: '#FFFFFF' }} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                        </div>
                        <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>Active Merchants</div>
                        <div style={{ fontSize: '32px', fontWeight: '800', color: '#1F2937', marginBottom: '4px' }}>
                            {stats.length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Partners onboard</div>
                    </div>
                </div>

                {/* Merchant Performance Table */}
                <div style={{
                    background: '#FFFFFF',
                    border: '2px solid #E5E7EB',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)',
                        padding: '24px',
                        borderBottom: '2px solid #E5E7EB'
                    }}>
                        <div className="flex items-center gap-3">
                            <div style={{
                                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                                padding: '10px',
                                borderRadius: '12px'
                            }}>
                                <svg style={{ width: '24px', height: '24px', color: '#FFFFFF' }} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2 1 1 0 000-2zm-4-3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                                    Merchant Performance
                                </h2>
                                <p style={{ fontSize: '14px', color: '#6B7280' }}>Revenue breakdown by merchant</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead style={{ background: '#F9FAFB' }}>
                                <tr>
                                    <th style={{
                                        padding: '16px 24px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: '#6B7280',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>Merchant</th>
                                    <th style={{
                                        padding: '16px 24px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: '#6B7280',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>Orders</th>
                                    <th style={{
                                        padding: '16px 24px',
                                        textAlign: 'right',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: '#6B7280',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>Revenue</th>
                                    <th style={{
                                        padding: '16px 24px',
                                        textAlign: 'center',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: '#6B7280',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>Share</th>
                                </tr>
                            </thead>
                            <tbody style={{ background: '#FFFFFF' }}>
                                {stats.map((merchant, idx) => {
                                    const revenue = parseFloat(merchant.total_revenue || 0);
                                    const sharePercent = ((revenue / totalRevenue) * 100).toFixed(1);

                                    return (
                                        <tr key={idx}
                                            style={{
                                                borderTop: '1px solid #F3F4F6',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div className="flex items-center gap-3">
                                                    <div style={{
                                                        width: '44px',
                                                        height: '44px',
                                                        borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#FFFFFF',
                                                        fontWeight: '700',
                                                        fontSize: '18px'
                                                    }}>
                                                        {merchant.merchant_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#1F2937', fontSize: '15px' }}>
                                                            {merchant.merchant_name}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                                                            ID: #{idx + 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    background: '#EBF5FF',
                                                    color: '#1976D2',
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontWeight: '600',
                                                    fontSize: '13px'
                                                }}>
                                                    {merchant.total_orders}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>
                                                    BDT {revenue.toLocaleString()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div className="flex items-center justify-center gap-3">
                                                    <div style={{
                                                        width: '100px',
                                                        height: '8px',
                                                        background: '#E5E7EB',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div
                                                            style={{
                                                                height: '100%',
                                                                background: 'linear-gradient(90deg, #2196F3 0%, #42A5F5 100%)',
                                                                borderRadius: '10px',
                                                                width: `${sharePercent}%`,
                                                                transition: 'width 0.5s ease'
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '13px',
                                                        fontWeight: '700',
                                                        color: '#1F2937',
                                                        minWidth: '45px'
                                                    }}>
                                                        {sharePercent}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
