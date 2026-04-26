import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';

const MARKET_SEGMENTS = [
  { value: 'legal_tech', label: 'Legal Tech' },
  { value: 'property_management', label: 'Property Management' },
  { value: 'conservation', label: 'Conservation' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'non_profit', label: 'Non-Profit' },
  { value: 'fintech', label: 'FinTech' },
  { value: 'hr_tech', label: 'HR Tech' },
  { value: 'sustainability', label: 'Sustainability' }
];

export default function MarketGapDiscussionPanel({ onGapIdentified }) {
  const [gaps, setGaps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState('');
  const [formData, setFormData] = useState({
    gap_title: '',
    gap_description: '',
    problem_statement: '',
    market_segment: '',
    competitor_weaknesses: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(true);

  useEffect(() => {
    loadGaps();
  }, []);

  const loadGaps = async () => {
    try {
      const data = await base44.entities.MarketGapAnalysis.list('-created_date', 20);
      setGaps(data);
    } catch (err) {
      console.error('Failed to load gaps:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitGap = async () => {
    if (!formData.gap_title || !formData.problem_statement) {
      toast.error('Fill in title and problem statement');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await base44.auth.me();

      const newGap = await base44.entities.MarketGapAnalysis.create({
        gap_title: formData.gap_title,
        gap_description: formData.gap_description,
        problem_statement: formData.problem_statement,
        market_segment: formData.market_segment || 'other',
        identified_by: [user.email],
        competitor_weaknesses: formData.competitor_weaknesses
          ? formData.competitor_weaknesses.split(',').map(s => s.trim())
          : [],
        status: 'identified'
      });

      // Create board communication thread
      await base44.entities.BoardMessage.create({
        channel_id: 'strategy',
        channel_name: '#strategy',
        from_member: user.email,
        message_content: `🎯 New Market Gap Identified: ${formData.gap_title}\n\n${formData.gap_description}`,
        message_type: 'proposal'
      });

      toast.success('Market gap identified and posted to board');
      setFormData({ gap_title: '', gap_description: '', problem_statement: '', market_segment: '', competitor_weaknesses: '' });
      setShowForm(false);
      loadGaps();
      onGapIdentified?.();
    } catch (err) {
      console.error('Failed to create gap:', err);
      toast.error('Failed to identify gap');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Market Gap Identification</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Identify Gap
        </Button>
      </div>

      {/* Gap Submission Form */}
      {showForm && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">Identify a Market Gap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Gap Title</label>
              <Input
                placeholder="e.g., Integrated Legal Operations Platform"
                value={formData.gap_title}
                onChange={(e) => setFormData({ ...formData, gap_title: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Market Segment</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MARKET_SEGMENTS.map((seg) => (
                  <Button
                    key={seg.value}
                    variant={formData.market_segment === seg.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, market_segment: seg.value })}
                    className={formData.market_segment === seg.value ? 'bg-slate-900' : ''}
                  >
                    {seg.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Problem Statement</label>
              <textarea
                placeholder="What problem does this gap represent?"
                value={formData.problem_statement}
                onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                className="w-full p-3 border rounded-lg text-sm mt-1"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Gap Description</label>
              <textarea
                placeholder="Describe the market gap in detail..."
                value={formData.gap_description}
                onChange={(e) => setFormData({ ...formData, gap_description: e.target.value })}
                className="w-full p-3 border rounded-lg text-sm mt-1"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Competitor Weaknesses (comma-separated)</label>
              <Input
                placeholder="e.g., Poor integration, Limited automation, High cost"
                value={formData.competitor_weaknesses}
                onChange={(e) => setFormData({ ...formData, competitor_weaknesses: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmitGap}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Post to Board
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Identified Gaps */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Recent Gaps</h3>
        {gaps.length > 0 ? (
          gaps.map((gap) => (
            <Card key={gap.id} className="hover:shadow-lg transition">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{gap.gap_title}</h4>
                    <Badge className="mt-2 bg-slate-100 text-slate-800">
                      {MARKET_SEGMENTS.find(s => s.value === gap.market_segment)?.label || gap.market_segment}
                    </Badge>
                  </div>
                  <Badge className={
                    gap.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : gap.status === 'ready_for_proposal'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }>
                    {gap.status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>

                <p className="text-sm text-slate-700">{gap.gap_description}</p>

                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Problem:</p>
                  <p className="text-sm text-slate-600">{gap.problem_statement}</p>
                </div>

                {gap.competitor_weaknesses && gap.competitor_weaknesses.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">Competitor Gaps:</p>
                    <div className="flex flex-wrap gap-2">
                      {gap.competitor_weaknesses.map((weakness) => (
                        <Badge key={weakness} variant="secondary">
                          {weakness}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MessageSquare className="w-4 h-4" />
                    {gap.identified_by?.length || 0} board member{gap.identified_by?.length !== 1 ? 's' : ''}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Zap className="w-4 h-4" />
                    Propose Build
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-slate-50">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-600">No market gaps identified yet. Start the conversation!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}