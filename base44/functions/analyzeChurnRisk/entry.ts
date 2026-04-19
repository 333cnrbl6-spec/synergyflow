import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role || !['admin'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch subscription data
    const subscriptions = await base44.entities.AppSubscription.list().catch(() => []);
    const users = await base44.entities.User.list().catch(() => []);
    
    const today = new Date();
    const sixMonthsAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);

    // Calculate churn risk for each organization
    const churnAnalysis = subscriptions.map(sub => {
      // Extract metrics
      const daysActive = sub.active_until ? 
        Math.floor((new Date(sub.active_until).getTime() - today.getTime()) / (24 * 60 * 60 * 1000)) : 
        0;
      
      const accountAge = Math.floor((today.getTime() - new Date(sub.created_date || today).getTime()) / (24 * 60 * 60 * 1000));
      const hasPaymentMethod = !!sub.stripe_customer_id;
      const isActive = sub.status === 'active';
      const monthsSinceSignup = Math.floor(accountAge / 30);

      // Risk Factor 1: Expiration Risk (30+ days until expiry = high risk)
      let expirationRisk = 0;
      if (daysActive <= 30 && daysActive >= 0) expirationRisk = 0.8;
      else if (daysActive < 0) expirationRisk = 1.0; // Expired
      else if (daysActive <= 60) expirationRisk = 0.5;
      else expirationRisk = 0.1;

      // Risk Factor 2: Account Maturity (newer accounts churn more)
      let maturityRisk = 0;
      if (monthsSinceSignup < 3) maturityRisk = 0.7; // Very new = high risk
      else if (monthsSinceSignup < 6) maturityRisk = 0.5;
      else if (monthsSinceSignup < 12) maturityRisk = 0.3;
      else maturityRisk = 0.1; // Mature accounts lower risk

      // Risk Factor 3: Payment Status Risk
      let paymentRisk = !hasPaymentMethod ? 0.6 : (sub.status === 'cancelled' ? 0.9 : 0.1);

      // Risk Factor 4: Tier Risk (starter tier churn more than enterprise)
      let tierRisk = 0;
      if (sub.subscription_tier === 'starter') tierRisk = 0.6;
      else if (sub.subscription_tier === 'professional') tierRisk = 0.3;
      else tierRisk = 0.1;

      // Risk Factor 5: Product Coverage Risk (fewer products = higher churn)
      const appsIncluded = sub.apps_included?.length || 0;
      let coverageRisk = appsIncluded === 0 ? 0.8 : appsIncluded === 1 ? 0.5 : 0.2;

      // Weighted churn risk score (0-100)
      const weights = {
        expiration: 0.35,
        maturity: 0.25,
        payment: 0.20,
        tier: 0.10,
        coverage: 0.10
      };

      const churnScore = Math.round(
        (expirationRisk * weights.expiration +
         maturityRisk * weights.maturity +
         paymentRisk * weights.payment +
         tierRisk * weights.tier +
         coverageRisk * weights.coverage) * 100
      );

      // Risk classification
      let riskLevel = 'Low';
      let riskColor = 'green';
      if (churnScore >= 70) {
        riskLevel = 'Critical';
        riskColor = 'red';
      } else if (churnScore >= 50) {
        riskLevel = 'High';
        riskColor = 'orange';
      } else if (churnScore >= 30) {
        riskLevel = 'Medium';
        riskColor = 'yellow';
      }

      // Intervention recommendations
      const interventions = [];
      if (daysActive <= 30 && daysActive >= 0) {
        interventions.push('Renewal reminder needed');
      }
      if (daysActive < 0) {
        interventions.push('Account expired - immediate recovery required');
      }
      if (!hasPaymentMethod) {
        interventions.push('Add payment method to reduce friction');
      }
      if (monthsSinceSignup < 3 && monthsSinceSignup > 0) {
        interventions.push('Onboarding support - critical period');
      }
      if (appsIncluded < 2) {
        interventions.push('Recommend feature expansion or bundling');
      }

      return {
        organization_id: sub.user_email,
        organization_name: sub.organization_name || sub.user_email,
        subscription_tier: sub.subscription_tier,
        apps_included: sub.apps_included?.length || 0,
        churn_score: churnScore,
        risk_level: riskLevel,
        risk_color: riskColor,
        days_until_expiry: daysActive,
        account_age_days: accountAge,
        months_since_signup: monthsSinceSignup,
        has_payment_method: hasPaymentMethod,
        is_active: isActive,
        risk_factors: {
          expiration_risk: Math.round(expirationRisk * 100),
          maturity_risk: Math.round(maturityRisk * 100),
          payment_risk: Math.round(paymentRisk * 100),
          tier_risk: Math.round(tierRisk * 100),
          coverage_risk: Math.round(coverageRisk * 100)
        },
        interventions,
        recommended_action: interventions[0] || 'Monitor and maintain'
      };
    });

    // Sort by churn score (highest risk first)
    const sortedByRisk = churnAnalysis.sort((a, b) => b.churn_score - a.churn_score);

    // Segment by risk level
    const criticalRisk = sortedByRisk.filter(a => a.churn_score >= 70);
    const highRisk = sortedByRisk.filter(a => a.churn_score >= 50 && a.churn_score < 70);
    const mediumRisk = sortedByRisk.filter(a => a.churn_score >= 30 && a.churn_score < 50);
    const lowRisk = sortedByRisk.filter(a => a.churn_score < 30);

    // Calculate portfolio metrics
    const avgChurnScore = Math.round(churnAnalysis.reduce((sum, a) => sum + a.churn_score, 0) / churnAnalysis.length);
    const churnTrend = Math.round((criticalRisk.length + highRisk.length) / churnAnalysis.length * 100);

    return Response.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      summary: {
        total_organizations: churnAnalysis.length,
        critical_risk: criticalRisk.length,
        high_risk: highRisk.length,
        medium_risk: mediumRisk.length,
        low_risk: lowRisk.length,
        avg_churn_score: avgChurnScore,
        at_risk_percentage: churnTrend
      },
      organizations: {
        critical: criticalRisk.slice(0, 10),
        high: highRisk.slice(0, 10),
        medium: mediumRisk.slice(0, 5),
        low: lowRisk.slice(0, 5)
      },
      top_interventions: [
        { intervention: 'Renewal reminder', count: churnAnalysis.filter(a => a.days_until_expiry <= 30 && a.days_until_expiry >= 0).length },
        { intervention: 'Add payment method', count: churnAnalysis.filter(a => !a.has_payment_method).length },
        { intervention: 'Onboarding support', count: churnAnalysis.filter(a => a.months_since_signup < 3 && a.months_since_signup > 0).length },
        { intervention: 'Feature expansion', count: churnAnalysis.filter(a => a.apps_included < 2).length }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=3600'
      }
    });
  } catch (error) {
    return Response.json(
      { error: error.message, status: 'analysis_failed' },
      { status: 500 }
    );
  }
});