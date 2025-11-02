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
            // Clean up the paragraph text
            p.textContent = paragraph.trim().replace(/\n/g, ' ');
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

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadIntroduction();
    loadTimeline();
});
