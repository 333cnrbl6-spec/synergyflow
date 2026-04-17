import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const channelId = payload.channel_id;

    // Fetch all data
    const [messages, channel, proposals, decisions] = await Promise.all([
      base44.entities.BoardMessage.filter({ channel_id: channelId }),
      base44.entities.BoardChannel.filter({ id: channelId }),
      base44.entities.BoardProposal.filter({ channel_id: channelId }),
      base44.entities.BoardDecision.filter({ channel_id: channelId }),
    ]);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = doc.internal.pageSize.getWidth() - 2 * margin;

    // Helper to add page break
    const checkPageBreak = (spaceNeeded = 10) => {
      if (yPosition + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('THE BOARDROOM — Discussion Archive', margin, yPosition);
    yPosition += 12;

    // Channel info
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Channel: ${channel[0]?.display_name || 'Unknown'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 10;

    // Messages section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Discussion Timeline', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    const sortedMessages = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    sortedMessages.forEach((msg) => {
      checkPageBreak(20);

      // Message header
      doc.setFont(undefined, 'bold');
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const header = `${msg.from_member} [${msg.message_type}] — ${timestamp}`;
      doc.text(header, margin, yPosition);
      yPosition += 5;

      // Message content (wrapped)
      doc.setFont(undefined, 'normal');
      const wrappedText = doc.splitTextToSize(msg.message_content, maxWidth - 4);
      wrappedText.forEach((line) => {
        checkPageBreak(5);
        doc.text(line, margin + 3, yPosition);
        yPosition += 5;
      });

      yPosition += 4;
    });

    // Proposals section
    if (proposals.length > 0) {
      checkPageBreak(15);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Proposals & Decisions', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');

      proposals.forEach((prop) => {
        checkPageBreak(15);
        doc.setFont(undefined, 'bold');
        doc.text(`${prop.title} [${prop.status}]`, margin, yPosition);
        yPosition += 5;

        doc.setFont(undefined, 'normal');
        doc.text(`Raised by: ${prop.raised_by}`, margin + 3, yPosition);
        yPosition += 4;

        const wrappedSummary = doc.splitTextToSize(prop.summary, maxWidth - 4);
        wrappedSummary.forEach((line) => {
          checkPageBreak(5);
          doc.text(line, margin + 3, yPosition);
          yPosition += 4;
        });

        if (prop.chairman_notes) {
          doc.setFont(undefined, 'italic');
          doc.text('Chairman Notes:', margin + 3, yPosition);
          yPosition += 4;
          const wrappedNotes = doc.splitTextToSize(prop.chairman_notes, maxWidth - 6);
          wrappedNotes.forEach((line) => {
            checkPageBreak(5);
            doc.text(line, margin + 6, yPosition);
            yPosition += 4;
          });
        }

        yPosition += 3;
      });
    }

    // Generate PDF bytes
    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="board-discussion-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});