import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Save, X, Copy, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  extractPlaceholders,
  getPlaceholderSuggestions,
  validateTemplate,
  PLACEHOLDER_DEFINITIONS,
  TEMPLATE_TYPE_PLACEHOLDERS
} from '@/lib/templateUtils';

/**
 * TemplateEditor — create/edit templates with placeholder support
 */
export default function TemplateEditor({ template = null, onSave, onCancel }) {
  const [name, setName] = useState(template?.name || '');
  const [type, setType] = useState(template?.template_type || 'custom');
  const [content, setContent] = useState(template?.content || '');
  const [description, setDescription] = useState(template?.description || '');
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  const [validation, setValidation] = useState({ isValid: true, errors: [], placeholders: [] });
  const [saving, setSaving] = useState(false);

  // Validate template on content change
  useEffect(() => {
    const result = validateTemplate(content, type);
    setValidation(result);
  }, [content, type]);

  const placeholderSuggestions = getPlaceholderSuggestions(type);

  const handleInsertPlaceholder = (tag) => {
    const textarea = document.getElementById('template-content');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + tag + content.substring(end);
      setContent(newContent);
      
      // Move cursor after inserted text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tag.length;
        textarea.focus();
      }, 0);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      toast.error('Please fill in template name and content');
      return;
    }

    if (!validation.isValid) {
      toast.error('Please fix template validation errors');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name,
        template_type: type,
        content,
        description,
        available_placeholders: validation.placeholders
      });
      toast.success('Template saved successfully');
    } catch (e) {
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{template ? 'Edit Template' : 'Create New Template'}</h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Template Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Standard Tenancy Agreement"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Template Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenancy_agreement">Tenancy Agreement</SelectItem>
                    <SelectItem value="notice_to_quit">Notice to Quit</SelectItem>
                    <SelectItem value="notice_to_repair">Notice to Repair</SelectItem>
                    <SelectItem value="rent_demand">Rent Demand</SelectItem>
                    <SelectItem value="custom">Custom Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description (Optional)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="When to use this template..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Template Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                id="template-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Start typing your template...\n\nUse placeholders like {{tenant_name}}, {{property_address}}, etc.\nClick "Available Placeholders" on the right for suggestions.`}
                rows={15}
                className="font-mono text-sm"
              />

              {/* Validation Messages */}
              {!validation.isValid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                  {validation.errors.map((error, idx) => (
                    <div key={idx} className="flex gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-red-900">{error}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Placeholders Used */}
              {validation.placeholders.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600">Placeholders used in this template:</p>
                  <div className="flex flex-wrap gap-2">
                    {validation.placeholders.map(placeholder => (
                      <Badge key={placeholder} variant="outline" className="font-mono text-xs">
                        {`{{${placeholder}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !validation.isValid} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>

        {/* Sidebar: Placeholder Helper */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Available Placeholders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => setShowPlaceholders(!showPlaceholders)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 w-full text-left"
              >
                {showPlaceholders ? '▼ Hide' : '▶ Show'} All Placeholders
              </button>

              {showPlaceholders && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {placeholderSuggestions.map(({ tag, label, example }) => (
                    <div key={tag} className="p-2 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 transition cursor-pointer">
                      <button
                        onClick={() => {
                          handleInsertPlaceholder(tag);
                          toast.success(`Inserted ${tag}`);
                        }}
                        className="w-full text-left"
                      >
                        <p className="font-mono text-xs font-semibold text-slate-900">{tag}</p>
                        <p className="text-xs text-slate-600 mt-1">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">e.g., {example}</p>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!showPlaceholders && (
                <div className="space-y-2 text-xs text-slate-600">
                  <p>This template type supports:</p>
                  <div className="flex flex-wrap gap-1">
                    {placeholderSuggestions.slice(0, 5).map(({ tag }) => (
                      <Badge key={tag} variant="secondary" className="text-xs font-mono">
                        {tag}
                      </Badge>
                    ))}
                    {placeholderSuggestions.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{placeholderSuggestions.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 space-y-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Tips:</p>
              <ul className="space-y-2 text-xs">
                <li>• Use double curly braces: <code className="bg-white px-1 rounded">{'{{placeholder}}'}</code></li>
                <li>• Placeholders are case-sensitive</li>
                <li>• Unmapped placeholders show as [Placeholder Name]</li>
                <li>• Click any placeholder tag to insert it</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}