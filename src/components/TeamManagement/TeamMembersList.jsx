import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Trash2, Edit2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  active: { icon: CheckCircle2, color: 'bg-green-100 text-green-800', label: 'Active' },
  inactive: { icon: AlertCircle, color: 'bg-gray-100 text-gray-800', label: 'Inactive' }
};

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  user: 'bg-slate-100 text-slate-800'
};

export default function TeamMembersList({ organizationEmail, onMemberUpdated }) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadMembers();
  }, [organizationEmail]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.TeamMember.filter({
        organization_email: organizationEmail
      }, '-invitation_sent_date');
      setMembers(data);
    } catch (err) {
      console.error('Failed to load members:', err);
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (id) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      await base44.entities.TeamMember.delete(id);
      setMembers(members.filter(m => m.id !== id));
      toast.success('Team member removed');
      onMemberUpdated?.();
    } catch (err) {
      console.error('Failed to remove member:', err);
      toast.error('Failed to remove team member');
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      const member = members.find(m => m.id === id);
      await base44.entities.TeamMember.update(id, { role: newRole });
      setMembers(members.map(m => m.id === id ? { ...m, role: newRole } : m));
      setEditingId(null);
      toast.success('Role updated');
      onMemberUpdated?.();
    } catch (err) {
      console.error('Failed to update role:', err);
      toast.error('Failed to update role');
    }
  };

  const filteredMembers = members.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          <div className="flex gap-2">
            {['all', 'active', 'pending', 'inactive'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading team members...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No {filter === 'all' ? 'team members' : filter + ' members'} found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Products</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const statusConfig_ = statusConfig[member.status];
                  const StatusIcon = statusConfig_.icon;

                  return (
                    <tr key={member.id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{member.member_name}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {member.member_email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === member.id ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            className="px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="user">User</option>
                          </select>
                        ) : (
                          <Badge className={roleColors[member.role]}>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4" />
                          <span>{statusConfig_.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {member.assigned_products?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {member.assigned_products.slice(0, 2).map((p, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {p.product_name}
                              </Badge>
                            ))}
                            {member.assigned_products.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{member.assigned_products.length - 2} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">All products</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {editingId !== member.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(member.id)}
                              className="w-8 h-8"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}