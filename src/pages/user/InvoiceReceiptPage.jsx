import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserHeader from '../../components/Layout/UserHeader';
import { getUserAuth, registrationApi } from '../../services/api';

const InvoiceReceiptPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const auth = getUserAuth();
    if (!auth || !auth.token) {
      navigate('/user/login');
      return;
    }

    async function loadInvoices() {
      try {
        setLoading(true);
        const res = await registrationApi.getInvoices();
        if (res.status && res.data) {
          setInvoices(res.data);
        }
      } catch (err) {
        console.error('Error fetching invoices:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, [navigate]);

  const handleDownloadPdf = async (inv) => {
    try {
      setDownloadingId(inv.id);
      const cleanNum = (inv.invoice_number || 'invoice').replace(/[^a-zA-Z0-9-_]/g, '_');
      await registrationApi.downloadInvoicePdf(inv.id, `SPCTT_${cleanNum}.pdf`);
    } catch (err) {
      console.error('Error downloading invoice PDF:', err);
      alert('Failed to download invoice PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <UserHeader pageTitle="Invoice(s) & Receipt(s)" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Conference Invoices & Payment Receipts</h2>
            <p className="text-sm text-gray-500">Download or print your Proforma Invoices and Official Tax Receipts</p>
          </div>
          <Link
            to="/user/dashboard"
            className="text-sm text-[#004b63] hover:underline font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500">
            <div className="w-8 h-8 border-4 border-[#004b63] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-600 mb-4">No invoices generated yet.</p>
            <Link
              to="/user/registration"
              className="bg-[#9e1c2b] text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-[#831422] transition-colors inline-block"
            >
              Start Registration
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#004b63]">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">{inv.title}</div>
                        <div className="text-xs text-gray-500">{inv.description}</div>
                      </td>
                      <td className="py-3.5 px-4 capitalize">
                        <span className="text-xs px-2.5 py-1 rounded bg-gray-100 text-gray-700 font-medium">
                          {inv.invoice_type ? inv.invoice_type.replace('_', ' ') : 'Invoice'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        {formatCurrency(inv.total_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                          }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="text-[#004b63] hover:text-[#00384a] font-semibold text-xs border border-[#004b63]/30 px-2.5 py-1.5 rounded hover:bg-teal-50 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(inv)}
                            disabled={downloadingId === inv.id}
                            className="bg-[#9e1c2b] hover:bg-[#831422] text-white font-medium text-xs px-2.5 py-1.5 rounded transition-colors disabled:opacity-50"
                          >
                            {downloadingId === inv.id ? 'Downloading...' : '📥 PDF'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal / Printable Invoice View */}
            {selectedInvoice && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl p-0 overflow-hidden relative animate-scaleUp my-8 border border-gray-200">
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold z-10 transition-colors"
                  >
                    ✕
                  </button>

                  {/* Header Banner Image with Red and Black Theme Overlay */}
                  <div className="relative w-full overflow-hidden border border-[#C0192B]">
                    <img
                      src="https://pub-32253d31098b4cfc9f901824d48b3dc5.r2.dev/assets/spctt_2027_banner_header.png"
                      alt="SPCTT 2027 Header"
                      className="w-full h-36 sm:h-40 md:h-44 object-cover block"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/88 to-white/80 p-4 sm:p-5 flex flex-col justify-between text-gray-900">
                      {/* Top Row: Title, Subtitle, Dates, Venue */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="max-w-[58%] sm:max-w-[62%]">
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#C0192B] tracking-tight leading-none drop-shadow-sm">
                            4th SPCTT 2027
                          </h2>
                          <p className="text-xs sm:text-sm md:text-base font-bold text-[#111827] leading-snug mt-1.5">
                            Annual Conference of Society for Pediatric Cellular Therapy and Transplant
                          </p>
                        </div>
                        <div className="text-right text-xs sm:text-sm space-y-2 shrink-0">
                          <div>
                            <span className="text-[10px] sm:text-xs font-bold text-[#C0192B] block uppercase tracking-wider leading-none">
                              DATES
                            </span>
                            <span className="text-xs sm:text-sm md:text-base font-bold text-[#111827]">
                              March 06 & 07, 2027
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] sm:text-xs font-bold text-[#C0192B] block uppercase tracking-wider leading-none">
                              VENUE
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-[#111827] leading-tight block">
                              Taj Vivanta, Dwarka,<br className="hidden sm:inline" /> New Delhi (India)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row on Banner: GST Number Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#C0192B]/20 mt-1">
                        <div className="text-xs sm:text-sm font-medium">
                          <span className="text-[#C0192B] font-bold">GST Number : </span>
                          <span className="font-bold text-[#111827] tracking-wide">
                            {(selectedInvoice.gst_number && selectedInvoice.gst_number !== '08AAMAG2209E1ZX') ? selectedInvoice.gst_number : '09AARCP4212B1ZK'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-6">
                    {/* Receipt Title & Reg No Bar */}
                    <div className="space-y-0 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-[#13254A] text-white py-2.5 text-center font-black text-base sm:text-lg tracking-wider">
                        REGISTRATION RECEIPT
                      </div>
                      <div className="bg-[#476EAC] text-white py-2 text-center font-bold text-sm sm:text-base tracking-wide">
                        Registration No : {selectedInvoice.registration_code || `SPC-2027-${String(selectedInvoice.registration_id || selectedInvoice.id || '001').padStart(4, '0')}`}
                      </div>
                    </div>

                    {/* Section 1: Delegate Information */}
                    <div className="rounded-md overflow-hidden">
                      <div className="bg-[#13254A] text-white text-sm sm:text-base font-bold px-4 py-2">
                        Delegate Information
                      </div>
                      <div className="border border-t-0 border-gray-200 p-4 space-y-3 text-sm sm:text-[15px] bg-white border-b-2 border-b-[#476EAC]">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-semibold w-1/3">Full Name</span>
                          <span className="text-gray-950 font-bold w-2/3">{selectedInvoice.attendee_name || selectedInvoice.full_name || selectedInvoice.user_name || 'Registered Delegate'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-semibold w-1/3">Email</span>
                          <span className="text-gray-900 font-medium w-2/3">{selectedInvoice.attendee_email || selectedInvoice.email || selectedInvoice.user_email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-semibold w-1/3">Category</span>
                          <span className="text-gray-900 font-semibold w-2/3">{selectedInvoice.category_name || 'Standard Registration'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Payment Details */}
                    <div className="rounded-md overflow-hidden">
                      <div className="bg-[#13254A] text-white text-sm sm:text-base font-bold px-4 py-2">
                        Payment Details
                      </div>
                      <div className="border border-t-0 border-gray-200 p-4 space-y-3 text-sm sm:text-[15px] bg-white border-b-2 border-b-[#476EAC]">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-semibold w-1/3">Payment Gateway</span>
                          <span className="text-gray-950 font-bold w-2/3">{((selectedInvoice.payment_method || 'Axis Razorpay (PAGE WORLDWIDE)').replace(/Elisyan\s*India/gi, 'PAGE WORLDWIDE')).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-semibold w-1/3">Transaction ID</span>
                          <span className="font-mono text-gray-900 font-semibold w-2/3 text-sm">{selectedInvoice.transaction_id || selectedInvoice.razorpay_payment_id || 'pay_TfyPpx6ytAA70R'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-semibold w-1/3">Payment Date</span>
                          <span className="text-gray-900 font-medium w-2/3">{new Date(selectedInvoice.paid_at || selectedInvoice.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) + ', ' + new Date(selectedInvoice.paid_at || selectedInvoice.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Amount Breakdown */}
                    {(() => {
                      const baseAmount = parseFloat(selectedInvoice.amount || selectedInvoice.rate || 0);
                      const gstAmount = parseFloat(selectedInvoice.gst_amount || (baseAmount * 0.18).toFixed(2));
                      const totalBasePlusGst = parseFloat((baseAmount + gstAmount).toFixed(2));
                      const razorpayCharge = parseFloat((totalBasePlusGst * 0.025).toFixed(2));
                      const razorpayTax = parseFloat((razorpayCharge * 0.18).toFixed(2));
                      const facilitationCharges = parseFloat((razorpayCharge + razorpayTax).toFixed(2));
                      const totalPayable = parseFloat((totalBasePlusGst + facilitationCharges).toFixed(2));

                      return (
                        <div className="rounded-md overflow-hidden">
                          <div className="bg-[#13254A] text-white text-sm sm:text-base font-bold px-4 py-2">
                            Amount Breakdown
                          </div>
                          <div className="border border-t-0 border-gray-200 p-4 space-y-3 text-sm sm:text-[15px] bg-white">
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-semibold">Base Amount</span>
                              <span className="text-gray-950 font-bold">{formatCurrency(baseAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-semibold">GST (18%)</span>
                              <span className="text-gray-950 font-bold">{formatCurrency(gstAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-semibold">Sub Total</span>
                              <span className="text-gray-950 font-bold">{formatCurrency(totalBasePlusGst)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-semibold">Facilitation Charges (2.5% Razorpay + 18% Tax on Razorpay)</span>
                              <span className="text-gray-950 font-bold">{formatCurrency(facilitationCharges)}</span>
                            </div>

                            {/* Total Bar */}
                            <div className="bg-[#C0192B] text-white px-5 py-3 rounded-md flex justify-between items-center font-black text-base sm:text-lg mt-4 shadow-sm">
                              <span>TOTAL PAYABLE AMOUNT</span>
                              <span>{formatCurrency(totalPayable)}</span>
                            </div>
                          </div>
                          <div className="h-1 bg-[#476EAC] w-full"></div>
                        </div>
                      );
                    })()}

                    {/* Footer Section */}
                    <div className="text-center pt-4 space-y-1.5 border-t border-gray-200">
                      <div className="font-bold text-base text-[#13254A]">Thank You for Registering!</div>
                      <div className="text-gray-600 font-semibold text-xs sm:text-sm">For Queries & Support:</div>
                      <div className="text-[#13254A] font-bold text-xs sm:text-sm">Email: spctt2027@spctt.org | Phone: +91 9217453468 | Website: https://2027.spctt.org</div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                      <button
                        onClick={() => handleDownloadPdf(selectedInvoice)}
                        disabled={downloadingId === selectedInvoice.id}
                        className="bg-[#C0192B] hover:bg-[#a11424] text-white px-5 py-2 rounded text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                      >
                        {downloadingId === selectedInvoice.id ? 'Downloading...' : '📥 Download Official PDF'}
                      </button>
                      <button
                        onClick={handlePrint}
                        className="bg-[#476EAC] hover:bg-[#365a94] text-white px-5 py-2 rounded text-sm font-medium transition-colors"
                      >
                        🖨️ Print
                      </button>
                      <button
                        onClick={() => setSelectedInvoice(null)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default InvoiceReceiptPage;
