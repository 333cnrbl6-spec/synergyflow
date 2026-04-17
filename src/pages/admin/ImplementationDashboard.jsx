import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const COLUMNS = {
  'in_progress': { title: 'In Progress', color: 'bg-blue-50', borderColor: 'border-blue-200' },
  'completed': { title: 'Completed', color: 'bg-green-50', borderColor: 'border-green-200' }
};

export default function ImplementationDashboard() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadProposals();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = base44.entities.BoardProposal.subscribe((event) => {
      if (event.type === 'update' || event.type === 'create') {
        loadProposals();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadProposals = async () => {
    try {
      const data = await base44.entities.BoardProposal.list();
      // Filter to only show approved proposals that are in-progress or completed
      const filtered = data.filter(p => 
        p.status === 'approved' && (p.approval_stage === 'in_progress' || p.approval_stage === 'completed')
      );
      setProposals(filtered);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination || source.droppableId === destination.droppableId) {
      return;
    }

    const proposal = proposals.find(p => p.id === draggableId);
    if (!proposal) return;

    const newStage = destination.droppableId;
    setUpdatingId(draggableId);

    try {
      await base44.entities.BoardProposal.update(draggableId, {
        approval_stage: newStage
      });
      
      setProposals(prev =>
        prev.map(p =>
          p.id === draggableId ? { ...p, approval_stage: newStage } : p
        )
      );

      const stageLabel = newStage === 'completed' ? 'Completed' : 'In Progress';
      toast.success(`"${proposal.title}" moved to ${stageLabel}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to update proposal');
      await loadProposals();
    } finally {
      setUpdatingId(null);
    }
  };

  const ProposalCard = ({ proposal, index }) => (
    <Draggable draggableId={proposal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`transition-all ${snapshot.isDragging ? 'opacity-75 shadow-lg' : ''}`}
        >
          <Card className="mb-3 hover:shadow-md transition-shadow cursor-move">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">{proposal.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{proposal.summary}</p>
                
                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {proposal.proposal_type}
                    </Badge>
                    {proposal.is_unanimous && (
                      <Badge className="bg-green-100 text-green-700 text-xs">Unanimous</Badge>
                    )}
                  </div>
                </div>

                {proposal.products_involved?.length > 0 && (
                  <div className="text-xs text-slate-600 pt-1">
                    Products: {proposal.products_involved.slice(0, 2).join(', ')}
                    {proposal.products_involved.length > 2 && ` +${proposal.products_involved.length - 2}`}
                  </div>
                )}

                <div className="text-xs text-slate-500 pt-1">
                  Raised by: {proposal.raised_by}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );

  const getColumnProposals = (stage) => proposals.filter(p => p.approval_stage === stage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Implementation Dashboard</h1>
          <p className="text-slate-600">Drag proposals between columns to update their status in real-time</p>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(COLUMNS).map(([columnId, columnConfig]) => {
              const columnProposals = getColumnProposals(columnId);
              return (
                <div key={columnId}>
                  <div className="flex items-center gap-2 mb-4">
                    {columnId === 'in_progress' ? (
                      <Clock className="w-5 h-5 text-blue-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    <h2 className="font-bold text-slate-900">{columnConfig.title}</h2>
                    <Badge className="ml-auto bg-slate-200 text-slate-700">
                      {columnProposals.length}
                    </Badge>
                  </div>

                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[500px] rounded-xl p-4 transition-all ${
                          columnConfig.color
                        } ${columnConfig.borderColor} border-2 ${
                          snapshot.isDraggingOver ? 'ring-2 ring-offset-2 ring-blue-400' : ''
                        }`}
                      >
                        {columnProposals.length === 0 ? (
                          <div className="flex items-center justify-center h-full text-slate-500">
                            <div className="text-center">
                              <p className="text-sm">No proposals yet</p>
                              <p className="text-xs mt-1">Drag items here to get started</p>
                            </div>
                          </div>
                        ) : (
                          columnProposals.map((proposal, index) => (
                            <ProposalCard
                              key={proposal.id}
                              proposal={proposal}
                              index={index}
                            />
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>

        {/* Summary */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-900">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {getColumnProposals('in_progress').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-900">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getColumnProposals('completed').length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}