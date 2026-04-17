import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Users, Target, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function StrategicBrainstormPanel() {
  const [phase, setPhase] = useState('product_crosscheck');
  const [boardMembers, setBoardMembers] = useState([]);
  const [ideas, setIdeas] = useState({});
  const [loading, setLoading] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [brainstormSession, setBrainstormSession] = useState(null);

  useEffect(() => {
    fetchBoardData();
  }, []);

  const fetchBoardData = async () => {
    try {
      const members = await base44.entities.BoardMember.filter({ active: true });
      setBoardMembers(members);
      const ideaObj = {};
      members.forEach(m => {
        ideaObj[m.app_name] = '';
      });
      setIdeas(ideaObj);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load board data');
    }
  };

  const conveneBoard = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('facilitateStrategicBrainstorm', {});
      setBrainstormSession(response.data);
      setPhase('collaborative_ideas');
      toast.success('Board convened for strategic brainstorm');
    } catch (error) {
      console.error(error);
      toast.error('Failed to convene board');
    } finally {
      setLoading(false);
    }
  };

  const synthesizeAndPresent = async () => {
    setSynthesizing(true);
    try {
      const response = await base44.functions.invoke('synthesizeJointVentures', {
        brainstorm_ideas: ideas,
        market_analysis: { board_size: boardMembers.length }
      });
      toast.success('Strategic synthesis complete - Presented to Chairman');
      setPhase('chairman_review');
    } catch (error) {
      console.error(error);
      toast.error('Failed to synthesize findings');
    } finally {
      setSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Target className="w-8 h-8 text-purple-600" />
          Strategic Joint Ventures
        </h2>
        <p className="text-slate-600">Board convenes for collaborative discovery: new apps, big money targets, market leadership</p>
      </div>

      {/* Phase 1: Product Cross-Check */}
      {phase === 'product_crosscheck' && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Users className="w-5 h-5" />
              Phase 1: Product Cross-Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">
              Each board member validates their product readiness and identifies market synergies before brainstorming.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {boardMembers.map(member => (
                <div key={member.id} className="bg-white p-3 rounded-lg border border-blue-200">
                  <p className="font-semibold text-sm text-slate-900">{member.app_name}</p>
                  <p className="text-xs text-slate-600 mt-1">{member.role}</p>
                  <Badge className="mt-2 bg-blue-600">Ready to contribute</Badge>
                </div>
              ))}
            </div>
            <Button
              onClick={conveneBoard}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg"
            >
              {loading ? 'Convening...' : '🎯 Convene Board'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Phase 2: Collaborative Ideas */}
      {(phase === 'collaborative_ideas' || phase === 'chairman_review') && (
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Lightbulb className="w-5 h-5" />
              Phase 2: Collaborative Build Ideas & Market Targets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-slate-900 mb-3">Board Brainstorm Prompts</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>✓ What market gaps can we fill with joint development?</li>
                  <li>✓ Which products could integrate for multiplier effect?</li>
                  <li>✓ What new verticals could we dominate together?</li>
                  <li>✓ Where is untapped revenue potential outside our usual scope?</li>
                  <li>✓ What big money targets should we pursue?</li>
                </ul>
              </div>

              {/* Collect Ideas */}
              {boardMembers.map(member => (
                <div key={member.id} className="bg-white p-4 rounded-lg border border-amber-200">
                  <label className="block font-semibold text-slate-900 mb-2">
                    {member.app_name} - Collaborative Ideas & Market Targets
                  </label>
                  <Textarea
                    placeholder={`${member.app_name}'s ideas for joint ventures, new apps, market opportunities, synergies...`}
                    value={ideas[member.app_name] || ''}
                    onChange={(e) => setIdeas({
                      ...ideas,
                      [member.app_name]: e.target.value
                    })}
                    className="h-24"
                  />
                </div>
              ))}
            </div>

            {phase === 'collaborative_ideas' && (
              <Button
                onClick={synthesizeAndPresent}
                disabled={synthesizing || Object.values(ideas).every(i => !i)}
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
              >
                {synthesizing ? 'Synthesizing...' : '📊 Synthesize & Present to Chairman'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Phase 3: Chairman Review */}
      {phase === 'chairman_review' && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <TrendingUp className="w-5 h-5" />
              Phase 3: Chairman Review & Strategic Decision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-purple-300">
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900">Strategic Synthesis Complete</h4>
                  <p className="text-slate-700 mt-2">
                    Board recommendations on high-value joint ventures, new collaborative apps, and big money market targets have been synthesized and presented to the Chairman.
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    Awaiting Chairman decision on strategic direction and resource allocation.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded border border-purple-200">
                <p className="text-2xl font-bold text-purple-600">{boardMembers.length}</p>
                <p className="text-xs text-slate-600">Board Members</p>
              </div>
              <div className="bg-white p-3 rounded border border-purple-200">
                <p className="text-2xl font-bold text-green-600">✓</p>
                <p className="text-xs text-slate-600">Ideas Collected</p>
              </div>
              <div className="bg-white p-3 rounded border border-purple-200">
                <p className="text-2xl font-bold text-amber-600">→</p>
                <p className="text-xs text-slate-600">Pending Chairman</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}