import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const payload = await req.json();
    const { data } = payload;

    const channel_id = data.channel_id;
    const message_content = data.message_content;
    const from_member = data.from_member;

    if (!channel_id || !message_content || !from_member) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const channel = await base44.asServiceRole.entities.BoardChannel.get(channel_id);
    if (!channel || !channel.members || channel.members.length === 0) {
      return Response.json({ success: true, message: 'No members in channel' });
    }

    const allMembers = await base44.asServiceRole.entities.BoardMember.list();
    const allProducts = await base44.asServiceRole.entities.Product.list();

    // All active board members except the sender respond
    const respondingMembers = allMembers.filter(m =>
      channel.members.includes(m.app_name) && m.app_name !== from_member && m.active
    );

    if (respondingMembers.length === 0) {
      return Response.json({ success: true, message: 'No active members to respond' });
    }

    // Build a shared board context — all products visible to all members
    const allProductSummaries = allProducts.map(p => {
      const tiers = p.pricing_tiers || [];
      return `• ${p.name}: ${p.description} | Pricing: ${tiers.map(t => `${t.name} £${t.price}/mo`).join(', ')} | Market: ${p.target_market}`;
    }).join('\n');

    const channelFocus = {
      strategy: 'collective long-term strategy, shared growth opportunities, and how all products can be positioned together as a portfolio.',
      products: 'cross-product feature alignment, shared integrations, technical synergies, and how to raise collective product readiness.',
      prospects: 'joint sales opportunities, shared pipeline, and how the board can approach prospects with a unified portfolio offer.',
      governance: 'shared governance policy, collective risk management, compliance across all products, and board process improvements.'
    }[channel.channel_type] || 'collective board priorities and shared progress.';

    // Generate a unified board discussion — members respond cooperatively
    for (const member of respondingMembers) {
      const myProduct = allProducts.find(p => p.name === member.app_name);
      const myTiers = myProduct?.pricing_tiers || [];

      const prompt = `You are ${member.member_name}, representing ${member.app_name} on the SynergyFlow Board.

THE BOARD ETHOS: This board operates as a single unified entity. No product competes with another. All four products — Premiso, Species Explorer, Age UK Bury, and CaseNarrative — are owned and governed together. The board's collective strength is its diversity. You celebrate when any product advances because it lifts the whole board.

YOUR PRODUCT:
${myProduct ? `Name: ${myProduct.name}
Description: ${myProduct.description}
Pricing: ${myTiers.map(t => `${t.name} £${t.price}/mo`).join(' | ')}
Target: ${myProduct.target_market}` : 'No product data found.'}

ALL BOARD PRODUCTS (for cross-product context):
${allProductSummaries}

CHANNEL FOCUS: ${channelFocus}

A board member (${from_member}) has raised:
"${message_content}"

Respond in 2–4 sentences. Speak as a cooperative board member focused on collective readiness and shared success. Where relevant, suggest how your product can support or align with others. If your response surfaces a concrete action that should be built or approved, end with: [PROPOSAL: <one-line summary of what should be approved or built>]. Be direct, collaborative, and constructive.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gemini_3_flash'
      });

      // Check if the response contains a proposal for the chairman
      const proposalMatch = response.match(/\[PROPOSAL:\s*(.+?)\]/);
      if (proposalMatch) {
        const proposalSummary = proposalMatch[1].trim();
        await base44.asServiceRole.entities.BoardProposal.create({
          title: proposalSummary.slice(0, 80),
          summary: proposalSummary,
          raised_by: member.member_name,
          channel_id,
          channel_name: channel.display_name,
          proposal_type: 'build',
          products_involved: [member.app_name],
          status: 'pending_chairman',
          timestamp: new Date().toISOString()
        });
      }

      // Store message (strip the [PROPOSAL:...] tag from visible message for cleanliness)
      const cleanMessage = response.replace(/\[PROPOSAL:.*?\]/g, '').trim();

      await base44.asServiceRole.entities.BoardMessage.create({
        channel_id,
        channel_name: channel.display_name,
        from_member: member.member_name,
        message_content: cleanMessage,
        message_type: 'perspective',
        timestamp: new Date().toISOString()
      });
    }

    // After all individual responses, generate a brief collective board synthesis
    const synthesisPrompt = `You are the SynergyFlow Board Collective — a unified voice representing all four products: Premiso, Species Explorer, Age UK Bury, and CaseNarrative.

The board has been discussing: "${message_content}"

All board products:
${allProductSummaries}

In 1–2 sentences, summarise the board's collective position or next step. Speak as one unified board, not as individual products. If a concrete action emerges that requires chairman sign-off, end with: [PROPOSAL: <brief description>]. Otherwise, affirm the shared direction.`;

    const synthesis = await base44.integrations.Core.InvokeLLM({
      prompt: synthesisPrompt,
      model: 'gemini_3_flash'
    });

    const synthProposalMatch = synthesis.match(/\[PROPOSAL:\s*(.+?)\]/);
    if (synthProposalMatch) {
      await base44.asServiceRole.entities.BoardProposal.create({
        title: synthProposalMatch[1].trim().slice(0, 80),
        summary: synthProposalMatch[1].trim(),
        raised_by: 'The Board (Collective)',
        channel_id,
        channel_name: channel.display_name,
        proposal_type: 'build',
        products_involved: ['Premiso', 'Species Explorer', 'Age UK Bury', 'CaseNarrative'],
        status: 'pending_chairman',
        timestamp: new Date().toISOString()
      });
    }

    const cleanSynthesis = synthesis.replace(/\[PROPOSAL:.*?\]/g, '').trim();
    await base44.asServiceRole.entities.BoardMessage.create({
      channel_id,
      channel_name: channel.display_name,
      from_member: '📋 Board Collective',
      message_content: cleanSynthesis,
      message_type: 'announcement',
      timestamp: new Date().toISOString()
    });

    return Response.json({ success: true, responses_generated: respondingMembers.length + 1 });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});