import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export default function StrategyLaunchPrep({ products }) {
  const launchItems = products.map(p => ({
    product: p.name,
    pricing: !!p.pricing_tiers?.length,
    positioning: !!p.description,
    features: (p.features?.length || 0) > 0,
    marketing: !!p.icon_url,
    readiness: (!!p.pricing_tiers?.length + !!p.description + ((p.features?.length || 0) > 0) + !!p.icon_url) / 4
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          Launch Readiness Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {launchItems.map((item) => (
            <div key={item.product} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900">{item.product}</h3>
                <Badge 
                  className={`text-xs ${
                    item.readiness === 1 ? 'bg-green-100 text-green-700' :
                    item.readiness >= 0.75 ? 'bg-blue-100 text-blue-700' :
                    item.readiness >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-slate-100 text-slate-700'
                  }`}
                >
                  {Math.round(item.readiness * 100)}% Ready
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {item.pricing ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                  <span className={item.pricing ? 'text-slate-900 font-medium' : 'text-slate-600'}>Pricing Model</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.positioning ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                  <span className={item.positioning ? 'text-slate-900 font-medium' : 'text-slate-600'}>Market Positioning</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.features ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                  <span className={item.features ? 'text-slate-900 font-medium' : 'text-slate-600'}>Core Features Defined</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.marketing ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                  <span className={item.marketing ? 'text-slate-900 font-medium' : 'text-slate-600'}>Marketing Assets</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}