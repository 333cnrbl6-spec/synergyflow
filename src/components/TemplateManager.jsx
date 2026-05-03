import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Eye, Copy, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TemplateEditor from './TemplateEditor';
import TemplatePreview from './TemplatePreview';

/**
 * TemplateManager — list, create, edit, and manage templates
 */
export default function TemplateManager() {
  const [mode, setMode] = useState('list'); // 'list', 'edit', 'preview'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Template.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setMode('list');
      toast.success('Template created');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Template.update(selectedTemplate.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setMode('list');
      setSelectedTemplate(null);
      toast.success('Template updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Template.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
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

  const handleDuplicate = async (template) => {
    const newTemplate = {
      ...template,
      name: `${template.name} (Copy)`,
      id: undefined
    };
    await createMutation.mutateAsync(newTemplate);
  };

  const handlePreview = (template, data = {}) => {
    setSelectedTemplate(template);
    setPreviewData(data);
    setMode('preview');
  };

  const handleDelete = (id) => {
    if (confirm('Delete this template? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const templateTypeLabels = {
    tenancy_agreement: 'Tenancy Agreement',
    notice_to_quit: 'Notice to Quit',
    notice_to_repair: 'Notice to Repair',
    rent_demand: 'Rent Demand',
    custom: 'Custom'
  };

  if (mode === 'edit') {
    return (
      <TemplateEditor
        template={selectedTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setMode('list');
          setSelectedTemplate(null);
        }}
      />
    );
  }

  if (mode === 'preview') {
    return (
      <TemplatePreview
        template={selectedTemplate}
        onBack={() => {
          setMode('list');
          setSelectedTemplate(null);
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Templates</h1>
          <p className="text-slate-600 mt-1">Create and manage tenancy agreement and notice templates</p>
        </div>
        <Button onClick={() => {
          setSelectedTemplate(null);
          setMode('edit');
        }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500 mb-4">No templates yet. Create your first template to get started.</p>
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
          {templates.map(template => (
            <Card key={template.id} className="hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{template.name}</h3>
                      <Badge variant="outline">
                        {templateTypeLabels[template.template_type] || template.template_type}
                      </Badge>
                      {template.is_default && <Badge className="bg-green-600">Default</Badge>}
                    </div>
                    {template.description && (
                      <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {template.available_placeholders?.slice(0, 5).map(placeholder => (
                        <Badge key={placeholder} variant="secondary" className="text-xs font-mono">
                          {`{{${placeholder}}}`}
                        </Badge>
                      ))}
                      {template.available_placeholders?.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.available_placeholders.length - 5}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Used {template.usage_count} times
                      {template.last_used && ` • Last used ${new Date(template.last_used).toLocaleDateString()}`}
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
                        setMode('preview');
                      }}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedTemplate(template);
                        setMode('edit');
                      }}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}