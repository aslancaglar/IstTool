"use client";
import { useEffect } from 'react';

export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
      
      const header = document.querySelector('header');
      if (header) {
        header.style.right = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.paddingRight = '';
      document.body.style.overflow = 'unset';
      
      const header = document.querySelector('header');
      if (header) {
        header.style.right = '';
      }
    }

    return () => {
      document.body.style.paddingRight = '';
      document.body.style.overflow = 'unset';
      
      const header = document.querySelector('header');
      if (header) {
        header.style.right = '';
      }
    };
  }, [isLocked]);
}
