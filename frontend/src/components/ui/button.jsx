import { forwardRef } from 'react';

const Button = forwardRef(({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => <button ref={ref} className={`ui-button button-${variant} button-${size} ${className}`} {...props}>{children}</button>);
Button.displayName = 'Button';
export { Button };