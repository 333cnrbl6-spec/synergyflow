# Team Management System - User Guide

## Overview

The Team Management interface allows organization admins to:
- **Invite** team members via email
- **Assign** specific roles (Admin, Manager, User)
- **Control** product access per team member
- **View** team composition across products
- **Manage** team member status and permissions

---

## Key Features

### 1. Team Member Invitation

**Who can invite?** Organization admins or managers

**How to invite:**
1. Click "Invite Team Member" button
2. Enter email and full name
3. Select role:
   - **Admin**: Full access, manage team, billing, all products
   - **Manager**: Manage team and product assignments
   - **User**: Access assigned products only
4. For Users, select specific products to grant access
5. Optional: Add internal notes about the member
6. Click "Send Invitation"

**What happens next:**
- Email invitation is sent to the new member
- Status shows "Pending" until they activate
- Once they accept, status changes to "Active"

### 2. Team Members List

**View all team members with:**
- Name and email
- Current role
- Status (Pending/Active/Inactive)
- Assigned products
- Last login info (for active members)

**Actions:**
- **Edit Role**: Click edit icon to change a member's role
- **Remove Member**: Click trash icon to remove from team
- **Filter**: Filter by status (All, Active, Pending, Inactive)

### 3. Product Team View

**See team composition for each subscribed product:**
- Lists all members assigned to a specific product
- Shows their role and invitation status
- Quick view of product-specific team size
- Perfect for understanding who has access to what

---

## Role Definitions

### Admin
- ✅ Access all products
- ✅ Invite and remove team members
- ✅ Assign roles and product access
- ✅ Manage organization settings
- ✅ View all team data
- ✅ Manage billing

### Manager
- ✅ Invite and manage team members
- ✅ Assign product access to Users
- ✅ View team list
- ⚠️ Cannot change other managers' or admins' roles
- ❌ Cannot manage billing
- ❌ Cannot access all organization settings

### User
- ✅ Access assigned products only
- ✅ View own profile
- ✅ Collaborate within assigned products
- ❌ Cannot invite team members
- ❌ Cannot manage access
- ❌ Cannot view other users' data

---

## Product Assignment

**How it works:**
- Admins assign products to each team member
- Users see only their assigned products in the app
- Managers can manage product assignments
- Users cannot see products they're not assigned to

**Example scenario:**
- Company has access to "Case Tracker Pro" and "Base44 AI"
- Invite paralegal → Assign only "Case Tracker Pro"
- Invite AI specialist → Assign only "Base44 AI"
- Each sees only their products in the dashboard

---

## Team Member Status

| Status | Meaning | Action Needed |
|--------|---------|---------------|
| **Pending** | Invitation sent, awaiting acceptance | Member must click email link to activate |
| **Active** | Member activated and logged in | No action needed |
| **Inactive** | Member hasn't logged in for 30+ days | Optional: Remove or re-engage |

---

## Common Tasks

### Promote a User to Manager
1. Find user in Team Members list
2. Click edit icon next to their name
3. Select "Manager" from role dropdown
4. User now has management permissions

### Add New Products to a Team Member
1. Find member in Team Members list
2. Currently assigned products shown in table
3. To expand: Create new invitation with additional products OR
4. Edit member and add products to their assignment

### Remove a Team Member
1. Click trash icon next to member's name
2. Confirm removal
3. Member loses access immediately
4. Can be re-invited anytime

### View Team by Product
1. Click "By Product" tab
2. See all members assigned to each product
3. Quick overview of product team sizes
4. Useful for onboarding and handoffs

---

## Best Practices

### Security
- ✅ Always invite members by verified email
- ✅ Remove inactive members regularly (30+ days)
- ✅ Assign minimum necessary permissions (Principle of Least Privilege)
- ✅ Use Manager role to delegate safely
- ❌ Never share activation links
- ❌ Don't give Admin access unless absolutely necessary

### Organization
- ✅ Add notes when inviting (e.g., "Legal team lead", "Handles contracts")
- ✅ Review team quarterly
- ✅ Keep product assignments updated
- ✅ Use meaningful naming conventions
- ❌ Don't leave pending invitations hanging > 14 days

### Onboarding
1. Invite team member (Admin or Manager)
2. Assign specific products and role
3. Member receives email with activation link
4. Member clicks link and sets up their password
5. Welcome email with quick start guide sent
6. Add to Slack/Teams team for support

---

## Troubleshooting

### "Member hasn't received invitation"
- Check spam/junk folder
- Verify email address is correct
- Re-send invitation (need to remove and re-add)
- Check if member already has account with that email

### "Can't assign products to Admin"
- Admins automatically have access to all products
- If you want to restrict, change role to Manager or User

### "Member still sees products after removal"
- May be cached in their browser
- Ask member to logout completely and clear cache
- Takes max 5 minutes to propagate

### "Getting 'User already exists' error"
- This user likely has an existing account
- Either use existing invite flow, or contact support

---

## API Reference (Developers)

### TeamMember Entity
```json
{
  "member_email": "user@company.com",
  "member_name": "John Doe",
  "role": "user|manager|admin",
  "status": "pending|active|inactive",
  "assigned_products": [
    {
      "product_id": "case-tracker",
      "product_name": "Case Tracker Pro",
      "product_role": "owner|editor|viewer"
    }
  ],
  "invitation_sent_date": "2026-04-26T10:00:00Z",
  "activation_date": "2026-04-26T12:30:00Z",
  "last_login": "2026-04-26T14:00:00Z"
}
```

### Endpoints
- `GET /team/members` - List all team members
- `POST /team/members` - Invite new member
- `PUT /team/members/{id}` - Update member (role, products)
- `DELETE /team/members/{id}` - Remove member

---

## FAQ

**Q: Can I invite someone who's already a user of another product?**
A: Yes! They'll be added to your team and can access their assigned products.

**Q: What happens if I remove a team member by mistake?**
A: They lose access immediately. You can re-invite them using the same email.

**Q: Can I change a member's email address?**
A: No. Remove and re-invite with correct email.

**Q: Does removing a member delete their data?**
A: No. Their data stays in products they created. You can transfer ownership if needed.

**Q: What's the member limit?**
A: No strict limit. Check your subscription plan for team size included.

**Q: Can members remove themselves?**
A: Yes. They can deactivate their own account (Settings → Account).

---

## Support

For issues with team management:
- 📧 Email: support@synergyflow.com
- 💬 Chat: In-app support (bottom right)
- 📖 Help Center: docs.synergyflow.com/team
- 🆘 Emergency: support@synergyflow.com (urgent)