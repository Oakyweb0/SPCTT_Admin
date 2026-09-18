import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserHeader from '../../components/Layout/UserHeader';
import { getUserAuth, registrationApi } from '../../services/api';

const InvoiceReceiptPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

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
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="text-[#9e1c2b] hover:text-[#831422] font-semibold text-xs border border-[#9e1c2b]/30 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
                        >
                          View / Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal / Printable Invoice View */}
            {selectedInvoice && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white max-w-2xl w-full rounded-lg shadow-2xl p-8 space-y-6 relative animate-scaleUp">
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold p-1"
                  >
                    ✕
                  </button>

                  <div className="border-b-2 border-[#004b63] pb-4 flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-[#004b63]">SPCTT 2026</h3>
                      <p className="text-xs text-gray-500">Society of Pediatric Cardiopulmonary Techniques Conference</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                        {selectedInvoice.invoice_type === 'receipt' ? 'Payment Receipt' : 'Proforma Invoice'}
                      </span>
                      <span className="font-mono font-bold text-gray-900 text-base">
                        {selectedInvoice.invoice_number}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <p className="font-semibold text-gray-900">Billed To:</p>
                      <p className="font-medium">{selectedInvoice.full_name || 'Delegate'}</p>
                      <p className="text-xs text-gray-500">{selectedInvoice.registration_code}</p>
                      <p className="text-xs text-gray-500">{selectedInvoice.category_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Date: {new Date(selectedInvoice.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">Status: <strong className="uppercase">{selectedInvoice.status}</strong></p>
                    </div>
                  </div>

                  {/* Line Item Table */}
                  <table className="w-full text-left border-collapse text-sm border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                        <th className="p-3">Particulars</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Rate</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 font-medium">
                          {selectedInvoice.title}
                          <div className="text-xs text-gray-500">{selectedInvoice.description}</div>
                        </td>
                        <td className="p-3 text-center">{selectedInvoice.quantity || 1}</td>
                        <td className="p-3 text-right">{formatCurrency(selectedInvoice.rate || selectedInvoice.amount)}</td>
                        <td className="p-3 text-right font-medium">{formatCurrency(selectedInvoice.amount)}</td>
                      </tr>
                      <tr className="bg-gray-50/50 text-xs">
                        <td className="p-2 text-right font-medium" colSpan={3}>GST (18%):</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(selectedInvoice.gst_amount)}</td>
                      </tr>
                      <tr className="bg-teal-50 font-bold text-sm">
                        <td className="p-3 text-right text-[#004b63]" colSpan={3}>Total Amount:</td>
                        <td className="p-3 text-right text-[#004b63]">{formatCurrency(selectedInvoice.total_amount)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                    <button
                      onClick={handlePrint}
                      className="bg-[#004b63] hover:bg-[#00384a] text-white px-5 py-2 rounded text-sm font-medium transition-colors"
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
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default InvoiceReceiptPage;
