import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
}

export const GetVeevzLogo: React.FC<LogoProps> = ({
  size = 40,
  className = '',
  showText = false,
  textColor = 'text-black',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div 
        style={{ width: `${size}px`, height: `${size}px` }} 
        className="relative flex-shrink-0 rounded-full overflow-hidden shadow-xs hover:scale-105 transition-transform duration-200"
      >
        <svg
          viewBox="0 0 200 200"
          width={size}
          height={size}
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle base */}
          <circle cx="100" cy="100" r="100" fill="#000000" />
          
          {/* Top-Right Sky Blue Segment */}
          <path
            d="M 100 0 
               A 100 100 0 0 1 200 100 
               A 100 100 0 0 1 180 135
               L 165 125
               Q 150 115 138 120
               T 115 105
               Q 105 85 115 65
               T 118 40
               Q 105 20 100 0 Z"
            fill="#0084FF"
          />

          {/* White crevice/seam divider accent */}
          <path
            d="M 100 0
               C 104 22, 107 35, 116 48
               C 112 66, 102 78, 109 95
               C 114 105, 126 109, 134 116
               C 146 114, 158 122, 172 128
               L 182 136
               L 175 140
               C 159 133, 146 126, 133 127
               C 123 120, 110 115, 105 104
               C 98 87, 107 72, 111 54
               C 104 40, 99 22, 98 0 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`text-xl font-bold tracking-tight ${textColor} font-['Manrope'] leading-none`}>
            Get<span className="text-[#0084FF]">Veevz</span>
          </span>
          <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-0.5">
            Campaign Hub
          </span>
        </div>
      )}
    </div>
  );
};
