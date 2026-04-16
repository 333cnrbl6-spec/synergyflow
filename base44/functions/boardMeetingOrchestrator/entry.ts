import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, meeting_id, topic, attendees, member, response, recommendation } = await req.json();

    // Create new board meeting
    if (action === 'create') {
      const meeting = await base44.entities.BoardMeeting.create({
        title: topic,
        called_by: user.email,
        meeting_date: new Date().toISOString(),
        attendees: attendees || [],
        status: 'in_progress',
        agenda_items: [
          {
            topic: topic,
            priority: 'high',
            description: 'Primary agenda item'
          }
        ],
        discussion_threads: []
      });

      // Notify each attendee (in production, would invoke their agent functions)
      for (const attendee of attendees || []) {
        console.log(`Notifying ${attendee} of board meeting: ${meeting.id}`);
      }

      return Response.json({ 
        meeting_id: meeting.id, 
        status: 'meeting_created',
        message: `Board meeting created. Attendees notified: ${attendees?.join(', ') || 'None'}` 
      });
    }

    // Add member response to discussion
    if (action === 'add_response') {
      const meetings = await base44.entities.BoardMeeting.filter({ id: meeting_id });
      
      if (meetings.length === 0) {
        return Response.json({ error: 'Meeting not found' }, { status: 404 });
      }

      const meeting = meetings[0];
      const threads = meeting.discussion_threads || [];
      
      // Find or create thread for first agenda item
      let thread = threads[0] || {
        agenda_item: meeting.agenda_items?.[0]?.topic || 'General',
        messages: [],
        action_items: []
      };

      thread.messages.push({
        from: member,
        timestamp: new Date().toISOString(),
        content: response,
        perspective: member,
        recommendation: recommendation
      });

      const updatedThreads = threads.length > 0 ? 
        [thread, ...threads.slice(1)] : 
        [thread];

      await base44.entities.BoardMeeting.update(meeting_id, {
        discussion_threads: updatedThreads
      });

      return Response.json({ 
        status: 'response_recorded',
        message: `Response from ${member} recorded in board meeting` 
      });
    }

    // Conclude meeting and record decisions
    if (action === 'conclude') {
      const { decisions } = await req.json();

      await base44.entities.BoardMeeting.update(meeting_id, {
        status: 'concluded',
        decisions: decisions || []
      });

      return Response.json({ 
        status: 'meeting_concluded',
        meeting_id: meeting_id 
      });
    }

    // Get meeting details
    if (action === 'get') {
      const meetings = await base44.entities.BoardMeeting.filter({ id: meeting_id });
      
      if (meetings.length === 0) {
        return Response.json({ error: 'Meeting not found' }, { status: 404 });
      }

      return Response.json(meetings[0]);
    }

    // List all meetings
    if (action === 'list') {
      const meetings = await base44.entities.BoardMeeting.list('-created_date', 50);
      return Response.json({ meetings });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Board meeting orchestrator error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});