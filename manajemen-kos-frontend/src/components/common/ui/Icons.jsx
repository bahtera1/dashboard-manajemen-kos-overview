import React from 'react';

// Props default: className="w-5 h-5", strokeWidth=2
const IconBase = ({
    children,
    className = "w-5 h-5",
    viewBox = "0 0 24 24",
    strokeWidth = 2,
    fill = "none",
    stroke = "currentColor"
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        fill={fill}
        viewBox={viewBox}
        stroke={stroke}
    >
        {children}
    </svg>
);

export const SearchIcon = (props) => (
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </IconBase>
);

export const PlusIcon = (props) => (
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M12 4v16m8-8H4" />
    </IconBase>
);

export const EditIcon = (props) => (
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </IconBase>
);

export const TrashIcon = (props) => (
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </IconBase>
);

export const ChevronDownIcon = (props) => (
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M19 9l-7 7-7-7" />
    </IconBase>
);

export const ChevronLeftIcon = (props) => (
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M15 19l-7-7 7-7" />
    </IconBase>
);

export const ChevronRightIcon = (props) => (
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M9 5l7 7-7 7" />
    </IconBase>
);

export const CheckIcon = (props) => (
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M5 13l4 4L19 7" />
    </IconBase>
);

export const XIcon = (props) => (
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M6 18L18 6M6 6l12 12" />
    </IconBase>
);

export const MenuIcon = (props) => (
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M4 6h16M4 12h16M4 18h16" />
    </IconBase>
);

// Icon Spesifik Sidebar (Opsional)
export const HomeIcon = (props) => (
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </IconBase>
);

export const UserGroupIcon = (props) => (
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </IconBase>
);

export const KeyIcon = (props) => ( // Untuk Kamar
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </IconBase>
);

export const BanknotesIcon = (props) => ( // Untuk Transaksi
    <IconBase {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.strokeWidth || 2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </IconBase>
);
