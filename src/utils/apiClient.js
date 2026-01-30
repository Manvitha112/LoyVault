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

// Redemption API functions
export async function redeemOffer(customerDID, offerID, shopDID) {
	return request("/redemptions/redeem", {
		method: "POST",
		body: JSON.stringify({ customerDID, offerID, shopDID }),
	});
}

export async function fetchCustomerRedemptions(customerDID) {
	if (!customerDID) return [];
	return request(`/redemptions/customer/${encodeURIComponent(customerDID)}`);
}

export async function checkOfferRedemption(customerDID, offerID) {
	if (!customerDID || !offerID) return { redeemed: false, redemptionCount: 0 };
	return request(`/redemptions/check/${encodeURIComponent(customerDID)}/${encodeURIComponent(offerID)}`);
}

export async function fetchShopDetailsForBill(shopDID) {
	if (!shopDID) return null;
	return request(`/invoices/shop-details/${encodeURIComponent(shopDID)}`);
}

// Product API functions
export async function fetchShopProducts(shopDID, filters = {}) {
	if (!shopDID) return [];
	const params = new URLSearchParams();
	if (filters.category) params.append("category", filters.category);
	if (filters.search) params.append("search", filters.search);
	if (filters.activeOnly) params.append("activeOnly", "true");
	const queryString = params.toString();
	return request(`/products/shop/${encodeURIComponent(shopDID)}${queryString ? `?${queryString}` : ""}`);
}

export async function fetchProductCategories(shopDID) {
	if (!shopDID) return [];
	return request(`/products/shop/${encodeURIComponent(shopDID)}/categories`);
}

export async function createProduct(productData) {
	return request("/products", {
		method: "POST",
		body: JSON.stringify(productData),
	});
}

export async function updateProduct(productId, updates) {
	return request(`/products/${encodeURIComponent(productId)}`, {
		method: "PUT",
		body: JSON.stringify(updates),
	});
}

export async function deleteProduct(productId, permanent = false) {
	return request(`/products/${encodeURIComponent(productId)}${permanent ? "?permanent=true" : ""}`, {
		method: "DELETE",
	});
}

export async function updateProductStock(productId, quantity, operation = "set") {
	return request(`/products/${encodeURIComponent(productId)}/stock`, {
		method: "PATCH",
		body: JSON.stringify({ quantity, operation }),
	});
}
