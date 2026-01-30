# Offer Redemption Fix - Per-Customer Tracking

## Problem Fixed
**Issue:** When Customer A redeemed an offer, Customer B would also see it as redeemed because redemption state was stored in browser IndexedDB (local storage), not tracked per customer in the database.

**Root Cause:** Redemption tracking was browser-specific, not customer-specific.

---

## Solution Implemented

### Backend Changes

1. **New Model: `OfferRedemption.js`**
   - Tracks which customer redeemed which offer
   - Fields: `customerDID`, `offerID`, `shopDID`, `redemptionCount`, `redeemedAt`
   - Unique index on `customerDID + offerID` to prevent duplicates

2. **New Routes: `redemptions.js`**
   - `POST /api/redemptions/redeem` - Mark offer as redeemed for a customer
   - `GET /api/redemptions/customer/:customerDID` - Get all redemptions for a customer
   - `GET /api/redemptions/check/:customerDID/:offerID` - Check if specific offer is redeemed
   - `GET /api/redemptions/shop/:shopDID/stats` - Get redemption stats for a shop

3. **Updated `server.js`**
   - Registered redemption routes at `/api/redemptions`

### Frontend Changes

1. **Updated `apiClient.js`**
   - Added `redeemOffer()` - Call backend to redeem offer
   - Added `fetchCustomerRedemptions()` - Get customer's redemptions
   - Added `checkOfferRedemption()` - Check single offer redemption status

2. **Updated `OffersPage.jsx`**
   - Removed IndexedDB dependency for redemption tracking
   - Now fetches offers from backend
   - Fetches redemption state from backend per customer
   - Merges offers with redemption state
   - When customer redeems, saves to backend database

---

## How It Works Now

### Customer A Flow:
1. Customer A logs in with DID: `did:loyvault:customerA`
2. Views offers → Backend returns all offers for joined shops
3. Backend fetches redemptions for `customerA` → Returns empty array
4. Customer A sees all offers as **unredeemed**
5. Customer A redeems "50% OFF" offer
6. Backend creates redemption record: `{ customerDID: "customerA", offerID: "offer123" }`
7. Customer A refreshes → Sees "50% OFF" as **redeemed**

### Customer B Flow:
1. Customer B logs in with DID: `did:loyvault:customerB`
2. Views offers → Backend returns all offers for joined shops
3. Backend fetches redemptions for `customerB` → Returns empty array
4. Customer B sees all offers as **unredeemed** (including "50% OFF")
5. Customer B can redeem "50% OFF" independently
6. Backend creates separate redemption record: `{ customerDID: "customerB", offerID: "offer123" }`

**Result:** Each customer has their own redemption state! ✅

---

## Testing Instructions

### Setup
1. **Restart Backend Server:**
   ```bash
   cd server
   npm run dev
   ```
   
2. **Ensure Frontend is Running:**
   ```bash
   npm run dev
   ```

### Test Scenario

**Step 1: Create Two Customers**
1. Open browser in **normal mode** → Register Customer A
2. Open browser in **incognito/private mode** → Register Customer B
3. Both customers join the same shop's loyalty program

**Step 2: Create an Offer**
1. Login as shopkeeper
2. Create a new offer (e.g., "20% OFF")
3. Offer should appear for both customers

**Step 3: Test Redemption Isolation**
1. **Customer A:** Go to "My Offers" → Click on "20% OFF" → Click "Redeem"
2. **Customer A:** Refresh page → Offer shows as "Redeemed" ✅
3. **Customer B:** Go to "My Offers" → "20% OFF" should still show as "Active" (not redeemed) ✅
4. **Customer B:** Click "Redeem" → Should work successfully ✅
5. **Customer B:** Refresh → Now shows as "Redeemed" for Customer B ✅

**Step 4: Verify Database**
Check MongoDB Atlas → `offerredemptions` collection should have:
```json
[
  { "customerDID": "did:loyvault:customerA", "offerID": "offer123", "redemptionCount": 1 },
  { "customerDID": "did:loyvault:customerB", "offerID": "offer123", "redemptionCount": 1 }
]
```

---

## Database Schema

### OfferRedemption Collection
```javascript
{
  _id: ObjectId,
  customerDID: String,      // Customer who redeemed
  offerID: String,          // Offer that was redeemed
  shopDID: String,          // Shop that created the offer
  redemptionCount: Number,  // How many times redeemed (for multi-use offers)
  redeemedAt: Date,         // Last redemption timestamp
  createdAt: Date,
  updatedAt: Date
}
```

---

## Benefits

✅ **Per-Customer Tracking** - Each customer has independent redemption state  
✅ **Cross-Device Sync** - Redemption state synced via backend, not browser storage  
✅ **Multi-Device Support** - Customer can see redemptions on any device  
✅ **Shop Analytics Ready** - Can track total redemptions per offer  
✅ **Scalable** - Works with unlimited customers and offers  
✅ **Production Ready** - Uses MongoDB Atlas cloud database  

---

## API Endpoints

### Redeem an Offer
```http
POST /api/redemptions/redeem
Content-Type: application/json

{
  "customerDID": "did:loyvault:abc123",
  "offerID": "offer_xyz",
  "shopDID": "did:loyvault:shop-123"
}
```

### Get Customer Redemptions
```http
GET /api/redemptions/customer/did:loyvault:abc123
```

### Check Specific Redemption
```http
GET /api/redemptions/check/did:loyvault:abc123/offer_xyz
```

---

## Files Modified

### Backend
- ✅ `server/models/OfferRedemption.js` (NEW)
- ✅ `server/routes/redemptions.js` (NEW)
- ✅ `server/server.js` (UPDATED)

### Frontend
- ✅ `src/utils/apiClient.js` (UPDATED)
- ✅ `src/components/customer/OffersPage.jsx` (UPDATED)

---

## Migration Notes

- Existing offers in IndexedDB will be ignored
- All redemption state now comes from backend
- Old browser-based redemptions are not migrated (customers can re-redeem if needed)
- No data loss - offers and customer data remain intact

---

**Status:** ✅ COMPLETE - Ready for Testing
