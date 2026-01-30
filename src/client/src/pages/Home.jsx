import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Failed to parse user', err);
            }
        }
        // Disabled real fetch for demo purposes to show my generated data
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/products');
            setProducts(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleBuy = async (productId) => {
        if (!user) {
            alert('Please login to purchase products');
            return;
        }

        try {
            await axios.post('http://localhost:3000/api/buy', {
                userId: user.id,
                productId: productId
            });
            alert('Order placed successfully!');
        } catch (err) {
            alert('Failed to place order: ' + (err.response?.data?.error || err.message));
        }
    };

    // Group products by merchant
    const productsByMerchant = products.reduce((acc, product) => {
        const merchant = product.merchant || 'Unknown Merchant';
        if (!acc[merchant]) {
            acc[merchant] = [];
        }
        acc[merchant].push(product);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: '#FFFFFF' }}>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 mb-4"
                        style={{
                            border: '4px solid #E5E7EB',
                            borderTopColor: '#10B981'
                        }}></div>
                    <div style={{ fontSize: '18px', color: '#1F2937', fontWeight: '600' }}>Loading Products...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
            style={{
                background: '#FFFFFF',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            }}>

            {/* Decorative circles */}
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '350px',
                height: '350px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                opacity: 0.08,
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
                        Welcome to Proyojon Shop
                    </h1>
                    <p style={{ fontSize: '16px', color: '#6B7280' }}>
                        Discover amazing products from our trusted merchants
                    </p>
                    {user && (
                        <div style={{
                            marginTop: '12px',
                            fontSize: '14px',
                            color: '#10B981',
                            fontWeight: '600'
                        }}>
                            Welcome back, {user.name}!
                        </div>
                    )}
                    <div style={{
                        width: '80px',
                        height: '4px',
                        margin: '16px auto 0',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                    }}></div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <div style={{
                            background: '#F3F4F6',
                            borderRadius: '50%',
                            width: '96px',
                            height: '96px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <svg style={{ width: '48px', height: '48px', color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <p style={{ color: '#6B7280', fontSize: '18px' }}>No products available at the moment</p>
                    </div>
                ) : (
                    <div>
                        {/* Products grouped by merchant */}
                        {Object.entries(productsByMerchant).map(([merchant, merchantProducts], merchantIdx) => (
                            <div key={merchantIdx} style={{ marginBottom: '48px' }}>
                                {/* Merchant Header */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '24px',
                                    paddingBottom: '16px',
                                    borderBottom: '2px solid #E5E7EB'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#FFFFFF',
                                        fontWeight: '700',
                                        fontSize: '20px'
                                    }}>
                                        {merchant.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 style={{
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            color: '#1F2937',
                                            marginBottom: '4px'
                                        }}>
                                            {merchant}
                                        </h2>
                                        <p style={{ fontSize: '14px', color: '#6B7280' }}>
                                            {merchantProducts.length} {merchantProducts.length === 1 ? 'product' : 'products'} available
                                        </p>
                                    </div>
                                </div>

                                {/* Products Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {merchantProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="transition-all duration-300"
                                            style={{
                                                background: '#FFFFFF',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                padding: '12px',
                                                position: 'relative',
                                                minHeight: '130px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.08)';
                                                e.currentTarget.style.borderColor = '#10B981';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#E5E7EB';
                                            }}>

                                            {/* Square Product Image */}
                                            <div style={{
                                                width: '100px',
                                                height: '100px',
                                                minWidth: '100px',
                                                background: '#F9FAFB',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                position: 'relative'
                                            }}>
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#D1D5DB'
                                                    }}>
                                                        <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info Section */}
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100px' }}>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                                        <span style={{
                                                            fontSize: '9px',
                                                            fontWeight: '700',
                                                            padding: '2px 8px',
                                                            borderRadius: '20px',
                                                            background: '#F0FDF4',
                                                            color: '#059669',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.4px'
                                                        }}>
                                                            {product.category || 'Product'}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '10px',
                                                            color: product.stock_quantity > 0 ? (product.stock_quantity < 5 ? '#D97706' : '#059669') : '#DC2626',
                                                            fontWeight: '600'
                                                        }}>
                                                            {product.stock_quantity > 0 ? (product.stock_quantity < 5 ? `${product.stock_quantity} left` : 'In Stock') : 'Sold Out'}
                                                        </span>
                                                    </div>
                                                    <h3 style={{
                                                        fontSize: '15px',
                                                        fontWeight: '700',
                                                        color: '#1F2937',
                                                        marginBottom: '2px',
                                                        lineHeight: '1.2',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {product.name}
                                                    </h3>
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <div>
                                                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937' }}>
                                                            ৳{product.price.toLocaleString()}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleBuy(product.id);
                                                        }}
                                                        disabled={product.stock_quantity === 0}
                                                        className="transition-all duration-300"
                                                        style={{
                                                            padding: '6px 14px',
                                                            borderRadius: '8px',
                                                            fontWeight: '700',
                                                            fontSize: '12px',
                                                            border: 'none',
                                                            cursor: product.stock_quantity > 0 ? 'pointer' : 'not-allowed',
                                                            background: product.stock_quantity > 0 ? '#10B981' : '#E5E7EB',
                                                            color: product.stock_quantity > 0 ? '#FFFFFF' : '#9CA3AF'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (product.stock_quantity > 0) e.target.style.background = '#059669';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (product.stock_quantity > 0) e.target.style.background = '#10B981';
                                                        }}>
                                                        {product.stock_quantity > 0 ? 'Buy' : 'Sold'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
