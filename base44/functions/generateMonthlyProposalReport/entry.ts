import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch approved proposals and valuation snapshots
    const [proposals, snapshots, products] = await Promise.all([
      base44.entities.BoardProposal.filter({ status: 'approved' }),
      base44.entities.ValuationSnapshot.list(),
      base44.entities.Product.list(),
    ]);

    // Calculate cumulative impact
    const totalProposals = proposals.length;
    const cumulativeValue = snapshots.reduce((sum, s) => sum + (s.sell_now_value || 0), 0);
    const totalMRR = snapshots.reduce((sum, s) => sum + (s.monthly_mrr || 0), 0);
    const totalARR = snapshots.reduce((sum, s) => sum + (s.annual_arr || 0), 0);

    // Group proposals by type
    const proposalsByType = {};
    proposals.forEach(p => {
      if (!proposalsByType[p.proposal_type]) {
        proposalsByType[p.proposal_type] = [];
      }
      proposalsByType[p.proposal_type].push(p);
    });

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    doc.text('Monthly Board Report', 20, yPosition);
    yPosition += 12;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    doc.text(`Report Period: ${month}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    // Summary Metrics
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Portfolio Impact Summary', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    
    const metrics = [
      { label: 'Total Approved Proposals', value: totalProposals },
      { label: 'Cumulative Portfolio Value', value: `£${cumulativeValue.toLocaleString(undefined, {maximumFractionDigits: 0})}M` },
      { label: 'Combined Monthly MRR', value: `£${totalMRR.toLocaleString(undefined, {maximumFractionDigits: 0})}` },
      { label: 'Combined Annual ARR', value: `£${totalARR.toLocaleString(undefined, {maximumFractionDigits: 0})}` }
    ];

    const metricBoxWidth = (pageWidth - 40) / 2;
    let metricX = 20;
    let metricY = yPosition;

    metrics.forEach((metric, idx) => {
      if (idx === 2) {
        metricX = 20;
        metricY += 22;
      }

      doc.setDrawColor(226, 232, 240);
      doc.rect(metricX, metricY, metricBoxWidth - 2, 18);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(metric.label, metricX + 4, metricY + 6);
      
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.setFont(undefined, 'bold');
      doc.text(metric.value.toString(), metricX + 4, metricY + 14);
      doc.setFont(undefined, 'normal');

      metricX += metricBoxWidth;
    });

    yPosition = metricY + 25;

    // Proposals by Type
    if (Object.keys(proposalsByType).length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Proposals by Category', 20, yPosition);
      yPosition += 8;

      Object.entries(proposalsByType).forEach(([type, typeProposals]) => {
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.setFont(undefined, 'bold');
        doc.text(`${type.replace(/_/g, ' ').toUpperCase()} (${typeProposals.length})`, 20, yPosition);
        yPosition += 6;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        
        typeProposals.forEach(proposal => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setTextColor(100, 116, 139);
          const wrappedTitle = doc.splitTextToSize(`• ${proposal.title}`, pageWidth - 40);
          doc.text(wrappedTitle, 25, yPosition);
          yPosition += wrappedTitle.length * 5 + 2;

          if (proposal.is_unanimous) {
            doc.setTextColor(34, 197, 94);
            doc.text('✓ Unanimous Vote', 25, yPosition);
            yPosition += 4;
          }
        });

        yPosition += 4;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Confidential - Board Members Only`, 20, pageHeight - 10);

    const pdfBuffer = doc.output('arraybuffer');
    const fileName = `board-report-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}.pdf`;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});