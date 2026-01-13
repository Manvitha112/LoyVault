import { Shield, Twitter, Linkedin, Github } from "lucide-react";

const productLinks = ["For Customers", "For Businesses", "Pricing", "Demo"];
const resourceLinks = [
  "Documentation",
  "API Reference",
  "Privacy Policy",
  "Terms of Service",
];
const companyLinks = ["About Us", "Contact", "Blog", "Careers"];

export default function Footer() {
  return (
    <footer className="border-t border-purple-500/30 bg-slate-950/95 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-loyvault-purpleFrom to-loyvault-purpleTo">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold tracking-tight">
                LoyVault
              </span>
            </div>
            <p className="max-w-xs text-xs text-white/70">
              Privacy-first loyalty management. Wallet-based credentials that keep
              your identity in your hands.
            </p>
            <div className="flex items-center gap-3 text-white/70">
              <button
                type="button"
                aria-label="LoyVault on Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs transition hover:border-purple-400/80 hover:text-white"
              >
                <Twitter className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="LoyVault on LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs transition hover:border-purple-400/80 hover:text-white"
              >
                <Linkedin className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="LoyVault on GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs transition hover:border-purple-400/80 hover:text-white"
              >
                <Github className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white">Product</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-white/65">
              {productLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="transition-colors hover:text-loyvault-purpleTo"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white">Resources</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-white/65">
              {resourceLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="transition-colors hover:text-loyvault-purpleTo"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-white/65">
              {companyLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="transition-colors hover:text-loyvault-purpleTo"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-[11px] text-white/55 md:flex-row">
          <span>© 2025 LoyVault. All rights reserved.</span>
          <span>Built with self-sovereign identity (SSI) technology.</span>
        </div>
      </div>
    </footer>
  );
}

