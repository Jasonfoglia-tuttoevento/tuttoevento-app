import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export default function Skeleton({ 
  className = '', 
  variant = 'rectangular' 
}: SkeletonProps) {
  
  const baseStyles = "animate-pulse bg-gray-200 dark:bg-gray-700";
  
  let variantStyles = "";
  if (variant === 'circular') {
    variantStyles = "rounded-full";
  } else if (variant === 'text') {
    variantStyles = "h-4 rounded-md"; // Altezza standard per una riga di testo
  } else {
    variantStyles = "rounded-lg"; // Default rettangolare per card/box
  }

  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`} />
  );
}