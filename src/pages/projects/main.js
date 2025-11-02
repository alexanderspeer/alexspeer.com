/* eslint-disable no-use-before-define */
// Projects configuration
const PROJECTS_CONFIG = [
    {
        folder: '3dbrain',
        jsonFile: '3dbrain.json',
        hasVideo: true,
        order: 1,
        liveLink: 'https://alexspeer.com'
    },
    {
        folder: 'calliope',
        jsonFile: 'calliope.json',
        hasVideo: true,
        order: 2,
        liveLink: 'https://calliope-ccdc166d3d1e.herokuapp.com/static/index.html'
    },
    {
        folder: 'clio',
        jsonFile: 'clio.json',
        hasVideo: false,
        order: 3
    },
    {
        folder: 'euterpe',
        jsonFile: 'euterpe.json',
        hasVideo: true,
        order: 4
    },
    {
        folder: 'alarm-clock',
        jsonFile: 'alarm-clock.json',
        hasVideo: true,
        order: 5
    },
    {
        folder: 'facemash',
        jsonFile: 'columbia-facemash.json',
        hasVideo: false,
        order: 6,
        liveLink: 'https://columbia-facemash-46dd96c179aa.herokuapp.com/login'
    }
];

// Global state
let projectsData = [];
const activeFilters = new Set(['all']);
const allTechTags = new Set();
const projectCards = []; // Store all project cards persistently

// Consistent color mapping for tech stack (muted colors, no border, white text)
const techColors = {
    'JavaScript': { bg: 'rgba(90, 120, 180, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'Node.js': { bg: 'rgba(110, 80, 160, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'Python': { bg: 'rgba(70, 150, 150, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'Flask': { bg: 'rgba(180, 90, 130, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'SQL': { bg: 'rgba(180, 150, 60, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'Heroku': { bg: 'rgba(130, 140, 160, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'HTML/CSS': { bg: 'rgba(180, 80, 60, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'API': { bg: 'rgba(70, 110, 140, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'AI': { bg: 'rgba(120, 90, 160, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'OAuth 2.0': { bg: 'rgba(150, 60, 100, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'Arduino': { bg: 'rgba(60, 120, 110, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'C++': { bg: 'rgba(60, 100, 160, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'I2C Communication': { bg: 'rgba(180, 130, 60, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'Hardware': { bg: 'rgba(120, 120, 120, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'Embedded Systems': { bg: 'rgba(100, 70, 140, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'Automation': { bg: 'rgba(60, 110, 70, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'Algorithms': { bg: 'rgba(150, 90, 150, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'Neuroscience': { bg: 'rgba(180, 60, 110, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'Three.js': { bg: 'rgba(50, 50, 50, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'Webpack': { bg: 'rgba(140, 180, 220, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' },
    'Firebase Hosting': { bg: 'rgba(255, 160, 50, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' }
};

// Default color for unknown tech
const defaultTechColor = { bg: 'rgba(130, 130, 140, 0.9)', border: 'transparent', color: 'rgba(255, 255, 255, 1)' };

function getTechColor(tech) {
    return techColors[tech] || defaultTechColor;
}

// Load all project data
async function loadProjects() {
    const promises = PROJECTS_CONFIG.map(async (config) => {
        try {
            const response = await fetch(`pages/projects/${config.folder}/${config.jsonFile}`);
            const data = await response.json();

            if (data.projects && data.projects.length > 0) {
                const project = data.projects[0];
                return {
                    ...project,
                    folder: config.folder,
                    hasVideo: config.hasVideo,
                    order: config.order,
                    liveLink: config.liveLink,
                    stackArray: parseStack(project.stack)
                };
            }
        } catch (error) {
            console.error(`Error loading ${config.folder}:`, error);
        }
        return null;
    });

    const results = await Promise.all(promises);
    projectsData = results.filter(p => p !== null).sort((a, b) => a.order - b.order);

    // Extract all unique tech tags
    projectsData.forEach((project) => {
        project.stackArray.forEach(tech => allTechTags.add(tech));
    });

    renderFilterBar();
    renderProjects();
}

// Parse stack string into array
function parseStack(stackString) {
    return stackString.split('·').map(s => s.trim()).filter(s => s.length > 0);
}

// Format description with blank lines
function formatDescription(description, blankLineNotes) {
    // Split description into paragraphs
    const paragraphs = description.split('\n\n');
    return paragraphs.join('\n\n');
}

// Get gallery images for a project
function getGalleryImages(folder) {
    // Predefined gallery images for each project (specific numbers)
    const galleryImages = {
        '3dbrain': [1, 2, 3, 4, 5],
        'alarm-clock': [1, 2, 3],
        'calliope': [1, 2, 3, 4, 5, 7, 8, 9, 10], // Note: 6 is missing
        'clio': [1, 2, 3, 4],
        'euterpe': [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Note: 3 is missing
        'facemash': [1, 2, 3]
    };

    const imageNumbers = galleryImages[folder] || [];
    const images = [];

    imageNumbers.forEach((num) => {
        images.push(`pages/projects/${folder}/gallery/${folder}${num}.webp`);
    });

    return images;
}

// Render filter bar
function renderFilterBar() {
    const filterTagsContainer = document.getElementById('filter-tags');
    filterTagsContainer.innerHTML = '';

    // Add "All" filter
    const allTag = document.createElement('div');
    allTag.className = 'filter-tag all-filter active';
    allTag.textContent = 'All';
    allTag.addEventListener('click', () => toggleFilter('all'));
    filterTagsContainer.appendChild(allTag);

    // Sort tech tags by frequency (most used first)
    const techFrequency = {};
    projectsData.forEach(project => {
        project.stackArray.forEach(tech => {
            techFrequency[tech] = (techFrequency[tech] || 0) + 1;
        });
    });
    
    const sortedTags = Array.from(allTechTags).sort((a, b) => {
        return techFrequency[b] - techFrequency[a];
    });
    
    sortedTags.forEach((tech) => {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.textContent = tech;
        tag.dataset.tech = tech;
        
        // Apply consistent color
        const colors = getTechColor(tech);
        tag.style.background = colors.bg;
        tag.style.borderColor = colors.border;
        tag.style.color = colors.color;
        
        tag.addEventListener('click', () => toggleFilter(tech));
        filterTagsContainer.appendChild(tag);
    });
}

// Toggle filter
function toggleFilter(tech) {
    if (tech === 'all') {
        activeFilters.clear();
        activeFilters.add('all');
    } else {
        activeFilters.delete('all');
        if (activeFilters.has(tech)) {
            activeFilters.delete(tech);
        } else {
            activeFilters.add(tech);
        }

        // If no filters selected, show all
        if (activeFilters.size === 0) {
            activeFilters.add('all');
        }
    }

    updateFilterUI();
    filterProjects();
}

// Update filter UI
function updateFilterUI() {
    const allTags = document.querySelectorAll('.filter-tag');
    allTags.forEach((tag) => {
        const tech = tag.dataset.tech || 'all';
        if (activeFilters.has(tech)) {
            tag.classList.add('active');
            // Override inline styles for active state
            if (tech !== 'all') {
                tag.style.background = 'rgba(255, 255, 255, 0.9)';
                tag.style.color = '#000000';
            }
        } else {
            tag.classList.remove('active');
            // Restore original colors for inactive state
            if (tech !== 'all') {
                const colors = getTechColor(tech);
                tag.style.background = colors.bg;
                tag.style.borderColor = colors.border;
                tag.style.color = colors.color;
            }
        }
    });
}

// Filter projects and redistribute sequentially
function filterProjects() {
    const column1 = document.getElementById('column-1');
    const column2 = document.getElementById('column-2');
    
    // Use stored cards instead of querying DOM
    const visibleProjects = projectCards.filter(({ project }) => {
        // If "All" is selected, show everything
        if (activeFilters.has('all')) {
            return true;
        }
        // Otherwise, show if project has ANY of the selected tech
        return project.stackArray.some(tech => activeFilters.has(tech));
    });
    
    // Clear columns
    column1.innerHTML = '';
    column2.innerHTML = '';
    
    // Redistribute visible projects sequentially
    visibleProjects.forEach(({ card }, index) => {
        if (index % 2 === 0) {
            column1.appendChild(card);
        } else {
            column2.appendChild(card);
        }
    });
}

// Render projects into two columns
function renderProjects() {
    const column1 = document.getElementById('column-1');
    const column2 = document.getElementById('column-2');
    column1.innerHTML = '';
    column2.innerHTML = '';
    projectCards.length = 0; // Clear the stored cards

    for (let index = 0; index < projectsData.length; index += 1) {
        const project = projectsData[index];
        const galleryImages = getGalleryImages(project.folder);

        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.projectIndex = index;
        
        // Store reference to card
        projectCards.push({ card, project, index });

        // Create media container
        const mediaHtml = createMediaHtml(project, galleryImages);

        // Format description
        const formattedDescription = formatDescription(project.description, project.blank_line_notes);

        // Create stack tags with consistent colors
        const stackHtml = project.stackArray.map((tech) => {
            const colors = getTechColor(tech);
            return `<span class="stack-tag" style="background: ${colors.bg}; border-color: ${colors.border}; color: ${colors.color}">${tech}</span>`;
        }).join('');
        
        // Create live link HTML - make it active and vibrant if available
        const liveLinkHtml = project.liveLink
            ? `<a href="${project.liveLink}" target="_blank" rel="noopener noreferrer" class="project-link active live-link-active" title="Visit Live Site">
                <img src="../../favicons/link.png" alt="Link">
               </a>`
            : `<div class="project-link" title="Live Site (Coming Soon)">
                <img src="../../favicons/link.png" alt="Link">
               </div>`;

        card.innerHTML = `
            ${mediaHtml}
            <div class="project-content">
                <h2 class="project-title">${project.title}</h2>
                <p class="project-summary">${project.summary}</p>
                <button class="view-more-btn">show more</button>
                <div class="project-description">${formattedDescription}</div>
                <div class="project-footer">
                    <div class="project-links">
                        <div class="project-link" title="GitHub (Coming Soon)">
                            <img src="../../favicons/github.png" alt="GitHub">
                        </div>
                        <div class="project-link" title="YouTube (Coming Soon)">
                            <img src="../../favicons/youtube.png" alt="YouTube">
                        </div>
                        ${liveLinkHtml}
                    </div>
                    <div class="project-stack">
                        ${stackHtml}
                    </div>
                </div>
            </div>
        `;
        
        // Add view more button listener
        const viewMoreBtn = card.querySelector('.view-more-btn');
        const descriptionDiv = card.querySelector('.project-description');

        viewMoreBtn.addEventListener('click', () => {
            descriptionDiv.classList.toggle('expanded');
            if (descriptionDiv.classList.contains('expanded')) {
                viewMoreBtn.textContent = 'show less';
            } else {
                viewMoreBtn.textContent = 'show more';
            }
        });

        // Alternate between columns for even distribution
        if (index % 2 === 0) {
            column1.appendChild(card);
        } else {
            column2.appendChild(card);
        }

        // Setup gallery navigation after adding to DOM
        if (galleryImages.length > 0) {
            setupGalleryNavigation(card, galleryImages);
        }
    }
}

// Create media HTML with gallery navigation
function createMediaHtml(project, galleryImages) {
    if (galleryImages.length === 0) return '';

    const { folder, hasVideo, title } = project;
    
    // Use poster image if available (for projects with hover videos), otherwise use first gallery image
    const posterImage = hasVideo ? `pages/projects/${folder}/hover/poster.webp` : galleryImages[0];
    const videoWebm = `pages/projects/${folder}/hover/${folder}_preview.webm`;

    let html = `
        <div class="project-media-container" data-folder="${folder}" data-has-video="${hasVideo}">
            <img src="${posterImage}" alt="${title}" class="project-media project-poster" data-gallery-index="-1">
    `;

    // Add video overlay if available
    if (hasVideo) {
        html += `
            <video class="project-video" muted loop playsinline preload="auto">
                <source src="${videoWebm}" type="video/webm">
            </video>
        `;
    }

    // Add gallery navigation - always show if there are gallery images
    if (galleryImages.length > 0) {
        html += `
            <div class="gallery-arrow left">‹</div>
            <div class="gallery-arrow right">›</div>
            <div class="gallery-dots">
                ${galleryImages.map((_, i) =>
                    `<div class="gallery-dot" data-index="${i}"></div>`
                ).join('')}
            </div>
        `;
    }

    html += `</div>`;
    return html;
}

// Setup gallery navigation for a project card
function setupGalleryNavigation(card, galleryImages) {
    const mediaContainer = card.querySelector('.project-media-container');
    const mediaImg = mediaContainer.querySelector('.project-media');
    const video = mediaContainer.querySelector('.project-video');
    const leftArrow = mediaContainer.querySelector('.gallery-arrow.left');
    const rightArrow = mediaContainer.querySelector('.gallery-arrow.right');
    const dots = mediaContainer.querySelectorAll('.gallery-dot');
    const hasVideo = mediaContainer.dataset.hasVideo === 'true';

    // -1 means poster/video, 0+ means gallery image
    let currentIndex = -1;
    let isHovering = false;
    let isInGalleryMode = false;

    // Handle video hover - only if we're showing poster (not in gallery mode)
    if (video) {
        // Only trigger hover on the image itself, not the arrows/controls
        mediaImg.addEventListener('mouseenter', () => {
            isHovering = true;
            if (!isInGalleryMode && currentIndex === -1) {
                video.style.opacity = '1';
                video.play();
            }
        });

        mediaImg.addEventListener('mouseleave', () => {
            isHovering = false;
            if (video) {
                video.style.opacity = '0';
                video.pause();
                video.currentTime = 0;
            }
        });
    }

    // Get poster image source
    const posterSrc = mediaImg.src;

    // Navigate to specific index (-1 = poster, 0+ = gallery)
    function navigateToIndex(index) {
        currentIndex = index;
        
        if (index === -1) {
            // Show poster
            isInGalleryMode = false;
            mediaImg.src = posterSrc;
            mediaImg.dataset.galleryIndex = '-1';
            
            // Update dots - none active
            dots.forEach(dot => dot.classList.remove('active'));
            
            // If hovering, show video
            if (video && isHovering) {
                video.style.opacity = '1';
                video.play();
            }
        } else {
            // Show gallery image
            isInGalleryMode = true;
            mediaImg.src = galleryImages[index];
            mediaImg.dataset.galleryIndex = index;
            
            // Hide video when viewing gallery
            if (video) {
                video.style.opacity = '0';
                video.pause();
            }
            
            // Update dots
            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }

    // Left arrow
    if (leftArrow) {
        leftArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (currentIndex === -1) {
                // From poster, go to last gallery image
                navigateToIndex(galleryImages.length - 1);
            } else if (currentIndex === 0) {
                // From first gallery image, go back to poster if hasVideo, otherwise wrap
                if (hasVideo) {
                    navigateToIndex(-1);
                } else {
                    navigateToIndex(galleryImages.length - 1);
                }
            } else {
                // Navigate backward in gallery
                navigateToIndex(currentIndex - 1);
            }
        });
    }

    // Right arrow
    if (rightArrow) {
        rightArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (currentIndex === -1) {
                // From poster, go to first gallery image
                navigateToIndex(0);
            } else if (currentIndex === galleryImages.length - 1) {
                // From last gallery image, go back to poster if hasVideo, otherwise wrap
                if (hasVideo) {
                    navigateToIndex(-1);
                } else {
                    navigateToIndex(0);
                }
            } else {
                // Navigate forward in gallery
                navigateToIndex(currentIndex + 1);
            }
        });
    }

    // Dots navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateToIndex(index);
        });
    });

    // Click on image to open modal
    mediaImg.addEventListener('click', (e) => {
        // Don't open modal if clicking on arrows or dots
        if (e.target.classList.contains('gallery-arrow') ||
            e.target.classList.contains('gallery-dot')) {
            return;
        }
        
        // Open modal starting from current gallery image, or first if on poster
        const startIndex = currentIndex === -1 ? 0 : currentIndex;
        openGalleryModal(galleryImages, startIndex);
    });
}

// Gallery Modal
let currentModalIndex = 0;
let currentModalImages = [];

function openGalleryModal(images, startIndex) {
    currentModalImages = images;
    currentModalIndex = startIndex;

    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('gallery-image');
    const currentSpan = document.getElementById('gallery-current');
    const totalSpan = document.getElementById('gallery-total');

    modal.classList.add('active');
    modalImg.src = images[currentModalIndex];
    currentSpan.textContent = currentModalIndex + 1;
    totalSpan.textContent = images.length;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateModal(direction) {
    if (currentModalImages.length === 0) return;

    if (direction === 'next') {
        currentModalIndex = (currentModalIndex + 1) % currentModalImages.length;
    } else {
        currentModalIndex = (currentModalIndex - 1 + currentModalImages.length) % currentModalImages.length;
    }

    const modalImg = document.getElementById('gallery-image');
    const currentSpan = document.getElementById('gallery-current');

    modalImg.src = currentModalImages[currentModalIndex];
    currentSpan.textContent = currentModalIndex + 1;
}

// Modal event listeners
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('gallery-modal');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');

    prevBtn.addEventListener('click', () => navigateModal('prev'));
    nextBtn.addEventListener('click', () => navigateModal('next'));

    // Click outside to close (click on the dark background)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeGalleryModal();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeGalleryModal();
            } else if (e.key === 'ArrowLeft') {
                navigateModal('prev');
            } else if (e.key === 'ArrowRight') {
                navigateModal('next');
            }
        }
    });

    // Load projects
    loadProjects();
});

/* eslint-enable no-use-before-define */
