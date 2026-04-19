import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if onboarding email has already been sent for this user
    const existingProgress = await base44.entities.OnboardingProgress.filter({
      user_email: user.email
    });

    if (existingProgress.length > 0) {
      // Already created, skip email
      return Response.json({
        status: 'skipped',
        message: 'Onboarding already initiated for this user'
      });
    }

    // Create onboarding progress record
    await base44.entities.OnboardingProgress.create({
      user_email: user.email,
      organization_name: user.full_name || 'New Organization',
      current_step: 0,
      completed_steps: [],
      onboarding_started_date: new Date().toISOString()
    });

    // Send welcome email
    const emailResponse = await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: '🚀 Welcome to SynergyFlow - Your Getting Started Guide',
      body: `
Hi ${user.full_name || 'there'},

Welcome to SynergyFlow! 🎉

We're thrilled to have you on board. To help you get the most out of our platform, we've created a personalized Getting Started guide.

**Your First 7 Steps:**

1. 👤 Complete Your Profile - Set up your organization
2. 👥 Invite Your Team - Add colleagues and assign roles
3. 🎯 Choose Your Products - Activate the solutions you need
4. 🔗 Connect Integrations - Link external services
5. 📥 Import Your Data - Migrate from your previous system
6. ⚙️ Customize Your Dashboard - Personalize your workspace
7. 🎬 Watch Training Video - Master core features in 5 minutes

Each step takes just 5-10 minutes, and you can complete them at your own pace.

**Get Started Now:**
https://synergyflow.io/admin?openOnboarding=true

**What You'll Get:**
✓ Step-by-step guidance with tooltips
✓ Real-time progress tracking
✓ Interactive setup wizards
✓ Personalized recommendations
✓ 24/7 email support

**Need Help?**
- View our knowledge base: https://help.synergyflow.io
- Watch quick tutorials: https://videos.synergyflow.io
- Email support: support@synergyflow.io

Let's build something amazing together!

Best regards,
The SynergyFlow Team

P.S. Did you know? Users who complete onboarding in the first week see 3x better adoption rates. You've got this! 💪`
    });

    return Response.json({
      status: 'success',
      message: 'Onboarding email sent successfully',
      email: user.email
    });
  } catch (error) {
    console.error('Error in sendOnboardingEmail:', error);
    return Response.json(
      { error: error.message, status: 'failed' },
      { status: 500 }
    );
  }
});