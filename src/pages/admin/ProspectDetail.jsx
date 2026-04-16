import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Mail, Phone } from 'lucide-react';

export default function ProspectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prospect, setProspect] = useState(null);
  const [demos, setDemos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProspect = async () => {
      try {
        const data = await base44.entities.Prospect.filter({ id });
        if (data.length > 0) {
          setProspect(data[0]);
          setFormData(data[0]);
          
          // Fetch related demos
          const demoData = await base44.entities.Demo.filter({ prospect_id: id });
          setDemos(demoData);
        }
      } catch (error) {
        console.error('Error fetching prospect:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProspect();
  }, [id]);

  const handleSave = async () => {
    try {
      await base44.entities.Prospect.update(id, formData);
      setProspect(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving prospect:', error);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!prospect) {
    return <div className="p-8">Prospect not found</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/crm')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{prospect.company_name}</h1>
          <p className="text-muted-foreground">{prospect.contact_name}</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Company Name</label>
                    <Input
                      value={formData.company_name || ''}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact Name</label>
                    <Input
                      value={formData.contact_name || ''}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${prospect.email}`} className="text-blue-600 hover:underline">
                      {prospect.email}
                    </a>
                  </div>
                  {prospect.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{prospect.phone}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <Badge className="mt-1">
                  {prospect.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Deal Value</label>
                <div className="text-2xl font-bold mt-1">
                  {prospect.deal_value ? `$${prospect.deal_value.toLocaleString()}` : 'Not set'}
                </div>
              </div>
              {prospect.expected_close_date && (
                <div>
                  <label className="text-sm text-muted-foreground">Expected Close Date</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(prospect.expected_close_date).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interested Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {prospect.interested_products?.map((product) => (
                  <Badge key={product}>{product}</Badge>
                )) || <p className="text-muted-foreground">No products selected</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add internal notes..."
                  rows={6}
                />
              ) : (
                <p className="text-muted-foreground">{prospect.notes || 'No notes'}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sales Rep</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{prospect.assigned_sales_agent || 'Not assigned'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scheduled Demos ({demos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {demos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No demos scheduled</p>
              ) : (
                <div className="space-y-2">
                  {demos.map((demo) => (
                    <div key={demo.id} className="p-2 bg-secondary/50 rounded-lg text-sm">
                      <div className="font-medium">{demo.product_id}</div>
                      <div className="text-muted-foreground">
                        {new Date(demo.scheduled_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full mt-4">
                Schedule Demo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}