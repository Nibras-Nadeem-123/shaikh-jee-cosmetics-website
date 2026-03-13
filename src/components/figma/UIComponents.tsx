import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isLoading,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/90',
    secondary: 'bg-secondary text-primary border border-primary/10 hover:bg-secondary/80',
    outline: 'border-2 border-border text-foreground hover:bg-muted hover:border-primary/30',
    ghost: 'text-muted-foreground hover:text-primary hover:bg-muted',
    destructive: 'bg-destructive text-white hover:bg-destructive/90',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px] rounded-full',
    md: 'px-8 py-4 text-xs rounded-full',
    lg: 'px-12 py-5 text-sm rounded-full',
    icon: 'p-3 rounded-full',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : 18} className={children ? 'mr-2' : ''} />}
          {children}
        </>
      )}
    </button>
  );
};

export const Card = ({ children, className = '', hover = true }: { children: React.ReactNode, className?: string, hover?: boolean }) => (
  <div className={`bg-white rounded-[2.5rem] border border-primary/5 shadow-sm transition-all duration-500 ${hover ? 'hover:shadow-xl hover:shadow-primary/5 hover:border-primary/10' : ''} ${className}`}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'primary' }: { children: React.ReactNode, variant?: 'primary' | 'secondary' }) => (
  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${variant === 'primary' ? 'bg-primary text-white border-primary/10' : 'bg-secondary text-primary border-primary/5'}`}>
    {children}
  </span>
);
