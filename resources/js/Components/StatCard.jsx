import React from 'react';

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color = 'emerald',
    badge,
    className = '',
}) {
    const colorClasses = {
        emerald: {
            bg: 'bg-emerald-50 text-emerald-600',
            border: 'border-emerald-100',
            glow: 'group-hover:border-emerald-300',
        },
        blue: {
            bg: 'bg-blue-50 text-blue-600',
            border: 'border-blue-100',
            glow: 'group-hover:border-blue-300',
        },
        amber: {
            bg: 'bg-amber-50 text-amber-600',
            border: 'border-amber-100',
            glow: 'group-hover:border-amber-300',
        },
        rose: {
            bg: 'bg-rose-50 text-rose-600',
            border: 'border-rose-100',
            glow: 'group-hover:border-rose-300',
        },
        purple: {
            bg: 'bg-purple-50 text-purple-600',
            border: 'border-purple-100',
            glow: 'group-hover:border-purple-300',
        },
    };

    const scheme = colorClasses[color] || colorClasses.emerald;

    return (
        <div
            className={`group bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${scheme.glow} ${className}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        {title}
                    </p>
                    <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
                        {value}
                    </h3>
                </div>
                {Icon && (
                    <div className={`p-2.5 rounded-xl ${scheme.bg} shadow-2xs`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>

            {(subtitle || badge) && (
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    {subtitle && <span className="truncate">{subtitle}</span>}
                    {badge && <div>{badge}</div>}
                </div>
            )}
        </div>
    );
}
