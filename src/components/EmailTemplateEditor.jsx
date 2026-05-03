import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Copy, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  EMAIL_PLACEHOLDERS,
  TEMPLATE_TYPES,
  TRIGGER_TYPES,
  extractPlaceholders,
  getDefaultTemplate
} from '@/lib/messageUtils';

/**
 * EmailTemplateEditor — create/edit email templates
 */
export default function EmailTemplateEditor({ template = null, onSave, onCancel }) {
  const [name, setName] = useState(template?.name || '');
  const [type, setType] = useState(template?.template_type || 'rent_reminder');
  const [triggerType, setTriggerType] = useState(template?.trigger_type || 'manual');
  const [subject, setSubject] = useState(template?.subject_line || '');
  const [body, setBody] = useState(template?.body || '');
  const [description, setDescription] = useState(template?.description || '');
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  const [extractedPlaceholders, setExtractedPlaceholders] = useState([]);

  // Extract placeholders when content changes
  useEffect(() => {
    const placeholders = new Set([
      ...extractPlaceholders(subject),
      ...extractPlaceholders(body)
    ]);
    setExtractedPlaceholders(Array.from(placeholders));
  }, [subject, body]);

  const handleLoadDefault = () => {
    const defaults = getDefaultTemplate(triggerType);
    if (defaults) {
      setSubject(defaults.subject);
      setBody(defaults.body);
      toast.success('Default template loaded');
    } else {
      toast.info('No default template for this trigger type');
    }
  };

  const handleInsertPlaceholder = (placeholder) => {
    const tag = `{{${placeholder}}}`;
    setBody(prev => prev + tag);
    toast.success(`Inserted {{${placeholder}}}`);
  };

  const handleSave = () => {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      toast.error('Please fill in name, subject, and body');
      return;
    }

    onSave({
      name,
      template_type: type,
      subject_line: subject,
      body,
      description,
      trigger_type: triggerType,
      available_placeholders: extractedPlaceholders
    });
  };

  const typeInfo = TEMPLATE_TYPES[type];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{template ? 'Edit Template' : 'Create Email Template'}</h2>
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
                  placeholder="e.g., Rent Overdue - 7 Days"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEMPLATE_TYPES).map(([key, info]) => (
                        <SelectItem key={key} value={key}>{info.icon} {info.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Trigger</label>
                  <Select value={triggerType} onValueChange={setTriggerType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRIGGER_TYPES).map(([key, info]) => (
                        <SelectItem key={key} value={key}>{info.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="When/why is this sent?"
                  rows={2}
                />
              </div>

              <Button onClick={handleLoadDefault} variant="outline" className="w-full">
                Load Default Template
              </Button>
            </CardContent>
          </Card>

          {/* Email Subject */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Rent Payment Due - {{property_name}}"
              />
            </CardContent>
          </Card>

          {/* Email Body */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Body</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your email message..."
                rows={12}
                className="font-mono text-sm"
              />

              {/* Extracted Placeholders */}
              {extractedPlaceholders.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Placeholders used:</p>
                  <div className="flex flex-wrap gap-2">
                    {extractedPlaceholders.map(placeholder => (
                      <Badge key={placeholder} variant="secondary" className="text-xs font-mono">
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
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
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
                Placeholders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(EMAIL_PLACEHOLDERS).map(([placeholderKey, placeholderInfo]) => (
                <button
                  key={placeholderKey}
                  onClick={() => handleInsertPlaceholder(placeholderKey)}
                  className="w-full p-2 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 transition text-left"
                >
                  <p className="font-mono text-xs font-semibold text-slate-900">{`{{${placeholderKey}}}`}</p>
                  <p className="text-xs text-slate-600 mt-1">{placeholderInfo.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">e.g., {placeholderInfo.example}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 space-y-3 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Tips:</p>
              <ul className="space-y-2">
                <li>• Use {`{{placeholder}}`} format</li>
                <li>• Click placeholders to insert</li>
                <li>• Missing data shows as [placeholder]</li>
                <li>• Load defaults to get started</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}