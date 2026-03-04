import React from 'react';
import { clsx } from 'clsx';

interface AvatarProps {
    src?: string;
    initials?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses: Record<string, string> = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
};

export const Avatar: React.FC<AvatarProps> = ({
    src,
    initials,
    alt = '',
    size = 'md',
    className,
}) => {
    if (src) {
        return (
            <img
                src={src}
                alt={alt}
                className={clsx(
                    'rounded-full object-cover ring-2 ring-white/20 dark:ring-gray-700',
                    sizeClasses[size],
                    className,
                )}
            />
        );
    }

    return (
        <span
            className={clsx(
                'inline-flex items-center justify-center rounded-full font-bold bg-gradient-to-br from-host-blue to-host-cyan text-white ring-2 ring-white/20 dark:ring-gray-700',
                sizeClasses[size],
                className,
            )}
        >
            {initials ?? '?'}
        </span>
    );
};
