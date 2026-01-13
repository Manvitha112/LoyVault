import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ArrowLeft, CheckCircle2, Download } from "lucide-react";
import { generateDID, generateSeedPhrase, didFromSeedPhrase } from "../../utils/didGenerator";
import { saveIdentity, getIdentity, importWallet } from "../../utils/indexedDB";
import { hashPIN } from "../../utils/encryption";
import { validateDID, validateSeedPhrase, validatePIN } from "../../utils/validation";
import { toast } from "../common/Toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const panelVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: "easeIn" } },
};

const errorShakeVariants = {
  initial: { x: 0 },
  shake: {
    x: [0, -4, 4, -3, 3, -2, 2, 0],
    transition: { duration: 0.4 },
  },
};

export default function CustomerAuth() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [mode, setMode] = useState("create"); // "create" | "import"
  const [step, setStep] = useState("select"); // "select" | "generating" | "display" | "backup" | "pin" | "complete"
  const [did, setDid] = useState(null); // DID object
  const [seedPhrase, setSeedPhrase] = useState([]); // 12-word array
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [importing, setImporting] = useState({ method: "did", data: "" });
  const [generationError, setGenerationError] = useState("");
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [saving, setSaving] = useState(false);
  const [completeError, setCompleteError] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [seedInputs, setSeedInputs] = useState(Array(12).fill(""));

  const handleBack = () => {
    navigate("/get-started");
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    // Reset steps when switching modes for now
    setStep("select");
    setGenerationError("");
  };

  const handleGenerateWallet = async () => {
    try {
      setGenerationError("");
      setDid(null);
      setSeedPhrase([]);
      setShowSeedPhrase(false);
      setBackupConfirmed(false);
      setStep("generating");

      const didObj = generateDID();
      const phrase = generateSeedPhrase();

      // artificial delay for UX
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setDid(didObj);
      setSeedPhrase(phrase);
      setStep("display");
      toast.success("Wallet DID generated successfully");
    } catch (error) {
      console.error("[CustomerAuth] generate wallet failed", error);
      setGenerationError("Failed to generate wallet. Please try again.");
      toast.error("Failed to generate wallet. Please try again.");
      setStep("select");
    }
  };

  const handleDownloadBackup = () => {
    if (!did || !seedPhrase.length) return;
    try {
      const backup = {
        identity: {
          ...did,
          seedPhrase,
        },
        credentials: [],
        settings: {},
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "loyvault-wallet-backup.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Wallet backup downloaded");
    } catch (error) {
      console.error("[CustomerAuth] download backup failed", error);
      toast.error("Failed to download backup");
    }
  };

  const handleCompleteSetup = async () => {
    if (!did) return;
    if (pin) {
      const pinCheck = validatePIN(pin);
      if (!pinCheck.valid) {
        setPinError(pinCheck.error);
        return;
      }
      if (pin !== confirmPin) {
        setPinError("PIN and confirmation do not match.");
        return;
      }
    }
    setPinError("");
    setSaving(true);
    setCompleteError("");
    try {
      const identityPayload = {
        ...did,
        seedPhrase,
        pin: pin || null,
      };
      const ok = await saveIdentity(identityPayload);
      if (!ok) {
        throw new Error("saveIdentity returned false");
      }
      login("customer", { did: did.did });
      toast.success("Wallet created successfully");
      navigate("/customer/dashboard");
    } catch (error) {
      console.error("[CustomerAuth] complete setup failed", error);
      setCompleteError("Could not save wallet locally. Please try again.");
      toast.error("Could not save wallet locally. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderCreateContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-5"
        >
          {step === "select" && (
            <div className="space-y-4 text-sm text-white/80">
              <div className="rounded-2xl bg-gradient-to-tr from-loyvault-purpleFrom/25 to-loyvault-purpleTo/20 p-4 border border-loyvault-purpleTo/50">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-100/90">
                  New decentralized identity
                </p>
                <p className="mt-2 text-[13px] text-white/85">
                  A new LoyVault DID and keypair will be generated in your browser.
                  No personal information is required.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-white/80">
                  <li>✓ No personal information required</li>
                  <li>✓ Your identity stays with you</li>
                  <li>✓ Can be backed up securely with a seed phrase</li>
                </ul>
              </div>
              {generationError && (
                <motion.p
                  className="text-[11px] text-red-300"
                  variants={errorShakeVariants}
                  initial="initial"
                  animate="shake"
                >
                  {generationError}
                </motion.p>
              )}
              <button
                type="button"
                onClick={handleGenerateWallet}
                className="mt-1 rounded-full bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo px-5 py-2.5 text-xs font-semibold shadow-lg shadow-purple-600/40 transition hover:brightness-110"
              >
                Generate My DID
              </button>
            </div>
          )}

          {step === "generating" && (
            <div className="space-y-4 text-sm text-white/80">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-200/80">
                Generating wallet
              </p>
              <p>
                Generating secure decentralized identity in your browser. This may
                take a few seconds.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-400/70 bg-black/40">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                  >
                    <Wallet className="h-4 w-4 text-loyvault-purpleTo" />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full w-1/2 rounded-full bg-gradient-to-r from-loyvault-purpleFrom to-loyvault-purpleTo"
                      animate={{ x: ["-50%", "150%"] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-white/60 md:justify-end">
                <span className="inline-flex h-6 items-center rounded-full border border-white/15 bg-black/40 px-2">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Step {mode === "create" ? (step === "select" ? "1" : step === "generating" ? "2" : step === "display" ? "3" : step === "backup" ? "4" : step === "pin" ? "5" : "6") : "Import"} of {mode === "create" ? "6" : "-"}
                </span>
              </div>
            </div>
          )}

          {step === "display" && (
            <div className="space-y-4 text-sm text-white/80">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-200/80">
                Wallet created
              </p>
              <p className="text-[13px] text-white/75">
                Here is your new LoyVault identity. Next, we&apos;ll show you a recovery
                seed phrase so you can restore this wallet on any device.
              </p>
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                <span>Your DID was created successfully.</span>
              </div>
              <div className="rounded-2xl border border-white/15 bg-black/40 p-3 text-xs">
                <p className="font-medium text-white/80">Your DID</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="break-all text-white/70 text-[11px]">
                    {did?.did ?? "did:loyvault:pending"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (did?.did) {
                        navigator.clipboard?.writeText(did.did).then(
                          () => {
                            toast.success("DID copied to clipboard");
                          },
                          () => {
                            toast.error("Unable to copy DID");
                          },
                        );
                      }
                    }}
                    className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-white/80 hover:border-white/35 hover:bg-white/10"
                  >
                    <Download className="h-3 w-3" />
                    Copy
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-white/55">
                  This is your unique identifier. Keep it safe.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep("backup")}
                className="rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white/85 backdrop-blur-sm transition hover:border-white/45 hover:bg-white/10"
              >
                View Recovery Seed Phrase
              </button>
            </div>
          )}

          {step === "backup" && (
            <div className="space-y-4 text-sm text-white/80">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-200/80">
                Backup required
              </p>
              <p className="text-[13px] text-white/75">
                Write down these 12 words in order and keep them somewhere safe. This
                is the ONLY way to recover your wallet if you lose access.
              </p>
              <div className="rounded-2xl border border-purple-400/60 bg-black/40 p-4 text-xs">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {seedPhrase.length > 0 ? (
                    seedPhrase.map((word, idx) => (
                      <div
                        key={`${word}-${idx}`}
                        className={`flex items-center gap-2 rounded-full px-3 py-1 ${
                          showSeedPhrase ? "bg-white/5" : "bg-white/5 blur-sm"
                        }`}
                      >
                        <span className="text-[10px] text-white/50">
                          {(idx + 1).toString().padStart(2, "0")}
                        </span>
                        <span className="text-[11px] font-medium">{word}</span>
                      </div>
                    ))
                  ) : (
                    <span className="col-span-2 text-[11px] text-white/60 md:col-span-3">
                      Seed phrase will be shown here.
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <label className="flex items-center gap-2 text-[11px] text-white/75">
                  <input
                    type="checkbox"
                    checked={backupConfirmed}
                    onChange={(e) => setBackupConfirmed(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border border-white/30 bg-black/40 text-loyvault-purpleTo"
                  />
                  <span>I have written down my seed phrase</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSeedPhrase((prev) => !prev)}
                  className="rounded-full border border-white/25 bg-white/5 px-4 py-2 text-white/85 backdrop-blur-sm transition hover:border-white/45 hover:bg-white/10"
                >
                  {showSeedPhrase ? "Hide Seed Phrase" : "Reveal Seed Phrase"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-white/85 backdrop-blur-sm transition hover:border-white/45 hover:bg-white/10"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Backup
                </button>
                <button
                  type="button"
                  disabled={!backupConfirmed}
                  onClick={() => setStep("pin")}
                  className={`rounded-full px-4 py-2 text-xs font-semibold shadow-lg shadow-purple-600/40 transition hover:brightness-110 ${
                    backupConfirmed
                      ? "bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo"
                      : "bg-slate-700 text-white/60 cursor-not-allowed shadow-none"
                  }`}
                >
                  I&apos;ve Saved It, Continue
                </button>
              </div>
            </div>
          )}

          {step === "pin" && (
            <div className="space-y-4 text-sm text-white/80">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-200/80">
                Optional PIN
              </p>
              <p className="text-[13px] text-white/75">
                Set a PIN for quick access on this device. You can skip this step if
                you prefer to rely on the seed phrase only.
              </p>
              <div className="flex flex-col gap-3 text-xs md:flex-row">
                <div className="flex-1 space-y-1">
                  <label className="block text-white/70">PIN (4-6 digits)</label>
                  <input
                    type="password"
                    value={pin}
                    maxLength={6}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full rounded-full border border-white/20 bg-black/40 px-3 py-2 text-xs text-white outline-none ring-0 placeholder:text-white/35 focus:border-loyvault-purpleTo"
                    placeholder="Enter PIN"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="block text-white/70">Confirm PIN</label>
                  <input
                    type="password"
                    value={confirmPin}
                    maxLength={6}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full rounded-full border border-white/20 bg-black/40 px-3 py-2 text-xs text-white outline-none ring-0 placeholder:text-white/35 focus:border-loyvault-purpleTo"
                    placeholder="Re-enter PIN"
                  />
                </div>
              </div>
              {pinError && (
                <motion.p
                  className="text-[11px] text-red-300"
                  variants={errorShakeVariants}
                  initial="initial"
                  animate="shake"
                >
                  {pinError}
                </motion.p>
              )}
              <div className="flex flex-wrap gap-3 text-xs">
                <button
                  type="button"
                  onClick={handleCompleteSetup}
                  className="rounded-full bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo px-5 py-2.5 text-xs font-semibold shadow-lg shadow-purple-600/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
                  disabled={saving}
                >
                  {saving ? "Completing..." : "Complete Setup"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPin("");
                    setConfirmPin("");
                    handleCompleteSetup();
                  }}
                  className="rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white/85 backdrop-blur-sm transition hover:border-white/45 hover:bg-white/10 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  Skip PIN & Continue
                </button>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="space-y-4 text-sm text-white/80">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-200/90">
                Wallet ready
              </p>
              <p className="text-[13px] text-white/75">
                Your LoyVault wallet is set up. You can now join loyalty programs and
                receive credentials from shops.
              </p>
              {completeError && (
                <p className="text-[11px] text-red-300">{completeError}</p>
              )}
              <button
                type="button"
                onClick={() => navigate("/customer/dashboard")}
                className="rounded-full bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo px-5 py-2.5 text-xs font-semibold shadow-lg shadow-purple-600/40 transition hover:brightness-110"
              >
                Go to Wallet Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderImportContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={importing.method}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-5"
        >
          <div className="flex flex-wrap gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setImporting({ method: "did", data: "" });
                setImportError("");
                setImportSuccess("");
              }}
              className={`rounded-full px-3 py-1.5 border text-xs transition ${
                importing.method === "did"
                  ? "border-loyvault-purpleTo bg-loyvault-purpleTo/20 text-white"
                  : "border-white/20 bg-white/5 text-white/75 hover:border-white/35 hover:bg-white/10"
              }`}
            >
              Use DID
            </button>
            <button
              type="button"
              onClick={() => {
                setImporting({ method: "json", data: "" });
                setImportError("");
                setImportSuccess("");
              }}
              className={`rounded-full px-3 py-1.5 border text-xs transition ${
                importing.method === "json"
                  ? "border-loyvault-purpleTo bg-loyvault-purpleTo/20 text-white"
                  : "border-white/20 bg-white/5 text-white/75 hover:border-white/35 hover:bg-white/10"
              }`}
            >
              Upload Backup JSON
            </button>
            <button
              type="button"
              onClick={() => {
                setImporting({ method: "pin", data: "" });
                setImportError("");
                setImportSuccess("");
              }}
              className={`rounded-full px-3 py-1.5 border text-xs transition ${
                importing.method === "pin"
                  ? "border-loyvault-purpleTo bg-loyvault-purpleTo/20 text-white"
                  : "border-white/20 bg-white/5 text-white/75 hover:border-white/35 hover:bg-white/10"
              }`}
            >
              Unlock with PIN / Seed
            </button>
          </div>

          {importing.method === "did" && (
            <div className="space-y-3 text-sm text-white/80">
              <p>Paste your existing LoyVault DID and PIN to unlock your wallet on this device.</p>
              {importError && (
                <motion.p
                  className="text-[11px] text-red-300"
                  variants={errorShakeVariants}
                  initial="initial"
                  animate="shake"
                >
                  {importError}
                </motion.p>
              )}
              {(() => {
                const check = validateDID(importing.data);
                if (!importing.data) return null;
                return (
                  <p
                    className={`text-[11px] ${
                      check.valid ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {check.valid ? "DID looks valid." : check.error}
                  </p>
                );
              })()}
              <textarea
                rows={3}
                value={importing.data}
                onChange={(e) => setImporting({ method: "did", data: e.target.value })}
                placeholder="did:loyvault:your-existing-id"
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none ring-0 placeholder:text-white/35 focus:border-loyvault-purpleTo"
              />
              <input
                type="password"
                placeholder="Enter PIN (if set)"
                className="w-full rounded-full border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none ring-0 placeholder:text-white/35 focus:border-loyvault-purpleTo"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <button
                type="button"
                disabled={importLoading}
                onClick={async () => {
                  setImportError("");
                  setImportSuccess("");
                  const trimmedDid = importing.data.trim();
                  const didCheck = validateDID(trimmedDid);
                  const pinCheck = pin ? validatePIN(pin) : { valid: true };
                  if (!didCheck.valid) {
                    setImportError(didCheck.error);
                    return;
                  }
                  if (!pinCheck.valid) {
                    setImportError(pinCheck.error);
                    return;
                  }
                  setImportLoading(true);
                  try {
                    const identity = await getIdentity();
                    if (!identity || identity.did !== trimmedDid) {
                      const msg = "Wallet not found on this device. Try uploading a backup instead.";
                      setImportError(msg);
                      toast.error(msg);
                    } else if (identity.pinHash) {
                      const enteredHash = await hashPIN(pin || "");
                      if (enteredHash !== identity.pinHash) {
                        const msg = "Incorrect PIN for this wallet.";
                        setImportError(msg);
                        toast.error(msg);
                      } else {
                        login("customer", { did: identity.did });
                        toast.success("Wallet unlocked");
                        navigate("/customer/dashboard");
                      }
                    } else {
                      login("customer", { did: identity.did });
                      toast.success("Wallet unlocked");
                      navigate("/customer/dashboard");
                    }
                  } catch (error) {
                    console.error("[CustomerAuth] DID import failed", error);
                    const msg = "Unable to check local wallet. Please try again.";
                    setImportError(msg);
                    toast.error(msg);
                  } finally {
                    setImportLoading(false);
                  }
                }}
                className="mt-2 rounded-full bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo px-5 py-2.5 text-xs font-semibold shadow-lg shadow-purple-600/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
              >
                {importLoading ? "Checking..." : "Unlock Wallet"}
              </button>
            </div>
          )}

          {importing.method === "json" && (
            <div className="space-y-3 text-sm text-white/80">
              <p>Upload a JSON backup file that you previously exported from LoyVault.</p>
              {importError && (
                <p className="text-[11px] text-red-300">{importError}</p>
              )}
              {importSuccess && (
                <p className="text-[11px] text-emerald-300">{importSuccess}</p>
              )}
              <input
                type="file"
                accept="application/json"
                className="w-full text-xs text-white/70 file:mr-3 file:rounded-full file:border file:border-white/20 file:bg-white/10 file:px-3 file:py-1.5 file:text-[11px] file:text-white hover:file:border-white/40 hover:file:bg-white/15"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImportError("");
                  setImportSuccess("");
                  setImportLoading(true);
                  try {
                    const op = (async () => {
                      const text = await file.text();
                      const json = JSON.parse(text);
                      if (!json || typeof json !== "object") {
                        throw new Error("Invalid JSON structure");
                      }
                      const ok = await importWallet(json);
                      if (!ok) {
                        throw new Error("importWallet returned false");
                      }
                      const identity = json.identity || (await getIdentity());
                      if (!identity || !identity.did) {
                        throw new Error("No identity found in backup");
                      }
                      setImportSuccess("Backup imported successfully. Redirecting to your wallet...");
                      login("customer", { did: identity.did });
                      navigate("/customer/dashboard");
                    })();

                    await toast.promise(op, {
                      loading: "Importing wallet backup...",
                      success: "Wallet imported successfully",
                      error: "Failed to import backup file",
                    });
                  } catch (error) {
                    console.error("[CustomerAuth] JSON import failed", error);
                    setImportError("Failed to import backup file. Please check the file and try again.");
                  } finally {
                    setImportLoading(false);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          )}

          {importing.method === "pin" && (
            <div className="space-y-3 text-sm text-white/80">
              <p>Enter your 12-word recovery phrase to restore your LoyVault wallet.</p>
              {importError && (
                <motion.p
                  className="text-[11px] text-red-300"
                  variants={errorShakeVariants}
                  initial="initial"
                  animate="shake"
                >
                  {importError}
                </motion.p>
              )}
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {seedInputs.map((value, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1">
                    <span className="text-[10px] text-white/50">
                      {(idx + 1).toString().padStart(2, "0")}
                    </span>
                    <input
                      type="text"
                      autoComplete="off"
                      value={value}
                      onChange={(e) => {
                        const text = e.target.value.trim();
                        if (idx === 0 && text.includes(" ")) {
                          const parts = text.split(/\s+/).slice(0, 12);
                          const next = Array(12)
                            .fill("")
                            .map((_, i) => parts[i] || "");
                          setSeedInputs(next);
                        } else {
                          const next = [...seedInputs];
                          next[idx] = text;
                          setSeedInputs(next);
                        }
                      }}
                      className="flex-1 bg-transparent text-[11px] text-white outline-none placeholder:text-white/35"
                      placeholder="word"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled={importLoading}
                onClick={async () => {
                  setImportError("");
                  const words = seedInputs.map((w) => w.trim()).filter(Boolean);
                  const check = validateSeedPhrase(words);
                  if (!check.valid) {
                    setImportError(check.error);
                    return;
                  }
                  setImportLoading(true);
                  try {
                    const op = (async () => {
                      const identity = didFromSeedPhrase(words);
                      const ok = await saveIdentity({ ...identity, seedPhrase: words, pin: null });
                      if (!ok) {
                        throw new Error("saveIdentity returned false");
                      }
                      login("customer", { did: identity.did });
                      navigate("/customer/dashboard");
                    })();

                    await toast.promise(op, {
                      loading: "Restoring wallet from seed phrase...",
                      success: "Wallet restored successfully",
                      error: "Failed to restore wallet from seed phrase",
                    });
                  } catch (error) {
                    console.error("[CustomerAuth] seed phrase restore failed", error);
                    setImportError("Failed to restore wallet from seed phrase. Please double-check the words.");
                  } finally {
                    setImportLoading(false);
                  }
                }}
                className="mt-2 rounded-full bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo px-5 py-2.5 text-xs font-semibold shadow-lg shadow-purple-600/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
              >
                {importLoading ? "Restoring..." : "Restore Wallet"}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950/95 py-20 text-white">
      <div className="mx-auto max-w-3xl px-4">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70 backdrop-blur transition hover:border-white/25 hover:bg-white/10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to role selection</span>
        </button>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-slate-900/80 p-6 shadow-[0_0_50px_rgba(168,85,247,0.5)] backdrop-blur-xl md:p-8"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.2),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),_transparent_55%)]" />

          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo text-white shadow-lg shadow-purple-700/40">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight md:text-xl">
                    Access Your Wallet
                  </h1>
                  <p className="text-[12px] text-white/70 md:text-xs">
                    Secure. Private. Self-Sovereign.
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="inline-flex rounded-full border border-white/10 bg-black/40 p-1 text-xs backdrop-blur"
              role="tablist"
              aria-label="Wallet access mode"
            >
              <button
                type="button"
                onClick={() => handleModeChange("create")}
                className={`rounded-full px-4 py-1.5 transition ${
                  mode === "create"
                    ? "bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo text-white shadow-[0_0_18px_rgba(168,85,247,0.8)]"
                    : "text-white/70 hover:text-white"
                }`}
                role="tab"
                aria-selected={mode === "create"}
              >
                Create New Wallet
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("import")}
                className={`rounded-full px-4 py-1.5 transition ${
                  mode === "import"
                    ? "bg-white text-slate-950 shadow-[0_0_18px_rgba(148,163,184,0.8)]"
                    : "text-white/70 hover:text-white"
                }`}
                role="tab"
                aria-selected={mode === "import"}
              >
                Import Existing Wallet
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-white/80 focus-within:border-loyvault-purpleTo">
              {mode === "create" ? renderCreateContent() : renderImportContent()}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

