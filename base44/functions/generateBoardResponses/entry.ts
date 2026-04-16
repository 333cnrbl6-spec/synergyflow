import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const payload = await req.json();
    const { event, data } = payload;

    // Extract data from entity automation trigger
    const channel_id = data.channel_id;
    const message_content = data.message_content;
    const from_member = data.from_member;

    if (!channel_id || !message_content || !from_member) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get board members for this channel
    const channel = await base44.asServiceRole.entities.BoardChannel.get(channel_id);
    if (!channel || !channel.members || channel.members.length === 0) {
      return Response.json({ success: true, message: 'No members in channel' });
    }

    // Get all board members and products
    const allMembers = await base44.asServiceRole.entities.BoardMember.list();
    const allProducts = await base44.asServiceRole.entities.Product.list();

    // Filter to channel members who are not the sender and are active
    const channelMembers = allMembers.filter(m =>
      channel.members.includes(m.app_name) && m.app_name !== from_member && m.active
    );

    if (channelMembers.length === 0) {
      return Response.json({ success: true, message: 'No active members to respond' });
    }

    // Generate responses from each member
    for (const member of channelMembers) {
      // Find this member's product and calculate its sell-as-is value
      const product = allProducts.find(p => p.name === member.app_name);

      let productValueContext = '';
      if (product) {
        const lowestTier = product.pricing_tiers?.[0];
        const midTier = product.pricing_tiers?.[1];
        const enterpriseTier = product.pricing_tiers?.[2];

        productValueContext = `
Your product: ${product.name}
Description: ${product.description}
Target market: ${product.target_market}
Current sell-as-is pricing:
  - Starter: $${lowestTier?.price || 0}/month
  - Professional: $${midTier?.price || 0}/month  
  - Enterprise: $${enterpriseTier?.price || 0}/month
Estimated ARR if 100 customers (mix of tiers): ~$${Math.round(((lowestTier?.price || 0) * 40 + (midTier?.price || 0) * 45 + (enterpriseTier?.price || 0) * 15) * 12)}/year
Key features: ${product.features?.join(', ')}`;
      }

      const channelContext = {
        strategy: 'Focus on long-term strategic direction, growth opportunities, market positioning, and competitive advantage.',
        products: 'Focus on product development, feature priorities, cross-product integrations, and technical roadmap.',
        prospects: 'Focus on the sales pipeline, lead quality, deal values, conversion rates, and commercial opportunities.',
        governance: 'Focus on policy, compliance, voting outcomes, risk management, and board governance matters.'
      }[channel.channel_type] || 'Provide your professional perspective.';

      const prompt = `You are ${member.member_name}, the ${member.role} representing ${member.app_name} on the board of directors.

${productValueContext}

Channel context: ${channelContext}

A message was posted in the #${channel.display_name} channel by ${from_member}:
"${message_content}"

Respond concisely (2-4 sentences) from your unique product and role perspective. Reference your product's current value and pricing where relevant. Be professional, direct, and constructive. Do not use bullet points.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gemini_3_flash'
      });

      // Create response message
      await base44.asServiceRole.entities.BoardMessage.create({
        channel_id,
        channel_name: channel.display_name,
        from_member: member.member_name,
        message_content: response,
        message_type: 'perspective',
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({ success: true, responses_generated: channelMembers.length });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});