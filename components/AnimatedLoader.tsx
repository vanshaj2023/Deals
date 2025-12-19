"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface AnimatedLoaderProps {
  count?: number;
}

const AnimatedLoader = ({ count = 10 }: AnimatedLoaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.loader-card');
      
      gsap.fromTo(
        cards,
        {
          opacity: 0.3,
          scale: 0.95
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        }
      );
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="loader-card bg-white border border-gray-200"
        >
          <div className="aspect-[3/4] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer" />
          
          <div className="p-3 space-y-3">

            <div className="h-4 bg-gray-200 rounded w-3/4" />
            
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            
            <div className="flex gap-2">
              <div className="h-4 bg-gray-300 rounded w-16" />
              <div className="h-4 bg-gray-100 rounded w-12" />
            </div>
            
            <div className="h-5 bg-gray-100 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedLoader;
