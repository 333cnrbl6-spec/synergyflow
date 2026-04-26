import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const PRODUCT_DEMOS = {
  'case-tracker': [
    { title: 'Case Dashboard', description: 'View all your cases in one unified dashboard with real-time status updates.' },
    { title: 'Deadline Tracking', description: 'Never miss a limitation period. Automatic alerts for compliance deadlines.' },
    { title: 'Document Assembly', description: 'Auto-generate contracts from case data. Save 5+ hours per week.' },
    { title: 'Team Collaboration', description: 'Assign tasks, share notes, and communicate securely with your team.' },
    { title: 'Billing Integration', description: 'Time tracking syncs directly to Xero/FreshBooks for instant invoicing.' }
  ],
  'base44-ai': [
    { title: 'Contract Review', description: 'Upload contracts. Get instant risk analysis, precedent matching, and compliance flags.' },
    { title: 'Case Summary Generation', description: 'Paste case files. Get professional summaries in seconds, not hours.' },
    { title: 'Precedent Linking', description: 'AI automatically suggests relevant case law and binding precedents.' },
    { title: 'Batch Processing', description: 'Process thousands of documents overnight for due diligence.' },
    { title: 'Explainable Results', description: 'Every AI decision is explained so you stay in control.' }
  ],
  'case-narrative': [
    { title: 'Auto-Generate Narratives', description: 'Upload case notes. Get a chronological, court-ready narrative.' },
    { title: 'Timeline Builder', description: 'Visual timeline shows evidence sequence, key dates, and critical events.' },
    { title: 'Brief Formatting', description: 'Auto-formatted briefs ready to file. Compliance with court rules built-in.' },
    { title: 'Precedent Cross-Referencing', description: 'Auto-links case law and precedents relevant to your case.' },
    { title: 'Evidence Tagging', description: 'Organize and tag evidence documents for instant retrieval.' }
  ],
  'premiso': [
    { title: 'Property Search Automation', description: 'Auto-pull searches from Council of Mortgage Lenders and other providers.' },
    { title: 'Chain Verification', description: 'Automated defect detection. Flag liens, encumbrances, and title issues.' },
    { title: 'RICS Compliance', description: 'Built-in RICS checklists ensure every deal meets regulatory standards.' },
    { title: 'Document Assembly', description: 'Auto-populate completion documents. Ready to file in minutes.' },
    { title: 'Land Registry Integration', description: 'Direct integration pulls latest property data and title information.' }
  ],
  'charity-hub': [
    { title: 'Trustee Register', description: 'Manage trustee records, roles, and governance responsibilities.' },
    { title: 'Board Meeting Automation', description: 'Schedule meetings, track attendance, and record decisions.' },
    { title: 'Charity Commission Forms', description: 'Auto-complete Annual Returns and CC Forms. Never miss deadlines.' },
    { title: 'Restricted Funds Tracking', description: 'Monitor restricted and unrestricted funds against donor restrictions.' },
    { title: 'Audit Trail', description: 'Complete audit trail of all decisions for regulatory inspections.' }
  ],
  'species-explorer': [
    { title: 'Species Database', description: '50,000+ species with behavior, habitat, and conservation status.' },
    { title: 'Field Observation Logging', description: 'Log sightings with GPS coordinates. Build distribution maps.' },
    { title: 'Biodiversity Reports', description: 'Auto-generate environmental impact assessments for projects.' },
    { title: 'Conservation Tracking', description: 'Real-time IUCN Red List integration tracks endangered species.' },
    { title: 'Team Collaboration', description: 'Share observations and research with your team in real-time.' }
  ]
};

export default function DemoSlideshow({ productSlug, productName, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = PRODUCT_DEMOS[productSlug] || [];

  if (slides.length === 0) return null;

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-75">Product Demo</p>
            <h2 className="text-2xl font-bold">{productName}</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Slide Content */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">{currentSlideData.title}</h3>
            <p className="text-lg text-slate-600 leading-relaxed">{currentSlideData.description}</p>
          </div>

          {/* Slide Visual */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg p-12 text-center min-h-[200px] flex items-center justify-center">
            <div className="text-6xl opacity-20">📊</div>
          </div>
        </div>

        {/* Footer with Navigation */}
        <div className="bg-slate-50 border-t border-slate-200 p-6 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Slide {currentSlide + 1} of {slides.length}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === currentSlide ? 'bg-slate-900 w-8' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentSlide === slides.length - 1}
              className="disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}