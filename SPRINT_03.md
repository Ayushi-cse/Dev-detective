# Sprint 3: The API Hunter — Project Specification

## Engineering Overview
- **Project**: Dev-Detective Data Integration
- **Role**: Associate Software Engineer / Junior Full Stack Developer (Prodesk IT)
- **Phase**: Phase 2 — Foundation Projects (Frontend Foundation)
- **Primary Tech**: Vanilla JavaScript (ES6+), Fetch API, Async/Await, Promises, CSS3 (Custom Properties & Flexbox/Grid), Semantic HTML5.

---

## 📌 Deliverable Breakdown

### Phase 1: Base MVP (Mandatory - P0)
- [x] **Search Architecture**: Responsive input field and "Profile Card" layout.
- [x] **Async Fetch Logic**: Submits username and executes a GET request to `https://api.github.com/users/{username}`.
- [x] **Data Rendering**: Maps Avatar, Name, Bio, Joined Date, and Website/Portfolio URL to the DOM.
- [x] **Loading State**: UI spinner / animated loader visible while network promises resolve.
- [x] **Error Handling**: Handles 404 ("User Not Found") cleanly with zero app crashes.

### Phase 2: Data Expansion & Formatting (Priority 1)
- [x] **Endpoint Chaining**: Automatically chains the `repos_url` from the user response to fetch repositories (`?sort=updated&per_page=5`).
- [x] **List Rendering**: Displays Top 5 latest repositories with clickable `<a href="..." target="_blank">` links, descriptions, languages, and star/fork counts.
- [x] **Data Mutability**: Utility function to transform ISO 8601 strings (e.g., `2023-01-25T12:00:00Z`) into readable dates (e.g., `25 Jan 2023`).

### Phase 3: Advanced Logic & State Comparison (Priority 2)
- [x] **"Battle Mode" Architecture**: Interactive tab/toggle allowing simultaneous comparison of two GitHub users.
- [x] **Parallel Execution**: Fetches both users and their repositories concurrently using `Promise.all()`.
- [x] **Data Calculation**: Aggregates and reduces the array of repositories using `Array.prototype.reduce()` to tally total `stargazers_count`.
- [x] **Conditional UI**: Dynamically applies "Winner" (green accent) and "Runner Up / Defeated" (red accent) badges, along with comparative stat differentials.

---

## 🚀 How to Run in VS Code

1. **Open the project folder in VS Code**:
   - File -> Open Folder -> `C:\Users\kriay\.gemini\antigravity\scratch\dev-detective-github-hunter`
2. **Launch the project**:
   - **Option A (Recommended)**: Right-click `index.html` and click **"Open with Live Server"** (using the Live Server extension).
   - **Option B (Direct Browser)**: Double-click `index.html` or open it in Google Chrome / Microsoft Edge / Firefox.
   - **Option C (Terminal)**: Run `npx serve` or `python -m http.server 5500`.

---

## 🛡️ API Rate Limit Protection
GitHub allows **60 unauthenticated requests per hour** per IP address.
- If you hit an HTTP 403 Rate Limit, Dev-Detective provides an optional GitHub Personal Access Token (PAT) input in the settings/header to grant 5,000 requests/hour.
