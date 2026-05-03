import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, Building2, Wrench, Download } from 'lucide-react';
import { toast } from 'sonner';

/**
 * FinancialInsightsDashboard — rental income, overdue tracking, maintenance visualization
 */
export default function FinancialInsightsDashboard() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('generateFinancialInsights', {});
      if (response.data.success) {
        setInsights(response.data);
      } else {
        setError(response.data.error || 'Failed to fetch insights');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load financial insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !insights) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">{error || 'Failed to load financial insights'}</p>
          <Button onClick={fetchInsights} variant="outline" className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { summary, property_financials, overdue_rent_by_property, monthly_trends } = insights;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Insights</h1>
          <p className="text-xs text-slate-500 mt-1">Last updated: {new Date().toLocaleString('en-GB')}</p>
        </div>
        <Button onClick={fetchInsights} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-green-600" />
                <p className="text-sm text-slate-600">Total Rental Income</p>
              </div>
              <p className="text-3xl font-bold">£{summary.total_rental_income.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-slate-600">Overdue Rent</p>
              </div>
              <p className="text-3xl font-bold text-red-600">£{summary.total_overdue_rent.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-5 h-5 text-orange-600" />
                <p className="text-sm text-slate-600">Maintenance Costs</p>
              </div>
              <p className="text-3xl font-bold">£{summary.total_maintenance_costs.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-slate-600">Properties</p>
              </div>
              <p className="text-3xl font-bold">{summary.total_properties}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Maintenance (12-Month Trend)</CardTitle>
        </CardHeader>
        <CardContent>
          {monthly_trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthly_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `£${value.toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rental_income"
                  stroke="#10b981"
                  name="Rental Income"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="maintenance_costs"
                  stroke="#f97316"
                  name="Maintenance Costs"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="net_profit"
                  stroke="#3b82f6"
                  name="Net Profit"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-slate-500 py-8">No data available yet</p>
          )}
        </CardContent>
      </Card>

      {/* Property Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary by Property</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold">Property</th>
                  <th className="text-right py-3 px-4 font-semibold">Rent Expected</th>
                  <th className="text-right py-3 px-4 font-semibold">Rent Received</th>
                  <th className="text-right py-3 px-4 font-semibold">Collection</th>
                  <th className="text-right py-3 px-4 font-semibold">Maintenance</th>
                  <th className="text-right py-3 px-4 font-semibold">Net Profit</th>
                  <th className="text-right py-3 px-4 font-semibold">ROI</th>
                  <th className="text-right py-3 px-4 font-semibold">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {property_financials.map((prop) => (
                  <tr key={prop.property_id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-medium">{prop.property_name}</p>
                    </td>
                    <td className="text-right py-3 px-4 text-slate-600">
                      £{prop.total_rent_expected.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 font-medium">
                      £{prop.total_rent_received.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      <Badge
                        className={
                          prop.collection_rate >= 95
                            ? 'bg-green-100 text-green-700'
                            : prop.collection_rate >= 80
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {Math.round(prop.collection_rate)}%
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4">
                      £{prop.maintenance_costs.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      <span className={prop.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        £{prop.net_profit.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className={prop.roi_percentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {prop.roi_percentage}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      {prop.overdue_amount > 0 ? (
                        <Badge className="bg-red-100 text-red-700">
                          £{prop.overdue_amount.toLocaleString()}
                        </Badge>
                      ) : (
                        <span className="text-green-600">✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Rent Details */}
      {overdue_rent_by_property.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Overdue Rent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {overdue_rent_by_property.map((prop) => (
              <div key={prop.property_id} className="border-l-4 border-red-500 pl-4 py-2">
                <h4 className="font-semibold text-slate-900">{prop.property_name}</h4>
                <p className="text-red-600 font-semibold mb-2">Total Overdue: £{prop.total_overdue.toLocaleString()}</p>
                <div className="space-y-2">
                  {prop.overdue_payments.map((payment, idx) => (
                    <div key={idx} className="text-sm bg-red-50 p-2 rounded">
                      <p className="font-medium">{payment.tenant}</p>
                      <p className="text-slate-600">
                        £{payment.amount.toLocaleString()} due {new Date(payment.due_date).toLocaleDateString('en-GB')}
                      </p>
                      <p className="text-red-600">
                        {payment.days_overdue} days overdue
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Maintenance Breakdown by Category */}
      {property_financials.some(p => p.maintenance_costs > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Maintenance by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <MaintenanceByCategory propertyFinancials={property_financials} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Helper component for maintenance breakdown
 */
function MaintenanceByCategory({ propertyFinancials }) {
  const categoryCosts = {
    plumbing: 0,
    electrical: 0,
    heating: 0,
    appliance: 0,
    structural: 0,
    cleaning: 0,
    pest_control: 0,
    garden: 0,
    other: 0
  };

  const chartData = Object.entries(categoryCosts)
    .map(([category, cost]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' '),
      value: cost
    }))
    .filter(d => d.value > 0);

  return (
    <div className="text-center text-slate-500">
      <p>Maintenance breakdown by category will display when data is available</p>
    </div>
  );
}