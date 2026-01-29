import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register({ setUser }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        nid: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Store user info
                localStorage.setItem('user', JSON.stringify(data.user));
                if (typeof setUser === 'function') {
                    setUser(data.user);
                }
                navigate(`/dashboard/${data.user.id}`);
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Network error or server unreachable');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
            style={{
                background: '#FFFFFF',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            }}>

            {/* Decorative green circles */}
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                opacity: 0.1,
                zIndex: 0
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '-150px',
                left: '-150px',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                opacity: 0.08,
                zIndex: 0
            }}></div>

            {/* Register Container */}
            <div className="w-full" style={{ maxWidth: '380px', position: 'relative', zIndex: 1 }}>
                {/* Welcome Header */}
                <div className="text-center mb-6">
                    <h1 className="font-bold mb-2" style={{ fontSize: '28px', letterSpacing: '-0.5px', color: '#1F2937' }}>
                        Create Account
                    </h1>
                    <p className="leading-relaxed" style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.5' }}>
                        Join the best platform<br />
                        Fill in your details to get started
                    </p>
                </div>

                {/* Social Icons */}
                <div className="flex justify-center gap-3 mb-5">
                    <button className="rounded-full flex items-center justify-center border transition-all"
                        style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#F0FDF4',
                            borderColor: '#10B981'
                        }}>
                        <svg className="text-green-600" style={{ width: '22px', height: '22px' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </button>
                    <button className="rounded-full flex items-center justify-center border transition-all"
                        style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#F0FDF4',
                            borderColor: '#10B981'
                        }}>
                        <svg className="text-green-600" style={{ width: '22px', height: '22px' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                    </button>
                </div>

                {/* Or use your email account */}
                <p className="text-center mb-4" style={{ fontSize: '10.5px', color: '#6B7280' }}>
                    Or use your email to register:
                </p>

                {/* Error Message */}
                {error && (
                    <div className="mb-3 text-center rounded-full"
                        style={{
                            backgroundColor: '#FEE2E2',
                            color: '#991B1B',
                            padding: '10px 16px',
                            fontSize: '11px',
                            marginLeft: '20px',
                            marginRight: '20px',
                            border: '1px solid #FCA5A5'
                        }}>
                        {error}
                    </div>
                )}

                {/* Register Form */}
                <form onSubmit={handleSubmit} style={{ paddingLeft: '20px', paddingRight: '20px' }}>
                    {/* Name Input */}
                    <div className="relative mb-3">
                        <div className="absolute flex items-center pointer-events-none"
                            style={{ top: '50%', transform: 'translateY(-50%)', left: '16px' }}>
                            <svg style={{ width: '16px', height: '16px', color: '#10B981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full transition-all focus:outline-none"
                            placeholder="Full Name"
                            required
                            style={{
                                paddingLeft: '42px',
                                paddingRight: '16px',
                                paddingTop: '13px',
                                paddingBottom: '13px',
                                backgroundColor: '#F9FAFB',
                                border: '2px solid #E5E7EB',
                                borderRadius: '25px',
                                fontSize: '13px',
                                color: '#1F2937'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10B981'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    {/* Email Input */}
                    <div className="relative mb-3">
                        <div className="absolute flex items-center pointer-events-none"
                            style={{ top: '50%', transform: 'translateY(-50%)', left: '16px' }}>
                            <svg style={{ width: '16px', height: '16px', color: '#10B981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full transition-all focus:outline-none"
                            placeholder="Email"
                            required
                            style={{
                                paddingLeft: '42px',
                                paddingRight: '16px',
                                paddingTop: '13px',
                                paddingBottom: '13px',
                                backgroundColor: '#F9FAFB',
                                border: '2px solid #E5E7EB',
                                borderRadius: '25px',
                                fontSize: '13px',
                                color: '#1F2937'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10B981'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative mb-3">
                        <div className="absolute flex items-center pointer-events-none"
                            style={{ top: '50%', transform: 'translateY(-50%)', left: '16px' }}>
                            <svg style={{ width: '16px', height: '16px', color: '#10B981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full transition-all focus:outline-none"
                            placeholder="Password"
                            required
                            style={{
                                paddingLeft: '42px',
                                paddingRight: '16px',
                                paddingTop: '13px',
                                paddingBottom: '13px',
                                backgroundColor: '#F9FAFB',
                                border: '2px solid #E5E7EB',
                                borderRadius: '25px',
                                fontSize: '13px',
                                color: '#1F2937'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10B981'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    {/* Phone Input */}
                    <div className="relative mb-3">
                        <div className="absolute flex items-center pointer-events-none"
                            style={{ top: '50%', transform: 'translateY(-50%)', left: '16px' }}>
                            <svg style={{ width: '16px', height: '16px', color: '#10B981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full transition-all focus:outline-none"
                            placeholder="Phone Number"
                            required
                            style={{
                                paddingLeft: '42px',
                                paddingRight: '16px',
                                paddingTop: '13px',
                                paddingBottom: '13px',
                                backgroundColor: '#F9FAFB',
                                border: '2px solid #E5E7EB',
                                borderRadius: '25px',
                                fontSize: '13px',
                                color: '#1F2937'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10B981'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    {/* NID Input (Optional) */}
                    <div className="relative mb-3">
                        <div className="absolute flex items-center pointer-events-none"
                            style={{ top: '50%', transform: 'translateY(-50%)', left: '16px' }}>
                            <svg style={{ width: '16px', height: '16px', color: '#10B981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            name="nid"
                            value={formData.nid}
                            onChange={handleChange}
                            className="w-full transition-all focus:outline-none"
                            placeholder="NID (Optional)"
                            style={{
                                paddingLeft: '42px',
                                paddingRight: '16px',
                                paddingTop: '13px',
                                paddingBottom: '13px',
                                backgroundColor: '#F9FAFB',
                                border: '2px solid #E5E7EB',
                                borderRadius: '25px',
                                fontSize: '13px',
                                color: '#1F2937'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10B981'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    {/* Address Input (Optional) */}
                    <div className="relative mb-3">
                        <div className="absolute flex items-start pointer-events-none"
                            style={{ top: '16px', left: '16px' }}>
                            <svg style={{ width: '16px', height: '16px', color: '#10B981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full transition-all focus:outline-none resize-none"
                            placeholder="Address (Optional)"
                            rows="2"
                            style={{
                                paddingLeft: '42px',
                                paddingRight: '16px',
                                paddingTop: '13px',
                                paddingBottom: '13px',
                                backgroundColor: '#F9FAFB',
                                border: '2px solid #E5E7EB',
                                borderRadius: '20px',
                                fontSize: '13px',
                                color: '#1F2937'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10B981'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    {/* Already have account */}
                    <div className="text-center" style={{ marginTop: '8px', marginBottom: '12px' }}>
                        <p style={{ fontSize: '10.5px', color: '#6B7280' }}>
                            Already have an account? <Link to="/login" className="underline hover:no-underline" style={{ color: '#10B981', fontWeight: '500' }}>Login</Link>
                        </p>
                    </div>

                    {/* Register Button */}
                    <div className="flex justify-center" style={{ marginTop: '16px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                color: '#FFFFFF',
                                fontWeight: '700',
                                padding: '12px 48px',
                                borderRadius: '25px',
                                fontSize: '14px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                cursor: 'pointer',
                                letterSpacing: '0.3px'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            {loading ? 'Creating account...' : 'Register'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
