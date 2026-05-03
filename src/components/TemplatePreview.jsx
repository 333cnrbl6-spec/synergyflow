import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { populateTemplate, formatTemplateForDisplay } from '@/lib/templateUtils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * TemplatePreview — preview template with sample data
 */
export default function TemplatePreview({ template, onBack }) {
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  // Fetch tenants and properties for preview
  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant?.list?.() || Promise.resolve([])
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property?.list?.() || Promise.resolve([])
  });

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  // Build preview data
  const previewData = useMemo(() => {
    const data = {
      tenant_name: selectedTenant?.full_name || '[Tenant Name]',
      tenant_email: selectedTenant?.email || '[tenant@example.com]',
      tenant_phone: selectedTenant?.phone || '[Phone]',
      property_name: selectedProperty?.name || '[Property Name]',
      property_address: selectedProperty?.address || '[Property Address]',
      property_postcode: selectedProperty?.postcode || '[Postcode]',
      property_type: selectedProperty?.property_type || '[Type]',
      tenancy_start_date: selectedTenant?.tenancy_start_date || '[Start Date]',
      rent_amount: selectedTenant?.rent_amount ? `£${selectedTenant.rent_amount.toLocaleString()}` : '[Rent Amount]',
      rent_due_day: selectedTenant?.rent_day ? `${selectedTenant.rent_day}th of each month` : '[Due Day]',
      landlord_name: '[Landlord Name]',
      landlord_email: '[landlord@example.com]',
      current_date: new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    return data;
  }, [selectedTenant, selectedProperty]);

  const previewContent = populateTemplate(template.content, previewData);
  const formattedContent = formatTemplateForDisplay(previewContent);

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById('preview-content');
      const canvas = await html2canvas(element);
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 277);
      pdf.save(`${template.name}.pdf`);
      toast.success('Downloaded as PDF');
    } catch (e) {
      toast.error('Failed to download PDF');
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(previewContent);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{template.name}</h1>
            <p className="text-slate-600">Preview with sample data</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Data Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sample Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Tenant</label>
                <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Property</label>
                <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {tenants.length === 0 && (
                <p className="text-xs text-slate-500">No tenants available. Create a tenant first.</p>
              )}
              {properties.length === 0 && (
                <p className="text-xs text-slate-500">No properties available. Create a property first.</p>
              )}
            </CardContent>
          </Card>

          {/* Used Placeholders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Used Placeholders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {template.available_placeholders?.map(placeholder => (
                  <Badge key={placeholder} variant="secondary" className="text-xs font-mono">
                    {`{{${placeholder}}}`}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Preview */}
        <div className="lg:col-span-3 space-y-4">
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleCopyToClipboard} variant="outline" className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              Copy Text
            </Button>
            <Button onClick={handleDownloadPDF} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          {/* Preview Card */}
          <Card className="bg-white border-2">
            <CardContent id="preview-content" className="p-8">
              <div className="prose prose-sm max-w-none text-slate-800">
                <h2 className="text-2xl font-bold mb-6">{template.name}</h2>
                <div className="whitespace-pre-wrap leading-relaxed font-sans text-sm">
                  {formattedContent}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}