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
        background: rgba(0, 0, 0, 0.1) !important;
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
        background: rgba(0, 0, 0, 0.1) !important;
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

// Contact page initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Contact page loaded');
    setupMobileNavigation();
});

