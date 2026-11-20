'use client';

import React from 'react';

export default function SproutIllustration({ className = '', size = 260 }) {
  return (
    <div
      className={`sproutIllustrationContainer ${className}`}
      style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 320"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="sproutSvg"
      >
        <defs>
          {/* Radial mint aura behind the plant */}
          <radialGradient id="mintAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C8F169" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#9ADBB1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1E9A56" stopOpacity="0" />
          </radialGradient>

          {/* Leaf gradient 1: Lime to Green */}
          <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8F169" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2FB36A" stopOpacity="0.75" />
          </linearGradient>

          {/* Leaf gradient 2: Mint to Forest */}
          <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E3F4E9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#5CC689" stopOpacity="0.8" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="softTipGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background ambient circular glow */}
        <circle cx="160" cy="180" r="105" fill="url(#mintAura)" />

        {/* Subtle horizontal soil baseline */}
        <path
          d="M60 280 Q160 272 260 280"
          stroke="#9ADBB1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="4 6"
          opacity="0.35"
        />

        {/* Main Growing Stem */}
        <path
          d="M160 280 C158 220 148 160 160 88"
          stroke="#C8F169"
          strokeWidth="4.5"
          strokeLinecap="round"
          className="sproutStem"
        />

        {/* Leaf 1: Lower Left */}
        <g className="leafGroup leaf1">
          <path
            d="M156 235 C130 230 100 242 90 260 C110 268 140 255 156 235 Z"
            fill="url(#leafGrad1)"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeOpacity="0.5"
          />
          <path d="M156 235 Q125 245 92 259" stroke="#0B3D24" strokeWidth="1" opacity="0.3" />
        </g>

        {/* Leaf 2: Lower Right */}
        <g className="leafGroup leaf2">
          <path
            d="M157 215 C185 205 218 215 232 232 C214 245 180 238 157 215 Z"
            fill="url(#leafGrad2)"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeOpacity="0.5"
          />
          <path d="M157 215 Q195 220 230 231" stroke="#0B3D24" strokeWidth="1" opacity="0.3" />
        </g>

        {/* Leaf 3: Mid Left */}
        <g className="leafGroup leaf3">
          <path
            d="M153 175 C122 158 92 168 76 186 C98 198 132 192 153 175 Z"
            fill="url(#leafGrad2)"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />
          <path d="M153 175 Q114 175 78 185" stroke="#0B3D24" strokeWidth="1" opacity="0.3" />
        </g>

        {/* Leaf 4: Mid Right */}
        <g className="leafGroup leaf4">
          <path
            d="M155 150 C186 130 224 135 244 152 C225 168 186 168 155 150 Z"
            fill="url(#leafGrad1)"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />
          <path d="M155 150 Q198 145 242 151" stroke="#0B3D24" strokeWidth="1" opacity="0.3" />
        </g>

        {/* Leaf 5: Upper Left */}
        <g className="leafGroup leaf5">
          <path
            d="M156 118 C135 100 112 108 102 122 C118 132 142 130 156 118 Z"
            fill="url(#leafGrad1)"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
        </g>

        {/* Leaf 6: Upper Right Tip Bud */}
        <g className="leafGroup leaf6">
          <path
            d="M159 100 C178 85 204 90 216 104 C198 116 175 114 159 100 Z"
            fill="url(#leafGrad2)"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
        </g>

        {/* Glowing Top Seedling Bud */}
        <circle cx="160" cy="86" r="6" fill="#C8F169" filter="url(#softTipGlow)" className="tipGlow" />
        <circle cx="160" cy="86" r="3" fill="#FFFFFF" />
      </svg>

      <style jsx>{`
        .sproutStem {
          stroke-dasharray: 210;
          stroke-dashoffset: 210;
          animation: drawStem 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .leafGroup {
          opacity: 0;
          transform: scale(0.2) rotate(-15deg);
          animation-fill-mode: forwards;
        }

        .leaf1 {
          transform-origin: 156px 235px;
          animation: popLeaf 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s forwards,
                     gentleSway1 6s ease-in-out 1.4s infinite alternate;
        }
        .leaf2 {
          transform-origin: 157px 215px;
          animation: popLeaf 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s forwards,
                     gentleSway2 6.5s ease-in-out 1.6s infinite alternate;
        }
        .leaf3 {
          transform-origin: 153px 175px;
          animation: popLeaf 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s forwards,
                     gentleSway1 5.8s ease-in-out 1.8s infinite alternate;
        }
        .leaf4 {
          transform-origin: 155px 150px;
          animation: popLeaf 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s forwards,
                     gentleSway2 6.2s ease-in-out 2s infinite alternate;
        }
        .leaf5 {
          transform-origin: 156px 118px;
          animation: popLeaf 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.3s forwards,
                     gentleSway1 5.5s ease-in-out 2.2s infinite alternate;
        }
        .leaf6 {
          transform-origin: 159px 100px;
          animation: popLeaf 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s forwards,
                     gentleSway2 5.9s ease-in-out 2.4s infinite alternate;
        }

        .tipGlow {
          opacity: 0;
          animation: pulseTip 2.4s ease-in-out 1.8s infinite alternate;
        }

        @keyframes drawStem {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes popLeaf {
          0% {
            opacity: 0;
            transform: scale(0.2) rotate(-15deg);
          }
          70% {
            opacity: 1;
            transform: scale(1.08) rotate(3deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes gentleSway1 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-3.5deg);
          }
        }

        @keyframes gentleSway2 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(3.5deg);
          }
        }

        @keyframes pulseTip {
          0% {
            opacity: 0.4;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sproutStem {
            stroke-dashoffset: 0;
            animation: none;
          }
          .leafGroup {
            opacity: 1;
            transform: none;
            animation: none;
          }
          .tipGlow {
            opacity: 0.9;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
