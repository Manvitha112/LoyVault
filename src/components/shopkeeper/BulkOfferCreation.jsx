import React, { useState } from "react";
import { Plus, X, Upload, Download, Gift } from "lucide-react";
import { toast } from "react-hot-toast";
import { saveOffer } from "../../utils/offerStorage.js";
import { createOffer } from "../../utils/apiClient.js";

export default function BulkOfferCreation({ shop, onComplete }) {
  const [offers, setOffers] = useState([createEmptyOffer()]);
  const [creating, setCreating] = useState(false);

  function createEmptyOffer() {
    return {
      id: Date.now() + Math.random(),
      title: "",
      description: "",
      offerType: "percentage_discount",
      discountValue: "",
      minTier: "Base",
      minPurchase: "",
      startDate: "",
      endDate: "",
      maxRedemptionsPerCustomer: 1,
    };
  }

  const handleAddOffer = () => {
    setOffers([...offers, createEmptyOffer()]);
  };

  const handleRemoveOffer = (id) => {
    if (offers.length === 1) {
      toast.error("At least one offer is required");
      return;
    }
    setOffers(offers.filter((o) => o.id !== id));
  };

  const handleOfferChange = (id, field, value) => {
    setOffers(
      offers.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  const validateOffer = (offer) => {
    if (!offer.title.trim()) return "Title is required";
    if (!offer.description.trim()) return "Description is required";
    if (!offer.discountValue || parseFloat(offer.discountValue) <= 0)
      return "Valid discount value is required";
    return null;
  };

  const handleCreateAll = async () => {
    const errors = offers.map((o) => validateOffer(o)).filter(Boolean);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setCreating(true);
    try {
      let successCount = 0;
      for (const offer of offers) {
        const offerData = {
          ...offer,
          shopDID: shop.shopDID,
          shopName: shop.name,
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        await saveOffer(offerData, shop.shopDID);

        try {
          await createOffer(offerData);
        } catch (apiErr) {
          console.error("Failed to sync offer to backend", apiErr);
        }

        successCount++;
      }

      toast.success(`${successCount} offer(s) created successfully!`);
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Failed to create offers:", error);
      toast.error("Failed to create some offers");
    } finally {
      setCreating(false);
    }
  };

  const handleImportCSV = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split("\n").filter((l) => l.trim());
        const headers = lines[0].split(",").map((h) => h.trim());

        const imported = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const offer = createEmptyOffer();

          headers.forEach((header, idx) => {
            const value = values[idx] || "";
            if (header === "title") offer.title = value;
            else if (header === "description") offer.description = value;
            else if (header === "offerType") offer.offerType = value;
            else if (header === "discountValue")
              offer.discountValue = parseFloat(value) || "";
            else if (header === "minTier") offer.minTier = value;
            else if (header === "minPurchase")
              offer.minPurchase = parseFloat(value) || "";
          });

          return offer;
        });

        setOffers(imported);
        toast.success(`Imported ${imported.length} offer(s)`);
      } catch (error) {
        console.error("Failed to import CSV:", error);
        toast.error("Failed to import CSV file");
      }
    };
    reader.readAsText(file);
  };

  const handleExportTemplate = () => {
    const headers = [
      "title",
      "description",
      "offerType",
      "discountValue",
      "minTier",
      "minPurchase",
    ];
    const example = [
      "10% Off",
      "Get 10% off on all items",
      "percentage_discount",
      "10",
      "Base",
      "100",
    ];

    const csv = [headers.join(","), example.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bulk_offers_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Bulk Offer Creation</h2>
          <p className="text-sm text-purple-300">
            Create multiple offers at once
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportTemplate}
            className="flex items-center gap-2 rounded-lg border border-purple-400/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/20"
          >
            <Download className="h-4 w-4" />
            Template
          </button>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-purple-400/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/20">
            <Upload className="h-4 w-4" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {offers.map((offer, index) => (
          <OfferForm
            key={offer.id}
            offer={offer}
            index={index}
            onChange={handleOfferChange}
            onRemove={handleRemoveOffer}
            canRemove={offers.length > 1}
          />
        ))}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleAddOffer}
          className="flex items-center gap-2 rounded-lg border border-purple-400/30 bg-white/10 px-6 py-3 font-semibold text-white transition-all hover:bg-white/20"
        >
          <Plus className="h-5 w-5" />
          Add Another Offer
        </button>
        <button
          type="button"
          onClick={handleCreateAll}
          disabled={creating}
          className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {creating ? "Creating..." : `Create ${offers.length} Offer(s)`}
        </button>
      </div>
    </div>
  );
}

const OfferForm = ({ offer, index, onChange, onRemove, canRemove }) => {
  return (
    <div className="rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-400" />
          <h3 className="font-semibold text-white">Offer #{index + 1}</h3>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(offer.id)}
            className="rounded-lg p-2 text-red-400 transition-all hover:bg-red-500/10"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-purple-300">Title</label>
          <input
            type="text"
            value={offer.title}
            onChange={(e) => onChange(offer.id, "title", e.target.value)}
            placeholder="e.g., 10% Off"
            className="w-full rounded-lg border border-purple-400/30 bg-white/5 px-4 py-2 text-white outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-purple-300">
            Offer Type
          </label>
          <select
            value={offer.offerType}
            onChange={(e) => onChange(offer.id, "offerType", e.target.value)}
            className="w-full rounded-lg border border-purple-400/30 bg-white/5 px-4 py-2 text-white outline-none focus:border-purple-400 [&>option]:bg-slate-900 [&>option]:text-white"
          >
            <option value="percentage_discount">Percentage Discount</option>
            <option value="flat_discount">Flat Discount</option>
            <option value="bonus_points">Bonus Points</option>
            <option value="free_item">Free Item</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-purple-300">
            Description
          </label>
          <textarea
            value={offer.description}
            onChange={(e) => onChange(offer.id, "description", e.target.value)}
            placeholder="Describe the offer..."
            rows={2}
            className="w-full rounded-lg border border-purple-400/30 bg-white/5 px-4 py-2 text-white outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-purple-300">
            Discount Value
          </label>
          <input
            type="number"
            value={offer.discountValue}
            onChange={(e) =>
              onChange(offer.id, "discountValue", e.target.value)
            }
            placeholder="10"
            className="w-full rounded-lg border border-purple-400/30 bg-white/5 px-4 py-2 text-white outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-purple-300">
            Minimum Tier
          </label>
          <select
            value={offer.minTier}
            onChange={(e) => onChange(offer.id, "minTier", e.target.value)}
            className="w-full rounded-lg border border-purple-400/30 bg-white/5 px-4 py-2 text-white outline-none focus:border-purple-400 [&>option]:bg-slate-900 [&>option]:text-white"
          >
            <option value="Base">Base</option>
            <option value="Bronze">Bronze</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-purple-300">
            Min Purchase (₹)
          </label>
          <input
            type="number"
            value={offer.minPurchase}
            onChange={(e) => onChange(offer.id, "minPurchase", e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-purple-400/30 bg-white/5 px-4 py-2 text-white outline-none focus:border-purple-400"
          />
        </div>
      </div>
    </div>
  );
};
