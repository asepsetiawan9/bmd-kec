import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Box,
    FileSpreadsheet,
    Bell,
    ChevronLeft,
    ChevronRight,
    PlusCircle,
    Layers,
    Database,
    DoorClosed,
    Users,
    BookOpen,
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    const { url } = usePage();
    const { auth, pengaturan } = usePage().props;
    const userRole = auth?.user?.role;
    const permissions = auth?.user?.permissions || auth?.permissions || [];
    const tahunAktif = pengaturan?.tahun_aktif || new Date().getFullYear();

    const canManageMaster = permissions.includes('master.manage') || ['pengurus_barang', 'super_admin'].includes(userRole);
    const canCreateAset = permissions.includes('aset.create') || ['pengurus_barang', 'super_admin'].includes(userRole);

    // Helper to determine if link is active
    const isActive = (path) => {
        if (path === '/dashboard' && (url === '/dashboard' || url === '/')) return true;
        if (path !== '/dashboard' && url.startsWith(path)) return true;
        return false;
    };

    // Construct role-specific menu items for BMD (SIMUKTI)
    const getMenuItems = () => {
        const asetSubItems = [
            {
                name: 'Daftar Aset',
                href: '/aset',
                icon: Layers,
            },
        ];

        if (canCreateAset) {
            asetSubItems.push({
                name: 'Tambah Aset',
                href: '/aset/create',
                icon: PlusCircle,
            });
        }

        const items = [
            {
                name: 'Dashboard',
                href: '/dashboard',
                icon: BarChart3,
                badge: null,
            },
            {
                name: 'Aset BMD',
                href: '/aset',
                icon: Box,
                badge: null,
                subItems: asetSubItems,
            },
        ];

        if (canManageMaster) {
            items.push({
                name: 'Master Data',
                href: '/master',
                icon: Database,
                badge: null,
                subItems: [
                    {
                        name: 'Ruangan',
                        href: '/master/ruangan',
                        icon: DoorClosed,
                    },
                    {
                        name: 'Pegawai',
                        href: '/master/pegawai',
                        icon: Users,
                    },
                    {
                        name: 'Kode Barang 108',
                        href: '/master/kode-barang',
                        icon: BookOpen,
                    },
                ],
            });
        }

        items.push(
            {
                name: 'Laporan BMD',
                href: '/laporan',
                icon: FileSpreadsheet,
                badge: null,
            },
            {
                name: 'Notifikasi',
                href: '/notifikasi',
                icon: Bell,
                badge: null,
            }
        );

        return items;
    };

    const menuItems = getMenuItems();

    return (
        <>
            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar element */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out bg-gradient-to-b from-[#0f4a3c] via-[#0d3d31] to-[#08261f] text-white shadow-xl ${
                    collapsed ? 'w-[72px]' : 'w-[260px]'
                } ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Header / Brand */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 overflow-hidden focus:outline-none"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-white/20 shadow-inner overflow-hidden">
                            <img src="/logo.png" alt="Logo SIMUKTI" className="w-full h-full object-contain" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-lg tracking-wider text-white leading-tight">
                                    SIMUKTI
                                </span>
                                <span className="text-[11px] text-emerald-200/80 truncate">
                                    Kecamatan Mekarmukti
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 items-center justify-center text-white/80 hover:text-white transition-colors"
                        title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
                    >
                        {collapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;

                        return (
                            <div key={item.name} className="space-y-1">
                                <Link
                                    href={item.href}
                                    title={collapsed ? item.name : undefined}
                                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                                        active
                                            ? 'bg-white text-[#0f4a3c] font-semibold shadow-md'
                                            : 'text-white/85 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <Icon
                                        className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                                            active ? 'text-[#0f4a3c]' : 'text-emerald-200/80'
                                        }`}
                                    />

                                    {!collapsed && (
                                        <span className="truncate flex-1">
                                            {item.name}
                                        </span>
                                    )}

                                    {item.badge !== null && item.badge !== undefined && (
                                        <span
                                            className={`${
                                                item.badgeColor || 'bg-amber-400 text-neutral-900'
                                            } ${
                                                collapsed
                                                    ? 'absolute top-1.5 right-1.5 w-4 h-4 text-[10px] flex items-center justify-center rounded-full font-bold shadow'
                                                    : 'ml-auto px-2 py-0.5 text-xs rounded-full font-bold shadow-sm'
                                            }`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>

                                {!collapsed && item.subItems && item.subItems.length > 0 && (
                                    <div className="ml-7 pl-3 border-l border-white/15 space-y-1 mt-1">
                                        {item.subItems.map((sub) => {
                                            const subActive = url === sub.href;
                                            const SubIcon = sub.icon;
                                            return (
                                                <Link
                                                    key={sub.name}
                                                    href={sub.href}
                                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                                        subActive
                                                            ? 'bg-white/20 text-white font-semibold'
                                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                    }`}
                                                >
                                                    <SubIcon className="w-3.5 h-3.5" />
                                                    <span>{sub.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer Info / Tahun Anggaran */}
                <div className="p-3 border-t border-white/10 bg-black/10">
                    {!collapsed ? (
                        <div className="flex items-center justify-between text-xs text-white/75 px-1">
                            <span>Tahun Anggaran:</span>
                            <span className="px-2 py-0.5 rounded bg-white/15 font-semibold text-white">
                                {tahunAktif}
                            </span>
                        </div>
                    ) : (
                        <div className="text-center text-[10px] font-bold text-white/75">
                            {tahunAktif}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
