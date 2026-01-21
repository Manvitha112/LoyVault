const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function fetchLoyaltyProgramsByDid(did) {
  if (!did) return [];
  return request(`/loyalty-programs/by-did/${encodeURIComponent(did)}`);
}

export async function joinLoyaltyProgramByDid(payload) {
  return request("/loyalty-programs/join-by-did", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateLoyaltyPointsByDid(payload) {
  return request("/loyalty-programs/update-points-by-did", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchOffersForDid(did) {
  if (!did) return [];
  return request(`/offers/for-did/${encodeURIComponent(did)}`);
}

export async function createOffer(offer) {
	// Expect offer to already include shopDID and shopName
	const payload = {
		shopDID: offer.shopDID,
		shopName: offer.shopName,
		title: offer.title,
		description: offer.description,
		discountValue: offer.discountValue,
		minTier: offer.minTier,
		minPurchase: Number(offer.minPurchase) || 0,
		startDate: offer.startDate || undefined,
		endDate: offer.endDate || undefined,
		maxRedemptionsPerCustomer: offer.maxRedemptionsPerCustomer,
	};

	return request("/offers", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export async function fetchShopLoyaltyStats(shopDID) {
	if (!shopDID) return null;
	return request(`/loyalty-programs/stats/${encodeURIComponent(shopDID)}`);
}

export async function fetchShopOfferStats(shopDID) {
	if (!shopDID) return null;
	return request(`/offers/stats/${encodeURIComponent(shopDID)}`);
}

export async function createInvoice(payload) {
	return request("/invoices", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export async function fetchInvoicesForDid(did) {
	if (!did) return [];
	return request(`/invoices/for-customer/${encodeURIComponent(did)}`);
}

export async function fetchShopInvoices(shopDID) {
	if (!shopDID) return [];
	return request(`/invoices/for-shop/${encodeURIComponent(shopDID)}`);
}

export async function fetchShopInvoiceStats(shopDID) {
	if (!shopDID) return null;
	return request(`/invoices/stats/${encodeURIComponent(shopDID)}`);
}
