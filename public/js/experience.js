// Experience data embedded directly
const experienceData = {
    "education": [
        {
            "degree": "Bachelor of Arts in Cognitive Science (Specialization in Neural Engineering)",
            "institution": "Columbia University",
            "link": "https://www.columbia.edu/",
            "location": "New York, NY",
            "date_range": "Expected Graduation: May 2026",
            "details": [
                "Focus on computational neuroscience, brain-computer interfaces, and biomedical signal processing.",
                "Resident Advisor and active member of the Cognitive Science Society."
            ]
        }
    ],
    "work_experience": [
        {
            "title": "Undergraduate Research Assistant",
            "organization": "Ultrasound and Elasticity Imaging Laboratory (UEIL)",
            "link": "https://ueil.bme.columbia.edu/",
            "location": "Columbia University, New York, NY",
            "date_range": "October 2025 – Present",
            "details": [
                "Supported focused ultrasound neuromodulation experiments on murine models, calibrating transducer parameters (3.1 MHz, 10 Hz PRF, 1 ms pulses) and verifying sciatic nerve targeting through displacement imaging and motor response confirmation.",
                "Collected and analyzed behavioral data (von Frey thresholds, Rotarod, CatWalk) to quantify analgesic effects of FUS vs. ibuprofen, identifying significant post-sonication improvements in withdrawal thresholds.",
                "Processed longitudinal datasets across 15-day trials, applying ANOVA and Mann–Whitney U tests to evaluate treatment efficacy and motor performance consistency."
            ]
        },
        {
            "title": "Head of Events & Experiences",
            "organization": "NeuroNYC",
            "link": "https://neuro-nyc.org/",
            "location": "New York, NY",
            "date_range": "September 2025 – Present",
            "details": [
                "Lead planning and execution of weekly and monthly neurotech community events attracting 100–150+ attendees, fostering collaboration between researchers, founders, and students across NYC.",
                "Coordinated with leading neurotechnology companies and labs such as Synchron, Blackrock Neurotech, and NYBCI25 to host demos, panels, and networking sessions.",
                "Developed and managed partnerships with venues and sponsors to expand engagement opportunities within the growing NYC neurotech ecosystem."
            ]
        },
        {
            "title": "Brain-Computer Interface Engineer",
            "organization": "AWEAR",
            "link": "https://www.awear.us/",
            "location": "San Francisco, CA",
            "date_range": "June 2025 – Present",
            "details": [
                "Owned end-to-end ML development for the BCI platform, applying EEG preprocessing (filtering, artifact rejection, FFT/PSD features) and training classifiers for cognitive/affective states, achieving 86% mean accuracy on valence/arousal.",
                "Built a cross-platform app for real-time brainwave visualization with seizure-risk and sleep anomaly detection, stress/arousal monitoring, and dashboards, deployed to 200+ beta users.",
                "Led statistical validation with Stanford and UCSF, applying effect sizes, CIs, and ANOVA/Mann-Whitney tests to assess EEG features, culminating in a peer-reviewed paper presented at Stanford BAAS 2025 and IEEE EMBS."
            ]
        },
        {
            "title": "Neural Engineer, Multimodal AI",
            "organization": "Sama Therapeutics",
            "link": "https://sama.ac/",
            "location": "New York, NY",
            "date_range": "June – September 2025",
            "details": [
                "Engineered multimodal biomarker pipeline (EEG, audio, video) for PHQ-8 depression prediction using deep feature extractors with early/late fusion models, deployed on GCP with agentic AI, achieving 82% accuracy and 0.80 AUC.",
                "Executed end-to-end EEG preprocessing and feature engineering for rodent dataset, extracting biomarkers and training H2O AutoML to achieve 92% accuracy distinguishing baseline vs. post-manipulation states.",
                "Developed a video-based infant movement analysis platform deployed on GCP to automate Cerebral Palsy risk prediction, integrating pose estimation, feature extraction, and AutoSklearn classifiers to achieve 79% accuracy and 0.76 AUC."
            ]
        },
        {
            "title": "Human-Computer Interaction Engineer, AI Interfaces",
            "organization": "Harvard Medical School & Massachusetts General Hospital",
            "link": "https://hms.harvard.edu/news/artificial-intelligence",
            "location": "Remote, NY",
            "date_range": "May – September 2025",
            "details": [
                "Built and deployed a clinical simulator combining LLM-driven dialogue, neural TTS, and affect-responsive 3D avatars with performance logging, used by 150+ Harvard Med/MGH trainees for OSCE prep.",
                "Owned the full-stack simulation platform, doubling user-reported realism by adding emotion-conditioned interactions, synchronized audio-visual cues, and performance consoles.",
                "Fine-tuned the LLM and re-architected the response pipeline to reduce latency by ~40%, leveraging token streaming, parallelized rendering, and asynchronous API handling."
            ]
        },
        {
            "title": "Data Scientist",
            "organization": "Con Edison",
            "link": "https://www.conedison.com/en/",
            "location": "New York, NY",
            "date_range": "April – June 2025",
            "details": [
                "Performed time-series analysis on high-voltage transformer telemetry streams, applying statistical anomaly detection and trend modeling to identify irregular load patterns and forecast equipment failures."
            ]
        },
        {
            "title": "Machine Learning Engineer",
            "organization": "Virginia Tile",
            "link": "https://virginiatile.com/",
            "location": "Livonia, MI",
            "date_range": "May – December 2024",
            "details": [
                "Oversaw data cleaning and validation pipelines on large-scale SQL databases, ensuring high-quality inputs for ML models and boosting predictive accuracy while decreasing latency by up to 80% via optimized indexing and parallelization."
            ]
        },
        {
            "title": "Neuroscience Teaching Assistant",
            "organization": "Columbia University",
            "link": "https://psychology.columbia.edu/content/jon-freeman",
            "location": "New York, NY",
            "date_range": "October 2023 – May 2024",
            "details": [
                "Taught neural data analysis and experimental methods, mentoring students in neural processes, data interpretation, and research techniques."
            ]
        },
        {
            "title": "Neuroscience Research Intern",
            "organization": "Columbia University Neuroscience Summer Lab",
            "link": "https://columbia-sipps.github.io/",
            "location": "Remote",
            "date_range": "April – August 2023",
            "details": [
                "Worked on a research paper with neuroscientist Jon Freeman focusing on spontaneous trait inferences.",
                "Used R and MATLAB to clean, analyze, and visualize data, creating impactful visualizations for the final report presented at an Ivy League conference."
            ]
        }
    ]
};

// Load and render experience data
function loadExperience() {
    renderEducation(experienceData.education);
    renderWorkExperience(experienceData.work_experience);
}

// Map organization names to logo files
function getLogoPath(organization) {
    const logoMap = {
        'Columbia University': 'columbia.svg',
        'Ultrasound and Elasticity Imaging Laboratory (UEIL)': 'columbia.svg',
        'NeuroNYC': 'neuronyc.svg',
        'AWEAR': 'awear.svg',
        'Sama Therapeutics': 'sama.svg',
        'Harvard Medical School & Massachusetts General Hospital': 'harvard.svg',
        'Con Edison': 'conedison.svg',
        'Virginia Tile': 'virginiatile.svg',
        'Clarkston': 'clarkston.svg'
    };
    
    const filename = logoMap[organization] || 'columbia.svg'; // Default fallback
    return `../favicons/experience/svg-experience/${filename}`;
}

// Render education section
function renderEducation(education) {
    const container = document.getElementById('education-timeline');
    
    education.forEach((edu, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
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
                <div class="timeline-organization">${edu.link ? `<a href="${edu.link}" target="_blank" rel="noopener noreferrer">${edu.institution}</a>` : edu.institution}</div>
                ${edu.location ? `<div class="timeline-location">${edu.location}</div>` : ''}
                ${edu.details && edu.details.length > 0 ? `
                    <div class="timeline-details">
                        <ul>
                            ${edu.details.map(detail => `<li>${detail}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Render work experience section
function renderWorkExperience(workExperience) {
    const container = document.getElementById('work-timeline');
    
    workExperience.forEach((work, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
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
                <div class="timeline-organization">${work.link ? `<a href="${work.link}" target="_blank" rel="noopener noreferrer">${work.organization}</a>` : work.organization}</div>
                ${work.location ? `<div class="timeline-location">${work.location}</div>` : ''}
                ${work.details && work.details.length > 0 ? `
                    <div class="timeline-details">
                        <ul>
                            ${work.details.map(detail => `<li>${detail}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadExperience);

