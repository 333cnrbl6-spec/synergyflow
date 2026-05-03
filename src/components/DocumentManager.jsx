import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Trash2, Plus, AlertTriangle, Clock, CheckCircle2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DocumentUploader from './DocumentUploader';
import {
  DOCUMENT_TYPES,
  formatExpirationDate,
  getExpirationStatus,
  getStatusColor,
  formatFileSize,
  groupDocumentsByStatus,
  daysUntilExpiration
} from '@/lib/documentUtils';

/**
 * DocumentManager — view, upload, and manage compliance documents
 */
export default function DocumentManager({ propertyId, propertyName }) {
  const [showUploader, setShowUploader] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['documents', propertyId],
    queryFn: () => base44.entities.Document.filter({ property_id: propertyId })
  });

  const deleteMutation = useMutation({
    mutationFn: (docId) => base44.entities.Document.delete(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', propertyId] });
      toast.success('Document deleted');
    }
  });

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.certification_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || doc.document_type === filterType;
      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, searchTerm, filterType, filterStatus]);

  // Group by status
  const grouped = useMemo(() => groupDocumentsByStatus(filteredDocuments), [filteredDocuments]);

  const handleDelete = (docId) => {
    if (confirm('Delete this document? This cannot be undone.')) {
      deleteMutation.mutate(docId);
    }
  };

  const handleDownload = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (showUploader) {
    return (
      <DocumentUploader
        propertyId={propertyId}
        propertyName={propertyName}
        onUploadComplete={() => {
          setShowUploader(false);
          refetch();
        }}
        onCancel={() => setShowUploader(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Documents</h2>
          <p className="text-slate-600 mt-1">{propertyName}</p>
        </div>
        <Button onClick={() => setShowUploader(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Alerts Summary */}
      {(grouped.expired.length > 0 || grouped.expiring_soon.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {grouped.expired.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">{grouped.expired.length} Expired</p>
                  <p className="text-xs text-red-800 mt-1">Immediate action required</p>
                </div>
              </CardContent>
            </Card>
          )}
          {grouped.expiring_soon.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">{grouped.expiring_soon.length} Expiring Soon</p>
                  <p className="text-xs text-amber-800 mt-1">Renew within 30 days</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by name or certificate number..."
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
            {Object.entries(DOCUMENT_TYPES).map(([key, info]) => (
              <SelectItem key={key} value={key}>{info.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="valid">Valid</SelectItem>
            <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500 mb-4">No documents found</p>
            <Button onClick={() => setShowUploader(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Expired */}
          {grouped.expired.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Expired ({grouped.expired.length})
              </h3>
              {grouped.expired.map(doc => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onDownload={() => handleDownload(doc.file_url)}
                  onDelete={() => handleDelete(doc.id)}
                />
              ))}
            </div>
          )}

          {/* Expiring Soon */}
          {grouped.expiring_soon.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Expiring Soon ({grouped.expiring_soon.length})
              </h3>
              {grouped.expiring_soon.map(doc => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onDownload={() => handleDownload(doc.file_url)}
                  onDelete={() => handleDelete(doc.id)}
                />
              ))}
            </div>
          )}

          {/* Valid */}
          {grouped.valid.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Valid ({grouped.valid.length})
              </h3>
              {grouped.valid.map(doc => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onDownload={() => handleDownload(doc.file_url)}
                  onDelete={() => handleDelete(doc.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Individual document card component
 */
function DocumentCard({ doc, onDownload, onDelete }) {
  const docType = DOCUMENT_TYPES[doc.document_type];
  const expiresIn = doc.expiration_date ? daysUntilExpiration(doc.expiration_date) : null;

  return (
    <Card className={`hover:shadow-md transition ${doc.status === 'expired' ? 'bg-red-50' : doc.status === 'expiring_soon' ? 'bg-amber-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{docType?.icon || '📎'}</span>
              <div>
                <h3 className="font-semibold text-slate-900">{doc.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{docType?.label}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getStatusColor(doc.status)} variant="outline">
                {doc.status.replace('_', ' ').toUpperCase()}
              </Badge>
              {doc.certification_number && (
                <Badge variant="secondary" className="text-xs font-mono">{doc.certification_number}</Badge>
              )}
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              {doc.expiration_date && (
                <p>{getExpirationStatus(doc.expiration_date)}</p>
              )}
              <p>Uploaded {new Date(doc.upload_date).toLocaleDateString('en-GB')}</p>
              {doc.certified_by && <p>Certified by {doc.certified_by}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-4">
            <Button variant="ghost" size="icon" onClick={onDownload} className="text-slate-600 hover:text-slate-900">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}