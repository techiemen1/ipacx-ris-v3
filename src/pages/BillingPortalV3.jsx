// FILE: src/pages/BillingPortalV3.jsx
import React, { useState } from "react";
import { CreditCard, QrCode, ShieldCheck, DollarSign, Printer, CheckCircle2, FileText, ArrowRight, Zap, RefreshCw, Smartphone } from "lucide-react";

const INITIAL_INVOICES = [
  {
    id: "INV-2026-88192",
    accessionNumber: "ACC-882910",
    patientName: "DESHMUKH^PRIYA",
    patientMrn: "MRN-48912",
    modality: "US",
    procedureName: "OBSTETRIC FETAL ANOMALY SCAN (18-22 WEEKS) - ISUOG LEVEL II",
    sacCode: "999312",
    baseAmount: 3500.00,
    gstRate: 5,
    cgstAmount: 87.50,
    sgstAmount: 87.50,
    totalAmount: 3675.00,
    discountAmount: 0.00,
    paymentMethod: "UPI_QR",
    paymentStatus: "PAID",
    transactionRef: "UPI/6291028491/GPay",
    insuranceTpa: "N/A",
    createdAt: "10:20 AM"
  },
  {
    id: "INV-2026-55102",
    accessionNumber: "ACC-551920",
    patientName: "KAPOOR^ANANYA",
    patientMrn: "MRN-19203",
    modality: "US",
    procedureName: "TRANSVAGINAL ULTRASOUND (TVS) + COLOR DOPPLER PELVIS",
    sacCode: "999312",
    baseAmount: 2800.00,
    gstRate: 5,
    cgstAmount: 70.00,
    sgstAmount: 70.00,
    totalAmount: 2940.00,
    discountAmount: 0.00,
    paymentMethod: "INSURANCE_TPA",
    paymentStatus: "PRE_AUTHORIZED",
    transactionRef: "PA-2026-991823",
    insuranceTpa: "Star Health & Allied Insurance",
    createdAt: "09:50 AM"
  }
];

const BillingPortalV3 = () => {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("UPI_QR"); // UPI_QR, CARD, INSURANCE, CASH
  const [billingForm, setBillingForm] = useState({
    accessionNumber: "ACC-992102",
    patientName: "SHARMA^NEHA",
    patientMrn: "MRN-33019",
    modality: "US",
    procedureName: "NT SCAN (11-13+6 WEEKS) + NASAL BONE & DUCTUS VENOSUS",
    baseAmount: 2500,
    gstRate: 5,
    discountAmount: 0,
    insuranceTpa: "Star Health Insurance",
    preAuthNo: "PA-2026-77812",
    cardNumber: "**** **** **** 4819",
    cardHolder: "NEHA SHARMA"
  });

  const [activeReceipt, setActiveReceipt] = useState(null);
  const [successBanner, setSuccessBanner] = useState("");

  const calculateTotals = () => {
    const base = parseFloat(billingForm.baseAmount || 0);
    const disc = parseFloat(billingForm.discountAmount || 0);
    const net = Math.max(0, base - disc);
    const gstPct = parseFloat(billingForm.gstRate || 5);
    const totalGst = (net * gstPct) / 100;
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const grand = net + totalGst;

    return { net, totalGst, cgst, sgst, grand };
  };

  const { net, cgst, sgst, grand } = calculateTotals();

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    const newInv = {
      id: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      accessionNumber: billingForm.accessionNumber,
      patientName: billingForm.patientName.toUpperCase(),
      patientMrn: billingForm.patientMrn,
      modality: billingForm.modality,
      procedureName: billingForm.procedureName,
      sacCode: "999312",
      baseAmount: parseFloat(billingForm.baseAmount),
      gstRate: parseFloat(billingForm.gstRate),
      cgstAmount: cgst,
      sgstAmount: sgst,
      totalAmount: grand,
      discountAmount: parseFloat(billingForm.discountAmount || 0),
      paymentMethod: selectedPaymentMode,
      paymentStatus: selectedPaymentMode === "INSURANCE" ? "PRE_AUTHORIZED" : "PAID",
      transactionRef: selectedPaymentMode === "UPI_QR" ? `UPI/${Math.floor(1000000000 + Math.random() * 9000000000)}/Paytm` : selectedPaymentMode === "CARD" ? `CARD/AUTH-${Math.floor(100000 + Math.random() * 900000)}` : `PA-${billingForm.preAuthNo}`,
      insuranceTpa: selectedPaymentMode === "INSURANCE" ? billingForm.insuranceTpa : "N/A",
      createdAt: new Date().toLocaleTimeString()
    };

    setInvoices([newInv, ...invoices]);
    setActiveReceipt(newInv);
    setSuccessBanner(`✅ Tax Invoice ${newInv.id} created! Payment confirmed via ${selectedPaymentMode}`);
    setTimeout(() => setSuccessBanner(""), 4000);
  };

  const upiString = `upi://pay?pa=ipacx@hdfcbank&pn=iPaCX%20Radiology&am=${grand.toFixed(2)}&tn=RIS-${billingForm.accessionNumber}&cu=INR`;

  return (
    <div className="billing-portal-v3 p-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <header className="pb-6 border-b border-slate-800 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30">
              <CreditCard size={24} />
            </span>
            Indian Diagnostic Billing & Online Payment Portal
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-medium flex items-center gap-2">
            <span>SAC Code 999312 Healthcare Standard</span> •
            <span className="text-emerald-400 font-bold">UPI QR, Online Cards & TPA Insurance Claims</span>
          </p>
        </div>

        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck size={14} /> GSTIN: 27AAAAA0000A1Z5
          </span>
        </div>
      </header>

      {successBanner && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={18} /> {successBanner}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Generator Form */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <h2 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="flex items-center gap-2">
              <FileText size={18} className="text-emerald-400" /> Patient Billing & GST Tax Calculation
            </span>
            <span className="text-[11px] font-mono text-cyan-400">SAC Code: 999312</span>
          </h2>

          <form onSubmit={handleCreateInvoice} className="space-y-5 text-xs font-medium">
            {/* Patient Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Accession Number</label>
                <input
                  type="text"
                  value={billingForm.accessionNumber}
                  onChange={(e) => setBillingForm({ ...billingForm, accessionNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-400 font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Patient Name</label>
                <input
                  type="text"
                  value={billingForm.patientName}
                  onChange={(e) => setBillingForm({ ...billingForm, patientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">MRN Number</label>
                <input
                  type="text"
                  value={billingForm.patientMrn}
                  onChange={(e) => setBillingForm({ ...billingForm, patientMrn: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-purple-400 font-mono font-bold text-xs"
                />
              </div>
            </div>

            {/* Procedure & Amounts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Procedure Name</label>
                <input
                  type="text"
                  value={billingForm.procedureName}
                  onChange={(e) => setBillingForm({ ...billingForm, procedureName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Base Rate (₹)</label>
                <input
                  type="number"
                  value={billingForm.baseAmount}
                  onChange={(e) => setBillingForm({ ...billingForm, baseAmount: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-bold font-mono"
                />
              </div>
            </div>

            {/* GST Slabs & Discount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">GST Slab Rate</label>
                <select
                  value={billingForm.gstRate}
                  onChange={(e) => setBillingForm({ ...billingForm, gstRate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  <option value={0}>0% (Exempted Service)</option>
                  <option value={5}>5% (Healthcare Diagnostic Standard)</option>
                  <option value={12}>12% (Equipment / Reagent Surcharge)</option>
                  <option value={18}>18% (Commercial / Contrast Imaging)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Discount (₹)</label>
                <input
                  type="number"
                  value={billingForm.discountAmount}
                  onChange={(e) => setBillingForm({ ...billingForm, discountAmount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Computed Net Total</label>
                <div className="text-lg font-black text-emerald-400 font-mono pt-1">
                  ₹{grand.toFixed(2)}
                  <span className="text-[10px] text-slate-400 font-normal block">CGST ₹{cgst.toFixed(2)} + SGST ₹{sgst.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector Cards */}
            <div className="space-y-3">
              <label className="block text-slate-300 font-bold uppercase text-[10px]">Select Payment Mode</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* UPI QR */}
                <div
                  onClick={() => setSelectedPaymentMode("UPI_QR")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center ${
                    selectedPaymentMode === "UPI_QR"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <QrCode size={22} className={selectedPaymentMode === "UPI_QR" ? "text-emerald-400" : ""} />
                  <span className="font-bold text-xs">UPI Scan & Pay</span>
                  <span className="text-[9px] opacity-75">GPay, PhonePe, Paytm</span>
                </div>

                {/* Card */}
                <div
                  onClick={() => setSelectedPaymentMode("CARD")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center ${
                    selectedPaymentMode === "CARD"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard size={22} className={selectedPaymentMode === "CARD" ? "text-emerald-400" : ""} />
                  <span className="font-bold text-xs">Credit / Debit Card</span>
                  <span className="text-[9px] opacity-75">Visa, Mastercard, RuPay</span>
                </div>

                {/* Insurance / TPA */}
                <div
                  onClick={() => setSelectedPaymentMode("INSURANCE")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center ${
                    selectedPaymentMode === "INSURANCE"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <ShieldCheck size={22} className={selectedPaymentMode === "INSURANCE" ? "text-emerald-400" : ""} />
                  <span className="font-bold text-xs">TPA Insurance</span>
                  <span className="text-[9px] opacity-75">Star Health, PM-JAY</span>
                </div>

                {/* Cash Desk */}
                <div
                  onClick={() => setSelectedPaymentMode("CASH")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center ${
                    selectedPaymentMode === "CASH"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <DollarSign size={22} className={selectedPaymentMode === "CASH" ? "text-emerald-400" : ""} />
                  <span className="font-bold text-xs">Cash Desk</span>
                  <span className="text-[9px] opacity-75">Direct Desk Receipt</span>
                </div>
              </div>
            </div>

            {/* Dynamic Interactive Payment Preview Box */}
            {selectedPaymentMode === "UPI_QR" && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex flex-col md:flex-row items-center gap-6">
                <div className="p-3 bg-white rounded-xl shadow-lg">
                  {/* Dynamic Graphic UPI QR Code Box */}
                  <div className="w-36 h-36 border-4 border-slate-950 flex flex-col items-center justify-center p-2 text-slate-900 bg-white relative">
                    <QrCode size={110} className="text-slate-900" />
                    <span className="text-[8px] font-black tracking-tighter uppercase font-mono mt-0.5">BHIM UPI QR</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Smartphone size={16} /> Instant Dynamic UPI Payment QR Active
                  </span>
                  <p className="text-slate-400 text-[11px]">Scan using GPay, PhonePe, Paytm, or BHIM to pay <strong className="text-white">₹{grand.toFixed(2)}</strong></p>
                  <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-cyan-400 border border-slate-800 truncate max-w-sm">
                    {upiString}
                  </div>
                </div>
              </div>
            )}

            {selectedPaymentMode === "INSURANCE" && (
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">TPA Provider Name</label>
                  <input
                    type="text"
                    value={billingForm.insuranceTpa}
                    onChange={(e) => setBillingForm({ ...billingForm, insuranceTpa: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Pre-Authorization Claim Approval No.</label>
                  <input
                    type="text"
                    value={billingForm.preAuthNo}
                    onChange={(e) => setBillingForm({ ...billingForm, preAuthNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-400 font-mono font-bold"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <CreditCard size={16} /> Confirm Payment & Generate Tax Invoice
              </button>
            </div>
          </form>
        </div>

        {/* Audit Invoice List & Printable Modal */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <Printer size={18} className="text-emerald-400" /> Recent Diagnostic Invoices ({invoices.length})
              </span>
            </h2>

            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setActiveReceipt(inv)}
                  className={`p-4 rounded-xl border text-xs space-y-2 cursor-pointer transition-all ${
                    activeReceipt?.id === inv.id ? "bg-slate-900 border-emerald-500" : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="font-extrabold text-white flex justify-between items-center">
                    <span>{inv.patientName}</span>
                    <span className="text-emerald-400 font-mono font-bold">₹{inv.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono flex justify-between">
                    <span>{inv.id}</span>
                    <span>Acc: {inv.accessionNumber}</span>
                  </div>

                  <div className="text-[11px] text-slate-300 font-medium truncate">{inv.procedureName}</div>

                  <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">{inv.paymentMethod}</span>
                    <span className="text-slate-400">{inv.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-lg w-full space-y-4 text-xs font-medium">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">iPaCX RADIOLOGY & DIAGNOSTIC CENTER</h3>
                <p className="text-[10px] text-slate-400">GSTIN: 27AAAAA0000A1Z5 • SAC Code: 999312</p>
              </div>
              <button onClick={() => setActiveReceipt(null)} className="text-slate-400 hover:text-white font-bold text-base">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between text-cyan-400 font-bold">
                <span>INVOICE #: {activeReceipt.id}</span>
                <span>DATE: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>PATIENT: {activeReceipt.patientName}</span>
                <span>MRN: {activeReceipt.patientMrn}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>ACCESSION #: {activeReceipt.accessionNumber}</span>
                <span>MODALITY: {activeReceipt.modality}</span>
              </div>
            </div>

            <div className="space-y-1.5 border-b border-slate-800 pb-3">
              <div className="font-bold text-white flex justify-between">
                <span>{activeReceipt.procedureName}</span>
                <span>₹{activeReceipt.baseAmount.toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>CGST (2.5%)</span>
                <span>₹{activeReceipt.cgstAmount.toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>SGST (2.5%)</span>
                <span>₹{activeReceipt.sgstAmount.toFixed(2)}</span>
              </div>
              <div className="font-black text-sm text-emerald-400 flex justify-between pt-2 border-t border-slate-800">
                <span>GRAND TOTAL PAID</span>
                <span>₹{activeReceipt.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex justify-between items-center pt-1">
              <span>TXN REF: {activeReceipt.transactionRef}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">{activeReceipt.paymentStatus}</span>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
              >
                <Printer size={14} /> Print GST Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPortalV3;
