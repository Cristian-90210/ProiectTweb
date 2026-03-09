import React from 'react';

interface PageHeaderProps {
    title: React.ReactNode;
    subtitle?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
    return (
        <div className="relative -mt-24 pt-32 pb-20 overflow-hidden bg-host-gradient animate-gradient-x border-b border-white/10">
            {/* Fluid Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-blue-600/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
                <div className="absolute bottom-[-50%] right-[-20%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-sm animate-in slide-in-from-bottom-5 duration-700 fade-in">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-lg text-blue-100/90 max-w-2xl mx-auto font-light leading-relaxed animate-in slide-in-from-bottom-8 duration-700 fade-in delay-100">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};
