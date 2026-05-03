import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { calculateRenewalDate, DOCUMENT_TYPES } from '@/lib/documentUtils';

/**
 * DocumentUploader — secure file upload with metadata
 */
export default function DocumentUploader({ propertyId, propertyName, onUploadComplete, onCancel }) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('gas_safety_certificate');
  const [certNumber, setCertNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [certifiedBy, setCertifiedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File must be smaller than 10MB');
        return;
      }
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Only PDF, JPG, and PNG files are allowed');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !issueDate) {
      toast.error('Please select a file and issue date');
      return;
    }

    setUploading(true);
    try {
      // Upload file
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadResponse.file_url;

      // Calculate expiration date
      const expirationDate = calculateRenewalDate(issueDate, docType);

      // Create document record
      await base44.entities.Document.create({
        name: `${DOCUMENT_TYPES[docType].label} - ${propertyName}`,
        document_type: docType,
        property_id: propertyId,
        property_name: propertyName,
        file_url: fileUrl,
        file_size_kb: Math.round(file.size / 1024),
        upload_date: new Date().toISOString().split('T')[0],
        issue_date: issueDate,
        expiration_date: expirationDate,
        certification_number: certNumber,
        certified_by: certifiedBy,
        notes: notes,
        status: 'valid',
        tags: []
      });

      toast.success('Document uploaded successfully');
      setFile(null);
      setDocType('gas_safety_certificate');
      setCertNumber('');
      setIssueDate('');
      setCertifiedBy('');
      setNotes('');
      
      if (onUploadComplete) onUploadComplete();
    } catch (e) {
      toast.error('Failed to upload document');
      console.error(e);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const docInfo = DOCUMENT_TYPES[docType];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Compliance Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select File</label>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-slate-900">{file.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm text-slate-600">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-500">PDF, JPG, PNG up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Document Type</label>
          <Select value={docType} onValueChange={setDocType} disabled={uploading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DOCUMENT_TYPES).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  {info.icon} {info.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-1">{docInfo.description}</p>
        </div>

        {/* Issue Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Issue Date *</label>
          <Input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            disabled={uploading}
          />
        </div>

        {/* Certification Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Certification Number (Optional)</label>
          <Input
            type="text"
            value={certNumber}
            onChange={(e) => setCertNumber(e.target.value)}
            placeholder="e.g., GAS123456789"
            disabled={uploading}
          />
        </div>

        {/* Certified By */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Certified By (Optional)</label>
          <Input
            type="text"
            value={certifiedBy}
            onChange={(e) => setCertifiedBy(e.target.value)}
            placeholder="e.g., ABC Gas Services Ltd"
            disabled={uploading}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes..."
            rows={3}
            disabled={uploading}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-blue-900">
            <p className="font-medium">Expiration Tracking</p>
            <p className="text-xs mt-1">This document will automatically expire in {docInfo.validityYears || 'N/A'} year(s) from the issue date. You'll receive renewal alerts 30 days before expiration.</p>
          </div>
        </div>

        {/* Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 text-center">Uploading...</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={uploading} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || !issueDate || uploading} className="flex-1 bg-blue-600 hover:bg-blue-700">
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}