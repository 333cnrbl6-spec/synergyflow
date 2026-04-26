import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Package } from 'lucide-react';

export default function ProductTeamView({ organizationEmail, products }) {
  const [teamByProduct, setTeamByProduct] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProductTeams();
  }, [organizationEmail, products]);

  const loadProductTeams = async () => {
    setIsLoading(true);
    try {
      const members = await base44.entities.TeamMember.filter({
        organization_email: organizationEmail
      });

      const grouped = {};
      products.forEach((product) => {
        grouped[product.id] = {
          product: product,
          members: members.filter(m =>
            m.assigned_products?.some(p => p.product_id === product.id)
          )
        };
      });

      setTeamByProduct(grouped);
    } catch (err) {
      console.error('Failed to load product teams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          Loading team assignments...
        </CardContent>
      </Card>
    );
  }

  const productsWithMembers = Object.values(teamByProduct).filter(item => item.members.length > 0);

  if (productsWithMembers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          No team members assigned to products yet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {productsWithMembers.map(({ product, members }) => (
        <Card key={product.id} className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base">{product.name}</CardTitle>
              </div>
              <Badge className="bg-blue-600 text-white">{members.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="text-sm p-2 bg-white rounded border border-blue-100">
                  <div className="font-medium">{member.member_name}</div>
                  <div className="text-xs text-slate-500">{member.member_email}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {member.role}
                    </Badge>
                    {member.status === 'pending' && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}