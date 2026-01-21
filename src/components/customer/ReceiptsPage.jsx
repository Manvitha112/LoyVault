import React, { useState, useEffect } from "react";
import { Receipt, Calendar, TrendingUp, Store, FileText } from "lucide-react";
import { fetchInvoicesForDid } from "../../utils/apiClient.js";
import { toast } from "react-hot-toast";

const ReceiptsPage = ({ userDid }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (userDid) {
      loadInvoices();
    }
  }, [userDid]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await fetchInvoicesForDid(userDid);
      setInvoices(data || []);
    } catch (error) {
      console.error("Failed to load invoices:", error);
      toast.error("Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPointsEarned = invoices.reduce(
    (sum, inv) => sum + (inv.pointsAdded || 0),
    0
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-white">My Receipts</h1>
        <p className="text-purple-300">
          All your transaction history in one place
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<Receipt className="h-6 w-6" />}
          label="Total Receipts"
          value={invoices.length}
          color="purple"
        />
        <SummaryCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Total Spent"
          value={`₹${totalSpent.toLocaleString()}`}
          color="blue"
        />
        <SummaryCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Points Earned"
          value={totalPointsEarned}
          color="green"
        />
      </div>

      {/* Receipts List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500" />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyReceiptsState />
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <ReceiptCard
              key={invoice._id || invoice.transactionId}
              invoice={invoice}
              onClick={() => setSelectedInvoice(invoice)}
            />
          ))}
        </div>
      )}

      {/* Receipt Details Modal */}
      {selectedInvoice && (
        <ReceiptDetailsModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

const SummaryCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    purple: "from-purple-500 to-pink-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
  };

  return (
    <div className="rounded-xl border border-purple-400/30 bg-white/10 p-4 backdrop-blur-lg">
      <div className="mb-2 flex items-center gap-2 text-purple-300">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p
        className={`bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-2xl font-bold text-transparent`}
      >
        {value}
      </p>
    </div>
  );
};

const EmptyReceiptsState = () => (
  <div className="rounded-2xl border border-purple-400/30 bg-white/10 p-12 text-center backdrop-blur-lg">
    <Receipt className="mx-auto mb-6 h-24 w-24 text-purple-400/50" />
    <h2 className="mb-4 text-2xl font-bold text-white">No Receipts Yet</h2>
    <p className="mx-auto max-w-md text-purple-300">
      Your transaction receipts will automatically appear here when you make
      purchases at shops where you're a loyalty member.
    </p>
  </div>
);

const ReceiptCard = ({ invoice, onClick }) => {
  const date = new Date(invoice.createdAt);
  const formattedDate = date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      onClick={() => onClick(invoice)}
      className="cursor-pointer rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg transition-all hover:bg-white/15"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <Store className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">
              {invoice.shopName}
            </h3>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-purple-300">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formattedDate} at {formattedTime}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {invoice.transactionId}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">
            ₹{invoice.total.toLocaleString()}
          </p>
          {invoice.pointsAdded > 0 && (
            <p className="text-sm text-green-400">
              +{invoice.pointsAdded} points
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-purple-400/30 pt-4">
        <span className="text-sm text-purple-400">Tap to view details</span>
        {invoice.tierAfter && (
          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300">
            Tier: {invoice.tierAfter}
          </span>
        )}
      </div>
    </div>
  );
};

const ReceiptDetailsModal = ({ invoice, onClose }) => {
  const date = new Date(invoice.createdAt);
  const formattedDate = date.toLocaleDateString(undefined, {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-900 to-slate-900 p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">🧾</div>
          <h2 className="mb-2 text-2xl font-bold text-white">
            Receipt Details
          </h2>
          <p className="text-sm text-purple-400">{invoice.transactionId}</p>
        </div>

        {/* Shop & Date Info */}
        <div className="mb-6 rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-300">Shop</p>
              <p className="text-lg font-semibold text-white">
                {invoice.shopName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-300">Date & Time</p>
              <p className="text-lg font-semibold text-white">
                {formattedDate}
              </p>
              <p className="text-sm text-purple-300">{formattedTime}</p>
            </div>
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="mb-6 rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
          <h3 className="mb-4 font-semibold text-white">Amount Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-purple-200">
              <span>Subtotal</span>
              <span>₹{invoice.subtotal.toLocaleString()}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between text-purple-200">
                <span>Tax (GST)</span>
                <span>₹{invoice.tax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-purple-400/30 pt-3 text-lg font-bold text-white">
              <span>Total</span>
              <span>₹{invoice.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Loyalty Info */}
        <div className="mb-6 rounded-xl border border-green-400/30 bg-green-500/10 p-6">
          <h3 className="mb-4 font-semibold text-white">Loyalty Rewards</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-green-300">Points Earned</span>
              <span className="font-bold text-white">
                +{invoice.pointsAdded} points
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-300">Tier After Purchase</span>
              <span className="font-bold text-white">{invoice.tierAfter}</span>
            </div>
          </div>
        </div>

        {/* Line Items (if available) */}
        {invoice.lineItems && invoice.lineItems.length > 0 && (
          <div className="mb-6 rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
            <h3 className="mb-4 font-semibold text-white">Items</h3>
            <div className="space-y-2">
              {invoice.lineItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm text-purple-200"
                >
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>₹{item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6 rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
            <h3 className="mb-2 font-semibold text-white">Notes</h3>
            <p className="text-sm text-purple-200">{invoice.notes}</p>
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-4 font-semibold text-white transition-all hover:scale-105"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ReceiptsPage;
