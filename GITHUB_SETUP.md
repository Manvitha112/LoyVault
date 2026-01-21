# 📦 GitHub Setup Guide for LoyVault

This guide will help you push your LoyVault project to GitHub.

---

## 🚀 Quick Setup (First Time)

### Step 1: Initialize Git Repository

Open terminal in your project root directory:

```bash
cd c:\Users\91821\Desktop\LoyVaultFinal
git init
```

### Step 2: Add All Files

```bash
git add .
```

### Step 3: Create Initial Commit

```bash
git commit -m "Initial commit: Complete LoyVault loyalty management system"
```

### Step 4: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the **"+"** icon in top-right corner
3. Select **"New repository"**
4. Fill in details:
   - **Repository name:** `LoyVault` (or your preferred name)
   - **Description:** `Privacy-preserving loyalty management system using DIDs`
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README (we already have one)
5. Click **"Create repository"**

### Step 5: Connect Local Repository to GitHub

Replace `yourusername` with your actual GitHub username:

```bash
git remote add origin https://github.com/yourusername/LoyVault.git
git branch -M main
git push -u origin main
```

**If you get authentication error**, use Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when prompted

---

## 🔄 Updating Repository (After Changes)

Whenever you make changes to your code:

```bash
# Check what files changed
git status

# Add all changed files
git add .

# Commit with a descriptive message
git commit -m "Add feature: Analytics dashboard"

# Push to GitHub
git push
```

---

## 📝 Commit Message Examples

Good commit messages:

```bash
git commit -m "Add bulk offer creation feature"
git commit -m "Fix offer filtering bug for joined shops"
git commit -m "Update README with deployment instructions"
git commit -m "Improve invoice management UI"
git commit -m "Add customer profile page with data export"
```

---

## 🌿 Branch Management (Optional)

For feature development:

```bash
# Create and switch to new branch
git checkout -b feature/notification-system

# Make your changes, then commit
git add .
git commit -m "Add notification system"

# Push branch to GitHub
git push -u origin feature/notification-system

# Switch back to main branch
git checkout main

# Merge feature branch (after testing)
git merge feature/notification-system
git push
```

---

## 🔒 Important: Environment Variables

**NEVER commit `.env` files to GitHub!**

Your `.gitignore` already excludes:
- `.env`
- `server/.env`
- `.env.local`
- `.env.production`

### For Collaborators

Create a `.env.example` file in `server/` directory:

```bash
cd server
```

Create `server/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/loyvault
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/loyvault
```

Then commit this example file:

```bash
git add server/.env.example
git commit -m "Add environment variables example"
git push
```

---

## 📋 Pre-Push Checklist

Before pushing to GitHub, ensure:

- [ ] `.env` files are NOT included (check with `git status`)
- [ ] `node_modules/` is NOT included
- [ ] Code is tested and working
- [ ] README.md is up to date
- [ ] Commit message is descriptive
- [ ] No sensitive data (API keys, passwords) in code

---

## 🔍 Verify What Will Be Pushed

```bash
# See which files will be committed
git status

# See the changes in files
git diff

# See commit history
git log --oneline
```

---

## 🛠️ Useful Git Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo changes to a file
git checkout -- filename

# Remove file from staging
git reset HEAD filename

# View remote repository URL
git remote -v

# Pull latest changes from GitHub
git pull

# Clone repository to another location
git clone https://github.com/yourusername/LoyVault.git
```

---

## 🏷️ Creating Releases

After major milestones:

```bash
# Create a tag
git tag -a v1.0.0 -m "Release version 1.0.0 - MVP launch"

# Push tag to GitHub
git push origin v1.0.0

# Or push all tags
git push --tags
```

Then create a release on GitHub:
1. Go to your repository
2. Click "Releases" → "Create a new release"
3. Select your tag
4. Add release notes
5. Publish release

---

## 🚨 Troubleshooting

### Problem: "Permission denied (publickey)"

**Solution:** Use HTTPS instead of SSH, or set up SSH keys

```bash
# Change to HTTPS
git remote set-url origin https://github.com/yourusername/LoyVault.git
```

### Problem: "Updates were rejected"

**Solution:** Pull first, then push

```bash
git pull origin main --rebase
git push
```

### Problem: Accidentally committed `.env` file

**Solution:** Remove from Git history

```bash
# Remove from Git but keep local file
git rm --cached server/.env

# Commit the removal
git commit -m "Remove .env from repository"

# Push
git push
```

---

## 📊 GitHub Repository Settings

### Recommended Settings:

1. **Add Topics** (for discoverability):
   - `loyalty-program`
   - `decentralized-identity`
   - `did`
   - `privacy`
   - `react`
   - `nodejs`
   - `mongodb`

2. **Add Description:**
   ```
   Privacy-preserving loyalty management system using Decentralized Identifiers (DIDs)
   ```

3. **Enable Issues** (for bug tracking)

4. **Add License:**
   - Create `LICENSE` file
   - Choose MIT License (recommended for open source)

5. **Branch Protection** (for main branch):
   - Settings → Branches → Add rule
   - Require pull request reviews before merging

---

## 🤝 Collaborating with Others

### Adding Collaborators:

1. Go to repository Settings
2. Click "Collaborators"
3. Add GitHub usernames

### For Collaborators to Start:

```bash
# Clone the repository
git clone https://github.com/yourusername/LoyVault.git
cd LoyVault

# Install dependencies
npm install
cd server
npm install
cd ..

# Create .env file (copy from .env.example)
cd server
cp .env.example .env
# Edit .env with your MongoDB URI

# Start development
npm run dev  # Frontend
cd server && npm start  # Backend
```

---

## 📦 Complete First-Time Setup Script

Copy and paste this entire script (replace `yourusername`):

```bash
# Navigate to project
cd c:\Users\91821\Desktop\LoyVaultFinal

# Initialize Git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Complete LoyVault loyalty management system with DID-based privacy, automatic invoicing, offer management, and analytics"

# Add remote (replace yourusername)
git remote add origin https://github.com/yourusername/LoyVault.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## ✅ Success!

Your project is now on GitHub! 🎉

**Next Steps:**
1. Add project description and topics on GitHub
2. Star your own repository
3. Share the link with others
4. Set up GitHub Actions for CI/CD (optional)
5. Deploy to production (Vercel + Railway/Render)

**Repository URL:**
```
https://github.com/yourusername/LoyVault
```

---

**Need Help?** 
- [GitHub Docs](https://docs.github.com)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
