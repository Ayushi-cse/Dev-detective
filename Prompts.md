# Pair Programming & Prompts Log (`Prompts.md`)

This log documents the iterative problem solving, engineering prompts, AI pair-programming interactions, and testing scenarios used during Sprint 3: "Dev-Detective".

---

## 🤖 Prompt 1: Project Architecture & Async Fetch
**User Query / Prompt:**
> "I need to build Phase 1 of Dev-Detective. How should I structure a clean async/await function to fetch user data from `https://api.github.com/users/{username}`, handle loading states with a spinner, and catch 404 errors gracefully without crashing the DOM?"

**Engineering Takeaways:**
- Created `fetchUserData(username)` with `try / catch / finally` block.
- Used `finally` to ensure the loading indicator is always cleared regardless of success or failure.
- Checked `response.ok` before calling `response.json()`: if `response.status === 404`, threw a custom `'User Not Found'` error.

---

## 🤖 Prompt 2: Date Formatting & Repository Chaining
**User Query / Prompt:**
> "Phase 2 requires displaying the top 5 latest repos from `repos_url` and converting the ISO timestamp `2023-01-25T12:00:00Z` to a human-readable format like `25 Jan 2023`. What is the cleanest vanilla JS way to achieve this without external libraries like Moment.js or date-fns?"

**Engineering Takeaways:**
- Built `formatDate(isoString)` utilizing `new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })`.
- Chained `userData.repos_url` with query parameters `?sort=updated&per_page=5` to fetch the 5 most recently active repositories.
- Rendered list elements with clickable target blank links, stargazers count, forks, and language badges.

---

## 🤖 Prompt 3: Battle Mode with `Promise.all()` & Star Reduction
**User Query / Prompt:**
> "For Phase 3 'Battle Mode', how do I query two GitHub users at the exact same time, calculate their total stars across their repositories using `reduce()`, and compare them to determine a winner and loser with green/red styling?"

**Engineering Takeaways:**
- Implemented `Promise.all([fetchFullProfile(userA), fetchFullProfile(userB)])` to execute parallel network calls.
- Total stars calculation:
  ```javascript
  const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
  ```
- Evaluated comparison:
  - If `starsA > starsB`, User A receives the `.card-winner` class (emerald green) and User B receives `.card-loser` (rose red).
  - If tied, checked total repositories or marked as a Draw.

---

## 🧪 QA Test Protocol & Verification Checklist

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **TC-01: Valid User Fetch** | Type `"octocat"` and click Search | Profile card displays avatar, name, bio, join date (e.g. 25 Jan 2011), and stats. | Pass ✅ |
| **TC-02: Loading Indicator** | Submit search on throttled network | Loading spinner appears; search button is disabled during fetch. | Pass ✅ |
| **TC-03: 404 Not Found** | Type invalid username (e.g. `"thisuserdoesnotexist987654321"`) | Friendly error card: "No user found with that username" displayed. No console errors or crashes. | Pass ✅ |
| **TC-04: Top 5 Repos** | View repos section for active user (e.g. `"torvalds"`) | Exactly 5 latest repos rendered with stars, forks, and external link icons. | Pass ✅ |
| **TC-05: Battle Mode Execution** | Switch to Battle Mode, enter `"gaearon"` vs `"sindresorhus"`, click Battle | Both cards populate simultaneously; winner receives green badge and loser receives red badge. | Pass ✅ |
| **TC-06: Dark / Light Mode** | Click the theme toggle icon | Smooth theme transition between dark slate theme and crisp light theme. | Pass ✅ |

---

## 🎥 2-Minute QA Demo Script

1. **[0:00 - 0:25] Introduction & Mandatory P0**:
   - Introduce yourself: *"Hi, I'm presenting Sprint 3: The API Hunter (Dev-Detective) for Prodesk IT."*
   - Type `"octocat"` into search bar.
   - Show loading state resolving into the profile card (Avatar, Name, Bio, Joined date, Blog link).
2. **[0:25 - 0:50] 404 Error State Handling**:
   - Type a random non-existent username: `"prodesk-test-ghost-404"`.
   - Point out the error fallback UI message: *"User Not Found"* without crashing.
3. **[0:50 - 1:20] Phase 2: Endpoint Chaining & Date Parsing**:
   - Type a developer like `"kentcdodds"` or `"yyx990803"`.
   - Show the formatted date (`"DD Mon YYYY"`).
   - Scroll down to the Top 5 Repositories list. Click one repo to demonstrate it opens in a new tab.
4. **[1:20 - 1:55] Phase 3: Battle Mode**:
   - Click the **"⚔️ Battle Mode"** toggle.
   - Enter User 1: `"facebook"` and User 2: `"google"`.
   - Click **"Launch Battle"**. Explain the `Promise.all()` parallel fetching.
   - Show how `Array.reduce` calculated the total stars and assigned the **Winner** (Green) and **Loser** (Red) cards.
5. **[1:55 - 2:00] Wrap Up**:
   - Highlight clean modular vanilla JavaScript code and responsive styling.
