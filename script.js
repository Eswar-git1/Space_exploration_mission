// ============================================
// SPACE MISSION CONTROL - JavaScript
// Global Shared Visitor Counter with API
// ============================================

// Configuration
const COUNTER_API_URL = 'https://api.countapi.xyz/hit/space-mission-control-eswar/visits';
const ANIMATION_DURATION = 1000;
const FALLBACK_STORAGE_KEY = 'missionControlVisitorCount';

// DOM Elements
let counterElement;
let incrementAnimationElement;
let statVisitsElement;
let statTimeElement;

// State
let currentCount = 0;
let isApiAvailable = true;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the application when DOM is loaded
 */
function init() {
    // Get DOM elements
    counterElement = document.getElementById('counter');
    incrementAnimationElement = document.getElementById('incrementAnimation');
    statVisitsElement = document.getElementById('statVisits');
    statTimeElement = document.getElementById('statTime');

    // Load and increment visitor count (now uses API)
    incrementVisitorCount();

    // Start mission time clock
    updateMissionTime();
    setInterval(updateMissionTime, 1000);

    // Add entrance animation
    animateEntrance();
}

// ============================================
// VISITOR COUNTER FUNCTIONS (Global API)
// ============================================

/**
 * Increment the visitor count using global API
 * This count is shared across ALL users
 */
async function incrementVisitorCount() {
    try {
        // Call the API to increment the global counter
        const response = await fetch(COUNTER_API_URL);

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        currentCount = data.value;

        console.log(`✅ Mission Control: Global count - ${currentCount} astronauts (shared across all users)`);

        // Animate the counter update
        animateCounterUpdate(currentCount);

        // Show increment animation
        showIncrementAnimation();

        // Update stats
        updateStats();

        isApiAvailable = true;

    } catch (error) {
        console.error('⚠️ Error accessing global counter API:', error);
        console.log('Falling back to local storage...');

        // Fallback to localStorage if API fails
        isApiAvailable = false;
        incrementVisitorCountFallback();
    }
}

/**
 * Fallback: Use localStorage if API is unavailable
 */
function incrementVisitorCountFallback() {
    try {
        const storedCount = localStorage.getItem(FALLBACK_STORAGE_KEY);
        currentCount = storedCount ? parseInt(storedCount, 10) + 1 : 1;

        // Validate the stored value
        if (isNaN(currentCount) || currentCount < 0) {
            currentCount = 1;
        }

        localStorage.setItem(FALLBACK_STORAGE_KEY, currentCount.toString());

        console.log(`⚠️ Using local counter: ${currentCount} visits (browser-specific)`);

        // Animate the counter update
        animateCounterUpdate(currentCount);

        // Show increment animation
        showIncrementAnimation();

        // Update stats
        updateStats();

    } catch (error) {
        console.error('Error with fallback counter:', error);
        currentCount = 0;
        counterElement.textContent = '0';
    }
}

/**
 * Animate the counter from old value to new value
 */
function animateCounterUpdate(targetValue) {
    const startValue = targetValue - 1;
    const duration = ANIMATION_DURATION;
    const startTime = Date.now();

    function updateCounter() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);

        // Calculate current value
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);

        // Update display
        counterElement.textContent = currentValue;

        // Continue animation if not complete
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            counterElement.textContent = targetValue;
        }
    }

    requestAnimationFrame(updateCounter);
}

/**
 * Show the +1 increment animation
 */
function showIncrementAnimation() {
    // Remove any existing animation
    incrementAnimationElement.classList.remove('active');

    // Trigger reflow to restart animation
    void incrementAnimationElement.offsetWidth;

    // Add animation class
    incrementAnimationElement.classList.add('active');

    // Remove class after animation completes
    setTimeout(() => {
        incrementAnimationElement.classList.remove('active');
    }, ANIMATION_DURATION);
}

// ============================================
// STATS FUNCTIONS
// ============================================

/**
 * Update statistics display
 */
function updateStats() {
    statVisitsElement.textContent = currentCount;
}

/**
 * Update mission time display (current time in HH:MM:SS format)
 */
function updateMissionTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    statTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// ============================================
// ANIMATION FUNCTIONS
// ============================================

/**
 * Animate elements on page entrance
 */
function animateEntrance() {
    // Animate panels with staggered delay
    const panels = document.querySelectorAll('.panel');
    panels.forEach((panel, index) => {
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(20px)';

        setTimeout(() => {
            panel.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Animate header
    const header = document.querySelector('.header');
    header.style.opacity = '0';
    header.style.transform = 'translateY(-20px)';

    setTimeout(() => {
        header.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
    }, 200);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get current visitor count from API
 * Call this from browser console: await getCurrentCount()
 */
async function getCurrentCount() {
    try {
        const getUrl = 'https://api.countapi.xyz/get/space-mission-control-eswar/visits';
        const response = await fetch(getUrl);
        const data = await response.json();
        console.log(`Current global visitor count: ${data.value}`);
        return data.value;
    } catch (error) {
        console.error('Error fetching count:', error);
        console.log(`Last known count: ${currentCount}`);
        return currentCount;
    }
}

/**
 * Reset visitor count (for testing purposes)
 * Note: This only resets local storage, cannot reset the global API counter
 */
function resetVisitorCount() {
    if (isApiAvailable) {
        alert('⚠️ Cannot reset global counter!\n\nThe visitor count is now shared across ALL users globally.\nIt cannot be reset from the client side.\n\nThis is the true count of all astronauts who have visited Mission Control!');
        console.log('Global counter cannot be reset. Current count:', currentCount);
    } else {
        if (confirm('Reset local visitor count to 0?')) {
            localStorage.setItem(FALLBACK_STORAGE_KEY, '0');
            currentCount = 0;
            counterElement.textContent = '0';
            statVisitsElement.textContent = '0';
            console.log('Local visitor count has been reset.');
        }
    }
}

/**
 * Get current visitor count (for testing purposes)
 * Call this from browser console: getVisitorCount()
 */
function getVisitorCount() {
    console.log(`Current visitor count: ${currentCount}`);
    if (isApiAvailable) {
        console.log('ℹ️ This is a GLOBAL count shared across all users');
    } else {
        console.log('⚠️ This is a LOCAL count (browser-specific)');
    }
    return currentCount;
}

// Make functions available globally for console access
window.resetVisitorCount = resetVisitorCount;
window.getVisitorCount = getVisitorCount;
window.getCurrentCount = getCurrentCount;

// ============================================
// EVENT LISTENERS
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already ready
    init();
}

// ============================================
// EASTER EGG: Secret Commands
// ============================================

// Listen for keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl + Shift + R = Reset counter
    if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        resetVisitorCount();
    }

    // Ctrl + Shift + I = Show info
    if (event.ctrlKey && event.shiftKey && event.key === 'I') {
        event.preventDefault();
        console.log('==============================================');
        console.log('MISSION CONTROL - System Information');
        console.log('==============================================');
        console.log(`Total Astronauts Briefed: ${currentCount}`);
        console.log(`Storage Key: ${STORAGE_KEY}`);
        console.log(`Mission Time: ${statTimeElement.textContent}`);
        console.log('==============================================');
        console.log('Available Commands:');
        console.log('  - getVisitorCount()    : Get current count');
        console.log('  - resetVisitorCount()  : Reset count to 0');
        console.log('  - Ctrl+Shift+R         : Reset counter');
        console.log('  - Ctrl+Shift+I         : Show this info');
        console.log('==============================================');
    }
});

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================

console.log('%c MISSION CONTROL INITIALIZED ', 'background: #00f0ff; color: #0a0e27; font-size: 16px; font-weight: bold; padding: 10px;');
console.log('%c Welcome, Space Explorer! ', 'color: #00f0ff; font-size: 14px; font-weight: bold;');
console.log('%c System Status: OPERATIONAL ', 'color: #00ff88; font-size: 12px;');
console.log('%c 🌍 Global Counter: ENABLED - Shared across all users worldwide! ', 'color: #9d4edd; font-size: 12px; font-weight: bold;');
console.log('%c Type getVisitorCount() to view current astronaut count ', 'color: #a0b8c5; font-size: 11px;');
console.log('%c Type await getCurrentCount() to fetch latest global count ', 'color: #a0b8c5; font-size: 11px;');
console.log('%c Press Ctrl+Shift+I for more commands ', 'color: #a0b8c5; font-size: 11px;');
