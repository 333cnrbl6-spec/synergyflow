import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import WorkOrderCard from '@/components/contractor/WorkOrderCard';
import WorkOrderDetail from '@/components/contractor/WorkOrderDetail';

export default function ContractorPortal() {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        toast.error('Failed to load user information');
      }
    };
    fetchUser();
  }, []);

  // Fetch work orders assigned to this contractor
  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ['workOrders', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const orders = await base44.entities.WorkOrder.filter({
        contractor_email: user.email
      });
      return orders;
    },
    enabled: !!user?.email
  });

  const statusCounts = {
    issued: workOrders.filter(wo => wo.status === 'issued').length,
    in_progress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
    pending: workOrders.filter(wo => ['issued', 'assigned'].includes(wo.status)).length
  };

  const getWorkOrdersByStatus = (status) => {
    if (status === 'pending') {
      return workOrders.filter(wo => ['issued', 'assigned'].includes(wo.status));
    }
    return workOrders.filter(wo => wo.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Contractor Portal</h1>
          <p className="text-slate-600 mt-2">Manage your assigned repair jobs</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-600 text-sm font-medium">Pending Review</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{statusCounts.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{statusCounts.in_progress}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{statusCounts.completed}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-600 text-sm font-medium">Total Jobs</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{workOrders.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending Review ({statusCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({statusCounts.in_progress})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({statusCounts.completed})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {getWorkOrdersByStatus('pending').length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-600">
                  No pending work orders
                </CardContent>
              </Card>
            ) : (
              getWorkOrdersByStatus('pending').map(workOrder => (
                <WorkOrderCard
                  key={workOrder.id}
                  workOrder={workOrder}
                  onSelect={setSelectedWorkOrder}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4">
            {getWorkOrdersByStatus('in_progress').length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-600">
                  No work in progress
                </CardContent>
              </Card>
            ) : (
              getWorkOrdersByStatus('in_progress').map(workOrder => (
                <WorkOrderCard
                  key={workOrder.id}
                  workOrder={workOrder}
                  onSelect={setSelectedWorkOrder}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {getWorkOrdersByStatus('completed').length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-600">
                  No completed work orders yet
                </CardContent>
              </Card>
            ) : (
              getWorkOrdersByStatus('completed').map(workOrder => (
                <WorkOrderCard
                  key={workOrder.id}
                  workOrder={workOrder}
                  onSelect={setSelectedWorkOrder}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Modal */}
        {selectedWorkOrder && (
          <WorkOrderDetail
            workOrder={selectedWorkOrder}
            onClose={() => setSelectedWorkOrder(null)}
            onUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['workOrders'] });
              setSelectedWorkOrder(null);
            }}
          />
        )}
      </div>
    </div>
  );
}