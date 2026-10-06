import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Check, ChevronDown, Loader2, X } from 'lucide-react';

export default function KodeBarangSearchSelect({
    value = '',
    onSelect,
    golongan = '',
    placeholder = 'Ketik kode atau nama barang Permendagri 108...',
    error = null,
}) {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const containerRef = useRef(null);

    // Initial search or when dropdown opens
    useEffect(() => {
        let isMounted = true;
        const fetchOptions = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/master/kode-barang', {
                    params: {
                        q: query,
                        golongan: golongan || undefined,
                    },
                });
                if (isMounted) {
                    setOptions(response.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch kode barang:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        const timer = setTimeout(fetchOptions, 250);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [query, golongan]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (item) => {
        setSelectedItem(item);
        setIsOpen(false);
        if (onSelect) {
            onSelect(item);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setSelectedItem(null);
        setQuery('');
        if (onSelect) {
            onSelect(null);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full min-h-[42px] px-3 py-2 bg-white border rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-2xs ${
                    error
                        ? 'border-rose-400 focus-within:ring-2 focus-within:ring-rose-200'
                        : 'border-neutral-200 hover:border-neutral-300 focus-within:ring-2 focus-within:ring-emerald-200 focus-within:border-emerald-500'
                }`}
            >
                <div className="flex-1 min-w-0 pr-2">
                    {selectedItem ? (
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {selectedItem.kode}
                            </span>
                            <span className="text-xs text-neutral-800 font-medium truncate">
                                {selectedItem.uraian}
                            </span>
                        </div>
                    ) : value ? (
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {value}
                            </span>
                            <span className="text-xs text-neutral-500">Kode terpilih</span>
                        </div>
                    ) : (
                        <span className="text-xs text-neutral-400">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-neutral-400">
                    {(selectedItem || value) && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                            title="Reset pilihan"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Search box inside dropdown */}
                    <div className="p-2 border-b border-neutral-100 bg-neutral-50/50">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ketik nomor kode (cth: 02.03) atau nama barang..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {loading && (
                                <Loader2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-emerald-600" />
                            )}
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto divide-y divide-neutral-50 scrollbar-thin">
                        {options.length === 0 ? (
                            <div className="p-4 text-center text-xs text-neutral-400">
                                {loading ? 'Mencari referensi...' : 'Tidak ada kodefikasi yang cocok.'}
                            </div>
                        ) : (
                            options.map((item) => {
                                const isSelected = selectedItem?.kode === item.kode || value === item.kode;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSelect(item)}
                                        className={`px-3 py-2.5 flex items-start justify-between gap-3 text-xs cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-emerald-50 text-emerald-950 font-semibold'
                                                : 'hover:bg-neutral-50 text-neutral-700'
                                        }`}
                                    >
                                        <div className="space-y-0.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                                                    {item.kode}
                                                </span>
                                                {item.golongan_kib && (
                                                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                                                        KIB {item.golongan_kib}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-neutral-900 truncate">
                                                {item.uraian}
                                            </p>
                                        </div>

                                        {isSelected && (
                                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    );
}
