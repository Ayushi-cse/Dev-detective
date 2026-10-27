/**
 * Dev-Detective: GitHub API Hunter
 * Sprint 3 Deliverable - Prodesk IT
 *
 * Implements:
 * - Phase 1: Search Architecture, Async/Await Fetch, Loading & 404 States
 * - Phase 2: Endpoint Chaining, List Rendering, ISO Date Parsing
 * - Phase 3: "Battle Mode" Dual-Query via Promise.all(), Array.reduce() Star Aggregation
 */

// ============================================================================
// 1. CONSTANTS & DOM REFERENCES
// ============================================================================

const GITHUB_API_BASE = 'https://api.github.com/users';

// Navigation & Theme
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeText = document.getElementById('themeText');
const themeIcon = document.getElementById('themeIcon');
const tabSolo = document.getElementById('tabSolo');
const tabBattle = document.getElementById('tabBattle');
const soloView = document.getElementById('soloView');
const battleView = document.getElementById('battleView');

// Token Settings Drawer
const tokenToggleBtn = document.getElementById('tokenToggleBtn');
const tokenModal = document.getElementById('tokenModal');
const tokenInput = document.getElementById('tokenInput');
const saveTokenBtn = document.getElementById('saveTokenBtn');
const clearTokenBtn = document.getElementById('clearTokenBtn');
const tokenStatusText = document.getElementById('tokenStatusText');

// Solo Mode Elements
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchSubmitBtn = document.getElementById('searchSubmitBtn');
const searchErrorBadge = document.getElementById('searchErrorBadge');
const soloAlert = document.getElementById('soloAlert');
const soloAlertText = document.getElementById('soloAlertText');
const soloAlertClose = document.getElementById('soloAlertClose');
const soloLoading = document.getElementById('soloLoading');
const profileCard = document.getElementById('profileCard');
const reposSection = document.getElementById('reposSection');
const reposList = document.getElementById('reposList');

// Solo Profile Fields
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userJoinDate = document.getElementById('userJoinDate');
const userHandle = document.getElementById('userHandle');
const userBio = document.getElementById('userBio');
const statRepos = document.getElementById('statRepos');
const statFollowers = document.getElementById('statFollowers');
const statFollowing = document.getElementById('statFollowing');
const linkLocation = document.getElementById('linkLocation');
const linkWebsite = document.getElementById('linkWebsite');
const linkTwitter = document.getElementById('linkTwitter');
const linkCompany = document.getElementById('linkCompany');
const linkLocationWrapper = document.getElementById('linkLocationWrapper');
const linkWebsiteWrapper = document.getElementById('linkWebsiteWrapper');
const linkTwitterWrapper = document.getElementById('linkTwitterWrapper');
const linkCompanyWrapper = document.getElementById('linkCompanyWrapper');

// Battle Mode Elements
const battleForm = document.getElementById('battleForm');
const battleUser1Input = document.getElementById('battleUser1Input');
const battleUser2Input = document.getElementById('battleUser2Input');
const battleSubmitBtn = document.getElementById('battleSubmitBtn');
const battleLoading = document.getElementById('battleLoading');
const battleAlert = document.getElementById('battleAlert');
const battleAlertText = document.getElementById('battleAlertText');
const battleAlertClose = document.getElementById('battleAlertClose');
const battleArena = document.getElementById('battleArena');
const battleCard1 = document.getElementById('battleCard1');
const battleCard2 = document.getElementById('battleCard2');
const battleSummaryBanner = document.getElementById('battleSummaryBanner');


// ============================================================================
// 2. UTILITY FUNCTIONS
// ============================================================================

/**
 * Formats an ISO 8601 timestamp string (e.g. "2023-01-25T12:00:00Z")
 * into human-readable format (e.g. "25 Jan 2023").
 *
 * @param {string} isoString - ISO date string from GitHub API
 * @returns {string} - Formatted date string
 */
function formatDate(isoString) {
  if (!isoString) return 'Joined Unknown Date';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `Joined ${day} ${month} ${year}`;
}

/**
 * Retrieves optional GitHub Personal Access Token from localStorage
 * to attach to request headers. This lifts unauthenticated rate limit
 * from 60 to 5,000 requests/hour.
 *
 * @returns {HeadersInit} - HTTP request headers object
 */
function getAuthHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  const token = localStorage.getItem('github_pat');
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  return headers;
}


// ============================================================================
// 3. API SERVICE LAYER (FETCH & ASYNC/AWAIT)
// ============================================================================

/**
 * Fetches user profile data from GitHub REST API.
 * Handles HTTP 404 (User Not Found) and HTTP 403 (Rate Limit Exceeded).
 *
 * @param {string} username - GitHub username to query
 * @returns {Promise<Object>} - User profile JSON object
 */
async function fetchUserProfile(username) {
  const cleanUsername = encodeURIComponent(username.trim());
  const response = await fetch(`${GITHUB_API_BASE}/${cleanUsername}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User "${username}" was not found on GitHub.`);
    }
    if (response.status === 403) {
      throw new Error('API Rate Limit Exceeded (60 req/hr). Add a Personal Access Token or try again later.');
    }
    throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetches user repositories from their repos_url (Phase 2 Chaining).
 * Defaults to the 5 most recently active repositories for solo view,
 * or up to 100 for star calculations in Battle Mode.
 *
 * @param {string} reposUrl - Endpoint URL from the user profile
 * @param {number} perPage - Max repos to retrieve (default: 5)
 * @returns {Promise<Array>} - Array of repository objects
 */
async function fetchUserRepos(reposUrl, perPage = 5) {
  const response = await fetch(`${reposUrl}?sort=updated&per_page=${perPage}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    return []; // Return empty array gracefully if repo fetch fails
  }

  return await response.json();
}

/**
 * High-level helper that coordinates fetching both the profile and
 * repositories for a user.
 *
 * @param {string} username - Target username
 * @param {number} repoCount - Repos to fetch (5 for solo, 100 for battle stars)
 * @returns {Promise<{profile: Object, repos: Array}>}
 */
async function fetchFullUserData(username, repoCount = 5) {
  const profile = await fetchUserProfile(username);
  const repos = await fetchUserRepos(profile.repos_url, repoCount);
  return { profile, repos };
}


// ============================================================================
// 4. PHASE 1 & PHASE 2 RENDERING (SOLO DETECTIVE)
// ============================================================================

/**
 * Renders user profile information to the DOM.
 * Maps: Avatar, Name, Handle, Bio, Joined Date, Stats, and Contact Links.
 *
 * @param {Object} data - GitHub user profile object
 */
function renderProfile(data) {
  userAvatar.src = data.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
  userAvatar.alt = `${data.login}'s avatar`;

  userName.textContent = data.name || data.login;
  userHandle.textContent = `@${data.login}`;
  userHandle.href = data.html_url;

  userJoinDate.textContent = formatDate(data.created_at);
  userBio.textContent = data.bio || 'This profile has no bio';

  statRepos.textContent = (data.public_repos ?? 0).toLocaleString();
  statFollowers.textContent = (data.followers ?? 0).toLocaleString();
  statFollowing.textContent = (data.following ?? 0).toLocaleString();

  // Location
  if (data.location) {
    linkLocation.textContent = data.location;
    linkLocationWrapper.classList.remove('disabled');
  } else {
    linkLocation.textContent = 'Not Available';
    linkLocationWrapper.classList.add('disabled');
  }

  // Website / Portfolio Blog
  if (data.blog) {
    const formattedUrl = data.blog.startsWith('http') ? data.blog : `https://${data.blog}`;
    linkWebsite.textContent = data.blog;
    linkWebsite.href = formattedUrl;
    linkWebsiteWrapper.classList.remove('disabled');
  } else {
    linkWebsite.textContent = 'Not Available';
    linkWebsite.removeAttribute('href');
    linkWebsiteWrapper.classList.add('disabled');
  }

  // Twitter / X
  if (data.twitter_username) {
    linkTwitter.textContent = `@${data.twitter_username}`;
    linkTwitter.href = `https://twitter.com/${data.twitter_username}`;
    linkTwitterWrapper.classList.remove('disabled');
  } else {
    linkTwitter.textContent = 'Not Available';
    linkTwitter.removeAttribute('href');
    linkTwitterWrapper.classList.add('disabled');
  }

  // Company
  if (data.company) {
    linkCompany.textContent = data.company;
    linkCompanyWrapper.classList.remove('disabled');
  } else {
    linkCompany.textContent = 'Not Available';
    linkCompanyWrapper.classList.add('disabled');
  }

  profileCard.classList.remove('hidden');
}

/**
 * Phase 2: Renders the Top 5 latest repositories to the DOM.
 * Shows repo name link, description, primary language, stars, and forks.
 *
 * @param {Array} repos - Array of repository objects
 */
function renderRepositories(repos) {
  reposList.innerHTML = '';

  if (!repos || repos.length === 0) {
    reposList.innerHTML = `
      <div class="repo-card" style="text-align:center; padding: 2rem;">
        <p class="repo-desc">No public repositories found for this user.</p>
      </div>
    `;
    reposSection.classList.remove('hidden');
    return;
  }

  const topFive = repos.slice(0, 5);

  topFive.forEach(repo => {
    const repoCard = document.createElement('article');
    repoCard.className = 'repo-card';

    const repoDesc = repo.description || 'No description provided.';
    const repoLanguage = repo.language || 'Plain Text';
    const stars = (repo.stargazers_count ?? 0).toLocaleString();
    const forks = (repo.forks_count ?? 0).toLocaleString();
    const updatedDate = formatDate(repo.updated_at).replace('Joined ', 'Updated ');

    repoCard.innerHTML = `
      <div class="repo-header">
        <a class="repo-name-link" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
          <span>📦</span> ${escapeHtml(repo.name)}
        </a>
        <span class="repo-pill" title="Visibility">${repo.visibility || 'public'}</span>
      </div>
      <p class="repo-desc">${escapeHtml(repoDesc)}</p>
      <div class="repo-meta">
        <span class="repo-pill">
          <span class="repo-lang-dot"></span>
          ${escapeHtml(repoLanguage)}
        </span>
        <span class="repo-pill" title="Total Stars">⭐ ${stars}</span>
        <span class="repo-pill" title="Total Forks">🍴 ${forks}</span>
        <span class="repo-pill" title="Last Activity">📅 ${updatedDate}</span>
      </div>
    `;

    reposList.appendChild(repoCard);
  });

  reposSection.classList.remove('hidden');
}

/**
 * Escapes unsafe HTML characters to prevent XSS.
 *
 * @param {string} str - Raw string
 * @returns {string} - Escaped string
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// ============================================================================
// 5. PHASE 3: BATTLE MODE (PROMISE.ALL & ARRAY.REDUCE)
// ============================================================================

/**
 * Computes the total stargazers_count across a list of repositories
 * using Array.prototype.reduce().
 *
 * @param {Array} repos - Array of repository objects
 * @returns {number} - Aggregated star count
 */
function calculateTotalStars(repos) {
  if (!Array.isArray(repos)) return 0;
  return repos.reduce((accum, repo) => accum + (repo.stargazers_count || 0), 0);
}

/**
 * Builds the inner HTML template for a battle card.
 *
 * @param {Object} user - GitHub user profile
 * @param {number} totalStars - Calculated stars
 * @param {string} badgeClass - CSS class for badge
 * @param {string} badgeText - Winner / Loser / Tied text
 * @returns {string} - HTML string
 */
function createBattleCardHTML(user, totalStars, badgeClass, badgeText) {
  return `
    <div class="battle-outcome-badge ${badgeClass}">${badgeText}</div>
    <img class="battle-avatar" src="${user.avatar_url}" alt="${user.login}'s avatar" />
    <div class="battle-user-info">
      <h3>${escapeHtml(user.name || user.login)}</h3>
      <a href="${user.html_url}" target="_blank" rel="noopener noreferrer">@${escapeHtml(user.login)}</a>
    </div>

    <div class="battle-stats-card">
      <div class="battle-stat-row highlight-stars">
        <span>⭐ Total Stars:</span>
        <span>${totalStars.toLocaleString()}</span>
      </div>
      <div class="battle-stat-row">
        <span>📦 Public Repos:</span>
        <span>${(user.public_repos ?? 0).toLocaleString()}</span>
      </div>
      <div class="battle-stat-row">
        <span>👥 Followers:</span>
        <span>${(user.followers ?? 0).toLocaleString()}</span>
      </div>
      <div class="battle-stat-row">
        <span>📅 Active Since:</span>
        <span>${formatDate(user.created_at).replace('Joined ', '')}</span>
      </div>
    </div>
  `;
}

/**
 * Renders the Battle Mode comparison outcome.
 * Conditionally applies Winner (.winner) and Loser (.loser) styling.
 *
 * @param {Object} userA - User A data { profile, repos }
 * @param {Object} userB - User B data { profile, repos }
 */
function renderBattleResults(userA, userB) {
  const starsA = calculateTotalStars(userA.repos);
  const starsB = calculateTotalStars(userB.repos);

  // Reset existing outcome classes
  battleCard1.className = 'battle-card';
  battleCard2.className = 'battle-card';

  if (starsA > starsB) {
    battleCard1.classList.add('winner');
    battleCard2.classList.add('loser');

    battleCard1.innerHTML = createBattleCardHTML(userA.profile, starsA, 'winner-badge', '👑 Winner');
    battleCard2.innerHTML = createBattleCardHTML(userB.profile, starsB, 'loser-badge', 'Runner Up');

    const starDiff = (starsA - starsB).toLocaleString();
    battleSummaryBanner.innerHTML = `
      🏆 <strong>@${escapeHtml(userA.profile.login)}</strong> takes victory with <strong>${starsA.toLocaleString()}</strong> stars (+${starDiff} star lead over @${escapeHtml(userB.profile.login)}).
    `;
  } else if (starsB > starsA) {
    battleCard1.classList.add('loser');
    battleCard2.classList.add('winner');

    battleCard1.innerHTML = createBattleCardHTML(userA.profile, starsA, 'loser-badge', 'Runner Up');
    battleCard2.innerHTML = createBattleCardHTML(userB.profile, starsB, 'winner-badge', '👑 Winner');

    const starDiff = (starsB - starsA).toLocaleString();
    battleSummaryBanner.innerHTML = `
      🏆 <strong>@${escapeHtml(userB.profile.login)}</strong> takes victory with <strong>${starsB.toLocaleString()}</strong> stars (+${starDiff} star lead over @${escapeHtml(userA.profile.login)}).
    `;
  } else {
    // Tiebreaker based on followers, or absolute draw
    battleCard1.classList.add('winner');
    battleCard2.classList.add('winner');

    battleCard1.innerHTML = createBattleCardHTML(userA.profile, starsA, 'draw-badge', '🤝 Tied');
    battleCard2.innerHTML = createBattleCardHTML(userB.profile, starsB, 'draw-badge', '🤝 Tied');

    battleSummaryBanner.innerHTML = `
      🤝 <strong>Dead Heat!</strong> Both developers share an identical total of <strong>${starsA.toLocaleString()}</strong> stars!
    `;
  }

  battleArena.classList.remove('hidden');
}


// ============================================================================
// 6. EVENT HANDLERS & STATE CONTROLLERS
// ============================================================================

/**
 * Handles the Solo Search Form submission.
 * Enforces Loading indicator and 404 Error handling.
 */
async function handleSoloSearch(event) {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) return;

  // Clear previous notifications
  hideSoloError();
  searchErrorBadge.classList.add('hidden');

  // Trigger UI Loading state
  setSoloLoading(true);

  try {
    // Endpoint Chaining: Fetch User, then Fetch Top 5 Repos
    const { profile, repos } = await fetchFullUserData(query, 5);

    // Render results
    renderProfile(profile);
    renderRepositories(repos);

  } catch (error) {
    // 404 & Network Error Fallback
    showSoloError(error.message);
    searchErrorBadge.classList.remove('hidden');
    profileCard.classList.add('hidden');
    reposSection.classList.add('hidden');
  } finally {
    setSoloLoading(false);
  }
}

/**
 * Handles the Battle Mode Form submission.
 * Executes Promise.all() for concurrent network resolution.
 */
async function handleBattleSubmit(event) {
  event.preventDefault();

  const user1 = battleUser1Input.value.trim();
  const user2 = battleUser2Input.value.trim();

  if (!user1 || !user2) return;

  hideBattleError();
  battleArena.classList.add('hidden');
  setBattleLoading(true);

  try {
    // Parallel Execution via Promise.all
    // We request up to 100 repositories to give an accurate star count
    const [resultA, resultB] = await Promise.all([
      fetchFullUserData(user1, 100),
      fetchFullUserData(user2, 100)
    ]);

    renderBattleResults(resultA, resultB);

  } catch (error) {
    showBattleError(error.message);
  } finally {
    setBattleLoading(false);
  }
}

// UI State Toggles
function setSoloLoading(isLoading) {
  if (isLoading) {
    soloLoading.classList.remove('hidden');
    searchSubmitBtn.disabled = true;
    searchSubmitBtn.textContent = 'Searching...';
  } else {
    soloLoading.classList.add('hidden');
    searchSubmitBtn.disabled = false;
    searchSubmitBtn.textContent = 'Search';
  }
}

function showSoloError(message) {
  soloAlertText.textContent = message;
  soloAlert.classList.remove('hidden');
}

function hideSoloError() {
  soloAlert.classList.add('hidden');
}

function setBattleLoading(isLoading) {
  if (isLoading) {
    battleLoading.classList.remove('hidden');
    battleSubmitBtn.disabled = true;
    battleSubmitBtn.textContent = 'Battling...';
  } else {
    battleLoading.classList.add('hidden');
    battleSubmitBtn.disabled = false;
    battleSubmitBtn.textContent = '⚔️ Launch Battle';
  }
}

function showBattleError(message) {
  battleAlertText.textContent = message;
  battleAlert.classList.remove('hidden');
}

function hideBattleError() {
  battleAlert.classList.add('hidden');
}


// ============================================================================
// 7. THEME & VIEW SWITCHING
// ============================================================================

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('devfinder_theme', newTheme);

  if (newTheme === 'dark') {
    themeText.textContent = 'LIGHT';
    themeIcon.textContent = '☀️';
  } else {
    themeText.textContent = 'DARK';
    themeIcon.textContent = '🌙';
  }
}

function switchTab(mode) {
  if (mode === 'solo') {
    tabSolo.classList.add('active');
    tabBattle.classList.remove('active');
    soloView.classList.remove('hidden');
    battleView.classList.add('hidden');
  } else {
    tabBattle.classList.add('active');
    tabSolo.classList.remove('active');
    battleView.classList.remove('hidden');
    soloView.classList.add('hidden');
  }
}


// ============================================================================
// 8. TOKEN DRAWER LOGIC (RATE LIMIT SAFETY)
// ============================================================================

function initTokenDrawer() {
  const savedToken = localStorage.getItem('github_pat');
  if (savedToken) {
    tokenStatusText.textContent = '✅ Custom Personal Access Token is active (5,000 req/hr).';
    tokenStatusText.style.color = '#3fb950';
    tokenInput.value = savedToken;
  }

  tokenToggleBtn.addEventListener('click', () => {
    tokenModal.classList.toggle('hidden');
  });

  saveTokenBtn.addEventListener('click', () => {
    const val = tokenInput.value.trim();
    if (val) {
      localStorage.setItem('github_pat', val);
      tokenStatusText.textContent = '✅ Token saved! Requests now have 5,000 req/hr quota.';
      tokenStatusText.style.color = '#3fb950';
    } else {
      tokenStatusText.textContent = 'Please enter a valid token.';
      tokenStatusText.style.color = '#f85149';
    }
  });

  clearTokenBtn.addEventListener('click', () => {
    localStorage.removeItem('github_pat');
    tokenInput.value = '';
    tokenStatusText.textContent = 'Token removed. Standard rate limit (60 req/hr) applies.';
    tokenStatusText.style.color = '#8e94a4';
  });
}


// ============================================================================
// 9. APPLICATION INITIALIZATION
// ============================================================================

function init() {
  // 1. Restore Theme Preference
  const savedTheme = localStorage.getItem('devfinder_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'light') {
      themeText.textContent = 'DARK';
      themeIcon.textContent = '🌙';
    }
  }

  // 2. Event Listeners
  themeToggleBtn.addEventListener('click', toggleTheme);

  tabSolo.addEventListener('click', () => switchTab('solo'));
  tabBattle.addEventListener('click', () => switchTab('battle'));

  searchForm.addEventListener('submit', handleSoloSearch);
  battleForm.addEventListener('submit', handleBattleSubmit);

  soloAlertClose.addEventListener('click', hideSoloError);
  battleAlertClose.addEventListener('click', hideBattleError);

  initTokenDrawer();

  // 3. Initial Baseline Seed Data (octocat)
  // Fetch initial profile to ensure the UI is beautifully populated on first load
  searchInput.value = 'octocat';
  fetchFullUserData('octocat', 5)
    .then(({ profile, repos }) => {
      renderProfile(profile);
      renderRepositories(repos);
    })
    .catch((err) => {
      console.warn('Initial seed fetch failed:', err);
    });
}

// Start application once DOM is ready
document.addEventListener('DOMContentLoaded', init);
