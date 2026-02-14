import React, { Component } from 'react';

class GlobalErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        console.error('Error Boundary getDerivedStateFromError:', error);
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transform transition-all hover:scale-[1.01]">
                        {/* Header */}
                        <div className="bg-linear-to-r from-red-500 to-pink-600 p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 pattern-dots"></div>
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner ring-4 ring-white/10">
                                    <span className="text-5xl animate-bounce">😵</span>
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Terjadi Kesalahan!</h1>
                                <p className="text-red-100 text-sm font-medium">Aplikasi mengalami kendala teknis tak terduga.</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8">
                                <h3 className="text-red-900 font-semibold mb-2 flex items-center gap-2">
                                    <span className="text-lg">⚠️</span> Detail Masalah
                                </h3>
                                <p className="text-red-700 text-sm leading-relaxed text-opacity-90">
                                    "Web sedang mengalami gangguan saat memproses permintaan Anda. Hal ini mungkin disebabkan oleh koneksi yang tidak stabil atau data yang tidak valid. Mohon coba muat ulang."
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={this.handleReset}
                                    className="w-full group flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    <span className="group-hover:rotate-12 transition-transform duration-300">🏠</span>
                                    <span>Kembali ke Dashboard</span>
                                </button>

                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full group flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200 border border-gray-200"
                                >
                                    <span className="group-hover:rotate-180 transition-transform duration-500">↻</span>
                                    <span>Muat Ulang Halaman</span>
                                </button>
                            </div>

                            <div className="mt-8 text-center space-y-2">
                                <p className="text-xs text-gray-400 font-mono bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-100">
                                    Error Code: CLIENT_EXCEPTION_500
                                </p>
                                <p className="text-[10px] text-gray-300 uppercase tracking-widest">
                                    Manajemen Kos System
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
