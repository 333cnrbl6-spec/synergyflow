import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function ValuationTrendsDashboard() {
  const [snapshots, setSnapshots] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [snapshotsRes, productsRes] = await Promise.all([
          base44.entities.ValuationSnapshot.list('-snapshot_date'),
          base44.entities.Product.list()
        ]);

        setSnapshots(snapshotsRes);
        setProducts(productsRes);
        
        if (productsRes.length > 0) {
          setSelectedProduct(productsRes[0].id);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load valuation data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // Aggregate data by snapshot date
  const portfolioTrendData = {};
  snapshots.forEach(s => {
    if (!portfolioTrendData[s.snapshot_date]) {
      portfolioTrendData[s.snapshot_date] = {
        date: s.snapshot_date,
        portfolioValue: 0,
        portfolioMRR: 0,
        products: {}
      };
    }
    portfolioTrendData[s.snapshot_date].portfolioValue += s.sell_now_value;
    portfolioTrendData[s.snapshot_date].portfolioMRR += s.monthly_mrr;
    portfolioTrendData[s.snapshot_date].products[s.product_name] = {
      value: s.sell_now_value,
      mrr: s.monthly_mrr
    };
  });

  const trendLineData = Object.values(portfolioTrendData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(d => ({
      date: d.date,
      value: Math.round(d.portfolioValue * 10) / 10,
      mrr: Math.round(d.portfolioMRR)
    }));

  // Get selected product trend
  const selectedProductTrend = snapshots
    .filter(s => s.product_id === selectedProduct)
    .sort((a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date))
    .map(s => ({
      date: s.snapshot_date,
      value: s.sell_now_value,
      mrr: s.monthly_mrr,
      multiple: s.valuation_multiple
    }));

  // Latest snapshot
  const latestSnapshot = snapshots[0];
  const latestByProduct = {};
  snapshots.forEach(s => {
    if (!latestByProduct[s.product_name] || new Date(s.snapshot_date) > new Date(latestByProduct[s.product_name].snapshot_date)) {
      latestByProduct[s.product_name] = s;
    }
  });

  const portfolioMRR = Object.values(latestByProduct).reduce((sum, s) => sum + (s.monthly_mrr || 0), 0);
  const portfolioValue = Object.values(latestByProduct).reduce((sum, s) => sum + (s.sell_now_value || 0), 0);

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              <CardTitle>Portfolio Valuation Summary</CardTitle>
            </div>
            <Badge className="bg-green-600">Live</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <p className="text-sm text-green-600 font-medium">Portfolio Value</p>
              <p className="text-3xl font-bold text-green-700 mt-1">£{portfolioValue.toFixed(1)}M</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <p className="text-sm text-green-600 font-medium">Monthly MRR</p>
              <p className="text-3xl font-bold text-green-700 mt-1">£{Math.round(portfolioMRR)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <p className="text-sm text-green-600 font-medium">Annual ARR</p>
              <p className="text-3xl font-bold text-green-700 mt-1">£{Math.round(portfolioMRR * 12)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Valuation Trend */}
      {trendLineData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Portfolio Valuation Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendLineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `£${value}M`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#22c55e" 
                  name="Portfolio Value (£M)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Product Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Valuations by Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(latestByProduct)
              .sort((a, b) => b[1].sell_now_value - a[1].sell_now_value)
              .map(([productName, snapshot]) => (
                <div key={productName} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                  <div>
                    <p className="font-semibold text-slate-900">{productName}</p>
                    <p className="text-xs text-slate-600">MRR: £{snapshot.monthly_mrr} | Multiple: {snapshot.valuation_multiple}x</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">£{snapshot.sell_now_value.toFixed(2)}M</p>
                    <p className="text-xs text-slate-500">Sell Now Value</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Trend Detail */}
      {selectedProduct && selectedProductTrend.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {products.find(p => p.id === selectedProduct)?.name || 'Product'} Valuation Trend
              </CardTitle>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="text-sm px-2 py-1 border rounded bg-white"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={selectedProductTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Value (£M)" />
                <Bar yAxisId="right" dataKey="mrr" fill="#f59e0b" name="MRR (£)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Data Info */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Auto-calculated valuations:</span> Portfolio valuations are computed on every passed proposal based on active subscriptions and SaaS multiples. Historical snapshots enable trend analysis and valuation growth tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}