import React from 'react';

// Friendly AI-doctor character illustration, waving hello.
// Pure inline SVG so it needs no extra assets/dependencies.
function DoctorIllustration() {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '380px', margin: '0 auto' }}>
      {/* Speech bubble */}
      <div
        className="float-blob"
        style={{
          position: 'absolute', top: '8px', right: '10px',
          background: 'white', borderRadius: '16px',
          padding: '10px 18px', boxShadow: '0 10px 24px rgba(15,23,42,0.12)',
          fontWeight: '700', fontSize: '0.95rem', color: '#0a8a60',
          zIndex: 2, animationDuration: '4s'
        }}
      >
        Hello! 👋
        <div style={{
          position: 'absolute', bottom: '-6px', left: '28px',
          width: '14px', height: '14px', background: 'white',
          transform: 'rotate(45deg)'
        }} />
      </div>

      <svg viewBox="0 0 360 400" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="coatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#eef3f6" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd8b0" />
            <stop offset="100%" stopColor="#f4c08e" />
          </linearGradient>
          <radialGradient id="haloGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(15,184,127,0.18)" />
            <stop offset="100%" stopColor="rgba(15,184,127,0)" />
          </radialGradient>
        </defs>

        {/* Halo / glow behind character */}
        <ellipse cx="180" cy="190" rx="170" ry="170" fill="url(#haloGrad)" />

        {/* Floating decorative icons */}
        <g opacity="0.85">
          <circle cx="48" cy="90" r="22" fill="#eaf1ff" />
          <path d="M40 90h16M48 82v16" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

          <circle cx="320" cy="130" r="20" fill="#f3eaff" />
          <path d="M312 130c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" fill="none" stroke="#7c3aed" strokeWidth="2.5" />

          <circle cx="60" cy="290" r="18" fill="#fffbeb" />
          <path d="M52 290h16M60 282v16" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Ground shadow */}
        <ellipse cx="180" cy="372" rx="90" ry="14" fill="rgba(15,23,42,0.06)" />

        {/* Legs */}
        <rect x="148" y="300" width="26" height="70" rx="12" fill="#3b4a5a" />
        <rect x="190" y="300" width="26" height="70" rx="12" fill="#3b4a5a" />
        <rect x="142" y="360" width="38" height="16" rx="8" fill="#1f2937" />
        <rect x="184" y="360" width="38" height="16" rx="8" fill="#1f2937" />

        {/* Coat body */}
        <path d="M120 175 C120 150 145 135 180 135 C215 135 240 150 240 175 L248 305 C248 318 238 326 224 326 L136 326 C122 326 112 318 112 305 Z" fill="url(#coatGrad)" stroke="#dde3e9" strokeWidth="2" />

        {/* Coat lapels */}
        <path d="M168 145 L150 230 L172 220 Z" fill="#f7fafc" stroke="#dde3e9" strokeWidth="1.5" />
        <path d="M192 145 L210 230 L188 220 Z" fill="#f7fafc" stroke="#dde3e9" strokeWidth="1.5" />

        {/* Inner shirt */}
        <rect x="168" y="150" width="24" height="60" fill="#0fb87f" />

        {/* Stethoscope */}
        <path d="M150 165 C150 200 145 215 165 222 C185 229 195 215 195 195" fill="none" stroke="#3b4a5a" strokeWidth="5" strokeLinecap="round" />
        <circle cx="195" cy="195" r="8" fill="#3b4a5a" />
        <circle cx="150" cy="165" r="6" fill="#3b4a5a" />
        <circle cx="170" cy="160" r="6" fill="#3b4a5a" />

        {/* Pocket badge */}
        <rect x="195" y="250" width="30" height="22" rx="4" fill="#e3faf1" stroke="#0fb87f" strokeWidth="1.5" />
        <path d="M203 261h14M210 254v14" stroke="#0a8a60" strokeWidth="2" strokeLinecap="round" />

        {/* Neck */}
        <rect x="165" y="118" width="30" height="28" rx="10" fill="url(#skinGrad)" />

        {/* Head */}
        <circle cx="180" cy="90" r="46" fill="url(#skinGrad)" />

        {/* Hair */}
        <path d="M134 80 C134 48 158 30 180 30 C204 30 226 48 226 80 C226 64 214 56 200 56 C190 56 184 62 180 62 C176 62 170 56 160 56 C146 56 134 64 134 80Z" fill="#2b2238" />

        {/* Ears */}
        <circle cx="132" cy="92" r="9" fill="url(#skinGrad)" />
        <circle cx="228" cy="92" r="9" fill="url(#skinGrad)" />

        {/* Glasses */}
        <circle cx="163" cy="90" r="14" fill="rgba(255,255,255,0.35)" stroke="#3b4a5a" strokeWidth="2.5" />
        <circle cx="199" cy="90" r="14" fill="rgba(255,255,255,0.35)" stroke="#3b4a5a" strokeWidth="2.5" />
        <path d="M177 90h8" stroke="#3b4a5a" strokeWidth="2.5" />

        {/* Eyes */}
        <circle cx="163" cy="90" r="3.2" fill="#1f2937" />
        <circle cx="199" cy="90" r="3.2" fill="#1f2937" />

        {/* Smile */}
        <path d="M165 108 Q180 120 195 108" fill="none" stroke="#8a4b2e" strokeWidth="3" strokeLinecap="round" />

        {/* Cheeks */}
        <circle cx="148" cy="104" r="6" fill="#ff9d7a" opacity="0.35" />
        <circle cx="214" cy="104" r="6" fill="#ff9d7a" opacity="0.35" />

        {/* Left arm (resting) */}
        <path d="M120 185 C100 195 92 220 96 250" fill="none" stroke="url(#coatGrad)" strokeWidth="26" strokeLinecap="round" />
        <circle cx="96" cy="252" r="14" fill="url(#skinGrad)" />

        {/* Right arm waving */}
        <path d="M238 180 C262 165 278 130 270 95" fill="none" stroke="url(#coatGrad)" strokeWidth="26" strokeLinecap="round" />
        <g>
          <circle cx="270" cy="92" r="16" fill="url(#skinGrad)" />
          {/* Fingers */}
          <rect x="262" y="64" width="6" height="22" rx="3" fill="url(#skinGrad)" transform="rotate(-10 265 75)" />
          <rect x="272" y="60" width="6" height="24" rx="3" fill="url(#skinGrad)" transform="rotate(2 275 72)" />
          <rect x="282" y="64" width="6" height="22" rx="3" fill="url(#skinGrad)" transform="rotate(14 285 75)" />
        </g>
      </svg>
    </div>
  );
}

export default DoctorIllustration;