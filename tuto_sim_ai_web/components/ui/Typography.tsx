import { HTMLAttributes, forwardRef, ElementType } from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps extends HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'small' | 'large';
  as?: ElementType;
}

const Typography = forwardRef<HTMLHeadingElement | HTMLParagraphElement, TypographyProps>(
  ({ className, variant = 'p', as, children, ...props }, ref) => {
    const Component = as || (variant.match(/h[1-6]/) ? variant : 'p') as ElementType;

    const styles = {
      h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      h2: 'scroll-m-20 text-3xl font-semibold tracking-tight',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
      h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
      h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
      h6: 'scroll-m-20 text-base font-semibold tracking-tight',
      p: 'leading-7',
      small: 'text-sm font-medium leading-none',
      large: 'text-lg font-semibold',
    }[variant];

    return (
      <Component
        ref={ref}
        className={cn(styles, className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';

export { Typography, type TypographyProps };
