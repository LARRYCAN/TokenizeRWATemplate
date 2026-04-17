# 🧱 RWA Tokenization Template (Algorand)

A beginner-friendly, end-to-end template for tokenizing real-world assets (RWAs) on Algorand testnet using Algorand Standard Assets (ASAs).

**This repository is designed for:**
- Founders exploring RWA proofs-of-concept
- Builders new to Algorand
- Hackathons, demos, workshops, and early product experiments

No prior blockchain or smart contract experience required. By the end, you'll have a working tokenized asset with a real Algorand Asset ID.

---

## ✨ What This Template Gives You

- ✅ Complete Algorand starter app (user interface + backend)
- ✅ Simple flow to create and send Algorand assets (tokens)
- ✅ Easy sign-in options (Email login + wallet login)
- ✅ Ready to test on Algorand TestNet
- ✅ Quick one-step setup (no complex installation)
- ✅ Can be deployed online (Vercel), with analytics included

---

## 🧠 What "RWA Tokenization" Means Here

This template covers the blockchain “token” part of real-world asset (RWA) tokenization:

- Each real-world asset is represented as an token on the Algorand blockchain (ASA)
- Ownership, supply and transfers are tracked on the blockchain
- The real-world paperwork (documents, custody, legal structure) stays off the blockchain

> ⚠️ This is a technical proof-of-concept template, not legal or financial advice.

---

## 🚀 Getting Started (5 Minutes)

### Option 1: [GitHub Codespaces](https://github.com/features/codespaces) (Recommended)

This is the fastest and easiest way to run the project.

#### 1️⃣ Fork the repository

Click **Fork** (top-right of this page) to create your own copy.

https://github.com/user-attachments/assets/92e746e1-3143-4769-8a5a-1339e4bd7a14

#### 2️⃣ Open in Codespaces

1. Go to your forked repository
2. Click **Code → Codespaces → Create codespace**
3. Wait for the environment to load and enter the workspace

> When the Codespace loads, you may see an **"Open Workspace?"** popup in the bottom-right — click **Yes**.

Or manually enter it like below:

<img width="2794" height="1524" alt="Codespace workspace setup" src="https://github.com/user-attachments/assets/41f25490-1284-4998-b342-27f7a0ffb420" />

#### 3️⃣ Run the setup script

In the Codespaces terminal, run:

```bash
bash setup.sh
```

This script will:
- Install everything needed
- Set up the required files automatically
- Start the app for you (open the website)

👉 When it finishes, a web app link will open automatically in Codespaces.

> ⚠️ You do not need to manually create `.env` files for the frontend.

---

## 🔐 Web3Auth setup required

To enable email/social login, you must configure Web3Auth in your Web3Auth dashboard first.

### Steps

1. Go to the [Web3Auth Dashboard](https://dashboard.web3auth.io/)
2. Create a new project
3. Copy your **Client ID**

### Where to paste it

Open the file:

```
frontend/.env
```

Add (or update) the following value:

```env
VITE_WEB3AUTH_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

Save the file and restart the frontend if it's already running.

### Once your website is open in your browser, copy the website link (URL).

Next, go to your Web3Auth Dashboard. Inside your project settings, find Domains and paste your website link there, just like in the screenshot below. Click Add URL.

This step is very important — it allows the Web3Auth wallet to work properly on your website.

Note* Make sure you pick the network to work on is Algorand Testnet on the Web3 Auth Dashboard!

<img width="2908" height="1270" alt="image" src="https://github.com/user-attachments/assets/9e42fe72-02bb-4d2e-a29d-0fca3ccca272" />

---

## 🖼 Optional: NFT Minting (IPFS / Pinata)

If you want to create NFTs (with images/metadata), you’ll need to set up a small backend service for uploads.

> ⚠️ Only do this if you plan to mint NFTs and upload metadata.

#### If you’re only creating tokens or transfering tokens, you can skip this section.

### Backend path

```
projects/TokenizeRWATemplate-contracts/NFT_mint_server
```

### Steps

1. Go to https://app.pinata.cloud/developers/api-keys
2. Create a new API key
3. Copy the **JWT token**

### Where to paste it

Open:

```
projects/TokenizeRWATemplate-contracts/NFT_mint_server/.env
```

Add:

```env
PINATA_JWT=YOUR_PINATA_JWT_HERE
```

Save the file.

### Start the NFT Mint Server

After adding your Pinata JWT, start the NFT mint backend server.

Navigate to the server folder:

```
projects/TokenizeRWATemplate-contracts/NFT_mint_server
```

Run the server:

```
npm run dev
```
Important (Codespaces / Remote Environments)


### Lastly, open the Ports tab and change/make sure Port 3000 to Public

---

## 🌐 Starting the app again
After you run setup.sh once, you have two simple options each time you reopen your Codespace - so you don’t need to run the setup again:

### Option A: Terminal

```bash
cd frontend
npm run dev
```

### Option B: GitHub UI

You can also start the frontend directly using the GitHub Codespaces UI, which is useful for demos and workshops.

## Pro Tip!
GitHub Codespaces is available on free accounts, but it includes up to 60 hours per month.
To avoid losing your work, commit and sync your changes regularly (as shown in the demo video) so everything is saved to your forked repository.
#### A “commit” is like hitting save with a short note, it records your changes in Git so you can keep them and come back to them later.

https://github.com/user-attachments/assets/dd452ea1-3070-4718-af34-bea978e208ab

---

## 🧠  Final note (important)
- ✅ The app setup is mostly automatic
- ✅ You must add a Web3Auth Client ID (to use the app/login)
- ✅ Pinata is optional (only for NFT images/metadata)

### If something isn’t working, it’s usually because:
- Your Web3Auth Client ID is missing
- You don’t have TestNet ALGO or USDC in your wallet


---

## 🪙 Tokenization Flow (High Level)

This template walks you through the basic steps to represent a real-world asset as a token on the Algorand blockchain (ASA).

### Basic Flow

1. **Connect with Algorand**  
   Use Pera, Defly, Lute, or Web3Auth to interact with the app.

2. **Define your asset parameters**  
   Choose the asset name, unit name, total supply, decimals, and optional metadata.

3. **Create an Algorand Standard Asset (ASA)**  
   The asset is created on-chain and represents your real-world asset digitally.

4. **Receive an Asset ID**  
   Algorand assigns a unique Asset ID, which becomes the on-chain identifier for your tokenized asset.

5. **Use or extend the token as your RWA representation**  
   The ASA can now be transferred, held, integrated into apps, or extended with additional logic.

### Advanced Asset Controls (Optional)

ASAs support advanced management features commonly used in RWA and compliance-focused setups:

| Role | Description |
|------|-------------|
| **Manager** | Can modify asset configuration |
| **Reserve** | Holds non-circulating supply |
| **Freeze** | Can freeze/unfreeze accounts |
| **Clawback** | Can revoke assets from accounts |

These controls are optional and depend on your use case and trust model.

---

## 🧪 Disclaimer

> This repository is provided for **educational and experimental purposes only**.  
> It does not constitute legal, financial, or investment advice.

---

## 📹 Video Guides

Below are videos on:
- How to connect to TestNet on [Pera](https://perawallet.app/)
- How to use the [Algo Dispenser](https://bank.testnet.algorand.network/)
- How to use the [USDC Dispenser](https://faucet.circle.com/)

### How to connect to TestNet on Pera Wallet

https://github.com/user-attachments/assets/31df8135-119e-4529-9539-4943de979719

### How to use the Algo Dispenser

https://github.com/user-attachments/assets/643cae10-4673-4b68-8e95-4a3f16fbba60

### How to use the USDC Dispenser

https://github.com/user-attachments/assets/a76e90fa-97f4-44f8-a7e8-a8ccabd24398
