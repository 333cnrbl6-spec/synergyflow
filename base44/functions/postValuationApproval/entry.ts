import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { proposal_id, proposal_title, calculations } = await req.json();

    // Post board communication with valuation outcome
    const message = `
📊 **Portfolio Valuation Approved**

**Proposal:** ${proposal_title}

**Individual Product Values:**
${Object.entries(calculations.individual_values)
  .map(([name, value]) => `• ${name}: £${value.toLocaleString()}M`)
  .join('\n')}

**Suite Integration Dynamics:**
• Total Individual: £${calculations.total_individual.toLocaleString()}M
• Premium (+${calculations.suite_premium_percentage}%): £${calculations.suite_bonus.toLocaleString()}M
• **Portfolio Suite Value: £${calculations.suite_total_value.toLocaleString()}M**

This valuation is now the official board position for fundraising, M&A, or strategic discussions.
    `;

    await base44.functions.invoke('boardCommunications', {
      channel_id: 'strategy',
      from_member: 'System',
      message,
      message_type: 'announcement'
    });

    return Response.json({ 
      success: true,
      valuation: calculations
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});