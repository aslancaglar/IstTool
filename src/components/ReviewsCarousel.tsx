"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import Skeleton from './Skeleton';

interface ReviewsCarouselProps {
    reviewsData: any[];
}

export default function ReviewsCarousel({ reviewsData }: ReviewsCarouselProps) {
    const reviews = reviewsData || [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const extendedReviews = useMemo(
        () => (isMobile ? [...reviews, ...reviews] : [...reviews, ...reviews, ...reviews]),
        [reviewsData, isMobile]
    );

    const startAutoSlide = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = window.setInterval(() => {
            nextSlide();
        }, 4000);
    };

    useEffect(() => {
        if (reviews.length > 0) {
            startAutoSlide();
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isMobile, reviews.length]);

    useEffect(() => {
        if (reviews.length > 0 && currentIndex === reviews.length) {
            setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(0);
                setTimeout(() => {
                    setIsTransitioning(true);
                }, 50);
            }, 500);
        }
    }, [currentIndex, reviews.length]);

    const nextSlide = () => {
        if (reviews.length === 0) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
    };

    const prevSlide = () => {
        if (reviews.length === 0) return;
        if (currentIndex === 0) {
            setIsTransitioning(false);
            setCurrentIndex(reviews.length);
            setTimeout(() => {
                setIsTransitioning(true);
                setCurrentIndex(reviews.length - 1);
            }, 50);
        } else {
            setIsTransitioning(true);
            setCurrentIndex((prev) => prev - 1);
        }
        startAutoSlide();
    };

    const goToSlide = (index: number) => {
        setIsTransitioning(true);
        setCurrentIndex(index);
        startAutoSlide();
    };

    const handleNextClick = () => {
        nextSlide();
        startAutoSlide();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextSlide();
            startAutoSlide();
        }
        if (isRightSwipe) {
            prevSlide();
            startAutoSlide();
        }

        // reset
        setTouchStart(0);
        setTouchEnd(0);
    };

    const ReviewCard = ({ review, index }: { review: typeof reviews[0]; index: number }) => (
        <div
            key={`${review._id}-${index}`}
            className="flex-shrink-0 w-full md:w-auto"
            style={{ width: isMobile ? '100%' : 'calc(33.333% - 1.33rem)' }}
        >
            <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-lg transition-all h-full">
                <Quote className="w-10 h-10 text-primary-500/30 mb-4" />

                <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-5 h-5 ${i < review.rating
                                ? 'text-secondary-500 fill-secondary-500'
                                : 'text-gray-300'
                                }`}
                        />
                    ))}
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    "{review.comment}"
                </p>

                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-bold text-lg">
                            {review.name.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{review.name}</p>
                        <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!reviewsData) {
        return (
            <div className="flex gap-8 overflow-hidden">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="flex-shrink-0 bg-white rounded-3xl p-8 shadow-md"
                        style={{ width: isMobile ? '100%' : 'calc(33.333% - 1.33rem)' }}
                    >
                        <Skeleton className="h-10 w-10 mb-4" />
                        <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Skeleton key={s} className="h-5 w-5 rounded-full" />
                            ))}
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3 mb-6" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            {!isMobile && reviews.length > 0 && (
                <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Previous reviews"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
            )}
            {!isMobile && reviews.length > 0 && (
                <button
                    onClick={handleNextClick}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Next reviews"
                >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
            )}

            <div
                className="overflow-hidden min-h-[400px]"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className={`flex ${isMobile ? 'gap-0' : 'gap-8'}`}
                    style={{
                        transform: isMobile
                            ? `translateX(-${currentIndex * 100}%)`
                            : `translateX(-${currentIndex * (100 / 3)}%)`,
                        transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
                    }}
                >
                    {extendedReviews.map((review, index) => (
                        <ReviewCard key={`${review._id}-${index}`} review={review} index={index} />
                    ))}
                </div>
            </div>

            <div className="flex justify-center gap-2 mt-8">
                {reviews.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${index === (currentIndex % reviews.length)
                            ? 'bg-primary-600 w-8'
                            : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </>
    );
}
