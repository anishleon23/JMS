import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-12" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src="/jms_logo.png" alt="JMS Catering" className="h-full w-auto object-contain" />
    </div>
  );
};