import React, { useState, useEffect } from "react";
import {
  Receipt,
  Download,
  Calendar,
  TrendingUp,
  Filter,
  FileText,
  Search,
} from "lucide-react";
import { fetchShopInvoices, fetchShopInvoiceStats } from "../../utils/apiClient.js";
import { toast } from "react-hot-toast";

export default function InvoiceManagement({ shop }) {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ totalInvoices: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (shop?.shopDID) {
      loadInvoices();
      loadStats();
    }
  }, [shop?.shopDID]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await fetchShopInvoices(shop.shopDID);
      setInvoices(data || []);
    } catch (error) {
      console.error("Failed to load invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await fetchShopInvoiceStats(shop.shopDID);
      setStats(data || { totalInvoices: 0, totalRevenue: 0 });
    } catch (error) {
      console.error("Failed to load invoice stats:", error);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      searchTerm === "" ||
      invoice.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerDID.toLowerCase().includes(searchTerm.toLowerCase());

    const invoiceDate = new Date(invoice.createdAt);
    const now = new Date();
    let matchesDate = true;

    if (dateFilter === "today") {
      matchesDate = invoiceDate.toDateString() === now.toDateString();
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = invoiceDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = invoiceDate >= monthAgo;
    }

    return matchesSearch && matchesDate;
  });

  const exportToCSV = () => {
    const headers = [
      "Transaction ID",
      "Date",
      "Customer DID",
      "Subtotal",
      "Tax",
      "Total",
      "Points Added",
      "Tier After",
    ];

    const rows = filteredInvoices.map((inv) => [
      inv.transactionId,
      new Date(inv.createdAt).toLocaleString(),
      inv.customerDID,
      inv.subtotal,
      inv.tax,
      inv.total,
      inv.pointsAdded,
      inv.tierAfter,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoices_${shop.name}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Invoices exported to CSV");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Invoice Management</h2>
          <p className="text-sm text-purple-300">
            View and manage all your transaction invoices
          </p>
        </div>
        <button
          type="button"
          onClick={exportToCSV}
          disabled={filteredInvoices.length === 0}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={<Receipt className="h-6 w-6" />}
          label="Total Invoices"
          value={stats.totalInvoices}
          color="purple"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          color="green"
        />
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          label="Filtered Results"
          value={filteredInvoices.length}
          color="blue"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Search by Transaction ID or Customer DID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-purple-400/30 bg-white/5 py-2 pl-10 pr-4 text-white placeholder-purple-400/50 outline-none focus:border-purple-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-purple-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-purple-400/30 bg-white/5 px-4 py-2 text-white outline-none focus:border-purple-400 [&>option]:bg-slate-900 [&>option]:text-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500" />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="rounded-2xl border border-purple-400/30 bg-white/10 p-12 text-center backdrop-blur-lg">
          <Receipt className="mx-auto mb-4 h-16 w-16 text-purple-400/50" />
          <h3 className="mb-2 text-xl font-bold text-white">No Invoices Found</h3>
          <p className="text-purple-300">
            {searchTerm || dateFilter !== "all"
              ? "Try adjusting your filters"
              : "Invoices will appear here after customer transactions"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice._id || invoice.transactionId}
              invoice={invoice}
              onClick={() => setSelectedInvoice(invoice)}
            />
          ))}
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    blue: "from-blue-500 to-cyan-500",
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

const InvoiceCard = ({ invoice, onClick }) => {
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
      className="cursor-pointer rounded-xl border border-purple-400/30 bg-white/10 p-4 backdrop-blur-lg transition-all hover:bg-white/15"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <Receipt className="h-5 w-5 text-purple-400" />
            <div>
              <p className="font-semibold text-white">{invoice.transactionId}</p>
              <p className="text-xs text-purple-300">
                {formattedDate} at {formattedTime}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-purple-300">
            <span>Customer: {invoice.customerDID.slice(0, 20)}...</span>
            <span>Points: +{invoice.pointsAdded}</span>
            <span>Tier: {invoice.tierAfter}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">₹{invoice.total.toLocaleString()}</p>
          {invoice.tax > 0 && (
            <p className="text-xs text-purple-400">incl. GST ₹{invoice.tax}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const InvoiceDetailsModal = ({ invoice, onClose }) => {
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
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">🧾</div>
          <h2 className="mb-2 text-2xl font-bold text-white">Invoice Details</h2>
          <p className="text-sm text-purple-400">{invoice.transactionId}</p>
        </div>

        <div className="mb-6 rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-300">Shop</p>
              <p className="text-lg font-semibold text-white">{invoice.shopName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-300">Date & Time</p>
              <p className="text-lg font-semibold text-white">{formattedDate}</p>
              <p className="text-sm text-purple-300">{formattedTime}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-purple-300">Customer DID</p>
            <p className="break-all text-sm font-mono text-white">{invoice.customerDID}</p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
          <h3 className="mb-4 font-semibold text-white">Amount Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-purple-200">
              <span>Subtotal</span>
              <span>₹{invoice.subtotal.toLocaleString()}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between text-purple-200">
                <span>Tax (GST 18%)</span>
                <span>₹{invoice.tax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-purple-400/30 pt-3 text-lg font-bold text-white">
              <span>Total</span>
              <span>₹{invoice.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-green-400/30 bg-green-500/10 p-6">
          <h3 className="mb-4 font-semibold text-white">Loyalty Rewards</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-green-300">Points Added</span>
              <span className="font-bold text-white">+{invoice.pointsAdded} points</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-300">Customer Tier After</span>
              <span className="font-bold text-white">{invoice.tierAfter}</span>
            </div>
          </div>
        </div>

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
