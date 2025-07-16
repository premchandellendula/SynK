

const Logo = () => {
    return (
        <svg viewBox="0 0 70 80" xmlns="http://www.w3.org/2000/svg" className="w-auto h-18 mx-auto">
            <defs>
                <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{"stopColor":"oklch(0.606 0.25 292.717)", "stopOpacity":1}} />
                    <stop offset="100%" style={{"stopColor":"oklch(0.506 0.25 292.717)", "stopOpacity":1}} />
                </linearGradient>
    
                <animate id="pulse" attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
            </defs>

            <circle cx="35" cy="40" r="25" fill="url(#primaryGradient)" opacity="0.1"/>


            <g transform="translate(35, 40)">

                <circle cx="0" cy="0" r="3" fill="oklch(0.606 0.25 292.717)"/>

                <circle cx="0" cy="-12" r="2.5" fill="oklch(0.606 0.25 292.717)">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" begin="0s"/>
                </circle>
                <circle cx="10" cy="-6" r="2.5" fill="oklch(0.606 0.25 292.717)">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" begin="0.3s"/>
                </circle>
                <circle cx="10" cy="6" r="2.5" fill="oklch(0.606 0.25 292.717)">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" begin="0.6s"/>
                </circle>
                <circle cx="0" cy="12" r="2.5" fill="oklch(0.606 0.25 292.717)">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" begin="0.9s"/>
                </circle>
                <circle cx="-10" cy="6" r="2.5" fill="oklch(0.606 0.25 292.717)">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" begin="1.2s"/>
                </circle>
                <circle cx="-10" cy="-6" r="2.5" fill="oklch(0.606 0.25 292.717)">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" begin="1.5s"/>
                </circle>
    
                <line x1="0" y1="0" x2="0" y2="-12" stroke="oklch(0.606 0.25 292.717)" strokeWidth="1" opacity="0.4"/>
                <line x1="0" y1="0" x2="10" y2="-6" stroke="oklch(0.606 0.25 292.717)" strokeWidth="1" opacity="0.4"/>
                <line x1="0" y1="0" x2="10" y2="6" stroke="oklch(0.606 0.25 292.717)" strokeWidth="1" opacity="0.4"/>
                <line x1="0" y1="0" x2="0" y2="12" stroke="oklch(0.606 0.25 292.717)" strokeWidth="1" opacity="0.4"/>
                <line x1="0" y1="0" x2="-10" y2="6" stroke="oklch(0.606 0.25 292.717)" strokeWidth="1" opacity="0.4"/>
                <line x1="0" y1="0" x2="-10" y2="-6" stroke="oklch(0.606 0.25 292.717)" strokeWidth="1" opacity="0.4"/>
            </g>
        </svg>
    )
}

export default Logo