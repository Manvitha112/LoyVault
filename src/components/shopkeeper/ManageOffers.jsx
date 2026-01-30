import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Gift,
  Tag,
  Users,
  Calendar,
  TrendingUp,
  X,
  Layers,
} from "lucide-react";
import { toast, showError, showSuccess } from "../common/Toast.jsx";
import { saveOffer, getShopOffers } from "../../utils/offerStorage.js";
import { createOffer } from "../../utils/apiClient.js";
import BulkOfferCreation from "./BulkOfferCreation.jsx";

export default function ManageOffers({ shop }) {
  const [offers, setOffers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      if (!shop?.shopDID) {
        setOffers([]);
        return;
      }
      const existing = await getShopOffers(shop.shopDID);
      setOffers(existing || []);
    } catch (error) {
      console.error("Failed to load offers", error);
      showError("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const activeOffers = useMemo(
    () =>
      offers.filter((o) => {
        const end = new Date(o.endDate);
        return end >= new Date() && o.isActive;
      }),
    [offers]
  );

  const expiredOffers = useMemo(
    () =>
      offers.filter((o) => {
        const end = new Date(o.endDate);
        return end < new Date() || !o.isActive;
      }),
    [offers]
  );

  const handleCreateOffer = async (newOffer) => {
    try {
      if (!shop?.shopDID) {
        throw new Error("Missing shop DID");
      }

      // Save offer in shop storage
      const savedOffer = await saveOffer(newOffer, shop.shopDID);

      // Add to local state
      setOffers((prev) => [savedOffer, ...prev]);

      // Best-effort: persist offer to backend so customers can see it
      try {
        await createOffer(savedOffer);
      } catch (apiErr) {
        console.error("Failed to sync offer to backend", apiErr);
      }

      toast.success("Offer created successfully!");
    } catch (error) {
      console.error("Failed to create offer", error);
      toast.error("Failed to create offer");
    }
  };

  const handleEditOffer = (offerToEdit) => {
    toast("Offer editing UI coming soon");
  };

  const handleDeactivateOffer = (offerId) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? {
              ...o,
              isActive: false,
            }
          : o
      )
    );
    showSuccess("Offer deactivated");
  };

  const handleDeleteOffer = (offerId) => {
    if (!window.confirm("Delete this offer permanently?")) return;
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
    showSuccess("Offer deleted");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Offers</h1>
          <p className="text-sm text-blue-300">
            Create and manage promotional offers for your customers.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowBulkCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-400/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20"
          >
            <Layers className="h-5 w-5" />
            <span>Bulk Create</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Offer</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-blue-200">Loading offers...</p>
      ) : (
        <>
          <OfferSection
            title="Active Offers"
            offers={activeOffers}
            onEdit={handleEditOffer}
            onDeactivate={handleDeactivateOffer}
          />

          <OfferSection
            title="Expired Offers"
            offers={expiredOffers}
            onDelete={handleDeleteOffer}
            isExpired
          />
        </>
      )}

      {showCreateModal && (
        <CreateOfferModal
          shop={shop}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (offer) => {
            await handleCreateOffer(offer);
            setShowCreateModal(false);
          }}
        />
      )}

      {showBulkCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-purple-400/30 bg-gradient-to-br from-blue-900 to-slate-900 p-8">
            <BulkOfferCreation
              shop={shop}
              onComplete={() => {
                setShowBulkCreate(false);
                loadOffers();
              }}
            />
            <button
              type="button"
              onClick={() => setShowBulkCreate(false)}
              className="mt-4 w-full rounded-lg border border-purple-400/30 bg-white/10 py-3 font-semibold text-white transition-all hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OfferSection({
  title,
  offers,
  onEdit,
  onDeactivate,
  onDelete,
  isExpired,
}) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-bold text-white">
        {title} ({offers.length})
      </h2>

      {offers.length === 0 ? (
        <div className="rounded-xl border border-blue-400/30 bg-white/10 p-12 text-center backdrop-blur-lg">
          <Gift className="mx-auto mb-4 h-16 w-16 text-blue-400/50" />
          <p className="text-sm text-blue-300">
            {isExpired
              ? "No expired offers"
              : "No active offers. Create one to get started!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onEdit={onEdit}
              onDeactivate={onDeactivate}
              onDelete={onDelete}
              isExpired={isExpired}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer, onEdit, onDeactivate, onDelete, isExpired }) {
  const endLabel = useMemo(() => {
    if (!offer.endDate) return "--";
    try {
      const d = new Date(offer.endDate);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return offer.endDate;
    }
  }, [offer.endDate]);

  return (
    <div className="rounded-xl border border-blue-400/30 bg-white/10 p-6 backdrop-blur-lg transition-all hover:bg-white/15">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">{offer.title}</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isExpired
                  ? "bg-gray-500/20 text-gray-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {isExpired ? "Expired" : "Active"}
            </span>
          </div>
          <p className="mb-3 text-sm text-blue-300">{offer.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-blue-200">
            <span className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              {offer.discountValue}% OFF
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Min Tier: {offer.minTier}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Until: {endLabel}
            </span>
            {!isExpired && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Redemptions: {offer.redemptionCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!isExpired ? (
          <>
            <button
              type="button"
              onClick={() => onEdit && onEdit(offer)}
              className="rounded-lg bg-blue-500/20 px-4 py-2 text-sm text-blue-400 transition-all hover:bg-blue-500/30"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDeactivate && onDeactivate(offer.id)}
              className="rounded-lg bg-orange-500/20 px-4 py-2 text-sm text-orange-400 transition-all hover:bg-orange-500/30"
            >
              Deactivate
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onDelete && onDelete(offer.id)}
            className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400 transition-all hover:bg-red-500/30"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function CreateOfferModal({ shop, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    offerType: "percentage_discount",
    discountValue: "",
    minTier: "Base",
    endDate: "",
    minPurchase: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title || formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }
    if (!formData.description) {
      newErrors.description = "Description is required";
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else {
      const endDate = new Date(formData.endDate);
      if (endDate <= new Date()) {
        newErrors.endDate = "End date must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors");
      return;
    }

    setIsSubmitting(true);

    try {
      const offer = {
        id: `offer-${Date.now()}`,
        ...formData,
        discountValue: Number(formData.discountValue),
        shopDID: shop?.shopDID,
        shopName: shop?.shopName,
        isActive: true,
        redemptionCount: 0,
        createdAt: new Date().toISOString(),
      };

      // TODO: Persist offer to IndexedDB/backend

      toast.success("Offer created successfully!");
      onSubmit(offer);
      onClose();
    } catch (error) {
      console.error("Failed to create offer", error);
      toast.error("Failed to create offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-blue-400/30 bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-400/30 p-6">
          <h2 className="text-2xl font-bold text-white">Create New Offer</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-all hover:bg-white/10"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Title */}
          <div>
            <label className="mb-2 block text-blue-300">Offer Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., 15% OFF Weekend Sale"
              className={`w-full rounded-lg border px-4 py-3 text-white outline-none transition-all bg-white/5 placeholder-blue-400/50 ${
                errors.title
                  ? "border-red-400"
                  : "border-blue-400/30 focus:border-blue-400"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-blue-300">Description *</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe your offer..."
              className={`w-full rounded-lg border px-4 py-3 text-white outline-none transition-all bg-white/5 placeholder-blue-400/50 ${
                errors.description
                  ? "border-red-400"
                  : "border-blue-400/30 focus:border-blue-400"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Offer Type & Discount Value */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-blue-300">Offer Type</label>
              <select
                value={formData.offerType}
                onChange={(e) => handleChange("offerType", e.target.value)}
                className="w-full rounded-lg border border-blue-400/30 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400"
                style={{ colorScheme: 'dark' }}
              >
                <option value="percentage_discount" className="bg-slate-800 text-white">Percentage Discount</option>
                <option value="flat_discount" className="bg-slate-800 text-white">Flat Discount</option>
                <option value="bonus_points" className="bg-slate-800 text-white">Bonus Points</option>
                <option value="free_item" className="bg-slate-800 text-white">Free Item</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-blue-300">
                {formData.offerType === "percentage_discount"
                  ? "Discount %"
                  : "Value"} *
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => handleChange("discountValue", e.target.value)}
                placeholder={
                  formData.offerType === "percentage_discount" ? "15" : "100"
                }
                className={`w-full rounded-lg border px-4 py-3 text-white outline-none transition-all bg-white/5 placeholder-blue-400/50 ${
                  errors.discountValue
                    ? "border-red-400"
                    : "border-blue-400/30 focus:border-blue-400"
                }`}
              />
              {errors.discountValue && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.discountValue}
                </p>
              )}
            </div>
          </div>

          {/* Min Tier & Min Purchase */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-blue-300">Minimum Tier</label>
              <select
                value={formData.minTier}
                onChange={(e) => handleChange("minTier", e.target.value)}
                className="w-full rounded-lg border border-blue-400/30 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400"
                style={{ colorScheme: 'dark' }}
              >
                <option value="Base" className="bg-slate-800 text-white">Base (All Members)</option>
                <option value="Bronze" className="bg-slate-800 text-white">Bronze</option>
                <option value="Silver" className="bg-slate-800 text-white">Silver</option>
                <option value="Gold" className="bg-slate-800 text-white">Gold</option>
                <option value="Platinum" className="bg-slate-800 text-white">Platinum</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-blue-300">Min Purchase (₹)</label>
              <input
                type="number"
                value={formData.minPurchase}
                onChange={(e) => handleChange("minPurchase", e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-blue-400/30 bg-white/5 px-4 py-3 text-white placeholder-blue-400/50 outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="mb-2 block text-blue-300">Valid Until *</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={`w-full rounded-lg border px-4 py-3 text-white outline-none transition-all bg-white/5 ${
                errors.endDate
                  ? "border-red-400"
                  : "border-blue-400/30 focus:border-blue-400"
              }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-400">{errors.endDate}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-blue-400/30 bg-white/5 py-3 text-sm text-blue-300 transition-all hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 py-3 text-sm font-semibold text-white transition-all hover:from-blue-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
