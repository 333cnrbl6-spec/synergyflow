# Analytics & Usage Dashboard - User Guide

## Overview

The Analytics Dashboard provides users with real-time visibility into:
- **Usage metrics** for their subscribed products
- **Subscription quota tracking** and limits
- **Performance visualizations** showing trends over time
- **Alerts** when approaching quota limits
- **Export capabilities** for reporting and analysis

---

## Key Features

### 1. Product Selection

**View analytics for different products:**
- Switch between any of your subscribed products
- Each product has separate usage metrics and quotas
- Default selected on first load

### 2. Time Range Selection

**Analyze data across different periods:**
- **7 Days**: Recent activity snapshot
- **30 Days**: Monthly trend analysis
- **90 Days**: Quarterly performance review

### 3. Subscription Limits Dashboard

**Real-time quota tracking:**

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| **API Calls** | Monthly API request usage | 80% of limit |
| **Data Processing** | GB of data processed monthly | 80% of limit |
| **Storage** | Total storage used | 80% of limit |
| **Team Members** | Active team members | At limit |
| **Automation Runs** | Monthly automation executions | 80% of limit |
| **Reports Generated** | Monthly report creation | 80% of limit |

**Color-coded status:**
- 🟢 **Green**: Safe usage (< 80%)
- 🟡 **Yellow**: Warning (80-94%)
- 🔴 **Red**: Critical (≥ 95%)

### 4. Usage Charts

**Visualize trends with interactive charts:**

- **API Calls** (Line chart): Daily request volume trends
- **Data Processed** (Line chart): Data processing trends over time
- **Documents Created** (Bar chart): Document creation activity
- **Reports Generated** (Bar chart): Report generation frequency

**Interactive features:**
- Hover over data points for exact values
- Responsive design adapts to screen size
- Smooth animations and transitions

### 5. Quota Reset Date

**Track when your quotas reset:**
- Displayed in the Subscription Limits section
- Varies by subscription tier and start date
- Non-expiring metrics (Storage) never reset

### 6. Export Metrics

**Download usage data for external analysis:**
- Export as CSV file
- Includes date, API calls, data processed, storage, documents, reports
- Perfect for reports and analysis in Excel or other tools

---

## Subscription Tiers

### Starter Plan
- API Calls: 10,000/month
- Data Processing: 50 GB/month
- Storage: 10 GB total
- Team Members: 5
- Automation Runs: 100/month
- Reports: 50/month

### Professional Plan
- API Calls: 100,000/month
- Data Processing: 500 GB/month
- Storage: 100 GB total
- Team Members: 25
- Automation Runs: 1,000/month
- Reports: 500/month

### Enterprise Plan
- API Calls: 1,000,000/month
- Data Processing: 5,000 GB/month
- Storage: 1,000 GB total
- Team Members: 1,000
- Automation Runs: 10,000/month
- Reports: 5,000/month

---

## Alert System

### Critical Alerts

**You'll see alerts when:**
- ⚠️ API calls approach monthly limit (95%+)
- ⚠️ Storage approaches limit (95%+)
- ⚠️ Team member limit reached (100%)
- ⚠️ Automation runs near monthly limit (95%+)

### Alert Actions

**When you see an alert:**
1. Review your current usage
2. Reduce usage or optimize processes
3. Consider upgrading your plan
4. Contact support for guidance

### Disabling Alerts

**To disable alerts:**
1. Go to Account Settings
2. Find "Analytics Alerts"
3. Uncheck "Enable quota alerts"
4. Set custom threshold percentage (default: 80%)

---

## Common Use Cases

### 1. Capacity Planning
- Monitor growth trends month-over-month
- Identify when you'll need to upgrade
- Plan for seasonal spikes

### 2. Cost Optimization
- See which features consume most resources
- Identify unused API integrations
- Optimize automation workflows

### 3. Team Accountability
- Track team's usage patterns
- Allocate quota fairly across teams
- Identify power users

### 4. Compliance & Auditing
- Export metrics for audit trails
- Document usage patterns
- Verify quota compliance

### 5. Performance Monitoring
- Track system response times via API call patterns
- Monitor document creation and processing
- Identify bottlenecks or issues

---

## Best Practices

### Monitoring
- ✅ Check analytics weekly for trends
- ✅ Set alerts to 80% threshold
- ✅ Review usage patterns monthly
- ✅ Export data for archive/compliance
- ❌ Don't ignore critical alerts

### Optimization
- ✅ Batch API calls when possible
- ✅ Archive old documents to reduce storage
- ✅ Use automation for repetitive tasks
- ✅ Monitor for unused team members
- ❌ Don't let quotas reach 100%

### Planning
- ✅ Review quarterly usage trends
- ✅ Plan upgrades before hitting limits
- ✅ Communicate growth to team
- ✅ Budget for growth
- ❌ Don't wait until limits are hit

---

## Troubleshooting

### "No usage data available"
- Analytics collect daily after first 24 hours
- Check back tomorrow if account is new
- Ensure you're using the product (to generate metrics)

### "Quotas not updating in real-time"
- Metrics update once daily (batched overnight)
- For current-hour usage, see product dashboard
- Analytics show previous day's complete data

### "Wrong product showing"
- Ensure you selected correct product
- Some products may not have analytics enabled
- Contact support if product is missing

### "Can't export metrics"
- Need at least 1 day of usage data
- Ensure data is available for selected time range
- Check browser download settings
- Try different time range if no data

### "Upgrade link not working"
- Already on highest tier (Enterprise)
- Contact sales team for custom plan
- Enterprise users: contact account manager

---

## Data Security

### What Data Is Stored?
- Your product usage metrics (API calls, storage, etc.)
- Quota allocation and consumption
- Feature usage patterns
- Team member counts

### What Is NOT Stored?
- ❌ Actual data processed (only volume)
- ❌ Content of documents/reports
- ❌ Personal data from documents
- ❌ User login credentials
- ❌ Payment information

### Access Control
- Only authenticated users can view analytics
- Users only see their own product data
- Admins can see team-level data
- Data is encrypted in transit and at rest

---

## API Reference (Developers)

### UsageMetrics Entity
```json
{
  "user_email": "user@company.com",
  "product_id": "case-tracker",
  "metric_date": "2026-04-26",
  "api_calls": 1250,
  "data_processed_gb": 2.5,
  "documents_created": 15,
  "reports_generated": 3,
  "automation_runs": 50,
  "storage_used_gb": 5.2
}
```

### SubscriptionQuota Entity
```json
{
  "user_email": "user@company.com",
  "product_id": "case-tracker",
  "subscription_tier": "professional",
  "api_calls_limit": 100000,
  "current_api_calls_month": 45000,
  "reset_date": "2026-05-26",
  "alert_threshold_percent": 80
}
```

---

## FAQ

**Q: How often are metrics updated?**
A: Daily, typically overnight. Real-time usage appears in the product, not analytics.

**Q: Can I access historical data beyond 90 days?**
A: Contact support for data export archives beyond 90 days.

**Q: What happens when I hit my quota?**
A: You'll be alerted. Some features may be rate-limited. Upgrade plan to continue.

**Q: Can I change my alert threshold?**
A: Yes, in Account Settings → Analytics Alerts (default 80%).

**Q: Is my data private?**
A: Yes. You only see your own metrics. Admins see team metrics. Data is encrypted.

**Q: How is storage quota calculated?**
A: Includes documents, attachments, backups, and temporary files.

**Q: Can I export metrics for compliance?**
A: Yes. Export as CSV anytime. Includes full audit trail.

**Q: What's included in "Data Processing"?**
A: API calls, automation runs, report generation, bulk operations.

---

## Support

For analytics questions:
- 📧 Email: support@synergyflow.com
- 💬 In-app chat (bottom right)
- 📖 Help Center: help.synergyflow.com
- 📞 Phone: +44 (0) 20 XXXX XXXX (Enterprise)

## Related

- [Team Management Guide](./TEAM_MANAGEMENT_GUIDE.md)
- [Subscription Plans](./SUBSCRIPTION_TIERS.md)
- [API Documentation](./API.md)