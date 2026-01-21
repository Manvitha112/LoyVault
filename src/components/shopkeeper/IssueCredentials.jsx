import React, { useMemo, useState } from "react";
import { Download, Printer, RefreshCw, Info } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { showSuccess, showError, toast } from "../common/Toast.jsx";

export default function IssueCredentials({ shop }) {
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const shopName = shop?.shopName || "Your Shop";
  const shopDID = shop?.shopDID || "did:loyvault:shop-...";

  const qrData = useMemo(
    () =>
      JSON.stringify({
        type: "join",
        shopDID,
        shopName,
        timestamp: Date.now(),
        key: refreshKey,
      }),
    [shopDID, shopName, refreshKey]
  );

  const handleDownloadQR = async () => {
    try {
      const wrapper = document.getElementById("join-qr-wrapper");
      if (!wrapper) {
        throw new Error("QR wrapper not found");
      }

      const svg = wrapper.querySelector("svg");
      if (!svg) {
        throw new Error("QR SVG not found");
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${shopName.replace(/\s+/g, "-")}-join-qr.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess("QR code downloaded");
    } catch (error) {
      console.error("Failed to download QR code", error);
      showError("Failed to download QR code");
    }
  };

  const handlePrintPoster = () => {
    try {
      // Placeholder printable view for now – without real QR image
      const printWindow = window.open("", "", "width=800,height=600");
      if (!printWindow) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>Loyalty Program QR Code</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: Arial, sans-serif;
                padding: 20px;
                background: #0f172a;
                color: #e5e7eb;
              }
              .qr-container {
                text-align: center;
                border: 4px solid #3b82f6;
                padding: 40px;
                border-radius: 20px;
                background: #020617;
              }
              h1 { color: #1d4ed8; margin-bottom: 10px; }
              h2 { color: #64748b; margin-bottom: 30px; }
              .qr-placeholder {
                width: 300px;
                height: 300px;
                border-radius: 16px;
                border: 3px dashed #64748b;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: #9ca3af;
                margin: 0 auto;
              }
              p { color: #64748b; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h1>${shopName}</h1>
              <h2>Scan to Join Loyalty Program</h2>
              <div class="qr-placeholder">QR CODE HERE</div>
              <p>Use LoyVault app to scan</p>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error("Failed to open print view", error);
      showError("Failed to open print view");
    }
  };

  const handleRefresh = () => {
    setRefreshKey(Date.now());
    toast("QR code refreshed (placeholder)");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Issue Loyalty Credentials</h1>
        <p className="mt-1 text-sm text-blue-300">
          Display this QR code at your counter for customers to join.
        </p>
      </div>

      {/* QR Code Display */}
      <div className="rounded-2xl border border-blue-400/30 bg-white/10 p-8 backdrop-blur-lg">
        <div className="flex flex-col items-center">
          <div
            id="join-qr-wrapper"
            className="mb-6 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <QRCodeSVG
              value={qrData}
              size={256}
              level="H"
              includeMargin
            />
          </div>

          <h3 className="mb-2 text-2xl font-bold text-white">{shopName}</h3>
          <p className="mb-6 text-sm text-blue-300">Scan to join loyalty program</p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
            >
              <Download className="h-5 w-5" />
              <span>Download QR</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPoster}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-400/30 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/20"
            >
              <Printer className="h-5 w-5" />
              <span>Print Poster</span>
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center justify-center rounded-lg border border-blue-400/30 bg-white/10 p-3 text-blue-300 transition-all hover:bg-white/20"
              title="Refresh QR"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-blue-400/30 bg-white/10 p-6 backdrop-blur-lg">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Info className="h-5 w-5 text-blue-400" />
          How It Works
        </h3>
        <ol className="space-y-3 text-sm text-blue-200">
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              1
            </span>
            <span>Customer scans QR code with LoyVault wallet app.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              2
            </span>
            <span>Customer approves sharing their anonymous DID.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              3
            </span>
            <span>System automatically creates and issues a loyalty credential.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              4
            </span>
            <span>
              Customer becomes your loyalty member – no personal data collected.
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
