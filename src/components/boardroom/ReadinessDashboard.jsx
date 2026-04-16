const MEMBER_COLORS = {
  'Premiso': { accent: '#3b82f6', bg: '#1e3a5f', light: '#dbeafe' },
  'Species Explorer': { accent: '#22c55e', bg: '#14532d', light: '#dcfce7' },
  'Age UK Bury': { accent: '#f97316', bg: '#7c2d12', light: '#ffedd5' },
  'CaseNarrative': { accent: '#a855f7', bg: '#4c1d95', light: '#f3e8ff' },
};

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

function getReadinessStage(score) {
  if (score >= 90) return { label: 'Launch Ready', color: '#22c55e' };
  if (score >= 70) return { label: 'Near Ready', color: '#3b82f6' };
  if (score >= 50) return { label: 'In Progress', color: '#f59e0b' };
  return { label: 'Early Stage', color: '#f97316' };
}

export default function ReadinessDashboard({ members, products }) {
  const getProduct = (member) => products.find(p => p.name === member.app_name);

  const scores = members.map(m => ({
    member: m,
    product: getProduct(m),
    score: calcReadiness(getProduct(m)),
  }));

  // Parity score: the board is only as strong as its weakest member.
  // Combined score = the minimum individual score (not the average).
  // This means the score only rises when ALL members rise together.
  const minScore = scores.length > 0 ? Math.min(...scores.map(x => x.score)) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores.map(x => x.score)) : 1;
  const combined = minScore; // Board readiness = weakest link

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-sm tracking-wide uppercase">Board Readiness Dashboard</h3>
        <div className="text-xs text-slate-400">Sell-As-Is Readiness Index</div>
      </div>

      {/* Combined bar */}
      <div className="bg-slate-800 rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-300 text-xs font-semibold">BOARD PARITY SCORE</span>
          <span className="text-white font-black text-lg">{combined}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-700"
            style={{
              width: `${combined}%`,
              background: 'linear-gradient(90deg, #f97316, #22c55e)',
            }}
          />
        </div>
        <div className="text-xs text-slate-500">
          {combined >= 80 ? '✅ All products are launch-ready — true board parity achieved' :
           combined >= 60 ? '⚡ Getting closer — lagging products need collective support' :
           '🔧 Board parity is low — stronger products must lift the others'}
        </div>
        <div className="text-xs text-amber-400/80">
          ⚖️ Score reflects the weakest product — all must rise together
        </div>
      </div>

      {/* Individual members */}
      <div className="space-y-2">
        {scores.map(({ member, product, score }) => {
          const color = MEMBER_COLORS[member.member_name] || { accent: '#64748b', bg: '#334155', light: '#f1f5f9' };
          const stage = getReadinessStage(score);
          const tiers = product?.pricing_tiers || [];
          const isLeader = score === maxScore;

          return (
            <div key={member.id} className="bg-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.accent }} />
                  <span className="text-white text-xs font-semibold">{member.member_name}</span>
                  {score === maxScore && score > minScore && <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-semibold">AHEAD — help others</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: stage.color + '22', color: stage.color }}>
                    {stage.label}
                  </span>
                  <span className="text-white font-bold text-sm">{score}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${score}%`, backgroundColor: color.accent }}
                />
              </div>

              {/* Tier breakdown as cash tokens */}
              <div className="flex gap-2 items-center flex-wrap">
                {tiers.map((tier, i) => (
                  <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border"
                    style={{ borderColor: color.accent + '44', backgroundColor: color.accent + '11', color: color.accent }}>
                    💰 {tier.name}: £{tier.price}/mo
                  </div>
                ))}
                {tiers.length === 0 && <span className="text-slate-500 text-xs">No pricing configured</span>}
              </div>

              {/* Gap from top — framed as board needing to close this */}
              {score < maxScore && (
                <div className="text-xs text-amber-500/80">
                  ↑ {maxScore - score}% behind the board's most advanced product — board parity requires closing this gap
                </div>
              )}
              {score === minScore && scores.length > 1 && (
                <div className="text-xs text-red-400/80 font-semibold">
                  ⚠️ This product sets the board's parity score — priority to advance
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stage legend */}
      <div className="flex gap-3 flex-wrap pt-1 border-t border-slate-700">
        {[
          { label: 'Early Stage', color: '#f97316' },
          { label: 'In Progress', color: '#f59e0b' },
          { label: 'Near Ready', color: '#3b82f6' },
          { label: 'Launch Ready', color: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-slate-400">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}