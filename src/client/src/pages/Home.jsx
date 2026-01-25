import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        try {
            // Hardcoded User ID 1 (Alice) for demo
            await axios.post('http://localhost:3000/api/buy', {
                userId: 1,
                productId: productId
            });
            alert('Order placed successfully!');
        } catch (err) {
            alert('Failed to place order: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Shop Daily Essentials</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                        <div className="text-sm text-indigo-500 font-semibold mb-2">{product.category}</div>
                        <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                        <p className="text-gray-600 mb-4">Sold by: {product.merchant}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-gray-800">৳{product.price}</span>
                            <button
                                onClick={() => handleBuy(product.id)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                                disabled={product.stock_quantity === 0}
                            >
                                {product.stock_quantity > 0 ? 'Buy Now' : 'Out of Stock'}
                            </button>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">Stock: {product.stock_quantity}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
