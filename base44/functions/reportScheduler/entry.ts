import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all active reports
    const reports = await base44.asServiceRole.entities.Report.filter({ status: 'active' });

    const now = new Date();
    const currentDay = now.getDay(); // 0-6
    const currentDate = now.getDate(); // 1-31
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const toSend = [];

    for (const report of reports) {
      let shouldSend = false;

      if (report.frequency === 'weekly') {
        // Check if it's the right day and time (within 1 hour window)
        if (currentDay === report.day_of_week) {
          const reportTime = report.send_time;
          const timeDiff = Math.abs(
            (parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1])) -
            (parseInt(reportTime.split(':')[0]) * 60 + parseInt(reportTime.split(':')[1]))
          );
          if (timeDiff < 60) shouldSend = true; // Send if within 60 minutes
        }
      } else if (report.frequency === 'monthly') {
        // Check if it's the right date and time (within 1 hour window)
        if (currentDate === report.day_of_month) {
          const reportTime = report.send_time;
          const timeDiff = Math.abs(
            (parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1])) -
            (parseInt(reportTime.split(':')[0]) * 60 + parseInt(reportTime.split(':')[1]))
          );
          if (timeDiff < 60) shouldSend = true;
        }
      }

      if (shouldSend) {
        // Check if report was already sent today/this month
        const lastSent = report.last_sent ? new Date(report.last_sent) : null;
        const shouldReallySend = !lastSent || (
          report.frequency === 'weekly'
            ? lastSent.getDate() !== now.getDate()
            : lastSent.getMonth() !== now.getMonth()
        );

        if (shouldReallySend) {
          toSend.push(report);
        }
      }
    }

    // Send the reports
    for (const report of toSend) {
      try {
        await base44.asServiceRole.functions.invoke('generateAndEmailReport', { report_id: report.id });
        console.log(`Sent report: ${report.report_name}`);
      } catch (error) {
        console.error(`Failed to send report ${report.report_name}:`, error);
      }
    }

    return Response.json({
      success: true,
      reports_checked: reports.length,
      reports_sent: toSend.length
    });
  } catch (error) {
    console.error('Report scheduler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});