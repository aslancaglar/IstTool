"use client";

export const PulsingClock = () => (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
        <circle cx="40" cy="40" r="36" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5">
            <animate attributeName="r" values="34;36;34" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy="40" r="28" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4">
            <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="20s" repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy="40" r="3" fill="#D97706" />
        <line x1="40" y1="40" x2="40" y2="26" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="8s" repeatCount="indefinite" />
        </line>
        <line x1="40" y1="40" x2="52" y2="40" stroke="#D97706" strokeWidth="2" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="60s" repeatCount="indefinite" />
        </line>
    </svg>
);

export const CookingPot = () => (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
        <circle cx="40" cy="40" r="36" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2.5">
            <animate attributeName="r" values="34;36;34" dur="2s" repeatCount="indefinite" />
        </circle>
        <path d="M28 30 Q28 22 32 20" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity="0.7">
            <animate attributeName="d" values="M28 30 Q28 22 32 20;M28 28 Q26 20 30 16;M28 30 Q28 22 32 20" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M40 28 Q40 20 44 18" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity="0.7">
            <animate attributeName="d" values="M40 28 Q40 20 44 18;M40 26 Q38 18 42 14;M40 28 Q40 20 44 18" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.8s" repeatCount="indefinite" />
        </path>
        <path d="M52 30 Q52 22 48 20" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity="0.7">
            <animate attributeName="d" values="M52 30 Q52 22 48 20;M52 28 Q54 20 50 16;M52 30 Q52 22 48 20" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
        </path>
        <rect x="22" y="34" width="36" height="20" rx="4" fill="#3B82F6" opacity="0.9" />
        <rect x="18" y="32" width="44" height="5" rx="2.5" fill="#2563EB" />
        <rect x="14" y="38" width="8" height="3" rx="1.5" fill="#2563EB" />
        <rect x="58" y="38" width="8" height="3" rx="1.5" fill="#2563EB" />
        <circle cx="32" cy="44" r="2" fill="#93C5FD" opacity="0.6">
            <animate attributeName="cy" values="44;38;44" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="42" cy="46" r="1.5" fill="#93C5FD" opacity="0.6">
            <animate attributeName="cy" values="46;39;46" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="43" r="1.8" fill="#93C5FD" opacity="0.6">
            <animate attributeName="cy" values="43;37;43" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1s" repeatCount="indefinite" />
        </circle>
    </svg>
);

export const DeliveryScooter = () => (
    <svg viewBox="0 0 100 100" className="w-24 h-24">
        <circle cx="50" cy="50" r="46" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="2.5">
            <animate attributeName="r" values="44;46;44" dur="2s" repeatCount="indefinite" />
        </circle>
        <line x1="8" y1="72" x2="92" y2="72" stroke="#C4B5FD" strokeWidth="1.5" strokeDasharray="5 4">
            <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="0.4s" repeatCount="indefinite" />
        </line>
        <circle cx="22" cy="62" r="2" fill="#C4B5FD" opacity="0">
            <animate attributeName="cx" values="28;16;8" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.3;0" dur="1s" repeatCount="indefinite" />
            <animate attributeName="r" values="1;2.5;3.5" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="24" cy="64" r="1.5" fill="#C4B5FD" opacity="0">
            <animate attributeName="cx" values="28;18;10" dur="1.2s" repeatCount="indefinite" begin="0.3s" />
            <animate attributeName="opacity" values="0.5;0.2;0" dur="1.2s" repeatCount="indefinite" begin="0.3s" />
            <animate attributeName="r" values="1;2;3" dur="1.2s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;0.5,-1.5;0,0;-0.5,-0.5;0,0" dur="0.6s" repeatCount="indefinite" />
            <circle cx="30" cy="66" r="6" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
            <circle cx="30" cy="66" r="2" fill="#7C3AED" />
            <g>
                <animateTransform attributeName="transform" type="rotate" from="0 30 66" to="360 30 66" dur="0.35s" repeatCount="indefinite" />
                <line x1="30" y1="61" x2="30" y2="71" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" />
                <line x1="25" y1="66" x2="35" y2="66" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" />
            </g>
            <circle cx="62" cy="66" r="6" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
            <circle cx="62" cy="66" r="2" fill="#7C3AED" />
            <g>
                <animateTransform attributeName="transform" type="rotate" from="0 62 66" to="360 62 66" dur="0.35s" repeatCount="indefinite" />
                <line x1="62" y1="61" x2="62" y2="71" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" />
                <line x1="57" y1="66" x2="67" y2="66" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" />
            </g>
            <path d="M30 66 L36 56 L50 54 L58 58 L62 66" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M36 60 L44 58 L44 63 L36 64 Z" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1" />
            <ellipse cx="46" cy="54" rx="5" ry="3" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1" />
            <path d="M40 53 Q46 50 52 53" fill="#6D28D9" stroke="#5B21B6" strokeWidth="1" strokeLinecap="round" />
            <line x1="58" y1="58" x2="62" y2="66" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
            <line x1="56" y1="48" x2="62" y2="52" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
            <line x1="62" y1="52" x2="58" y2="58" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="64" cy="58" r="2" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.8">
                <animate attributeName="opacity" values="1;0.7;1" dur="0.8s" repeatCount="indefinite" />
            </circle>
            <path d="M44 52 L46 42 L50 40" fill="none" stroke="#5B21B6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M48 44 L56 48" fill="none" stroke="#5B21B6" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="36" r="5" fill="#7C3AED" stroke="#5B21B6" strokeWidth="1.5" />
            <path d="M52 35 Q55 36 52 38" fill="#A78BFA" stroke="#6D28D9" strokeWidth="0.8" />
            <rect x="32" y="42" width="10" height="10" rx="2" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="1.2" />
            <line x1="34" y1="45" x2="40" y2="45" stroke="#C4B5FD" strokeWidth="1" />
            <line x1="34" y1="48" x2="39" y2="48" stroke="#C4B5FD" strokeWidth="1" />
        </g>
        <line x1="14" y1="54" x2="22" y2="54" stroke="#C4B5FD" strokeWidth="1" strokeLinecap="round" opacity="0">
            <animate attributeName="opacity" values="0;0.6;0" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="x1" values="18;10" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="x2" values="24;18" dur="0.8s" repeatCount="indefinite" />
        </line>
        <line x1="12" y1="58" x2="20" y2="58" stroke="#C4B5FD" strokeWidth="1" strokeLinecap="round" opacity="0">
            <animate attributeName="opacity" values="0;0.5;0" dur="0.9s" repeatCount="indefinite" begin="0.2s" />
            <animate attributeName="x1" values="16;8" dur="0.9s" repeatCount="indefinite" begin="0.2s" />
            <animate attributeName="x2" values="22;14" dur="0.9s" repeatCount="indefinite" begin="0.2s" />
        </line>
        <line x1="16" y1="50" x2="22" y2="50" stroke="#C4B5FD" strokeWidth="0.8" strokeLinecap="round" opacity="0">
            <animate attributeName="opacity" values="0;0.4;0" dur="1s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="x1" values="20;12" dur="1s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="x2" values="26;18" dur="1s" repeatCount="indefinite" begin="0.5s" />
        </line>
    </svg>
);

export const CompletedCheck = () => (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
        <circle cx="40" cy="40" r="36" fill="#D1FAE5" stroke="#10B981" strokeWidth="2.5" />
        <path d="M25 40 L35 50 L55 30" fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="stroke-dashoffset" from="50" to="0" dur="0.6s" fill="freeze" />
            <animate attributeName="stroke-dasharray" from="0 50" to="50 0" dur="0.6s" fill="freeze" />
        </path>
        <circle cx="15" cy="20" r="2" fill="#34D399">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="r" values="1;2.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="65" cy="18" r="1.5" fill="#F59E0B">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        <circle cx="68" cy="55" r="2" fill="#3B82F6">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
        </circle>
        <circle cx="12" cy="58" r="1.5" fill="#EC4899">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.9s" />
        </circle>
    </svg>
);

export const CancelledX = () => (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
        <circle cx="40" cy="40" r="36" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2.5" />
        <line x1="28" y1="28" x2="52" y2="52" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
        <line x1="52" y1="28" x2="28" y2="52" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
    </svg>
);
