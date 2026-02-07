import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'black';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  isLoading = false,
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/20 focus:ring-primary-100 border border-transparent",
    black: "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20 focus:ring-gray-100 border border-transparent",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm focus:ring-gray-100",
    danger: "bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200 shadow-sm focus:ring-red-50",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-100"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};