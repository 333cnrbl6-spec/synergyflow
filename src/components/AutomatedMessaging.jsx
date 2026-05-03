import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Send, Eye, Copy, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EmailTemplateEditor from './EmailTemplateEditor';
import {
  TEMPLATE_TYPES,
  TRIGGER_TYPES,
  formatRentStatus,
  getRentStatus,
  populateEmailTemplate
} from '@/lib/messageUtils';

/**
 * AutomatedMessaging — manage email templates and send automated messages
 */
export default function AutomatedMessaging() {
  const [mode, setMode] = useState('list'); // 'list', 'edit', 'preview'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => base44.entities.EmailTemplate.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      setMode('list');
      toast.success('Template created');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailTemplate.update(selectedTemplate.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      setMode('list');
      setSelectedTemplate(null);
      toast.success('Template updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast.success('Template deleted');
    }
  });

  const handleSaveTemplate = async (templateData) => {
    if (selectedTemplate) {
      await updateMutation.mutateAsync(templateData);
    } else {
      await createMutation.mutateAsync(templateData);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.template_type === filterType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <EmailTemplateEditor
        template={selectedTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setMode('list');
          setSelectedTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-slate-600 mt-1">Create and manage automated messages</p>
        </div>
        <Button onClick={() => {
          setSelectedTemplate(null);
          setMode('edit');
        }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(TEMPLATE_TYPES).map(([key, info]) => (
              <SelectItem key={key} value={key}>{info.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500 mb-4">No templates found</p>
            <Button onClick={() => {
              setSelectedTemplate(null);
              setMode('edit');
            }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTemplates.map(template => {
            const typeInfo = TEMPLATE_TYPES[template.template_type];
            const triggerInfo = TRIGGER_TYPES[template.trigger_type];

            return (
              <Card key={template.id} className="hover:shadow-md transition">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{typeInfo?.icon}</span>
                        <div>
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          {template.description && (
                            <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">{typeInfo?.label}</Badge>
                        <Badge className="bg-blue-100 text-blue-700">{triggerInfo?.label}</Badge>
                        {template.is_default && <Badge className="bg-green-100 text-green-700">Default</Badge>}
                        {!template.active && <Badge variant="secondary">Inactive</Badge>}
                      </div>

                      <p className="text-sm font-mono text-slate-600 truncate">
                        Subject: {template.subject_line}
                      </p>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-4">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedTemplate(template);
                          setMode('edit');
                        }}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(template.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}