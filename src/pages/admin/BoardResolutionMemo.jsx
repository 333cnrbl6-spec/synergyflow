import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Printer, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BoardResolutionMemo() {
  const [memo, setMemo] = useState('');
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const loadApprovedProposals = async () => {
      try {
        const data = await base44.entities.BoardProposal.filter({ status: 'approved' });
        setProposals(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        if (data.length > 0) {
          await generateMemo(data);
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load proposals');
      } finally {
        setLoading(false);
      }
    };
    loadApprovedProposals();
  }, []);

  const generateMemo = async (approvedProposals) => {
    setGenerating(true);
    try {
      const proposalSummary = approvedProposals
        .map(p => `- ${p.title} (${p.proposal_type}): ${p.summary}${p.chairman_notes ? ` | Chairman notes: ${p.chairman_notes}` : ''}`)
        .join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a formal Board Resolution Memo based on these approved board decisions. Format it professionally with sections, numbered resolutions, implementation notes, and sign-off. Make it suitable for printing and email distribution.

APPROVED DECISIONS:
${proposalSummary}

Include:
1. Executive Summary
2. Numbered Resolutions (each decision as a formal resolution)
3. Implementation Timeline & Owners
4. Expected Impact
5. Board Approval Status
6. Next Review Date (30 days from now)

Format with proper spacing and professional memo structure.`,
        response_json_schema: {
          type: 'object',
          properties: {
            memo: { type: 'string' }
          }
        }
      });

      setMemo(response.memo);
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate memo');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Board Resolution Memo</title>
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; padding: 2in; max-width: 8.5in; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <pre>${memo}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const handleEmail = async () => {
    try {
      await base44.integrations.Core.SendEmail({
        to: 'board@company.com',
        subject: 'Board Resolution Memo - Approved Initiatives',
        body: memo
      });
      toast.success('Memo sent via email');
    } catch (e) {
      console.error(e);
      toast.error('Failed to send email');
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([memo], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'Board-Resolution-Memo.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Board Resolution Memo</h1>
          <p className="text-slate-600">AI-generated formal summary of {proposals.length} approved board decisions</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button onClick={handlePrint} className="gap-2 bg-slate-700 hover:bg-slate-800">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button onClick={handleDownload} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button onClick={handleEmail} className="gap-2 bg-green-600 hover:bg-green-700">
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Button 
            onClick={() => generateMemo(proposals)} 
            disabled={generating}
            variant="outline"
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>🔄 Regenerate</span>
            )}
          </Button>
        </div>

        {/* Memo Content */}
        <Card className="bg-white border border-slate-200">
          <CardContent className="p-8">
            {generating ? (
              <div className="flex items-center justify-center py-12 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
                <p className="text-slate-600">Generating formal memo...</p>
              </div>
            ) : memo ? (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono text-slate-800">
                {memo}
              </pre>
            ) : (
              <p className="text-slate-500 text-center py-8">No approved proposals to summarize.</p>
            )}
          </CardContent>
        </Card>

        {/* Proposal List */}
        {proposals.length > 0 && (
          <Card className="bg-white border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Included Decisions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {proposals.map((p) => (
                <div key={p.id} className="border border-slate-200 rounded p-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{p.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{p.summary}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap capitalize bg-slate-100 px-2 py-1 rounded">
                      {p.proposal_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}