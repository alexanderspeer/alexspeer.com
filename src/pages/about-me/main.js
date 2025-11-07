// Load introduction text
async function loadIntroduction() {
    try {
        const response = await fetch('pages/about-me/about-me.txt');
        let text = await response.text();

        // Normalize line endings
        text = text.replace(/\r\n/g, '\n');

        // Split by double newlines to get paragraphs
        const paragraphs = text.split('\n\n').filter(p => p.trim());

        const introContent = document.getElementById('intro-content');
        paragraphs.forEach((paragraph) => {
            const p = document.createElement('p');
            // Clean up the paragraph text and use innerHTML to allow HTML links
            p.innerHTML = paragraph.trim().replace(/\n/g, ' ');
            introContent.appendChild(p);
        });
    } catch (error) {
        console.error('Error loading introduction:', error);
    }
}

// Extract numeric age from age string
function extractAge(ageStr) {
    const match = ageStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

function createTimelineItem(timeline, speerEvent, greatEvent) {
    const item = document.createElement('div');
    item.className = 'timeline-item';

    // Left side (Alexander Speer)
    const left = document.createElement('div');
    left.className = speerEvent ? 'timeline-left' : 'timeline-left empty';

    if (speerEvent) {
        const content = document.createElement('div');
        content.className = 'timeline-content';

        const yearAge = document.createElement('div');
        yearAge.className = 'timeline-year-age';
        yearAge.textContent = `${speerEvent.year} • ${speerEvent.age}`;

        const eventText = document.createElement('div');
        eventText.className = 'timeline-event';
        eventText.textContent = speerEvent.event;

        content.appendChild(yearAge);
        content.appendChild(eventText);
        left.appendChild(content);
    }

    // Center dot - color based on which event exists
    const center = document.createElement('div');
    center.className = 'timeline-center';
    const dot = document.createElement('div');

    if (speerEvent && greatEvent) {
        // Both exist - use split blue/gold
        dot.className = 'timeline-dot shared';
    } else if (speerEvent) {
        // Only Speer - use blue
        dot.className = 'timeline-dot speer';
    } else {
        // Only Great - use gold
        dot.className = 'timeline-dot great';
    }

    center.appendChild(dot);

    // Right side (Alexander the Great)
    const right = document.createElement('div');
    right.className = greatEvent ? 'timeline-right' : 'timeline-right empty';

    if (greatEvent) {
        const content = document.createElement('div');
        content.className = 'timeline-content';

        const yearAge = document.createElement('div');
        yearAge.className = 'timeline-year-age';
        yearAge.textContent = `${greatEvent.year} • ${greatEvent.age}`;

        const eventText = document.createElement('div');
        eventText.className = 'timeline-event';
        eventText.textContent = greatEvent.event;

        content.appendChild(yearAge);
        content.appendChild(eventText);
        right.appendChild(content);
    }

    item.appendChild(left);
    item.appendChild(center);
    item.appendChild(right);
    timeline.appendChild(item);
}

// Load and display timeline
async function loadTimeline() {
    try {
        const response = await fetch('pages/about-me/timeline.json');
        const timelineData = await response.json();

        const timeline = document.getElementById('comparison-timeline');

        // Group events by age
        const eventsByAge = {};

        timelineData.forEach((event) => {
            const age = extractAge(event.age);
            if (!eventsByAge[age]) {
                eventsByAge[age] = {
                    speer: [],
                    great: []
                };
            }

            if (event.category === 'Alexander Speer') {
                eventsByAge[age].speer.push(event);
            } else {
                eventsByAge[age].great.push(event);
            }
        });

        // Sort ages numerically
        const sortedAges = Object.keys(eventsByAge).map(Number).sort((a, b) => a - b);

        // Create timeline items organized by age
        sortedAges.forEach((age) => {
            const events = eventsByAge[age];
            const speerEvents = events.speer;
            const greatEvents = events.great;

            // Get the maximum number of events at this age
            const maxEvents = Math.max(speerEvents.length, greatEvents.length);

            // Create rows for this age
            for (let i = 0; i < maxEvents; i += 1) {
                const speerEvent = speerEvents[i] || null;
                const greatEvent = greatEvents[i] || null;

                createTimelineItem(timeline, speerEvent, greatEvent);
            }
        });
    } catch (error) {
        console.error('Error loading timeline:', error);
    }
}

// Create mobile navigation if needed
function setupMobileNavigation() {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    // Hide the desktop navigation
    const desktopNav = document.getElementById('brain-navigation-container');
    if (desktopNav) {
        desktopNav.style.display = 'none';
    }

    // Create mobile VIEW TABS button
    const container = document.createElement('div');
    container.id = 'mobile-nav-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        pointer-events: auto;
    `;

    const navButton = document.createElement('button');
    navButton.textContent = 'VIEW TABS';
    navButton.id = 'mobile-view-tabs-button';
    navButton.style.cssText = `
        padding: 12px 24px;
        background: rgba(0, 0, 0, 0.05) !important;
        backdrop-filter: brightness(0.9) blur(20px) url(#liquidGlassFilter) !important;
        -webkit-backdrop-filter: brightness(0.9) blur(20px) url(#liquidGlassFilter) !important;
        border-radius: 28px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: inset 6px 6px 0px -6px rgba(255, 255, 255, 0.4),
                    inset 0 0 8px 1px rgba(255, 255, 255, 0.3),
                    0 8px 32px rgba(0, 0, 0, 0.5);
        color: rgba(255, 255, 255, 1.0);
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
        font-size: 12px;
        font-weight: 400;
        letter-spacing: 2px;
        cursor: pointer;
        transition: transform 0.2s ease-out;
        -webkit-tap-highlight-color: transparent;
    `;

    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.id = 'mobile-nav-dropdown';
    dropdown.style.cssText = `
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        display: none;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.05) !important;
        backdrop-filter: brightness(0.9) blur(20px) url(#liquidGlassFilter) !important;
        -webkit-backdrop-filter: brightness(0.9) blur(20px) url(#liquidGlassFilter) !important;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: inset 6px 6px 0px -6px rgba(255, 255, 255, 0.4),
                    inset 0 0 8px 1px rgba(255, 255, 255, 0.3),
                    0 8px 32px rgba(0, 0, 0, 0.5);
        padding: 8px;
        gap: 8px;
        z-index: 999;
        pointer-events: auto;
        min-width: 150px;
        opacity: 0;
        transition: opacity 0.3s ease-out;
    `;

    // Navigation items
    const navItems = [
        { label: 'HOME', url: '/?skip=true' },
        { label: 'ABOUT ME', url: '/about.html' },
        { label: 'EXPERIENCE', url: '/experience.html' },
        { label: 'PROJECTS', url: '/projects.html' },
        { label: 'CONTACT', url: '/contact.html' }
    ];

    navItems.forEach((item) => {
        const link = document.createElement('a');
        link.href = item.url;
        link.textContent = item.label;
        link.style.cssText = `
            color: rgba(255, 255, 255, 1.0);
            text-decoration: none;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
            font-size: 12px;
            font-weight: 400;
            letter-spacing: 2px;
            padding: 12px 20px;
            border-radius: 12px;
            cursor: pointer;
            transition: background 0.2s ease-out;
            white-space: nowrap;
            text-align: center;
        `;
        link.addEventListener('mouseenter', () => {
            link.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        link.addEventListener('mouseleave', () => {
            link.style.background = 'transparent';
        });
        dropdown.appendChild(link);
    });

    // Toggle dropdown
    let isOpen = false;
    navButton.addEventListener('click', (e) => {
        e.stopPropagation();
        isOpen = !isOpen;
        
        if (isOpen) {
            dropdown.style.display = 'flex';
            setTimeout(() => {
                dropdown.style.opacity = '1';
            }, 10);
        } else {
            dropdown.style.opacity = '0';
            setTimeout(() => {
                dropdown.style.display = 'none';
            }, 300);
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (isOpen && !dropdown.contains(e.target) && e.target !== navButton) {
            isOpen = false;
            dropdown.style.opacity = '0';
            setTimeout(() => {
                dropdown.style.display = 'none';
            }, 300);
        }
    });

    container.appendChild(navButton);
    document.body.appendChild(container);
    document.body.appendChild(dropdown);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadIntroduction();
    loadTimeline();
    setupMobileNavigation();
});
