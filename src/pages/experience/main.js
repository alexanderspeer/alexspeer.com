/* eslint-disable max-len */
// Experience data embedded directly
const experienceData = {
    education: [
        {
            degree: "Bachelor of Arts in Cognitive Science (Specialization in Neural Engineering)",
            institution: "Columbia University",
            location: "New York, NY",
            date_range: "Expected Graduation: May 2026",
            details: [
                "Focus on computational neuroscience, brain-computer interfaces, and biomedical signal processing.",
                "Resident Advisor and active member of the Cognitive Science Society."
            ]
        },
        {
            degree: "International Baccalaureate Program",
            institution: "Clarkston High School",
            location: "Clarkston, MI",
            date_range: "Sep 2019 - Jun 2022",
            details: [
                "Grade: 4.0",
                "Valedictorian"
            ]
        }
    ],
    work_experience: [
        {
            title: "Undergraduate Research Assistant",
            organization: "Ultrasound and Elasticity Imaging Laboratory (UEIL)",
            location: "Columbia University, New York, NY",
            date_range: "October 2025 – Present",
            details: [
                "Supported focused ultrasound neuromodulation experiments on murine models, calibrating transducer parameters (3.1 MHz, 10 Hz PRF, 1 ms pulses) and verifying sciatic nerve targeting through displacement imaging and motor response confirmation.",
                "Collected and analyzed behavioral data (von Frey thresholds, Rotarod, CatWalk) to quantify analgesic effects of FUS vs. ibuprofen, identifying significant post-sonication improvements in withdrawal thresholds.",
                "Processed longitudinal datasets across 15-day trials, applying ANOVA and Mann–Whitney U tests to evaluate treatment efficacy and motor performance consistency."
            ]
        },
        {
            title: "Head of Events & Experiences",
            organization: "NeuroNYC",
            location: "New York, NY",
            date_range: "September 2025 – Present",
            details: [
                "Lead planning and execution of weekly and monthly neurotech community events attracting 100–150+ attendees, fostering collaboration between researchers, founders, and students across NYC.",
                "Coordinated with leading neurotechnology companies and labs such as Synchron, Blackrock Neurotech, and NYBCI25 to host demos, panels, and networking sessions.",
                "Developed and managed partnerships with venues and sponsors to expand engagement opportunities within the growing NYC neurotech ecosystem."
            ]
        },
        {
            title: "Brain-Computer Interface Engineer",
            organization: "AWEAR",
            location: "San Francisco, CA",
            date_range: "June 2025 – Present",
            details: [
                "Owned end-to-end ML development for the BCI platform, applying EEG preprocessing (filtering, artifact rejection, FFT/PSD features) and training classifiers for cognitive/affective states, achieving 86% mean accuracy on valence/arousal.",
                "Built a cross-platform app for real-time brainwave visualization with seizure-risk and sleep anomaly detection, stress/arousal monitoring, and dashboards, deployed to 200+ beta users.",
                "Led statistical validation with Stanford and UCSF, applying effect sizes, CIs, and ANOVA/Mann-Whitney tests to assess EEG features, culminating in a peer-reviewed paper presented at Stanford BAAS 2025 and IEEE EMBS."
            ]
        },
        {
            title: "Neural Engineer, Multimodal AI",
            organization: "Sama Therapeutics",
            location: "New York, NY",
            date_range: "June – September 2025",
            details: [
                "Engineered multimodal biomarker pipeline (EEG, audio, video) for PHQ-8 depression prediction using deep feature extractors with early/late fusion models, deployed on GCP with agentic AI, achieving 82% accuracy and 0.80 AUC.",
                "Executed end-to-end EEG preprocessing and feature engineering for rodent dataset, extracting biomarkers and training H2O AutoML to achieve 92% accuracy distinguishing baseline vs. post-manipulation states.",
                "Developed a video-based infant movement analysis platform deployed on GCP to automate Cerebral Palsy risk prediction, integrating pose estimation, feature extraction, and AutoSklearn classifiers to achieve 79% accuracy and 0.76 AUC."
            ]
        },
        {
            title: "Human-Computer Interaction Engineer, AI Interfaces",
            organization: "Harvard Medical School & Massachusetts General Hospital",
            location: "Remote, NY",
            date_range: "May – September 2025",
            details: [
                "Built and deployed a clinical simulator combining LLM-driven dialogue, neural TTS, and affect-responsive 3D avatars with performance logging, used by 150+ Harvard Med/MGH trainees for OSCE prep.",
                "Owned the full-stack simulation platform, doubling user-reported realism by adding emotion-conditioned interactions, synchronized audio-visual cues, and performance consoles.",
                "Fine-tuned the LLM and re-architected the response pipeline to reduce latency by ~40%, leveraging token streaming, parallelized rendering, and asynchronous API handling."
            ]
        },
        {
            title: "Data Scientist",
            organization: "Con Edison",
            location: "New York, NY",
            date_range: "April – June 2025",
            details: [
                "Performed time-series analysis on high-voltage transformer telemetry streams, applying statistical anomaly detection and trend modeling to identify irregular load patterns and forecast equipment failures."
            ]
        },
        {
            title: "Machine Learning Engineer",
            organization: "Virginia Tile",
            location: "Livonia, MI",
            date_range: "May – December 2024",
            details: [
                "Oversaw data cleaning and validation pipelines on large-scale SQL databases, ensuring high-quality inputs for ML models and boosting predictive accuracy while decreasing latency by up to 80% via optimized indexing and parallelization."
            ]
        },
        {
            title: "Neuroscience Teaching Assistant",
            organization: "Columbia University",
            location: "New York, NY",
            date_range: "October 2023 – May 2024",
            details: [
                "Taught neural data analysis and experimental methods, mentoring students in neural processes, data interpretation, and research techniques."
            ]
        },
        {
            title: "Neuroscience Research Intern",
            organization: "Columbia University Neuroscience Summer Lab",
            location: "Remote",
            date_range: "April – August 2023",
            details: [
                "Worked on a research paper with neuroscientist Jon Freeman focusing on spontaneous trait inferences.",
                "Used R and MATLAB to clean, analyze, and visualize data, creating impactful visualizations for the final report presented at an Ivy League conference."
            ]
        }
    ]
};

// Map organization names to logo files (PNG version with glow)
function getLogoPath(organization) {
    const logoMap = {
        'Columbia University': 'columbia.png',
        'Ultrasound and Elasticity Imaging Laboratory (UEIL)': 'columbia.png',
        'Columbia University Neuroscience Summer Lab': 'columbia.png',
        'Clarkston High School': 'clarkston.png',
        NeuroNYC: 'neuronyc.png',
        AWEAR: 'awear.png',
        'Sama Therapeutics': 'sama.png',
        'Harvard Medical School & Massachusetts General Hospital': 'havard.png',
        'Con Edison': 'conedison.png',
        'Virginia Tile': 'virginiatile.png',
        Clarkston: 'clarkston.png'
    };

    const filename = logoMap[organization] || 'columbia.png'; // Default fallback
    return `../../favicons/experience/normal-png/${filename}`;
}

// Toggle show more/less for details
function toggleDetails(button) {
    const buttonElement = button;
    const detailsContainer = buttonElement.previousElementSibling;
    const hiddenItems = detailsContainer.querySelectorAll('.timeline-detail-item.hidden');

    if (hiddenItems.length > 0) {
        // Show all hidden items
        hiddenItems.forEach(item => item.classList.remove('hidden'));
        buttonElement.textContent = 'Show less';
    } else {
        // Hide all but first item
        const allItems = detailsContainer.querySelectorAll('.timeline-detail-item');
        allItems.forEach((item, index) => {
            if (index > 0) {
                item.classList.add('hidden');
            }
        });
        buttonElement.textContent = 'Show more';
    }
}

// Render education section
function renderEducation(education) {
    const container = document.getElementById('education-timeline');

    education.forEach((edu, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';

        // Render details as separate items with lines between them
        let detailsHTML = '';
        if (edu.details && edu.details.length > 0) {
            const detailItems = edu.details.map((detail, idx) =>
                `<div class="timeline-detail-item${idx > 0 ? ' hidden' : ''}">${detail}</div>`
            ).join('');

            detailsHTML = `
                <div class="timeline-details">
                    <div class="timeline-details-container">
                        ${detailItems}
                    </div>
                    ${edu.details.length > 1 ? `<button class="show-more-btn" onclick="toggleDetails(this)">Show more</button>` : ''}
                </div>
            `;
        }

        item.innerHTML = `
            <div class="timeline-left">
                <div class="timeline-title">${edu.degree}</div>
                <div class="timeline-date">${edu.date_range}</div>
            </div>
            <div class="timeline-center">
                <div class="timeline-icon">
                    <img src="${getLogoPath(edu.institution)}" alt="${edu.institution}">
                </div>
            </div>
            <div class="timeline-right">
                <div class="timeline-organization">${edu.institution}</div>
                ${edu.location ? `<div class="timeline-location">${edu.location}</div>` : ''}
                ${detailsHTML}
            </div>
        `;

        container.appendChild(item);
    });
}

// Make toggleDetails globally accessible
window.toggleDetails = toggleDetails;

// Render work experience section
function renderWorkExperience(workExperience) {
    const container = document.getElementById('work-timeline');

    workExperience.forEach((work, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';

        // Render details as separate items with lines between them
        let detailsHTML = '';
        if (work.details && work.details.length > 0) {
            const detailItems = work.details.map((detail, idx) =>
                `<div class="timeline-detail-item${idx > 0 ? ' hidden' : ''}">${detail}</div>`
            ).join('');

            detailsHTML = `
                <div class="timeline-details">
                    <div class="timeline-details-container">
                        ${detailItems}
                    </div>
                    ${work.details.length > 1 ? `<button class="show-more-btn" onclick="toggleDetails(this)">Show more</button>` : ''}
                </div>
            `;
        }

        item.innerHTML = `
            <div class="timeline-left">
                <div class="timeline-title">${work.title}</div>
                <div class="timeline-date">${work.date_range}</div>
            </div>
            <div class="timeline-center">
                <div class="timeline-icon">
                    <img src="${getLogoPath(work.organization)}" alt="${work.organization}">
                </div>
            </div>
            <div class="timeline-right">
                <div class="timeline-organization">${work.organization}</div>
                ${work.location ? `<div class="timeline-location">${work.location}</div>` : ''}
                ${detailsHTML}
            </div>
        `;

        container.appendChild(item);
    });
}

// Load and render experience data
function loadExperience() {
    renderEducation(experienceData.education);
    renderWorkExperience(experienceData.work_experience);
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadExperience();
    setupMobileNavigation();
});

/* eslint-enable max-len */

