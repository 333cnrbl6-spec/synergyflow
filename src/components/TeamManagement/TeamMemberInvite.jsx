import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Mail, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full access, manage team & billing' },
  { value: 'manager', label: 'Manager', description: 'Manage team and product access' },
  { value: 'user', label: 'User', description: 'Access assigned products only' }
];

export default function TeamMemberInvite({ products, onInviteSent }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'user',
    products: [],
    notes: ''
  });
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Invalid email address');
      return;
    }
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (formData.role === 'user' && formData.products.length === 0) {
      setError('Users must be assigned to at least one product');
      return;
    }

    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      if (!user) {
        throw new Error('User session lost');
      }

      // Create team member record
      const invitationToken = Math.random().toString(36).substring(2, 15);
      
      const teamMember = await base44.entities.TeamMember.create({
        organization_email: user.email,
        member_email: formData.email,
        member_name: formData.name,
        role: formData.role,
        assigned_products: formData.products.map(id => {
          const product = products.find(p => p.id === id);
          return {
            product_id: id,
            product_name: product?.name || 'Unknown',
            product_role: 'viewer'
          };
        }),
        status: 'pending',
        invitation_sent_date: new Date().toISOString(),
        invitation_token: invitationToken,
        notes: formData.notes
      });

      // Send invitation email
      await base44.integrations.Core.SendEmail({
        to: formData.email,
        subject: `You're invited to join ${user.full_name}'s SynergyFlow team`,
        body: `Hello ${formData.name},\n\n${user.full_name} has invited you to join their SynergyFlow team as a ${formData.role}.\n\nClick here to accept: [ACTIVATION_LINK]\n\nIf you didn't expect this, you can safely ignore this email.`
      });

      toast.success(`Invitation sent to ${formData.email}`);
      setFormData({ email: '', name: '', role: 'user', products: [], notes: '' });
      setShowForm(false);
      onInviteSent?.();
    } catch (err) {
      console.error('Invitation error:', err);
      const message = err.message || 'Failed to send invitation';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Invite Team Member
      </Button>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Invite Team Member
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} - {r.description}
                </option>
              ))}
            </select>
          </div>

          {formData.role === 'user' && (
            <div className="space-y-2">
              <Label>Assign Products</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-sm text-slate-500">No products available</p>
                ) : (
                  products.map((product) => (
                    <label key={product.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.products.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              products: [...formData.products, product.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              products: formData.products.filter(id => id !== product.id)
                            });
                          }
                        }}
                        disabled={isLoading}
                      />
                      <span className="text-sm">{product.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              placeholder="Any notes about this team member..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="2"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}