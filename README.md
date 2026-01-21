# 🎯 LoyVault - Privacy-Preserving Loyalty Management System

![LoyVault Banner](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**LoyVault** is a decentralized, privacy-first loyalty program management system that uses **Decentralized Identifiers (DIDs)** to enable customers and businesses to manage loyalty programs without sharing personal data.

---

## 🌟 Key Features

### For Customers
- ✅ **Privacy-First**: No phone number, email, or personal data required
- ✅ **DID-Based Identity**: Unique decentralized identifier for each customer
- ✅ **Multi-Shop Wallet**: Manage loyalty cards from multiple shops in one place
- ✅ **Automatic Tier Upgrades**: Base → Bronze → Silver → Gold → Platinum
- ✅ **Digital Receipts**: Automatic invoice delivery with GST breakdown
- ✅ **Instant Offers**: Receive tier-based offers automatically
- ✅ **Profile & Analytics**: View stats and export your data
- ✅ **Cross-Device Sync**: Access your wallet from any device

### For Businesses
- ✅ **Easy Setup**: Generate Shop DID and Join QR in seconds
- ✅ **Customer Verification**: Scan QR to verify membership and tier
- ✅ **Automatic Invoicing**: GST-compliant invoices created on every transaction
- ✅ **Offer Management**: Create single or bulk offers with CSV import/export
- ✅ **Analytics Dashboard**: Track revenue, members, tier distribution, trends
- ✅ **Invoice Management**: Search, filter, and export invoices for accounting
- ✅ **Privacy Compliant**: Never see customer personal data, only DIDs

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **QRCode.react** - QR code generation
- **html5-qrcode** - QR code scanning
- **idb** - IndexedDB wrapper for local storage
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

---

## 📁 Project Structure

```
LoyVaultFinal/
├── src/                          # Frontend source code
│   ├── components/
│   │   ├── common/              # Shared components
│   │   │   ├── NotificationBadge.jsx
│   │   │   └── Toast.jsx
│   │   ├── customer/            # Customer-specific components
│   │   │   ├── BottomNav.jsx
│   │   │   ├── DashboardHeader.jsx
│   │   │   ├── LoyaltyCardsGrid.jsx
│   │   │   ├── OffersPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ReceiptsPage.jsx
│   │   │   ├── ScanQRPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── WalletOverview.jsx
│   │   ├── landing/             # Landing page components
│   │   │   ├── Benefits.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   └── Stats.jsx
│   │   └── shopkeeper/          # Shopkeeper-specific components
│   │       ├── AnalyticsDashboard.jsx
│   │       ├── BulkOfferCreation.jsx
│   │       ├── DashboardHeader.jsx
│   │       ├── DashboardOverview.jsx
│   │       ├── InvoiceManagement.jsx
│   │       ├── IssueCredentials.jsx
│   │       ├── ManageOffers.jsx
│   │       ├── RedeemOffer.jsx
│   │       ├── ShopSettings.jsx
│   │       ├── Sidebar.jsx
│   │       └── VerifyCustomer.jsx
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── pages/
│   │   ├── CustomerDashboard.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ShopDashboard.jsx
│   ├── utils/
│   │   ├── apiClient.js         # Backend API calls
│   │   ├── credentialStorage.js # Credential management
│   │   ├── encryption.js        # Encryption utilities
│   │   ├── indexedDB.js         # IndexedDB setup
│   │   ├── notificationStorage.js # Notification management
│   │   ├── offerStorage.js      # Offer management
│   │   └── qrCodeUtils.js       # QR code utilities
│   ├── App.jsx                  # Main app component
│   ├── index.css                # Global styles
│   └── main.jsx                 # App entry point
├── server/                       # Backend source code
│   ├── models/
│   │   ├── Customer.js          # Customer schema
│   │   ├── Invoice.js           # Invoice schema
│   │   ├── LoyaltyProgram.js    # Loyalty program schema
│   │   ├── Offer.js             # Offer schema
│   │   └── Shop.js              # Shop schema
│   ├── routes/
│   │   ├── customers.js         # Customer API routes
│   │   ├── invoices.js          # Invoice API routes
│   │   ├── loyalty.js           # Loyalty program API routes
│   │   └── offers.js            # Offer API routes
│   ├── .env                     # Environment variables
│   └── server.js                # Express server setup
├── public/                       # Static assets
├── .gitignore                   # Git ignore rules
├── package.json                 # Frontend dependencies
├── tailwind.config.js           # Tailwind configuration
├── vite.config.js               # Vite configuration
└── README.md                    # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/LoyVault.git
cd LoyVault
```

#### 2. Install Frontend Dependencies

```bash
npm install
```

#### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

#### 4. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cd server
```

Create `.env` file with the following content:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/loyvault
# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/loyvault?retryWrites=true&w=majority
```

#### 5. Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGODB_URI` in `.env`

#### 6. Start the Backend Server

```bash
cd server
npm start
```

Backend will run on `http://localhost:5000`

#### 7. Start the Frontend Development Server

Open a new terminal:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

#### 8. Open in Browser

Navigate to `http://localhost:5173`

---

## 📖 Usage Guide

### For Customers

1. **Create Wallet**
   - Click "Get Started" → "Customer"
   - Enter name and 4-digit PIN
   - Your DID is generated automatically

2. **Join a Shop**
   - Go to "Scan" tab
   - Upload shop's Join QR code
   - Loyalty card appears in your wallet

3. **Earn Points**
   - At checkout, show your loyalty QR
   - Shopkeeper scans and adds points
   - Receive digital receipt automatically

4. **View Offers**
   - Check "My Offers" tab
   - See tier-based offers from joined shops
   - Mark as redeemed when used

5. **View Receipts**
   - Check "Receipts" tab
   - View all transaction history
   - See GST breakdown and points earned

6. **View Profile**
   - Check "Profile" tab
   - See your stats across all shops
   - Export your data as JSON

### For Businesses

1. **Register Shop**
   - Click "Get Started" → "Business"
   - Enter shop name and 4-digit PIN
   - Your Shop DID is generated

2. **Display Join QR**
   - Go to "Issue Credentials"
   - Download your Join QR code
   - Display at counter/receipts

3. **Verify Customer**
   - Go to "Verify Customer"
   - Upload customer's loyalty QR
   - Enter purchase amount
   - Points and invoice created automatically

4. **Create Offers**
   - Go to "Manage Offers"
   - Create single offer or bulk offers
   - Import from CSV for bulk creation
   - Offers delivered to customers automatically

5. **View Analytics**
   - Go to "Analytics"
   - Track revenue, members, trends
   - Filter by time range
   - View tier distribution

6. **Manage Invoices**
   - Go to "Invoices"
   - Search and filter invoices
   - Export to CSV for accounting
   - View detailed breakdowns

---

## 🔑 Key Concepts

### Decentralized Identifiers (DIDs)

- Unique identifier for each customer and shop
- Format: `did:key:z6Mk...` (Ed25519 key pair)
- No personal data attached
- Privacy-preserving by design

### Tier System

| Tier | Points Required | Benefits |
|------|----------------|----------|
| Base | 0 | Basic access |
| Bronze | 100+ | Bronze-tier offers |
| Silver | 200+ | Silver-tier offers |
| Gold | 300+ | Gold-tier offers |
| Platinum | 500+ | Platinum-tier offers |

### Points Calculation

- **1 point = ₹10 spent**
- Example: ₹500 purchase = 50 points
- Automatic tier upgrade when threshold reached

### Invoice System

- Automatic GST calculation (18%)
- Unique transaction ID
- Includes: Subtotal, GST, Total, Points, Tier
- Delivered to customer wallet automatically

---

## 🗄️ Database Schema

### Customer
```javascript
{
  did: String (unique),
  name: String,
  pinHash: String,
  createdAt: Date
}
```

### Shop
```javascript
{
  shopDID: String (unique),
  name: String,
  pinHash: String,
  createdAt: Date
}
```

### LoyaltyProgram
```javascript
{
  did: String (customer DID),
  shopDID: String,
  points: Number,
  tier: String,
  joinedAt: Date,
  lastUpdated: Date
}
```

### Offer
```javascript
{
  shop: ObjectId,
  shopDID: String,
  shopName: String,
  title: String,
  description: String,
  offerType: String,
  discountValue: Number,
  minTier: String,
  minPurchase: Number,
  startDate: Date,
  endDate: Date,
  maxRedemptionsPerCustomer: Number,
  createdAt: Date
}
```

### Invoice
```javascript
{
  transactionId: String (unique),
  shopDID: String,
  customerDID: String,
  subtotal: Number,
  gst: Number,
  total: Number,
  pointsAdded: Number,
  tierAfter: String,
  createdAt: Date
}
```

---

## 🔧 API Endpoints

### Customer Routes (`/api/customers`)
- `POST /` - Create customer
- `GET /:did` - Get customer by DID
- `POST /login` - Customer login

### Shop Routes (`/api/shops`)
- `POST /` - Create shop
- `GET /:shopDID` - Get shop by DID
- `POST /login` - Shop login

### Loyalty Routes (`/api/loyalty`)
- `POST /join` - Join loyalty program
- `GET /programs/:did` - Get customer's programs
- `PUT /update-points` - Update customer points
- `GET /stats/:shopDID` - Get shop loyalty stats

### Offer Routes (`/api/offers`)
- `POST /` - Create offer
- `GET /for-did/:did` - Get offers for customer
- `GET /stats/:shopDID` - Get offer stats

### Invoice Routes (`/api/invoices`)
- `POST /` - Create invoice
- `GET /for-customer/:did` - Get customer invoices
- `GET /for-shop/:shopDID` - Get shop invoices
- `GET /stats/:shopDID` - Get invoice stats

---

## 🎨 Features Breakdown

### ✅ Implemented Features

#### Core Features
- [x] Customer & Shop registration with DID
- [x] QR-based loyalty program joining
- [x] Points earning system (1 point per ₹10)
- [x] Automatic tier upgrades
- [x] Customer verification with validation
- [x] Cross-device sync via backend
- [x] Local storage with IndexedDB

#### Offer System
- [x] Single offer creation
- [x] Bulk offer creation with CSV
- [x] Automatic offer delivery
- [x] Tier-based targeting
- [x] Offer redemption tracking

#### Invoice System
- [x] Automatic invoice generation
- [x] GST calculation (18%)
- [x] Transaction ID generation
- [x] Digital receipt delivery
- [x] Invoice management & export

#### Analytics
- [x] Shop analytics dashboard
- [x] Revenue tracking
- [x] Customer tier distribution
- [x] Time-range filtering
- [x] Key metrics & insights

#### Customer Features
- [x] Wallet overview
- [x] Loyalty cards grid
- [x] My Offers page
- [x] My Receipts page
- [x] Profile page with export
- [x] QR scanning

#### Shop Features
- [x] Dashboard overview
- [x] Issue credentials
- [x] Verify customer
- [x] Manage offers
- [x] Invoice management
- [x] Analytics dashboard

---

## 🚢 Deployment

### Frontend Deployment (Vercel/Netlify)

#### Vercel
```bash
npm install -g vercel
vercel login
vercel
```

#### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Backend Deployment (Railway/Render)

#### Railway
1. Create account at [Railway](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Add MongoDB service
5. Set environment variables
6. Deploy

#### Render
1. Create account at [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `cd server && npm install`
5. Set start command: `cd server && npm start`
6. Add environment variables
7. Deploy

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Decentralized Identity Foundation for DID standards
- React and Vite teams for amazing tools
- MongoDB team for excellent database
- Tailwind CSS for beautiful styling
- All open-source contributors

---

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

## 🔮 Future Enhancements

- [ ] Push notifications for new offers
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics with charts
- [ ] Offer redemption verification at POS
- [ ] Customer referral system
- [ ] Shop-to-shop partnerships
- [ ] Blockchain integration for credentials

---

**Made with ❤️ using React, Node.js, and MongoDB**
