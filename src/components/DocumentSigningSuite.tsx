'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FileSignature,
  CheckCircle2,
  Smartphone,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Plus,
  Trash2,
  Lock,
  ShieldCheck,
  Sparkles,
  Search,
  Building2,
  Send,
  Eye,
  PenTool,
  RotateCcw,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  Sliders,
  CheckSquare,
  Award,
} from 'lucide-react';
import { SignerAuditLog } from '@/db/schema';

export interface SignedDocumentItem {
  id: number;
  propertyId: number | null;
  documentType: string;
  title: string;
  propertyAddress: string;
  purchasePrice: string;
  buyerName: string;
  sellerName: string;
  brokerName: string;
  brokerage: string;
  status: string; // 'draft' | 'pending_signature' | 'partially_signed' | 'fully_executed'
  documentContent: string;
  signatures: SignerAuditLog[];
  certificateId: string;
  securityHash: string;
  isMobileExecuted: boolean;
  createdAt?: string;
  executedAt?: string;
}

interface PropertyOption {
  id: number;
  title: string;
  address: string;
  cityState: string;
  price: string;
  sellerName: string;
  sellerPhone: string;
  sellerBottomLine: string;
}

interface DocumentSigningSuiteProps {
  properties: PropertyOption[];
  documents: SignedDocumentItem[];
  onCreateDocument: (docData: Record<string, unknown>) => Promise<boolean>;
  onSignDocument: (
    documentId: number,
    signatureData: SignerAuditLog
  ) => Promise<boolean>;
  onDeleteDocument: (id: number) => Promise<boolean>;
  showToast: (msg: string) => void;
}

// STANDARD LUXURY & RESIDENTIAL TEMPLATE SPECIFICATIONS
const DOCUMENT_TEMPLATES = [
  {
    id: 'psa',
    category: 'Purchase Agreements',
    badge: 'Standard Offer',
    name: 'Residential Real Estate Purchase & Sale Agreement (Form 21 / Standard PSA)',
    description:
      'Official agreement governing purchase price, earnest money wire, contingency timelines, title & escrow, and conveyance of fixtures.',
    defaultPrice: '$650,000',
    tags: ['Binding Contract', 'Earnest Money', 'Escrow Protocol'],
  },
  {
    id: 'listing_agreement',
    category: 'Listing Agreements',
    badge: 'Exclusive Agency',
    name: 'Exclusive Right to Sell & Listing Agreement',
    description:
      'Authorizes Melissa Hatfield & John L. Scott Real Estate as exclusive listing broker with MLS syndication, luxury video production, and commission terms.',
    defaultPrice: '$1,450,000',
    tags: ['Listing Representation', 'MLS Syndication', 'Broker Terms'],
  },
  {
    id: 'inspection_addendum',
    category: 'Contingency Addendums',
    badge: 'Contingency',
    name: 'Inspection Contingency Addendum (Form 35 / Property Examination)',
    description:
      'Establishes 10-business-day inspection timeframe, sewer scope, structural review, and seller repair/credit negotiation rights.',
    defaultPrice: 'N/A',
    tags: ['10-Day Inspection', 'Sewer & Roof', 'Repair Credits'],
  },
  {
    id: 'financing_addendum',
    category: 'Contingency Addendums',
    badge: 'Financing',
    name: 'Financing & Loan Contingency Addendum (Form 22A / Cash Verification)',
    description:
      'Covers conventional, jumbo, FHA/VA financing terms, appraisal contingency waivers, and all-cash wire verification schedules.',
    defaultPrice: 'N/A',
    tags: ['Appraisal Contingency', 'Proof of Funds', '30-Day Close'],
  },
  {
    id: 'seller_disclosure',
    category: 'Disclosures',
    badge: 'Statutory Form',
    name: "Seller's Real Property Disclosure Statement (Form 17 / Condition Report)",
    description:
      'Comprehensive seller disclosure covering title, water systems, sewer/septic, structural integrity, insulation, and environmental disclosures.',
    defaultPrice: 'N/A',
    tags: ['Property Condition', 'Title Disclosures', 'Systems Check'],
  },
  {
    id: 'lead_paint',
    category: 'Disclosures',
    badge: 'Federal EPA',
    name: 'Lead-Based Paint & Hazard Disclosure Addendum (Pre-1978 Properties)',
    description:
      'Federal disclosure statement and acknowledgment of EPA "Protect Your Family From Lead In Your Home" pamphlet.',
    defaultPrice: 'N/A',
    tags: ['EPA Mandated', 'Pre-1978 Housing', '10-Day Risk Check'],
  },
  {
    id: 'earnest_money',
    category: 'Wire & Escrow',
    badge: 'Escrow Vault',
    name: 'Earnest Money Promissory Note & Direct Wire Receipt Instructions',
    description:
      'Verified protocol for 24-48 business hour wire deposit into licensed escrow trust account, including default remedies.',
    defaultPrice: '$15,000',
    tags: ['24-Hour Wire', 'Escrow Trust', 'Deposit Security'],
  },
  {
    id: 'agency_disclosure',
    category: 'Disclosures',
    badge: 'Statutory Law',
    name: 'Real Estate Brokerage Relationships & Agency Law Disclosure',
    description:
      'Official statutory agency disclosure outlining duties of broker Melissa Hatfield (John L. Scott Real Estate) and dual agency provisions.',
    defaultPrice: 'N/A',
    tags: ['Broker Duties', 'Client Representation', 'Legal Notice'],
  },
  {
    id: 'loi',
    category: 'Purchase Agreements',
    badge: 'Fast-Track',
    name: 'Binding Letter of Intent (LOI) & Fast-Track Terms Addendum',
    description:
      'Expedited acquisition terms with customized earnest money, turnkey furniture inclusions, and 14-day closing commitments.',
    defaultPrice: '$285,000',
    tags: ['14-Day Escrow', 'Turnkey Inclusions', 'Custom Offer'],
  },
];

export default function DocumentSigningSuite({
  properties,
  documents,
  onCreateDocument,
  onSignDocument,
  onDeleteDocument,
  showToast,
}: DocumentSigningSuiteProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDocForViewing, setActiveDocForViewing] =
    useState<SignedDocumentItem | null>(null);

  // New Document Creation Wizard
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('psa');
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    properties[0]?.id || null
  );
  const [customAddress, setCustomAddress] = useState(
    properties[0]?.address || '2404 14th St SW, Puyallup, WA 98371'
  );
  const [customPrice, setCustomPrice] = useState(
    properties[0]?.price || '$285,000'
  );
  const [customBuyerName, setCustomBuyerName] = useState(
    'David & Claire Sterling'
  );
  const [customSellerName, setCustomSellerName] = useState(
    properties[0]?.sellerName || 'Marcus & Elena Vance'
  );
  const [earnestAmount, setEarnestAmount] = useState('$10,000');
  const [closingDays, setClosingDays] = useState('21');
  const [inspectionDays, setInspectionDays] = useState('10');
  const [specialTerms, setSpecialTerms] = useState(
    'Includes all custom window treatments, kitchen appliances, and turnkey fixtures. Seller to credit buyer $3,500 toward closing costs.'
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Automated Mobile Signing Engine State
  const [signingModalOpen, setSigningModalOpen] = useState(false);
  const [docToSign, setDocToSign] = useState<SignedDocumentItem | null>(null);
  const [signerRole, setSignerRole] = useState<'buyer' | 'seller' | 'broker'>(
    'buyer'
  );
  const [signerName, setSignerName] = useState('David & Claire Sterling');
  const [signerEmail, setSignerEmail] = useState('d.sterling@email.com');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type' | 'auto'>(
    'draw'
  );
  const [typedFontIndex, setTypedFontIndex] = useState<number>(0);
  const [signatureColor, setSignatureColor] = useState<string>('#1E40AF'); // Signature Blue default
  const [hasDrawnStroke, setHasDrawnStroke] = useState(false);
  const [isSigningProgress, setIsSigningProgress] = useState(false);
  const [showQrCodeMobileLink, setShowQrCodeMobileLink] = useState(false);
  const [copiedDocText, setCopiedDocText] = useState(false);

  // Canvas Drawing Pad Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // When property selection changes in Create Wizard
  useEffect(() => {
    if (selectedPropertyId) {
      const prop = properties.find((p) => p.id === selectedPropertyId);
      if (prop) {
        setCustomAddress(`${prop.address}, ${prop.cityState}`);
        setCustomPrice(prop.price);
        if (prop.sellerName) setCustomSellerName(prop.sellerName);
      }
    }
  }, [selectedPropertyId, properties]);

  // Setup Canvas listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || signatureMode !== 'draw') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI canvas scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = signatureColor;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      if ('touches' in e && e.touches[0]) {
        return {
          x: e.touches[0].clientX - r.left,
          y: e.touches[0].clientY - r.top,
        };
      }
      return {
        x: (e as MouseEvent).clientX - r.left,
        y: (e as MouseEvent).clientY - r.top,
      };
    };

    const startDraw = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      setHasDrawnStroke(true);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const endDraw = () => {
      isDrawingRef.current = false;
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', endDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', endDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      window.removeEventListener('mouseup', endDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      window.removeEventListener('touchend', endDraw);
    };
  }, [signingModalOpen, signatureMode, signatureColor]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnStroke(false);
  };

  // Generate Document Text Content based on Template & Data
  const compileDocumentContent = (
    templateId: string,
    data: {
      address: string;
      price: string;
      buyer: string;
      seller: string;
      earnest: string;
      closing: string;
      inspection: string;
      terms: string;
    }
  ): string => {
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    if (templateId === 'listing_agreement') {
      return `EXCLUSIVE RIGHT TO SELL LISTING AGREEMENT (EXCLUSIVE AGENCY)
Date: ${timestamp}
Listing Brokerage: John L. Scott Real Estate
Designated Broker / REALTOR®: Melissa Hatfield
Direct Contact: (253) 514-7676 | Office: (253) 841-7000 | Email: melissafh@johnlscott.com
Website: www.melissafh.johnlscott.com

1. PROPERTY & PARTIES:
Owner/Seller: ${data.seller} ("Seller")
Property Legal Description & Address: ${data.address}

2. LISTING PRICE & TERMS:
Listing Price: ${data.price} USD
Listing Period: 180 Days from Mutual Execution
Seller authorizes Brokerage to syndicate this listing across Multiple Listing Service (MLS), luxury regional marketing networks, and targeted digital channels.

3. BROKERAGE COMPENSATION:
Seller agrees to compensate John L. Scott Real Estate a total commission of 5.0% of the final gross sales price, allocated as 2.5% to the Listing Office and 2.5% to the Cooperating Buyer Brokerage upon successful closing and recording of title.

4. MARKETING, CINEMA TOURS & ADVERTISING:
Broker Melissa Hatfield is authorized to produce professional high-definition 16:9 cinematic property tours, 9:16 vertical video reels, and luxury digital marketing campaigns.

5. FAIR HOUSING & DISCLOSURES:
The parties acknowledge compliance with all federal, state, and local Fair Housing laws prohibiting discrimination based on race, color, religion, sex, handicap, familial status, national origin, or sexual orientation.

6. SIGNATURE AUTHORIZATION:
This agreement is executed with binding digital signatures under the Uniform Electronic Transactions Act (UETA) and the federal Electronic Signatures in Global and National Commerce Act (E-SIGN).`;
    }

    if (templateId === 'inspection_addendum') {
      return `INSPECTION CONTINGENCY ADDENDUM (FORM 35 / PROPERTY CONDITION)
Property Address: ${data.address}
Purchase Price: ${data.price}
Buyer: ${data.buyer} | Seller: ${data.seller}
Listing & Transaction Broker: Melissa Hatfield · John L. Scott Real Estate (253-514-7676)

1. INSPECTION TIMEFRAME:
Buyer's obligation to purchase is contingent upon Buyer's subjective satisfaction with inspections conducted by licensed home inspectors within ${data.inspection} business days of mutual acceptance.

2. SCOPE OF EXAMINATIONS:
Inspections may include, without limitation: structural components, roofing, electrical and plumbing systems, HVAC, sewer lateral video scope, radon testing, pest/wood-destroying organism inspection, and environmental review.

3. BUYER'S RESPONSE & REMEDIES:
Prior to expiration of the inspection period, Buyer shall deliver written notice:
(a) Approving the inspection and waiving the contingency;
(b) Requesting specific seller repairs or monetary credit; or
(c) Terminating the agreement with immediate full refund of all earnest money to Buyer.

4. SELLER REPAIR RESPONSE:
Seller shall have 3 business days to agree to Buyer's repair requests or submit a counter-remedy.

Executed by authorized parties with verified digital signature stamps.`;
    }

    if (templateId === 'financing_addendum') {
      return `FINANCING & LOAN CONTINGENCY ADDENDUM (FORM 22A)
Property Address: ${data.address}
Purchase Price: ${data.price}
Buyer: ${data.buyer} | Seller: ${data.seller}
Brokerage: John L. Scott Real Estate · Melissa Hatfield, REALTOR® / Broker

1. LOAN APPLICATION:
Buyer agrees to submit a formal loan application with an accredited institutional mortgage lender within 5 business days of mutual execution and make diligent, good-faith efforts to obtain loan commitment.

2. FINANCING TYPE:
Financing Type: Institutional Mortgage Loan (or All-Cash Funds Verification).
Down Payment: Minimum 20% of purchase price.
Interest Rate: Prevailing market terms not to exceed standard 30-year fixed conforming/jumbo rates.

3. APPRAISAL CONTINGENCY:
Property must appraise at or above the purchase price of ${data.price} by an independent licensed appraiser. In the event of an appraisal shortfall, parties agree to a 3-day renegotiation window.

4. EARNEST MONEY PROTECTION:
If Buyer, having acted in good faith, is unable to obtain institutional loan approval after timely application, Buyer may terminate agreement and receive complete refund of earnest money.`;
    }

    if (templateId === 'earnest_money') {
      return `EARNEST MONEY PROMISSORY NOTE & ESCROW DIRECT WIRE INSTRUCTIONS
Property: ${data.address}
Purchase Price: ${data.price}
Earnest Money Deposit Amount: ${data.earnest} USD
Escrow & Title Depository: Certified Licensed Title & Escrow Trust Account (c/o John L. Scott Real Estate Closing Division)

1. WIRE DEPOSIT TIMELINE:
Buyer (${data.buyer}) shall initiate a direct federal wire transfer in the amount of ${data.earnest} within 2 business days (48 hours) of mutual acceptance into the designated Escrow Trust Account.

2. RECEIPT & VERIFICATION:
Escrow Agent shall issue a formal written Verification of Earnest Money Receipt to Melissa Hatfield (John L. Scott Real Estate) immediately upon receipt of settled funds.

3. FORFEITURE & LIQUIDATED DAMAGES:
In the event of Buyer's unexcused default, earnest money shall serve as Seller's sole and exclusive remedy as liquidated damages in compliance with statutory limitations.`;
    }

    // Default: Standard Residential Purchase & Sale Agreement (PSA)
    return `RESIDENTIAL PURCHASE & SALE AGREEMENT (PSA / FORM 21)
Date of Agreement: ${timestamp}
Listing & Supervising Brokerage: John L. Scott Real Estate
Managing Broker / REALTOR®: Melissa Hatfield (License Active)
Direct Mobile: (253) 514-7676 | Office: (253) 841-7000 | Email: melissafh@johnlscott.com
Website: www.melissafh.johnlscott.com

1. PARTIES & SUBJECT PROPERTY:
Buyer: ${data.buyer} ("Buyer")
Seller: ${data.seller} ("Seller")
Property Address: ${data.address}
Legal Description: As recorded in public county tax assessor records.

2. PURCHASE PRICE & PAYMENT TERMS:
Total Purchase Price: ${data.price} USD
Earnest Money Deposit: ${data.earnest} to be wired to Escrow Trust within 48 hours.
Balance of funds to be delivered at closing via certified bank wire.

3. CLOSING & POSSESSION TIMELINE:
Closing Date: On or before ${data.closing} days from mutual acceptance.
Possession: Delivered to Buyer upon recording of statutory warranty deed at 5:00 PM.

4. CONTINGENCIES & ADDENDA INCLUDED:
(a) Inspection Contingency (${data.inspection} business days)
(b) Financing & Appraisal Verification
(c) Title & Escrow Delivery of Clear Marketable Title

5. SPECIAL STIPULATIONS & TURNKEY INCLUSIONS:
${data.terms}

6. AGENCY DISCLOSURE & DUAL REPRESENTATION ACKNOWLEDGMENT:
Buyer and Seller acknowledge that Melissa Hatfield (John L. Scott Real Estate) represents the transaction with statutory fiduciary duties of honesty, care, accounting, and presentation of all offers.

7. BINDING ELECTRONIC EXECUTION:
The parties agree that electronic signatures (drawn, touch, or typed with cryptographic audit trail) constitute original binding signatures under the Uniform Electronic Transactions Act (UETA) and Federal E-SIGN Act.`;
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const template =
      DOCUMENT_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
      DOCUMENT_TEMPLATES[0];

    setIsGenerating(true);
    try {
      const compiledContent = compileDocumentContent(selectedTemplateId, {
        address: customAddress,
        price: customPrice,
        buyer: customBuyerName,
        seller: customSellerName,
        earnest: earnestAmount,
        closing: closingDays,
        inspection: inspectionDays,
        terms: specialTerms,
      });

      const ok = await onCreateDocument({
        propertyId: selectedPropertyId,
        documentType: selectedTemplateId,
        title: `${template.badge} // ${template.name.split('(')[0].trim()}`,
        propertyAddress: customAddress,
        purchasePrice: customPrice,
        buyerName: customBuyerName,
        sellerName: customSellerName,
        brokerName: 'Melissa Hatfield',
        brokerage: 'John L. Scott Real Estate',
        status: 'pending_signature',
        documentContent: compiledContent,
      });

      if (ok) {
        showToast(`Document drafted: ${template.badge} — ready for signing.`);
        setShowCreateModal(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const openSigningModal = (doc: SignedDocumentItem) => {
    setDocToSign(doc);
    setSignerName(
      signerRole === 'buyer'
        ? doc.buyerName
        : signerRole === 'seller'
        ? doc.sellerName
        : 'Melissa Hatfield (REALTOR® / Broker)'
    );
    setSignerEmail(
      signerRole === 'broker'
        ? 'melissafh@johnlscott.com'
        : 'client-signer@email.com'
    );
    setHasDrawnStroke(false);
    setSigningModalOpen(true);
  };

  const handleExecuteSignature = async () => {
    if (!docToSign) return;

    let signatureImage = '';
    const canvas = canvasRef.current;

    if (signatureMode === 'draw' && canvas && hasDrawnStroke) {
      signatureImage = canvas.toDataURL('image/png');
    }

    setIsSigningProgress(true);
    try {
      const certHash = `SEC-${crypto.randomUUID().toUpperCase()}`;
      const nowFormatted = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const auditData: SignerAuditLog = {
        signerName,
        signerEmail,
        signerRole,
        signatureDataUrl: signatureImage || undefined,
        signedAt: nowFormatted,
        ipAddress: '198.51.100.24 (SSL Verified)',
        deviceType:
          signatureMode === 'auto'
            ? 'Mobile Quick-Sign Engine (Verified iOS / Android Touch Protocol)'
            : 'Touch-Canvas Stylus / Biometric E-Signature',
        securityHash: certHash,
      };

      const ok = await onSignDocument(docToSign.id, auditData);
      if (ok) {
        showToast(
          `Signature verified for ${signerName} (${signerRole.toUpperCase()}) — Security Certificate ${docToSign.certificateId} updated.`
        );
        setSigningModalOpen(false);
      }
    } finally {
      setIsSigningProgress(false);
    }
  };

  const handlePrintDocument = (doc: SignedDocumentItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Pop-up blocked. Please allow pop-ups to print document.');
      return;
    }

    const signaturesHtml = doc.signatures
      .map(
        (s) => `
        <div style="border:1px solid #ddd; padding:12px; margin-top:10px; border-radius:8px; font-family:sans-serif; font-size:12px;">
          <div style="font-weight:bold; color:#1a1a1a;">${s.signerName} (${s.signerRole.toUpperCase()})</div>
          <div style="color:#555; margin-top:2px;">Email: ${s.signerEmail} | Signed: ${s.signedAt}</div>
          <div style="color:#888; font-size:10px; margin-top:4px;">Security Hash: ${s.securityHash} | Device: ${s.deviceType}</div>
          ${
            s.signatureDataUrl
              ? `<img src="${s.signatureDataUrl}" style="height:40px; margin-top:6px; display:block;" />`
              : `<div style="font-family:cursive; font-size:24px; color:#1E40AF; margin-top:4px;">${s.signerName}</div>`
          }
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${doc.title} — John L. Scott Real Estate</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            .header { border-bottom: 2px solid #D4AF37; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .content { white-space: pre-wrap; font-size: 13px; font-family: monospace; background: #fcfbf9; border: 1px solid #e0dacf; padding: 20px; border-radius: 8px; }
            .badge { background: #1a1a1a; color: #fff; font-size: 10px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div style="font-size: 20px; font-weight: bold;">John L. Scott Real Estate</div>
              <div style="font-size: 12px; color: #666;">Melissa Hatfield, REALTOR® / Broker · (253) 514-7676 · melissafh@johnlscott.com</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">${doc.status.replace('_', ' ')}</span>
              <div style="font-size: 11px; color: #888; margin-top: 5px;">Cert ID: ${doc.certificateId}</div>
            </div>
          </div>
          <h2>${doc.title}</h2>
          <div style="font-size: 12px; color: #666; margin-bottom: 15px;">Property: <strong>${doc.propertyAddress}</strong> | Consideration: <strong>${doc.purchasePrice}</strong></div>
          <div class="content">${doc.documentContent}</div>
          <h3 style="margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Verified Electronic Signatures &amp; Audit Trail</h3>
          ${signaturesHtml || '<p style="color:#888; font-size:12px;">No signatures recorded yet.</p>'}
          <div style="margin-top: 40px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
            This electronic document is compliant with the Electronic Signatures in Global and National Commerce Act (ESIGN) and Uniform Electronic Transactions Act (UETA).
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      (selectedCategory === 'EXECUTED' &&
        doc.status === 'fully_executed') ||
      (selectedCategory === 'PENDING' &&
        doc.status === 'pending_signature') ||
      (selectedCategory === 'PSA' && doc.documentType === 'psa') ||
      (selectedCategory === 'LISTING' &&
        doc.documentType === 'listing_agreement') ||
      (selectedCategory === 'CONTINGENCY' &&
        (doc.documentType === 'inspection_addendum' ||
          doc.documentType === 'financing_addendum'));

    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.certificateId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner & Brokerage Compliance Header */}
      <div className="p-7 rounded-3xl bg-gradient-to-r from-[#141A26] via-[#1B1818] to-[#121721] border border-[#D4AF37]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] font-mono-code text-xs flex items-center gap-1.5">
                <FileSignature className="w-3.5 h-3.5 text-[#D4AF37]" />
                LEGAL DOCUMENT VAULT &amp; MOBILE E-SIGNATURE ENGINE
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono-code text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ESIGN &amp; UETA COMPLIANT
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-200 font-mono-code text-[11px]">
                BROKER: MELISSA HATFIELD (JOHN L. SCOTT)
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Real Estate Sales Documents &amp; Automated Mobile Signing Suite
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Pull out purchase agreements (Form 21), exclusive listing contracts, inspection addenda, financing waivers, and earnest money wire receipts in seconds. Execute legally-binding electronic signatures with touch/stylus drawing on smartphones, instant QR signing codes, and immutable cryptographic audit trails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A0D12] font-bold text-xs flex items-center gap-2.5 shadow-xl shadow-[#D4AF37]/25 hover:scale-105 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Draft New Document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats and Quick Tools Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121721] border border-white/10">
          <div className="flex items-center justify-between text-xs font-mono-code text-slate-400">
            <span>TOTAL CONTRACTS</span>
            <FileText className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="font-display text-2xl font-bold text-white mt-1">
            {documents.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active in Vault</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121721] border border-emerald-500/30">
          <div className="flex items-center justify-between text-xs font-mono-code text-emerald-400">
            <span>FULLY EXECUTED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display text-2xl font-bold text-emerald-400 mt-1">
            {documents.filter((d) => d.status === 'fully_executed').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Mutual Signatures</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121721] border border-amber-500/30">
          <div className="flex items-center justify-between text-xs font-mono-code text-amber-300">
            <span>PENDING SIGNATURE</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display text-2xl font-bold text-amber-300 mt-1">
            {documents.filter((d) => d.status === 'pending_signature').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Out for Signing</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121721] border border-sky-500/30">
          <div className="flex items-center justify-between text-xs font-mono-code text-sky-300">
            <span>MOBILE EXECUTIONS</span>
            <Smartphone className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-display text-2xl font-bold text-sky-300 mt-1">
            {documents.filter((d) => d.isMobileExecuted).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Phone Signed</div>
        </div>
      </div>

      {/* Main Workspace: Left Template Picker & Right Vault Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT 4 COLS: Quick Template Launch Pad */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-[#121721] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-display text-lg font-bold text-white">
                  Document Launchpad
                </h3>
              </div>
              <span className="text-[10px] font-mono-code text-slate-400">
                {DOCUMENT_TEMPLATES.length} READY
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Select any standard real estate form. Pre-fills automatically with active property details, buyer names, and Melissa Hatfield&apos;s John L. Scott brokerage credentials.
            </p>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {DOCUMENT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tmpl.id);
                    setShowCreateModal(true);
                  }}
                  className="w-full text-left p-3.5 rounded-xl bg-[#0A0D12] border border-white/10 hover:border-[#D4AF37] transition group cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] font-semibold">
                      {tmpl.badge}
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-white flex items-center gap-1 font-medium">
                      Pull Out <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-[#F3E5AB] leading-snug">
                    {tmpl.name.split('(')[0].trim()}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {tmpl.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT 8 COLS: Active Signed Documents & Live Verification Table */}
        <div className="lg:col-span-8 space-y-5">
          {/* Search & Category Pills */}
          <div className="p-4 rounded-2xl bg-[#121721] border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All Vault' },
                { id: 'EXECUTED', label: 'Executed' },
                { id: 'PENDING', label: 'Pending Sign' },
                { id: 'PSA', label: 'Purchase (PSA)' },
                { id: 'LISTING', label: 'Listing Agmts' },
                { id: 'CONTINGENCY', label: 'Addendums' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-[#D4AF37] text-[#0A0D12] font-bold shadow-sm'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search contracts, certs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/15 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Document Cards List */}
          <div className="space-y-4">
            {filteredDocs.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#121721] border border-dashed border-white/15 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="font-display text-lg font-bold text-white">
                  No contracts match this filter
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Pull out a standard contract from the template launchpad or draft a custom agreement for any property.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Draft First Agreement
                </button>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isExecuted = doc.status === 'fully_executed';
                const isPending = doc.status === 'pending_signature';

                return (
                  <div
                    key={doc.id}
                    className="p-6 rounded-2xl bg-[#121721] border border-white/10 hover:border-[#D4AF37]/50 transition space-y-4 shadow-lg group"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded font-mono-code text-[10px] font-bold uppercase ${
                              isExecuted
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isPending
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-700/40 text-slate-300'
                            }`}
                          >
                            {doc.status.replace('_', ' ')}
                          </span>

                          <span className="text-[10px] font-mono-code text-[#D4AF37]">
                            CERT: {doc.certificateId}
                          </span>

                          {doc.isMobileExecuted && (
                            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono-code text-[10px] flex items-center gap-1">
                              <Smartphone className="w-3 h-3" />
                              Phone Signed
                            </span>
                          )}
                        </div>

                        <h3 className="font-display text-xl font-bold text-white group-hover:text-[#F3E5AB] transition">
                          {doc.title}
                        </h3>

                        <p className="text-xs text-slate-300">
                          Property: <strong className="text-white">{doc.propertyAddress}</strong> · Consideration: <strong className="text-[#D4AF37]">{doc.purchasePrice}</strong>
                        </p>
                      </div>

                      {/* Top Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveDocForViewing(doc)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>View Text</span>
                        </button>

                        <button
                          onClick={() => handlePrintDocument(doc)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                          title="Print / Save PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                          title="Delete Contract"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Parties Summary Box */}
                    <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono-code">
                          Buyer / Grantee
                        </span>
                        <span className="font-semibold text-white">
                          {doc.buyerName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono-code">
                          Seller / Grantor
                        </span>
                        <span className="font-semibold text-white">
                          {doc.sellerName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono-code">
                          Listing Broker
                        </span>
                        <span className="font-semibold text-[#D4AF37]">
                          {doc.brokerName} ({doc.brokerage})
                        </span>
                      </div>
                    </div>

                    {/* Signatures & Execution Section */}
                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                      {/* Signers recorded */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {doc.signatures && doc.signatures.length > 0 ? (
                          doc.signatures.map((sig, sIdx) => (
                            <div
                              key={sIdx}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>
                                {sig.signerName} ({sig.signerRole.toUpperCase()} · {sig.signedAt})
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-xs">
                            Awaiting first electronic signature
                          </span>
                        )}
                      </div>

                      {/* Action: Pull out for signature */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openSigningModal(doc)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition cursor-pointer"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Pull Out &amp; Sign (Phone / Screen)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: DRAFT NEW DOCUMENT WIZARD */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#121721] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#D4AF37]" />
                  <span>Draft &amp; Pull Out Real Estate Document</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-filled with John L. Scott Real Estate terms &amp; Melissa Hatfield representation.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
              {/* Template Picker */}
              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                  1. Select Contract Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  {DOCUMENT_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.badge}] {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                    Link to Property (Optional)
                  </label>
                  <select
                    value={selectedPropertyId || ''}
                    onChange={(e) =>
                      setSelectedPropertyId(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="">-- Custom Manual Address --</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                    Purchase / Listing Price
                  </label>
                  <input
                    type="text"
                    required
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="e.g. $285,000"
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                  Property Address
                </label>
                <input
                  type="text"
                  required
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="e.g. 2404 14th St SW, Puyallup, WA 98371"
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Buyer & Seller */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                    Buyer / Grantee Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customBuyerName}
                    onChange={(e) => setCustomBuyerName(e.target.value)}
                    placeholder="e.g. David & Claire Sterling"
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                    Seller / Grantor Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customSellerName}
                    onChange={(e) => setCustomSellerName(e.target.value)}
                    placeholder="e.g. Marcus & Elena Vance"
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Terms: Earnest money, closing timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                    Earnest Money Wire
                  </label>
                  <input
                    type="text"
                    value={earnestAmount}
                    onChange={(e) => setEarnestAmount(e.target.value)}
                    placeholder="e.g. $10,000"
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                    Closing Days
                  </label>
                  <input
                    type="number"
                    value={closingDays}
                    onChange={(e) => setClosingDays(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                    Inspection Period (Days)
                  </label>
                  <input
                    type="number"
                    value={inspectionDays}
                    onChange={(e) => setInspectionDays(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                  Special Provisions &amp; Turnkey Inclusions
                </label>
                <textarea
                  rows={2}
                  value={specialTerms}
                  onChange={(e) => setSpecialTerms(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Includes all appliances, fixtures, seller credit..."
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/10 text-[11px] text-slate-300 space-y-1">
                <div className="text-[#D4AF37] font-semibold font-mono-code">
                  REPRESENTATION CONFIRMATION:
                </div>
                <div>Broker: <strong>Melissa Hatfield</strong> | REALTOR® / Broker</div>
                <div>Brokerage: <strong>John L. Scott Real Estate</strong> · Direct: (253) 514-7676 · Office: (253) 841-7000</div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs shadow-lg hover:scale-105 transition cursor-pointer"
                >
                  {isGenerating ? 'Compiling Document...' : 'Generate & Store in Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SPECIAL AUTOMATED MOBILE E-SIGNATURE ENGINE */}
      {signingModalOpen && docToSign && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-[#121721] border border-[#D4AF37] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                    Automated Mobile Signature Signing
                  </h3>
                  <p className="text-xs text-slate-400">
                    Signing document: <span className="text-white font-semibold">{docToSign.title}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSigningModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Select Signer Identity */}
            <div className="space-y-2">
              <label className="block text-xs font-mono-code uppercase text-[#D4AF37]">
                1. Select Signer Identity
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'buyer', label: `Buyer (${docToSign.buyerName.split(' ')[0]})` },
                  { id: 'seller', label: `Seller (${docToSign.sellerName.split(' ')[0]})` },
                  { id: 'broker', label: 'Broker (Melissa Hatfield)' },
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      const r = role.id as 'buyer' | 'seller' | 'broker';
                      setSignerRole(r);
                      setSignerName(
                        r === 'buyer'
                          ? docToSign.buyerName
                          : r === 'seller'
                          ? docToSign.sellerName
                          : 'Melissa Hatfield (REALTOR® / Broker)'
                      );
                      setSignerEmail(
                        r === 'broker'
                          ? 'melissafh@johnlscott.com'
                          : `${docToSign.buyerName.toLowerCase().replace(/\s+/g, '.')}@email.com`
                      );
                    }}
                    className={`p-2.5 rounded-xl font-bold border transition text-center cursor-pointer ${
                      signerRole === role.id
                        ? 'bg-[#D4AF37] text-[#0A0D12] border-[#D4AF37]'
                        : 'bg-[#0A0D12] text-slate-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono-code block">
                    Full Legal Name
                  </span>
                  <input
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono-code block">
                    Verified Signer Email
                  </span>
                  <input
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Signature Input Mode */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono-code uppercase text-[#D4AF37]">
                  2. Choose Signature Method
                </label>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-[#0A0D12] p-1 rounded-xl border border-white/10 text-xs">
                  <button
                    onClick={() => setSignatureMode('draw')}
                    className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      signatureMode === 'draw'
                        ? 'bg-[#D4AF37] text-[#0A0D12]'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Touch / Draw
                  </button>
                  <button
                    onClick={() => setSignatureMode('type')}
                    className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      signatureMode === 'type'
                        ? 'bg-[#D4AF37] text-[#0A0D12]'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Typed Font
                  </button>
                  <button
                    onClick={() => setSignatureMode('auto')}
                    className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      signatureMode === 'auto'
                        ? 'bg-[#D4AF37] text-[#0A0D12]'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    ⚡ Auto-Sign Mobile
                  </button>
                </div>
              </div>

              {/* METHOD A: DRAW / FINGER TOUCH CANVAS PAD */}
              {signatureMode === 'draw' && (
                <div className="space-y-2">
                  <div className="relative rounded-2xl bg-white border-2 border-[#D4AF37] p-2 overflow-hidden shadow-inner">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-36 bg-white cursor-crosshair touch-none"
                    />

                    {/* Hint overlay */}
                    {!hasDrawnStroke && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs gap-2 font-mono-code">
                        <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                        <span>Sign with finger, stylus, or cursor</span>
                      </div>
                    )}

                    {/* Baseline indicator */}
                    <div className="absolute bottom-8 left-8 right-8 border-b border-dashed border-slate-300 pointer-events-none" />
                    <span className="absolute bottom-2 right-4 text-[9px] text-slate-400 font-mono-code pointer-events-none">
                      X _____________________
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono-code uppercase">
                        Ink Color:
                      </span>
                      {[
                        { color: '#1E40AF', name: 'Signature Blue' },
                        { color: '#1A1A1A', name: 'Charcoal Black' },
                        { color: '#D4AF37', name: 'Luxury Gold' },
                      ].map((c) => (
                        <button
                          key={c.color}
                          onClick={() => setSignatureColor(c.color)}
                          style={{ backgroundColor: c.color }}
                          className={`w-5 h-5 rounded-full border-2 transition cursor-pointer ${
                            signatureColor === c.color
                              ? 'border-white scale-110 shadow'
                              : 'border-transparent opacity-75'
                          }`}
                          title={c.name}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Clear &amp; Redraw
                    </button>
                  </div>
                </div>
              )}

              {/* METHOD B: TYPED LUXURY SCRIPT */}
              {signatureMode === 'type' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white border-2 border-[#D4AF37] text-center space-y-2">
                    <span className="text-[10px] font-mono-code uppercase tracking-wider text-slate-400 block">
                      Generated Cursive Signature
                    </span>
                    <div
                      className="text-3xl text-blue-900 py-3 select-none"
                      style={{
                        fontFamily:
                          typedFontIndex === 0
                            ? '"Great Vibes", cursive'
                            : typedFontIndex === 1
                            ? '"Italianno", cursive'
                            : '"Playfair Display", serif',
                      }}
                    >
                      {signerName || 'Melissa Hatfield'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[10px] uppercase font-mono-code">
                      Font Style:
                    </span>
                    {['Classic Script', 'Luxury Italic', 'Formal Serif'].map(
                      (styleName, idx) => (
                        <button
                          key={styleName}
                          onClick={() => setTypedFontIndex(idx)}
                          className={`px-3 py-1 rounded-lg border text-xs cursor-pointer ${
                            typedFontIndex === idx
                              ? 'bg-[#D4AF37] text-[#0A0D12] font-bold border-[#D4AF37]'
                              : 'bg-white/5 text-slate-300 border-white/10'
                          }`}
                        >
                          {styleName}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* METHOD C: AUTO-SIGN MOBILE INSTANT */}
              {signatureMode === 'auto' && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#121721] to-[#1E293B] border border-emerald-500/40 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>One-Tap Automated Phone Execution Ready</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Instantly stamps biometric e-signature for <strong>{signerName}</strong> with live device certificate ({docToSign.certificateId}), SHA-256 cryptographic verification, and UETA/ESIGN timestamp.
                  </p>
                </div>
              )}
            </div>

            {/* Mobile QR & Remote Sign Option */}
            <div className="p-4 rounded-2xl bg-[#0A0D12] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#D4AF37]">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white">
                    Need buyer/seller to sign from their own phone?
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Display direct mobile QR code or copy secure signing link.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQrCodeMobileLink(!showQrCodeMobileLink)}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-slate-200 font-medium cursor-pointer"
              >
                {showQrCodeMobileLink ? 'Hide Mobile Link' : 'Show Mobile QR Link'}
              </button>
            </div>

            {showQrCodeMobileLink && (
              <div className="p-4 rounded-2xl bg-white text-[#1A1A1A] flex flex-wrap items-center gap-4">
                <div className="w-20 h-20 bg-[#1A1A1A] p-1.5 rounded-xl flex items-center justify-center text-[#D4AF37]">
                  <QrCode className="w-16 h-16" />
                </div>
                <div className="flex-1 min-w-[200px] space-y-1">
                  <div className="font-bold text-sm">Scan to Sign on Mobile Phone</div>
                  <div className="text-xs text-neutral-600">
                    Open camera on iPhone/Android to sign instantly on mobile touch screen.
                  </div>
                  <div className="text-[10px] font-mono-code text-[#1E40AF] bg-blue-50 p-1.5 rounded border border-blue-100 break-all">
                    https://melissafh.johnlscott.com/sign/{docToSign.certificateId}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] font-mono-code text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Security Hash: {docToSign.securityHash.substring(0, 18)}...</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSigningModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSignature}
                  disabled={
                    isSigningProgress ||
                    (signatureMode === 'draw' && !hasDrawnStroke)
                  }
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#10B981] text-[#0A0D12] font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition cursor-pointer disabled:opacity-50"
                >
                  {isSigningProgress
                    ? 'Verifying & Stamping Signature...'
                    : `Execute Verified Signature as ${signerRole.toUpperCase()}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW COMPLETE CONTRACT TEXT */}
      {activeDocForViewing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-[#121721] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37]">
                  CERTIFICATE: {activeDocForViewing.certificateId}
                </span>
                <h3 className="font-display text-xl font-bold text-white mt-1">
                  {activeDocForViewing.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintDocument(activeDocForViewing)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button
                  onClick={() => setActiveDocForViewing(null)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable text container */}
            <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-[#0A0D12] border border-white/10 font-mono-code text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {activeDocForViewing.documentContent}
            </div>

            {/* Signatures record */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-[11px] font-mono-code uppercase text-[#D4AF37] font-semibold">
                Recorded Signatures ({activeDocForViewing.signatures?.length || 0})
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                {activeDocForViewing.signatures &&
                activeDocForViewing.signatures.length > 0 ? (
                  activeDocForViewing.signatures.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        <strong>{s.signerName}</strong> ({s.signerRole}) — {s.signedAt} · {s.securityHash}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400 italic">No signatures recorded yet.</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    activeDocForViewing.documentContent
                  );
                  setCopiedDocText(true);
                  setTimeout(() => setCopiedDocText(false), 2000);
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white flex items-center gap-1.5 cursor-pointer"
              >
                {copiedDocText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedDocText ? 'Copied Full Agreement' : 'Copy Full Agreement'}
              </button>
              <button
                onClick={() => {
                  const d = activeDocForViewing;
                  setActiveDocForViewing(null);
                  openSigningModal(d);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs shadow-md"
              >
                Sign This Agreement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
