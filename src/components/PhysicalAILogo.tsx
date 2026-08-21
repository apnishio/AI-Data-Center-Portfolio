import React from 'react';

interface PhysicalAILogoProps {
  className?: string;
  size?: number;
}

/**
 * PhysicalAILogo: Blends physical datacenter infrastructure
 * (conductive busbars, power energy circuits, fiber-optic waveguides)
 * with Artificial Intelligence (neural matrix core, synaptic nodes, quantum compute chip).
 */
export const PhysicalAILogo: React.FC<PhysicalAILogoProps> = ({ 
  className = "w-8 h-8", 
  size = 32 
}) => {
  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
    >
      <defs>
        {/* Core AI Intelligence Gradient */}
        <linearGradient id="aiCoreGrad" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" /> {/* Electric Cyan */}
          <stop offset="50%" stopColor="#10B981" /> {/* Hyper Emerald */}
          <stop offset="100%" stopColor="#6366F1" /> {/* Deep Neural Indigo */}
        </linearGradient>

        {/* Energy & Power Conduit Gradient */}
        <linearGradient id="energyTrace" x1="2" y1="16" x2="30" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0.8" />
        </linearGradient>

        {/* Fiber Optical Waveguide Glow */}
        <linearGradient id="waveguideGrad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="aiGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Microchip / Die Substrate Grid (Hardware Foundation) */}
      <rect 
        x="6.5" 
        y="6.5" 
        width="19" 
        height="19" 
        rx="4" 
        stroke="url(#energyTrace)" 
        strokeWidth="1.25" 
        strokeOpacity="0.4"
        fill="#0B132B"
        fillOpacity="0.85"
      />

      {/* Physical Traces: Busbars & Fiber Optic Interconnect Lines */}
      {/* Top & Bottom Power/Cooling Rails */}
      <path d="M16 2.5V6.5" stroke="url(#waveguideGrad)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 25.5V29.5" stroke="url(#waveguideGrad)" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Left & Right High-Speed Cable / Fiber Traces */}
      <path d="M2.5 16H6.5" stroke="url(#energyTrace)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M25.5 16H29.5" stroke="url(#energyTrace)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Diagonal Optical Conduits */}
      <path d="M4 8L7.5 10" stroke="#38BDF8" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M28 8L24.5 10" stroke="#34D399" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M4 24L7.5 22" stroke="#818CF8" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M28 24L24.5 22" stroke="#38BDF8" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />

      {/* Physical Hardware Pins / Contact Pads (Outer Perimeter) */}
      <circle cx="16" cy="2.5" r="1" fill="#38BDF8" />
      <circle cx="16" cy="29.5" r="1" fill="#34D399" />
      <circle cx="2.5" cy="16" r="1" fill="#34D399" />
      <circle cx="29.5" cy="16" r="1" fill="#818CF8" />

      {/* Central AI Neural Core: Diamond-Hex Matrix */}
      <path 
        d="M16 9.5L22.5 16L16 22.5L9.5 16L16 9.5Z" 
        fill="url(#aiCoreGrad)" 
        fillOpacity="0.25"
        stroke="url(#aiCoreGrad)" 
        strokeWidth="1.3" 
        strokeLinejoin="round"
      />

      {/* Internal Energy Spark / Neural Synapse Paths */}
      <path 
        d="M16 11.5L18.5 14.5H13.5L16 17.5L14 20.5" 
        stroke="#FFFFFF" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        strokeOpacity="0.9"
        filter="url(#aiGlow)"
      />

      {/* Neural AI Synapse Nodes (Floating In Silicon) */}
      <circle cx="16" cy="9.5" r="1.2" fill="#FFFFFF" />
      <circle cx="22.5" cy="16" r="1.2" fill="#38BDF8" />
      <circle cx="16" cy="22.5" r="1.2" fill="#34D399" />
      <circle cx="9.5" cy="16" r="1.2" fill="#818CF8" />

      {/* Central Quantum Intelligence Node */}
      <circle cx="16" cy="16" r="1.6" fill="#FFFFFF" filter="url(#aiGlow)" />
    </svg>
  );
};
