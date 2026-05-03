import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Clock, Shield, Download, FileText, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { DEPOSIT_SCHEMES, COMPLIANCE_STATUS, calculateDeadline, daysUntilDeadline, getComplianceAlert, generatePrescribedInformation } from '@/lib/depositUtils';

/**
 * DepositProtectionManager — manage all deposit compliance
 */
export default function DepositProtectionManager() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewDepositForm, setShowNewDepositForm] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const queryClient = useQueryClient();

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ['deposits'],
    queryFn: () => base44.entities.DepositProtection.list()
  });

  const updateDepositMutation = useMutation({
    mutationFn: (data) => base44.entities.DepositProtection.update(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      toast.success('Deposit updated');
      setSelectedDeposit(null);
    }
  });

  const filteredDeposits = deposits.filter(d => {
    const matchesStatus = filterStatus === 'all' || d.compliance_status === filterStatus;
    const matchesSearch = d.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.property_address.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  // Summary stats
  const stats = {
    total: deposits.length,
    compliant: deposits.filter(d => d.compliance_status === 'compliant').length,
    at_risk: deposits.filter(d => d.compliance_status === 'at_risk').length,
    overdue: deposits.filter(d => d.compliance_status === 'overdue').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Deposit Protection</h1>
        <Button
          onClick={() => setShowNewDepositForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Record New Deposit
        </Button>
      </div>

      {/* Compliance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Total Deposits</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Compliant</p>
              <p className="text-3xl font-bold">{stats.compliant}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">At Risk</p>
              <p className="text-3xl font-bold">{stats.at_risk}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Overdue</p>
              <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search by tenant or property..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-48"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(COMPLIANCE_STATUS).map(([key, info]) => (
              <SelectItem key={key} value={key}>{info.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Deposits List */}
      {filteredDeposits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No deposits found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDeposits.map(deposit => {
            const statusInfo = COMPLIANCE_STATUS[deposit.compliance_status];
            const daysUntil = daysUntilDeadline(deposit.protection_deadline);
            const alert = getComplianceAlert(deposit);

            return (
              <Card key={deposit.id} className="hover:shadow-md transition">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <Shield className="w-6 h-6 text-slate-400 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold">{deposit.tenant_name}</h3>
                          <p className="text-sm text-slate-600">{deposit.property_address}</p>
                          <p className="text-sm text-slate-600">Deposit: £{deposit.deposit_amount}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 my-3">
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        {deposit.protection_scheme && (
                          <Badge variant="outline">{DEPOSIT_SCHEMES[deposit.protection_scheme].name}</Badge>
                        )}
                        {!deposit.protection_date && (
                          <Badge className="bg-red-100 text-red-700">Not Protected</Badge>
                        )}
                        {!deposit.prescribed_info_sent && (
                          <Badge className="bg-orange-100 text-orange-700">No Prescribed Info</Badge>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <div>📅 Received: {new Date(deposit.deposit_received_date).toLocaleDateString('en-GB')}</div>
                        <div>⏰ Deadline: {new Date(deposit.protection_deadline).toLocaleDateString('en-GB')} ({daysUntil > 0 ? daysUntil + ' days' : 'OVERDUE'})</div>
                        {deposit.protection_date && (
                          <div>✅ Protected: {new Date(deposit.protection_date).toLocaleDateString('en-GB')}</div>
                        )}
                        {deposit.prescribed_info_sent && (
                          <div>✅ Info Sent: {new Date(deposit.prescribed_info_sent_date).toLocaleDateString('en-GB')}</div>
                        )}
                      </div>

                      {alert && (
                        <div className={`mt-3 p-2 rounded text-xs ${alert.type === 'CRITICAL' ? 'bg-red-50 text-red-700' : alert.type === 'URGENT' ? 'bg-orange-50 text-orange-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {alert.message}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDeposit(deposit)}
                      >
                        View Details
                      </Button>
                      {deposit.protection_date && !deposit.prescribed_info_sent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendPrescribedInfo(deposit)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Send Info
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Deposit Form */}
      {showNewDepositForm && (
        <NewDepositForm
          onSubmit={async (data) => {
            const deadline = calculateDeadline(data.deposit_received_date);
            await base44.entities.DepositProtection.create({
              ...data,
              protection_deadline: deadline,
              prescribed_info_deadline: deadline,
              compliance_status: 'at_risk'
            });
            queryClient.invalidateQueries({ queryKey: ['deposits'] });
            setShowNewDepositForm(false);
            toast.success('Deposit recorded');
          }}
          onCancel={() => setShowNewDepositForm(false)}
        />
      )}

      {/* Deposit Details Modal */}
      {selectedDeposit && (
        <DepositDetailsModal
          deposit={selectedDeposit}
          onClose={() => setSelectedDeposit(null)}
          onUpdate={updateDepositMutation.mutate}
        />
      )}
    </div>
  );
}

/**
 * NewDepositForm component
 */
function NewDepositForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    property_id: '',
    property_name: '',
    property_address: '',
    tenant_id: '',
    tenant_name: '',
    tenant_email: '',
    tenancy_start_date: '',
    deposit_amount: '',
    deposit_received_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tenant_name || !formData.deposit_amount || !formData.property_address) {
      toast.error('Please fill in required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Record New Deposit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Property Address"
                value={formData.property_address}
                onChange={(e) => setFormData({...formData, property_address: e.target.value})}
                placeholder="Full property address"
                required
              />
              <Input
                label="Property Name"
                value={formData.property_name}
                onChange={(e) => setFormData({...formData, property_name: e.target.value})}
                placeholder="Optional reference"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tenant Name"
                value={formData.tenant_name}
                onChange={(e) => setFormData({...formData, tenant_name: e.target.value})}
                placeholder="Full name"
                required
              />
              <Input
                label="Tenant Email"
                type="email"
                value={formData.tenant_email}
                onChange={(e) => setFormData({...formData, tenant_email: e.target.value})}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Deposit Amount (£)"
                type="number"
                step="0.01"
                value={formData.deposit_amount}
                onChange={(e) => setFormData({...formData, deposit_amount: parseFloat(e.target.value)})}
                placeholder="0.00"
                required
              />
              <Input
                label="Deposit Received Date"
                type="date"
                value={formData.deposit_received_date}
                onChange={(e) => setFormData({...formData, deposit_received_date: e.target.value})}
                required
              />
            </div>

            <Input
              label="Tenancy Start Date"
              type="date"
              value={formData.tenancy_start_date}
              onChange={(e) => setFormData({...formData, tenancy_start_date: e.target.value})}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Record Deposit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * DepositDetailsModal component
 */
function DepositDetailsModal({ deposit, onClose, onUpdate }) {
  const [scheme, setScheme] = useState(deposit.protection_scheme || 'dps');
  const [protectionDate, setProtectionDate] = useState(deposit.protection_date || '');
  const [protectionRef, setProtectionRef] = useState(deposit.protection_reference || '');

  const handleSaveProtection = async () => {
    if (!scheme || !protectionDate || !protectionRef) {
      toast.error('Please fill in all protection details');
      return;
    }

    onUpdate({
      id: deposit.id,
      updates: {
        protection_scheme: scheme,
        protection_date: protectionDate,
        protection_reference: protectionRef,
        protection_scheme_contact: scheme
      }
    });
  };

  const handleSendPrescribedInfo = async () => {
    const prescribedInfo = generatePrescribedInformation(deposit, scheme);
    
    try {
      await base44.integrations.Core.SendEmail({
        to: deposit.tenant_email,
        subject: `Prescribed Information - Your Tenancy Deposit at ${deposit.property_address}`,
        body: prescribedInfo.replace(/\n/g, '<br />')
      });

      onUpdate({
        id: deposit.id,
        updates: {
          prescribed_info_sent: true,
          prescribed_info_sent_date: new Date().toISOString()
        }
      });

      toast.success('Prescribed information sent to tenant');
    } catch (error) {
      toast.error('Failed to send prescribed information');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
        <CardHeader>
          <CardTitle>Deposit Details - {deposit.tenant_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Property</p>
              <p className="font-semibold">{deposit.property_address}</p>
            </div>
            <div>
              <p className="text-slate-600">Deposit Amount</p>
              <p className="font-semibold">£{deposit.deposit_amount}</p>
            </div>
            <div>
              <p className="text-slate-600">Received</p>
              <p className="font-semibold">{new Date(deposit.deposit_received_date).toLocaleDateString('en-GB')}</p>
            </div>
            <div>
              <p className="text-slate-600">Deadline</p>
              <p className="font-semibold">{new Date(deposit.protection_deadline).toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {!deposit.protection_date && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-semibold">Register Protection</h4>
              <Select value={scheme} onValueChange={setScheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEPOSIT_SCHEMES).map(([key, info]) => (
                    <SelectItem key={key} value={key}>{info.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                label="Protection Reference"
                value={protectionRef}
                onChange={(e) => setProtectionRef(e.target.value)}
                placeholder="Reference from scheme"
              />
              <Input
                label="Protection Date"
                type="date"
                value={protectionDate}
                onChange={(e) => setProtectionDate(e.target.value)}
              />
              <Button onClick={handleSaveProtection} className="w-full bg-green-600 hover:bg-green-700">
                Save Protection Details
              </Button>
            </div>
          )}

          {deposit.protection_date && !deposit.prescribed_info_sent && (
            <div className="border-t pt-4">
              <Button onClick={handleSendPrescribedInfo} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                <Mail className="w-4 h-4" />
                Send Prescribed Information to Tenant
              </Button>
            </div>
          )}

          <div className="border-t pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function handleSendPrescribedInfo(deposit) {
  const prescribedInfo = generatePrescribedInformation(deposit, deposit.protection_scheme);
  await base44.integrations.Core.SendEmail({
    to: deposit.tenant_email,
    subject: `Prescribed Information - Your Tenancy Deposit`,
    body: prescribedInfo
  });
  toast.success('Prescribed information sent');
}