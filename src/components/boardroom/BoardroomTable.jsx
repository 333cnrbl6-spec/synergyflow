import { useState, useEffect } from 'react';

const MEMBER_COLORS = {
  'Premiso': { bg: '#1e3a5f', accent: '#3b82f6', light: '#dbeafe' },
  'Species Explorer': { bg: '#14532d', accent: '#22c55e', light: '#dcfce7' },
  'Age UK Bury': { bg: '#7c2d12', accent: '#f97316', light: '#ffedd5' },
  'CaseNarrative': { bg: '#4c1d95', accent: '#a855f7', light: '#f3e8ff' },
};

const SEAT_POSITIONS = [
  { top: '5%', left: '50%', transform: 'translateX(-50%)', label: 'top' },
  { top: '28%', left: '88%', transform: 'translateX(-50%)', label: 'right-top' },
  { top: '28%', left: '12%', transform: 'translateX(-50%)', label: 'left-top' },
  { bottom: '5%', left: '50%', transform: 'translateX(-50%)', label: 'bottom' },
];

// Readiness score: based on pricing tier spread (proxy for launch readiness)
function calcReadiness(product) {
  if (!product) return 30;
  const tiers = product.pricing_tiers || [];
  const hasMultipleTiers = tiers.length >= 3;
  const hasEnterprise = tiers.some(t => t.price >= 400);
  const hasMid = tiers.some(t => t.price >= 100 && t.price < 400);
  let score = 40;
  if (hasMultipleTiers) score += 20;
  if (hasEnterprise) score += 20;
  if (hasMid) score += 20;
  return Math.min(score, 100);
}

function CashStack({ count, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
        <div
          key={i}
          className="w-10 h-2 rounded-sm border border-opacity-40 shadow-sm"
          style={{
            backgroundColor: color.accent,
            borderColor: color.bg,
            opacity: 0.7 + i * 0.06,
            marginTop: i === 0 ? 0 : -4,
            transform: `rotate(${(i % 2 === 0 ? 1 : -1) * 2}deg)`,
          }}
        />
      ))}
      <span className="text-xs font-bold mt-1" style={{ color: color.accent }}>
        {count} tier{count !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

function MemberSeat({ member, product, position, isActive, onClick }) {
  const color = MEMBER_COLORS[member.member_name] || { bg: '#334155', accent: '#64748b', light: '#f1f5f9' };
  const readiness = calcReadiness(product);
  const tierCount = product?.pricing_tiers?.length || 0;

  return (
    <div
      className="absolute flex flex-col items-center cursor-pointer group"
      style={{ ...position, zIndex: 10 }}
      onClick={() => onClick(member)}
    >
      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 transition-all duration-300 group-hover:scale-110"
        style={{
          backgroundColor: color.bg,
          borderColor: isActive ? color.accent : 'rgba(255,255,255,0.3)',
          boxShadow: isActive ? `0 0 20px ${color.accent}88` : undefined,
        }}
      >
        {member.member_name.slice(0, 2).toUpperCase()}
      </div>
      {/* Name tag */}
      <div
        className="mt-1 px-2 py-0.5 rounded text-xs font-semibold text-white shadow text-center max-w-24"
        style={{ backgroundColor: color.bg }}
      >
        {member.member_name}
      </div>
      {/* Cash stack on table edge */}
      <div className="mt-2">
        <CashStack count={tierCount} color={color} />
      </div>
      {/* Readiness ring */}
      <div className="mt-1">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle
            cx="20" cy="20" r="16" fill="none"
            stroke={color.accent} strokeWidth="4"
            strokeDasharray={`${(readiness / 100) * 100.5} 100.5`}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
          />
          <text x="20" y="24" textAnchor="middle" fontSize="9" fill={color.accent} fontWeight="bold">
            {readiness}%
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function BoardroomTable({ members, products, activeMember, onMemberClick }) {
  const getProduct = (member) => products.find(p => p.name === member.app_name);

  const combinedReadiness = members.length > 0
    ? Math.round(members.reduce((sum, m) => sum + calcReadiness(getProduct(m)), 0) / members.length)
    : 0;

  return (
    <div className="relative w-full" style={{ height: 480 }}>
      {/* Room background */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
        {/* Wood panelling lines */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-full" style={{
            top: `${15 + i * 14}%`, height: 1,
            background: 'rgba(255,255,255,0.03)'
          }} />
        ))}
      </div>

      {/* Table surface */}
      <div
        className="absolute rounded-full shadow-2xl"
        style={{
          top: '18%', left: '20%', width: '60%', height: '60%',
          background: 'linear-gradient(145deg, #7c5b3a 0%, #5c3d20 40%, #3d2610 100%)',
          border: '6px solid #9d7350',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7), inset 0 2px 8px rgba(255,255,255,0.1)',
        }}
      >
        {/* Table felt */}
        <div className="absolute inset-4 rounded-full"
          style={{ background: 'linear-gradient(145deg, #1a472a, #0f2d1a)', opacity: 0.7 }} />

        {/* Combined value in centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="text-center">
            <div className="text-xs text-green-400 font-semibold tracking-widest uppercase mb-1">Board Readiness</div>
            <div className="text-5xl font-black text-white">{combinedReadiness}%</div>
            <div className="text-xs text-slate-400 mt-1">Combined Score</div>
            <div className="flex gap-1 mt-3 justify-center">
              {members.map((m) => {
                const color = MEMBER_COLORS[m.member_name] || { accent: '#64748b' };
                const r = calcReadiness(getProduct(m));
                return (
                  <div key={m.id} className="w-2 rounded-full" style={{
                    height: `${r / 10 + 8}px`, backgroundColor: color.accent, opacity: 0.85
                  }} />
                );
              })}
            </div>
            <div className="text-xs text-slate-500 mt-1">PERMANENTLY CONVENED</div>
          </div>
        </div>
      </div>

      {/* Member seats */}
      {members.map((member, i) => {
        const pos = SEAT_POSITIONS[i % SEAT_POSITIONS.length];
        return (
          <MemberSeat
            key={member.id}
            member={member}
            product={getProduct(member)}
            position={pos}
            isActive={activeMember?.id === member.id}
            onClick={onMemberClick}
          />
        );
      })}

      {/* "Permanently Convened" badge */}
      <div className="absolute top-3 right-4 flex items-center gap-2 bg-green-900/80 border border-green-500/40 rounded-full px-3 py-1">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-green-300 text-xs font-semibold">Live Session</span>
      </div>
    </div>
  );
}