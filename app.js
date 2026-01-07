// State
let allRankings = [];
let filteredRankings = [];
let currentSort = 'rank';
let displayedCount = 0;
const ITEMS_PER_PAGE = 50;
let isLoading = false;

// Theme handling
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    icon.classList.remove('fa-moon', 'fa-sun');
    icon.classList.add(theme === 'dark' ? 'fa-sun' : 'fa-moon');
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}

// Data loading
async function loadData() {
    try {
        const [rankings, metadata] = await Promise.all([
            fetch('data/rankings.json').then(r => r.json()),
            fetch('data/metadata.json').then(r => r.json())
        ]);

        allRankings = rankings;
        filteredRankings = rankings;
        
        updateStats(metadata, rankings);
        displayedCount = 0;
        renderTable(filteredRankings, true);
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('rankings-body').innerHTML = `
            <tr><td colspan="7" class="loading">Error loading data. Please try again later.</td></tr>
        `;
    }
}

function updateStats(metadata, rankings) {
    document.getElementById('total-users').textContent = metadata.totalUsers.toLocaleString();
    
    const totalCommits = rankings.reduce((sum, user) => sum + user.commits, 0);
    document.getElementById('total-commits').textContent = totalCommits.toLocaleString();
    
    const date = new Date(metadata.generatedAt);
    const timeAgo = getTimeAgo(date);
    document.getElementById('last-updated').textContent = timeAgo;
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
        }
    }
    return 'Just now';
}

// Table rendering with lazy loading
function renderTable(rankings, reset = false) {
    const tbody = document.getElementById('rankings-body');
    
    if (rankings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-results">No users found matching your search.</td></tr>';
        displayedCount = 0;
        return;
    }

    if (reset) {
        tbody.innerHTML = '';
        displayedCount = 0;
    }

    const repoName = window.location.pathname.split('/')[1] || 'committers-nepal';
    const username = window.location.hostname.split('.')[0] || 'birajrai';
    const badgeBaseUrl = `https://${username}.github.io/${repoName}`;

    const start = displayedCount;
    const end = Math.min(displayedCount + ITEMS_PER_PAGE, rankings.length);
    const itemsToRender = rankings.slice(start, end);

    const rowsHtml = itemsToRender.map(user => `
        <tr>
            <td class="rank-cell ${getRankClass(user.rank)}">#${user.rank}</td>
            <td>
                <div class="user-cell">
                    <img src="${user.avatarUrl}" alt="${user.username}" class="user-avatar" loading="lazy">
                    <div class="user-info">
                        <div class="user-name">${escapeHtml(user.name)}</div>
                        <a href="https://github.com/${user.username}" target="_blank" class="user-link">
                            @${user.username}
                        </a>
                    </div>
                </div>
            </td>
            <td>${user.commits.toLocaleString()}</td>
            <td>${user.publicContributions.toLocaleString()}</td>
            <td>${user.allContributions.toLocaleString()}</td>
            <td>${user.followers.toLocaleString()}</td>
            <td class="badge-cell">
                <img 
                    src="https://img.shields.io/endpoint?url=${encodeURIComponent(badgeBaseUrl)}/badges/${user.username}.json" 
                    alt="Rank badge"
                    class="badge-img"
                    loading="lazy"
                >
            </td>
        </tr>
    `).join('');

    tbody.insertAdjacentHTML('beforeend', rowsHtml);
    displayedCount = end;

    // Remove loading indicator if all items are displayed
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        if (displayedCount >= rankings.length) {
            loadingIndicator.remove();
        }
    } else if (displayedCount < rankings.length) {
        // Add loading indicator
        const loadingRow = document.createElement('tr');
        loadingRow.id = 'loading-indicator';
        loadingRow.innerHTML = '<td colspan="7" class="loading-more"><i class="fas fa-spinner fa-spin"></i> Loading more...</td>';
        tbody.appendChild(loadingRow);
    }

    isLoading = false;
}

// Load more items
function loadMoreItems() {
    if (isLoading || displayedCount >= filteredRankings.length) {
        return;
    }

    isLoading = true;
    renderTable(filteredRankings, false);
}

function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search and sort
function handleSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        filteredRankings = allRankings;
    } else {
        filteredRankings = allRankings.filter(user =>
            user.username.toLowerCase().includes(term) ||
            user.name.toLowerCase().includes(term)
        );
    }
    
    sortRankings(currentSort);
    displayedCount = 0;
    renderTable(filteredRankings, true);
}

function sortRankings(sortBy) {
    currentSort = sortBy;
    
    filteredRankings.sort((a, b) => {
        switch (sortBy) {
            case 'commits':
                return b.commits - a.commits;
            case 'contributions':
                return b.allContributions - a.allContributions;
            case 'followers':
                return b.followers - a.followers;
            case 'rank':
            default:
                return a.rank - b.rank;
        }
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadData();

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', (e) => {
        sortRankings(e.target.value);
        displayedCount = 0;
        renderTable(filteredRankings, true);
    });

    // Infinite scroll
    const tableContainer = document.querySelector('.table-container');
    tableContainer.addEventListener('scroll', () => {
        if (isLoading || displayedCount >= filteredRankings.length) {
            return;
        }

        const scrollTop = tableContainer.scrollTop;
        const scrollHeight = tableContainer.scrollHeight;
        const clientHeight = tableContainer.clientHeight;

        // Load more when scrolled to 80% of the content
        if (scrollTop + clientHeight >= scrollHeight * 0.8) {
            loadMoreItems();
        }
    });

    // Also handle window scroll for mobile
    window.addEventListener('scroll', () => {
        if (isLoading || displayedCount >= filteredRankings.length) {
            return;
        }

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;

        // Load more when scrolled to 80% of the page
        if (scrollTop + clientHeight >= scrollHeight * 0.8) {
            loadMoreItems();
        }
    });
});
