# 🔍 Dev-Detective: The GitHub API Hunter
> **Sprint 3 Deliverable | Phase 2: Foundation Projects**  
> **Role:** Associate Software Engineer / Junior Full Stack Developer at **Prodesk IT**  
> **Stack:** HTML5, Modern CSS3 (Variables, Flexbox, Grid), Vanilla JavaScript (ES6+, Async/Await, Promises, Fetch API)

---

## 📖 Project Overview

**Dev-Detective** is a responsive client-side web application that interfaces directly with the official [GitHub REST API](https://docs.github.com/en/rest). It demonstrates production-level asynchronous programming in JavaScript—including Promises, `async/await`, endpoint chaining, error fallbacks, and multi-query concurrency via `Promise.all()`.

---

## ✨ Features Implemented

### 🟢 Phase 1: Base MVP (Mandatory Deliverables — P0)
- **Search Architecture:** Search form with Enter key or submit button, responsive Profile Card component.
- **Asynchronous Logic:** Performs GET requests to `https://api.github.com/users/{username}` using the native `fetch()` API.
- **Data Rendering:** Maps GitHub attributes to DOM elements:
  - 🖼️ Avatar image
  - 👤 Full name & GitHub `@username`
  - 📝 Bio (with fallback for empty bios)
  - 📅 Account join date (humanized)
  - 🌐 Website / Portfolio link
  - 📊 Core stats: Public Repos, Followers, Following
  - 📍 Metadata: Location, Twitter handle, Company affiliation
- **State Management:**
  - **Loading State:** CSS animated spinner and button disabled state while the promise resolves.
  - **404 Error Handling:** Catches HTTP 404 cleanly and displays an alert card (*"User '{username}' was not found on GitHub"*). The application **never crashes**.

### 🟡 Phase 2: Data Expansion & Formatting (Priority 1)
- **Endpoint Chaining:** After resolving the user profile, the application immediately reads `repos_url` and triggers a secondary async fetch (`repos_url?sort=updated&per_page=5`).
- **List Rendering:** Renders the **Top 5 Latest Repositories** under the profile card, each displaying:
  - Clickable repository name with `<a href="..." target="_blank">`
  - Repository description
  - Language badge
  - ⭐ Stargazers count
  - 🍴 Forks count
  - 📅 Last updated timestamp
- **Data Mutability / Date Utility:** Custom `formatDate(isoString)` function transforming raw ISO timestamps (e.g., `2023-01-25T12:00:00Z`) into clean strings (e.g., `Joined 25 Jan 2023`).

### 🔴 Phase 3: Advanced Logic & State Comparison (Priority 2 — "Battle Mode")
- **Dual-Input Architecture:** Interactive tab switcher toggles between Solo Search and the **Developer Face-Off Arena**.
- **Parallel Requests via `Promise.all()`:** Concurrently queries two GitHub usernames and fetches up to 100 repositories for each profile in parallel.
- **Star Aggregation via `Array.prototype.reduce()`:** Loops through both repository sets and computes total stars earned across public projects:
  ```javascript
  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  ```
- **Conditional UI:**
  - 👑 **Winner Card:** Highlighted with an emerald green glow and border (`#2ea043`).
  - 🥈 **Runner Up Card:** Styled with a crimson red indicator (`#f85149`).
  - Displays summary statistics showing the star differential between both developers.

---

## 🎨 Bonus Enhancements
- **Dark & Light Mode:** Seamless theme toggle with state persisted in `localStorage`.
- **403 Rate Limit Safety Drawer:** Dedicated settings modal to input an optional GitHub Personal Access Token (PAT), bumping the request ceiling from 60 to 5,000 requests/hour.
- **Zero-Dependency Architecture:** 100% native Vanilla JavaScript with zero external npm dependencies.

---

## 📁 Project Structure

```
dev-detective-github-hunter/
├── index.html        # Semantic HTML5 layout with Solo & Battle Mode sections
├── style.css         # Modern styling, CSS variables, dark/light themes, animations
├── app.js            # Modular async/await logic, chaining, reduce(), and DOM controllers
├── Prompts.md        # AI Pair-programming prompts, QA test matrix, 2-minute video script
├── SPRINT_03.md      # Official Sprint 3 prompt & deliverables checklist
└── README.md         # Comprehensive project documentation
```

---

## 🚀 Running the Project in VS Code

### Method 1: VS Code Live Server (Recommended)
1. Open Visual Studio Code.
2. Select **File > Open Folder...** and choose `C:\Users\kriay\.gemini\antigravity\scratch\dev-detective-github-hunter`.
3. If you have the **Live Server** extension installed:
   - Right-click `index.html` in the Explorer sidebar.
   - Click **"Open with Live Server"**.
4. The application will launch in your browser at `http://127.0.0.1:5500`.

### Method 2: Direct Browser Execution
- Simply double-click `index.html` from your file explorer, or drag and drop it into Google Chrome, Microsoft Edge, or Mozilla Firefox.

### Method 3: Command Line / Terminal
In VS Code's integrated terminal (`Ctrl + \``):
```bash
# Using Node's npx serve
npx serve .

# Or using Python 3
python -m http.server 5500
```

---

## 🧪 Verification & QA Testing

| Action | Input | Expected Outcome |
|---|---|---|
| Search valid user | `octocat` | Profile card and 5 latest repos render smoothly. |
| Search invalid user | `non-existent-user-xyz-999` | 404 error banner appears; UI does not crash. |
| Test Battle Mode | User 1: `torvalds` vs User 2: `gaearon` | Simultaneous fetch via `Promise.all()`, cards render with Green Winner & Red Runner Up. |
| Toggle Theme | Click Light / Dark button | Immediate color scheme switch with persistent theme state. |

---

## 📬 Submission Checklist
- [x] Push clean code to GitHub repository.
- [x] Ensure `Prompts.md` reflects pair-programming prompts and QA test cases.
- [x] Record 2-minute video demonstrating **Loading State**, **404 Error State**, **Top 5 Repos**, and **Battle Mode**.
- [x] If dashboard form encounters technical issues, email deliverable to `info@prodesk.in` with your Registered Email / Employee ID in the subject line.
