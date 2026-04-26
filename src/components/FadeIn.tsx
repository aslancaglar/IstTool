"use client";
import { useEffect, useRef, useState, ReactNode } from 'react';

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    direction?: 'up' | 'none';
    className?: string;
}

export default function FadeIn({ children, delay = 0, direction = 'up', className = '' }: FadeInProps) {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentRef = domRef.current;
        if (!currentRef) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, []);

    const baseStyles = direction === 'up'
        ? 'opacity-0 translate-y-8 transition-all duration-1000 ease-out'
        : 'opacity-0 transition-opacity duration-1000 ease-out';

    const visibleStyles = direction === 'up'
        ? 'opacity-100 translate-y-0'
        : 'opacity-100';

    return (
        <div
            ref={domRef}
            className={`${baseStyles} ${isVisible ? visibleStyles : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}
