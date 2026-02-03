// Dr Muntasir's Thyroid Cancer Management App — Color System

/**
 * Unified color constants for consistent theming across the app.
 * Usage: Import and use in Tailwind classes or inline styles.
 */

export const COLORS = {
    // Module-Specific Primary Colors
    cancer: {
        primary: 'teal',
        bg: 'bg-teal-600',
        bgHover: 'hover:bg-teal-700',
        bgLight: 'bg-teal-50',
        text: 'text-teal-700',
        textDark: 'text-teal-800',
        textLight: 'text-teal-600',
        border: 'border-teal-400',
        ring: 'ring-teal-500',
    },
    nodule: {
        primary: 'indigo',
        bg: 'bg-indigo-500',
        bgHover: 'hover:bg-indigo-600',
        bgLight: 'bg-indigo-50',
        text: 'text-indigo-700',
        textDark: 'text-indigo-800',
        textLight: 'text-indigo-600',
        border: 'border-indigo-400',
        ring: 'ring-indigo-500',
    },

    // Status Colors
    status: {
        success: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-400',
        },
        warning: {
            bg: 'bg-amber-100',
            text: 'text-amber-800',
            border: 'border-amber-400',
        },
        error: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-400',
        },
        info: {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            border: 'border-blue-400',
        },
    },

    // Neutral Colors
    neutral: {
        bg: 'bg-stone-50',
        bgWhite: 'bg-white',
        bgCard: 'bg-white',
        border: 'border-stone-200',
        text: 'text-stone-800',
        textMuted: 'text-stone-500',
        textLight: 'text-stone-400',
    },

    // Action Colors
    action: {
        primary: 'bg-teal-600 hover:bg-teal-700 text-white',
        secondary: 'bg-stone-200 hover:bg-stone-300 text-stone-700',
        disabled: 'bg-stone-100 text-stone-400 cursor-not-allowed',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
    },
};

// Tailwind class helpers for common patterns
export const BUTTON_STYLES = {
    primary: `${COLORS.action.primary} font-bold py-2 px-4 rounded-lg shadow transition-all`,
    secondary: `${COLORS.action.secondary} font-bold py-2 px-4 rounded-lg transition-all`,
    disabled: `${COLORS.action.disabled} font-bold py-2 px-4 rounded-lg`,
    danger: `${COLORS.action.danger} font-bold py-2 px-4 rounded-lg shadow transition-all`,
};

export const CARD_STYLES = {
    base: `${COLORS.neutral.bgCard} rounded-xl shadow-lg border ${COLORS.neutral.border}`,
    header: (module: 'cancer' | 'nodule') =>
        `text-lg font-bold text-white p-4 ${module === 'cancer' ? COLORS.cancer.bg : COLORS.nodule.bg}`,
};
