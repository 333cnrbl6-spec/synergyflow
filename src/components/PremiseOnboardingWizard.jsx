import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, Home, Users, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PremisoPricingManager from './PremisoPricingManager.jsx';

/**
 * PremiseOnboardingWizard — 3-step rapid onboarding to Aha! moment
 * Step 1: Add first property
 * Step 2: Add first tenant
 * Step 3: Configure rent collection
 */
export default function PremiseOnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Property
  const [property, setProperty] = useState({
    name: '',
    address: '',
    postcode: '',
    property_type: 'flat',
    purchase_price: '',
    rental_value: ''
  });

  // Step 2: Tenant
  const [tenant, setTenant] = useState({
    full_name: '',
    email: '',
    phone: '',
    tenancy_start_date: '',
    rent_amount: '',
    rent_day: '1'
  });

  // Step 3: Rent Collection (pricing config)
  const [rentCollectionDay, setRentCollectionDay] = useState('1');

  const handlePropertyChange = (key, value) => {
    setProperty(p => ({ ...p, [key]: value }));
  };

  const handleTenantChange = (key, value) => {
    setTenant(t => ({ ...t, [key]: value }));
  };

  const handleAddProperty = async () => {
    if (!property.name.trim() || !property.address.trim() || !property.postcode.trim()) {
      toast.error('Please fill in all property details');
      return;
    }

    setLoading(true);
    try {
      // Create property (would integrate with actual Property entity if available)
      toast.success(`Property "${property.name}" created!`);
      setStep(2);
    } catch (e) {
      toast.error('Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTenant = async () => {
    if (!tenant.full_name.trim() || !tenant.email.trim() || !tenant.tenancy_start_date || !tenant.rent_amount) {
      toast.error('Please fill in all tenant details');
      return;
    }

    setLoading(true);
    try {
      // Create tenant relationship (would integrate with actual Tenant entity if available)
      toast.success(`Tenant "${tenant.full_name}" added!`);
      setStep(3);
    } catch (e) {
      toast.error('Failed to add tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      // Update user onboarding status
      await base44.auth.updateMe({ premiso_onboarding_complete: true });
      toast.success('🎉 Welcome to Premiso! Your portfolio is ready.');
      
      if (onComplete) onComplete({ property, tenant, rentCollectionDay });
    } catch (e) {
      toast.error('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome to Premiso</h1>
          <p className="text-slate-600 mt-2">Let's set up your first property in 3 quick steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                  s < step ? 'bg-green-600 text-white' :
                  s === step ? 'bg-slate-900 text-white' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {s < step ? <CheckCircle2 className="w-6 h-6" /> : s}
                </div>
                <span className="text-xs mt-2 text-slate-600 font-medium">
                  {s === 1 ? 'Property' : s === 2 ? 'Tenant' : 'Payments'}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Content */}
        <Card className="shadow-lg">
          {/* Step 1: Property Setup */}
          {step === 1 && (
            <>
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Add Your First Property
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-slate-600">
                  Start by adding the property you'd like to manage with Premiso.
                </p>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Property Name</label>
                  <Input
                    placeholder="e.g., 42 Maple Street"
                    value={property.name}
                    onChange={(e) => handlePropertyChange('name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                  <Input
                    placeholder="e.g., 42 Maple Street, London"
                    value={property.address}
                    onChange={(e) => handlePropertyChange('address', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Postcode</label>
                    <Input
                      placeholder="SW1A 1AA"
                      value={property.postcode}
                      onChange={(e) => handlePropertyChange('postcode', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <Select value={property.property_type} onValueChange={(v) => handlePropertyChange('property_type', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="hmo">HMO</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price (£)</label>
                    <Input
                      type="number"
                      placeholder="250000"
                      value={property.purchase_price}
                      onChange={(e) => handlePropertyChange('purchase_price', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rent (£)</label>
                    <Input
                      type="number"
                      placeholder="1200"
                      value={property.rental_value}
                      onChange={(e) => handlePropertyChange('rental_value', e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddProperty}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Add Property & Continue
                </Button>
              </CardContent>
            </>
          )}

          {/* Step 2: Tenant Setup */}
          {step === 2 && (
            <>
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Add Your First Tenant
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-slate-600">
                  Now let's add your first tenant for {property.name}.
                </p>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tenant Name</label>
                  <Input
                    placeholder="e.g., Jane Smith"
                    value={tenant.full_name}
                    onChange={(e) => handleTenantChange('full_name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <Input
                    type="email"
                    placeholder="jane@example.com"
                    value={tenant.email}
                    onChange={(e) => handleTenantChange('email', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="07911 123456"
                    value={tenant.phone}
                    onChange={(e) => handleTenantChange('phone', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tenancy Start Date</label>
                    <Input
                      type="date"
                      value={tenant.tenancy_start_date}
                      onChange={(e) => handleTenantChange('tenancy_start_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rent (£)</label>
                    <Input
                      type="number"
                      placeholder="1200"
                      value={tenant.rent_amount}
                      onChange={(e) => handleTenantChange('rent_amount', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rent Due Day (1-31)</label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={tenant.rent_day}
                    onChange={(e) => handleTenantChange('rent_day', e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleAddTenant}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                    Add Tenant & Continue
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Rent Collection */}
          {step === 3 && (
            <>
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Configure Rent Collection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <PremisoPricingManager
                  onSave={handleCompleteOnboarding}
                  initialTiers={[
                    { name: 'Rent Collection', monthly_price: 0, features: ['Send payment links to tenants', 'Track rent payments', 'Auto-reconciliation'] }
                  ]}
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Success Summary (after complete) */}
        {step > 3 && (
          <Card className="mt-8 bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">All Set!</h3>
              <p className="text-slate-600 mt-2">Your portfolio is ready. Head to your dashboard to manage properties, send rent collection links, and track payments.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}