import React, { useState, useEffect } from "react";
import { Gift, Check, Calendar, Tag, TrendingUp, X } from "lucide-react";
import {
  getCustomerOffers,
  saveCustomerOffer,
  markOfferViewed,
  markOfferRedeemed,
} from "../../utils/offerStorage.js";
import { toast } from "react-hot-toast";
import { fetchOffersForDid } from "../../utils/apiClient.js";
import { QRCodeSVG } from "qrcode.react";

const OffersPage = ({ credentials, userDid }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("all"); // all, active, redeemed
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    // Wait until we know the user's DID so we can fetch backend offers
    if (userDid) {
      loadOffers();
    }
  }, [userDid]);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const localOffers = await getCustomerOffers();
      let merged = localOffers || [];

      // Also fetch NORMAL offers for all shops this DID is a member of
      try {
        if (userDid) {
          const remote = await fetchOffersForDid(userDid);
          if (Array.isArray(remote) && remote.length > 0) {
            const byKey = new Map();
            merged.forEach((o) => {
              const key = o.offerId || o.id;
              if (key) byKey.set(key, o);
            });

            // Persist any new backend offers into IndexedDB so redeemed/viewed flags stick
            for (const o of remote) {
              const key = o._id || o.offerId;
              if (!key) continue;
              if (!byKey.has(key)) {
                await saveCustomerOffer({
                  id: key,
                  offerId: key,
                  shopName: o.shopName,
                  shopDID: o.shopDID,
                  title: o.title,
                  description: o.description,
                  offerType: o.offerType,
                  discountValue: o.discountValue,
                  minTier: o.minTier,
                  minPurchase: o.minPurchase,
                  startDate: o.startDate,
                  endDate: o.endDate,
                  maxRedemptionsPerCustomer: o.maxRedemptionsPerCustomer,
                });
              }
            }

            // Reload from local DB so viewed/redeemed state comes from IndexedDB
            const refreshedLocal = await getCustomerOffers();
            console.log("[OffersPage] Refreshed local offers after save:", refreshedLocal);
            merged = refreshedLocal || [];
          }
        }
      } catch (apiError) {
        console.error("[OffersPage] Failed to load backend offers", apiError);
      }

      console.log("[OffersPage] Final merged offers:", merged);
      setOffers(merged);
    } catch (error) {
      console.error("Failed to load offers:", error);
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleOfferClick = async (offer) => {
    if (!offer.viewed) {
      await markOfferViewed(offer.id);
      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, viewed: true } : o))
      );
    }

    setSelectedOffer(offer);
  };

  const filteredOffers = offers.filter((offer) => {
    if (filterBy === "active")
      return !offer.redeemed && new Date(offer.endDate) >= new Date();
    if (filterBy === "redeemed") return offer.redeemed;
    return true;
  });

  const activeCount = offers.filter(
    (o) => !o.redeemed && new Date(o.endDate) >= new Date()
  ).length;
  const redeemedCount = offers.filter((o) => o.redeemed).length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">My Offers</h1>
          <p className="text-purple-300">
            {activeCount} active {redeemedCount} redeemed
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setFilterBy("all")}
          className={`rounded-lg px-4 py-2 transition-all ${
            filterBy === "all"
              ? "bg-purple-500 text-white"
              : "bg-white/10 text-purple-300 hover:bg-white/20"
          }`}
        >
          All ({offers.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterBy("active")}
          className={`rounded-lg px-4 py-2 transition-all ${
            filterBy === "active"
              ? "bg-purple-500 text-white"
              : "bg-white/10 text-purple-300 hover:bg-white/20"
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterBy("redeemed")}
          className={`rounded-lg px-4 py-2 transition-all ${
            filterBy === "redeemed"
              ? "bg-purple-500 text-white"
              : "bg-white/10 text-purple-300 hover:bg-white/20"
          }`}
        >
          Redeemed ({redeemedCount})
        </button>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500" />
        </div>
      ) : filteredOffers.length === 0 ? (
        <EmptyOffersState credentials={credentials} filterBy={filterBy} />
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onClick={handleOfferClick} />
          ))}
        </div>
      )}

      {/* Offer Details Modal */}
      {selectedOffer && (
        <OfferDetailsModal
          offer={selectedOffer}
          userDid={userDid}
          onClose={() => setSelectedOffer(null)}
          onRedeem={async () => {
            await markOfferRedeemed(selectedOffer.id);
            await loadOffers();
            setSelectedOffer(null);
            toast.success("Offer marked as redeemed!");
          }}
        />
      )}
    </div>
  );
};

const EmptyOffersState = ({ credentials, filterBy }) => (
  <div className="rounded-2xl border border-purple-400/30 bg-white/10 p-12 text-center backdrop-blur-lg">
    <Gift className="mb-6 h-24 w-24 mx-auto text-purple-400/50" />

    <h2 className="mb-4 text-2xl font-bold text-white">
      {filterBy === "redeemed"
        ? "No Redeemed Offers Yet"
        : filterBy === "active"
        ? "No Active Offers"
        : "No Offers Yet"}
    </h2>

    <p className="mx-auto mb-8 max-w-md text-purple-300">
      {filterBy === "all"
        ? "You'll automatically receive offers from shops whose loyalty programs you've joined. Open an offer to view and show its QR at checkout."
        : filterBy === "active"
        ? "You don't have any active offers right now"
        : "You haven't redeemed any offers yet"}
    </p>

    {filterBy === "all" && (
      <div className="mx-auto max-w-sm rounded-xl bg-white/5 p-6 text-left">
        <h3 className="mb-3 font-semibold text-white">
          Enrolled Shops ({credentials.length})
        </h3>
        <ul className="space-y-2 text-sm">
          {credentials.map((cred) => (
            <li
              key={cred.id}
              className="flex items-center gap-2 text-purple-300"
            >
              <Check className="h-4 w-4 text-green-400" />
              <span>{cred.shopName}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-purple-400">
          You'll receive offers from these shops
        </p>
      </div>
    )}
  </div>
);

const OfferCard = ({ offer, onClick }) => {
  const isExpired = new Date(offer.endDate) < new Date();
  const isRedeemed = offer.redeemed;
  const isNew = !offer.viewed;

  return (
    <div
      onClick={() => onClick(offer)}
      className="relative cursor-pointer rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg transition-all hover:bg-white/15"
    >
      {isNew && (
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
            NEW
          </span>
        </div>
      )}

      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1 pr-4">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">{offer.title}</h3>
            {isRedeemed && (
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                Redeemed
              </span>
            )}
            {isExpired && !isRedeemed && (
              <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
                Expired
              </span>
            )}
          </div>

          <p className="mb-2 text-sm text-purple-400">{offer.shopName}</p>
          <p className="mb-4 text-purple-200">{offer.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-purple-300">
            <span className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              {offer.discountValue}% OFF
            </span>
            {offer.minPurchase > 0 && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Min: ₹{offer.minPurchase}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                Until:{" "}
                {offer.endDate
                  ? new Date(offer.endDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "2-digit",
                    })
                  : "--"}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-purple-400/30 pt-4">
        <span className="text-sm text-purple-400">Tap to view details</span>
        {!isRedeemed && !isExpired && (
          <span className="text-sm font-semibold text-green-400">
            Available to use
          </span>
        )}
      </div>
    </div>
  );
};

const OfferDetailsModal = ({ offer, userDid, onClose, onRedeem }) => {
  const isExpired = new Date(offer.endDate) < new Date();
  const isRedeemed = offer.redeemed;
  const canRedeem = !isExpired && !isRedeemed;

  const qrPayload = JSON.stringify({
    type: "offer-redemption",
    version: "1.0",
    offerId: offer.offerId || offer.id,
    shopDID: offer.shopDID,
    customerDID: userDid || null,
    shopName: offer.shopName,
    title: offer.title,
  });

  const handleDownloadQR = () => {
    try {
      const container = document.getElementById("offer-qr-container");
      if (!container) return;
      const svg = container.querySelector("svg");
      if (!svg) return;

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${offer.title || "offer"}-qr.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download offer QR", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-900 to-slate-900 p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Offer Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-all hover:bg-white/10"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Shop Info */}
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">🎁</div>
          <p className="text-sm text-purple-400">{offer.shopName}</p>
        </div>

        {/* Offer Title & Main Block */}
        <div className="mb-6 rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
          <h3 className="mb-3 text-2xl font-bold text-white">{offer.title}</h3>
          <p className="mb-4 text-lg text-purple-200">{offer.description}</p>

          <div className="flex items-center justify-center gap-4 border-y border-purple-400/30 py-4">
            <div className="text-center">
              <p className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
                {offer.discountValue}%
              </p>
              <p className="text-sm text-purple-300">OFF</p>
            </div>
          </div>
        </div>

        {/* Offer Details */}
        <div className="mb-6 rounded-xl border border-purple-400/30 bg-white/10 p-6 backdrop-blur-lg">
          <h4 className="mb-4 font-semibold text-white">Details</h4>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-300">Offer Type:</span>
              <span className="font-medium text-white">
                {offer.offerType?.replace("_", " ").toUpperCase()}
              </span>
            </div>

            {offer.minPurchase > 0 && (
              <div className="flex justify-between">
                <span className="text-purple-300">Minimum Purchase:</span>
                <span className="font-medium text-white">₹{offer.minPurchase}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-purple-300">Minimum Tier:</span>
              <span className="font-medium text-white">{offer.minTier}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-purple-300">Valid Until:</span>
              <p className="text-lg font-semibold text-white">
                {offer.endDate
                  ? new Date(offer.endDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : "--"}
              </p>
            </div>

            {offer.maxRedemptionsPerCustomer && (
              <div className="flex justify-between">
                <span className="text-purple-300">Max Uses:</span>
                <span className="font-medium text-white">
                  {offer.maxRedemptionsPerCustomer} time(s)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Redemption QR & Status */}
        <div className="mb-6 grid gap-4 md:grid-cols-[1.2fr,1fr]">
          <div className="rounded-xl border border-purple-400/30 bg-white/10 p-6 text-center">
            <h4 className="mb-3 font-semibold text-white">
              Show this QR at the shop
            </h4>
            <div
              id="offer-qr-container"
              className="mx-auto inline-block rounded-xl bg-white p-4"
            >
              <QRCodeSVG value={qrPayload} size={180} />
            </div>
            <p className="mt-3 text-xs text-purple-300">
              This QR is unique to this offer and your account. The shop will
              scan it to apply the discount.
            </p>
          </div>

          <div
            className={`rounded-xl p-6 ${
              isRedeemed
                ? "bg-green-500/10 border border-green-400/30"
                : isExpired
                ? "bg-red-500/10 border border-red-400/30"
                : "bg-blue-500/10 border border-blue-400/30"
            }`}
          >
            <div className="flex items-center gap-3">
              {isRedeemed ? (
                <>
                  <Check className="h-6 w-6 text-green-400" />
                  <div>
                    <h4 className="font-semibold text-white">Already Redeemed</h4>
                    {offer.redeemedAt && (
                      <p className="text-sm text-green-300">
                        Redeemed on{" "}
                        {new Date(offer.redeemedAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          }
                        )}
                      </p>
                    )}
                  </div>
                </>
              ) : isExpired ? (
                <>
                  <X className="h-6 w-6 text-red-400" />
                  <div>
                    <h4 className="font-semibold text-white">Offer Expired</h4>
                    <p className="text-sm text-red-300">
                      This offer is no longer valid
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Gift className="h-6 w-6 text-blue-400" />
                  <div>
                    <h4 className="font-semibold text-white">Ready to Use</h4>
                    <p className="text-sm text-blue-300">
                      Show this QR at checkout to apply the offer.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {canRedeem && (
            <button
              type="button"
              onClick={() => {
                // eslint-disable-next-line no-alert
                if (window.confirm("Mark this offer as redeemed?")) {
                  onRedeem();
                }
              }}
              className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 py-4 font-semibold text-white transition-all hover:scale-105"
            >
              Mark as Redeemed
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadQR}
            className="flex-1 rounded-lg border border-purple-400/30 bg-white/10 py-4 font-semibold text-white transition-all hover:bg-white/20"
          >
            Download Offer QR
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`${
              canRedeem ? "flex-1" : "w-full"
            } rounded-lg border border-purple-400/30 bg-white/10 py-4 font-semibold text-white transition-all hover:bg-white/20`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
