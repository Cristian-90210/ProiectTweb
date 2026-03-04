import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

/* ── Context ───────────────────────────────────────────────── */
interface DropdownContextValue {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
}

const DropdownContext = createContext<DropdownContextValue | undefined>(undefined);

const useDropdown = () => {
    const ctx = useContext(DropdownContext);
    if (!ctx) throw new Error('Dropdown compound components must be used inside <Dropdown>');
    return ctx;
};

/* ── Root ──────────────────────────────────────────────────── */
export const Dropdown: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const toggle = () => setIsOpen((v) => !v);
    const close = () => setIsOpen(false);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) close();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    return (
        <DropdownContext.Provider value={{ isOpen, toggle, close }}>
            <div ref={ref} className={clsx('relative', className)}>
                {children}
            </div>
        </DropdownContext.Provider>
    );
};

/* ── Trigger Button ────────────────────────────────────────── */
export const DropdownButton: React.FC<{
    children: React.ReactNode;
    className?: string;
    'aria-label'?: string;
}> = ({ children, className, ...rest }) => {
    const { toggle } = useDropdown();
    return (
        <button
            type="button"
            onClick={toggle}
            className={clsx('outline-none cursor-pointer', className)}
            {...rest}
        >
            {children}
        </button>
    );
};

/* ── Menu Panel ────────────────────────────────────────────── */
export const DropdownMenu: React.FC<{
    children: React.ReactNode;
    className?: string;
    anchor?: 'left' | 'right';
}> = ({ children, className, anchor = 'right' }) => {
    const { isOpen } = useDropdown();
    return (
        <div
            className={clsx(
                'absolute mt-2 w-56 bg-white/90 dark:bg-[#0f2027]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 transform origin-top z-50',
                anchor === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
                isOpen
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none',
                className,
            )}
        >
            <div className="py-1.5">{children}</div>
        </div>
    );
};

/* ── Menu Item ─────────────────────────────────────────────── */
export const DropdownItem: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    destructive?: boolean;
}> = ({ children, onClick, className, destructive }) => {
    const { close } = useDropdown();
    return (
        <button
            type="button"
            onClick={() => {
                onClick?.();
                close();
            }}
            className={clsx(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                destructive
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-host-cyan',
                className,
            )}
        >
            {children}
        </button>
    );
};

/* ── Label (section header inside menu) ────────────────────── */
export const DropdownLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => (
    <div
        className={clsx(
            'px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500',
            className,
        )}
    >
        {children}
    </div>
);

/* ── Divider ───────────────────────────────────────────────── */
export const DropdownDivider: React.FC = () => (
    <div className="my-1 h-px bg-gray-100 dark:bg-gray-700/60" />
);
