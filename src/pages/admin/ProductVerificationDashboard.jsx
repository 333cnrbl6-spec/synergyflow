import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductVerificationDashboard() {
  const queryClient = useQueryClient();
  const [expandedVerification, setExpandedVerification] = useState(null);
  const [newTestName, setNewTestName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  const { data: verifications = [], isLoading } = useQuery({
    queryKey: ['productVerifications'],
    queryFn: () => base44.entities.ProductVerification.list(),
    refetchInterval: 10000
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ['boardProposals'],
    queryFn: async () => {
      const res = await base44.functions.invoke('boardCommunications', { action: 'get_proposals' });
      return res.data.proposals || [];
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const updateVerificationMutation = useMutation({
    mutationFn: (data) => base44.entities.ProductVerification.update(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVerifications'] });
      toast.success('Verification updated');
    }
  });

  const createVerificationMutation = useMutation({
    mutationFn: (data) => base44.entities.ProductVerification.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVerifications'] });
      toast.success('Verification created');
    }
  });

  const approvedProposals = proposals.filter(p => p.status === 'approved');

  const handleAddTestResult = (verificationId, categoryName, testName) => {
    const verification = verifications.find(v => v.id === verificationId);
    if (!verification) return;

    const updatedCategories = verification.test_categories.map(cat => {
      if (cat.category === categoryName) {
        return {
          ...cat,
          items: [
            ...(cat.items || []),
            { test_name: testName, status: 'pending', notes: '' }
          ]
        };
      }
      return cat;
    });

    updateVerificationMutation.mutate({
      id: verificationId,
      updates: { test_categories: updatedCategories }
    });
  };

  const handleUpdateTestStatus = (verificationId, categoryName, testIndex, status) => {
    const verification = verifications.find(v => v.id === verificationId);
    if (!verification) return;

    const updatedCategories = verification.test_categories.map(cat => {
      if (cat.category === categoryName) {
        const updatedItems = [...(cat.items || [])];
        updatedItems[testIndex] = { ...updatedItems[testIndex], status };
        return { ...cat, items: updatedItems };
      }
      return cat;
    });

    const totalTests = updatedCategories.reduce((sum, c) => sum + (c.items?.length || 0), 0);
    const passedTests = updatedCategories.reduce(
      (sum, c) => sum + (c.items?.filter(i => i.status === 'passed').length || 0), 0
    );

    updateVerificationMutation.mutate({
      id: verificationId,
      updates: {
        test_categories: updatedCategories,
        coverage_percentage: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
      }
    });
  };

  const handleAddCategory = (verificationId, categoryName) => {
    const verification = verifications.find(v => v.id === verificationId);
    if (!verification || !categoryName.trim()) return;

    const updatedCategories = [
      ...(verification.test_categories || []),
      { category: categoryName, items: [] }
    ];

    updateVerificationMutation.mutate({
      id: verificationId,
      updates: { test_categories: updatedCategories }
    });
    setNewCategoryName('');
    setShowNewCategory(false);
  };

  const handleCreateVerification = (product, proposal) => {
    createVerificationMutation.mutate({
      product_id: product.id,
      product_name: product.name,
      board_member_app: product.slug,
      related_proposal_id: proposal?.id || null,
      verification_phase: 'planning',
      test_categories: [
        { category: 'Core Functionality', items: [] },
        { category: 'User Flows', items: [] },
        { category: 'Edge Cases', items: [] },
        { category: 'Performance', items: [] }
      ],
      coverage_percentage: 0
    });
  };

  const statusColors = {
    pending: 'bg-slate-100 text-slate-700',
    passed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    planning: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    issues_found: 'bg-orange-100 text-orange-700',
    resolved: 'bg-green-100 text-green-700'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900">Product Verification</h1>
          <p className="text-slate-600 mt-2">Exhaustive testing against board-approved changes</p>
        </div>

        {/* Active Verifications */}
        {verifications.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Active Verifications</h2>
            {verifications.map((verification) => (
              <Card key={verification.id} className="border-l-4 border-blue-500">
                <div
                  className="cursor-pointer p-6 flex items-center justify-between hover:bg-slate-50 transition"
                  onClick={() => setExpandedVerification(
                    expandedVerification === verification.id ? null : verification.id
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{verification.product_name}</h3>
                      <Badge className={statusColors[verification.verification_phase]}>
                        {verification.verification_phase}
                      </Badge>
                      <Badge variant="outline">{verification.coverage_percentage || 0}% Coverage</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">By: {verification.board_member_app}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <div className="text-2xl font-bold text-slate-900">
                        {verification.test_categories?.reduce((sum, c) => sum + (c.items?.filter(i => i.status === 'passed').length || 0), 0) || 0}/
                        {verification.test_categories?.reduce((sum, c) => sum + (c.items?.length || 0), 0) || 0}
                      </div>
                      <p className="text-xs text-slate-500">Tests Passed</p>
                    </div>
                    {expandedVerification === verification.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedVerification === verification.id && (
                  <CardContent className="border-t pt-6 space-y-6">
                    {/* Test Categories */}
                    {(verification.test_categories || []).map((category) => (
                      <div key={category.category} className="space-y-3">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                          {category.category}
                          <Badge variant="outline">
                            {category.items?.filter(i => i.status === 'passed').length || 0}/{category.items?.length || 0}
                          </Badge>
                        </h4>

                        <div className="space-y-2 ml-4">
                          {(category.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateTestStatus(verification.id, category.category, idx, e.target.value)}
                                className={`px-3 py-1 rounded text-sm font-medium cursor-pointer border-none ${statusColors[item.status]}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="passed">Passed ✓</option>
                                <option value="failed">Failed ✗</option>
                              </select>
                              <span className="text-slate-700 flex-1">{item.test_name}</span>
                              {item.notes && (
                                <span className="text-xs text-slate-500 italic">{item.notes}</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add Test */}
                        <div className="ml-4 flex gap-2">
                          <input
                            type="text"
                            placeholder="Add test..."
                            className="flex-1 px-3 py-2 text-sm border rounded-md"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                handleAddTestResult(verification.id, category.category, e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Add Category */}
                    {showNewCategory ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="New test category..."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border rounded-md"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddCategory(verification.id, newCategoryName)}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowNewCategory(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowNewCategory(true)}
                        className="gap-2 w-full"
                      >
                        <Plus className="w-4 h-4" />
                        Add Test Category
                      </Button>
                    )}

                    {/* Issues */}
                    {verification.issues_found && verification.issues_found.length > 0 && (
                      <div className="border-t pt-4 space-y-2">
                        <h5 className="font-semibold text-red-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Issues Found ({verification.issues_found.length})
                        </h5>
                        {verification.issues_found.map((issue, idx) => (
                          <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`bg-${issue.severity === 'critical' ? 'red' : issue.severity === 'high' ? 'orange' : 'yellow'}-600`}>
                                {issue.severity}
                              </Badge>
                              <span className="text-red-900 font-medium">{issue.description}</span>
                            </div>
                            <p className="text-xs text-red-800">Status: {issue.status}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Create New Verification */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Create New Verification</h2>
          <div className="space-y-3">
            {approvedProposals.length > 0 ? (
              approvedProposals.map((proposal) => {
                const relatedProducts = products.filter(p =>
                  proposal.products_involved?.includes(p.slug)
                );

                return (
                  <Card key={proposal.id} className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base">{proposal.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-600">{proposal.summary}</p>
                      <div className="space-y-2">
                        {relatedProducts.length > 0 ? (
                          relatedProducts.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div>
                                <p className="font-medium text-slate-900">{product.name}</p>
                                <p className="text-xs text-slate-500">{product.target_market}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleCreateVerification(product, proposal)}
                              >
                                Start Verification
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No products specified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="text-center py-12">
                <p className="text-slate-500">No approved board proposals yet. Create one to initiate product verification.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}