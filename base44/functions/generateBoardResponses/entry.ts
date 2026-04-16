import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_id, channel_id, message_content, from_member } = await req.json();

    // Get board members for this channel
    const channel = await base44.asServiceRole.entities.BoardChannel.get(channel_id);
    if (!channel) {
      return Response.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Get board member details for those in the channel
    const allMembers = await base44.asServiceRole.entities.BoardMember.list();
    const channelMembers = allMembers.filter(m => 
      channel.members && channel.members.includes(m.app_name) && m.app_name !== from_member
    );

    // Generate responses from each member
    for (const member of channelMembers) {
      const prompt = `You are ${member.member_name}, a ${member.role} representing ${member.app_name}. Your expertise: ${member.expertise?.join(', ')}. 

A message was just posted in the board channel by ${from_member}:
"${message_content}"

Respond briefly (2-3 sentences) with your perspective or question, staying in character. Be professional and constructive.`;

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

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});