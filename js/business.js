const STORAGE_KEY = 'srttrail_discovery_data';
const LEAD_ENDPOINT = 'https://srttrail-leads.p-vedant7878.workers.dev';
const TOAST_TIMEOUT_MS = 4000;
const SUCCESS_TIMEOUT_MS = 5000;
const LOADING_DELAY_MS = 1200;
const MAX_PRIORITIES = 5;
const CHART_JS_URL = 'https://cdn.jsdelivr.net/npm/chart.js';
const CONFETTI_URL = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';

const pillarData = [
    {
        title: "Let's Say Hello",
        description: "First things first, I'd love to know who I'm talking to and how to best reach you.",
        questions: [
            {
                id: 'c_name',
                text: 'Your Full Name',
                placeholder: 'e.g. Jane Doe',
                type: 'input',
                inputType: 'text',
                autocomplete: 'name',
                required: true
            },
            {
                id: 'c_email',
                text: 'Your Email Address',
                placeholder: 'e.g. jane@example.com',
                type: 'input',
                inputType: 'email',
                autocomplete: 'email',
                required: true
            },
            {
                id: 'c_company',
                text: 'Your Business Name',
                placeholder: 'e.g. The Corner Bakery',
                type: 'input',
                inputType: 'text',
                autocomplete: 'organization',
                required: false
            },
            {
                id: 'c_phone',
                text: 'Phone Number',
                placeholder: 'Optional',
                type: 'input',
                inputType: 'tel',
                autocomplete: 'tel',
                required: false
            }
        ]
    },
    {
        title: 'Your Business Story',
        description: 'Tell me a little bit about what you do, who you serve, and what you want this website to achieve.',
        questions: [
            {
                id: 'p1_q1',
                text: 'What services or products do you offer to the community?',
                placeholder: 'Describe what you do best...',
                type: 'textarea',
                required: true
            },
            {
                id: 'p1_q2',
                text: 'Who are your primary local customers?',
                placeholder: 'e.g. Homeowners, families, college students...',
                type: 'textarea',
                required: true
            },
            {
                id: 'p1_q3',
                text: 'What is the main goal for this new website?',
                placeholder: 'e.g. I want people to easily find my menu, book an appointment, call me...',
                type: 'textarea',
                required: true
            }
        ]
    },
    {
        title: 'Your Top 5 Priorities',
        description: 'All of my websites come standard with fast load times, mobile responsiveness, smooth functionality, and basic SEO. To make this project fit your business, choose where you want the deepest focus.',
        helper: 'Select up to 5 core focus areas below.',
        questions: [
            {
                id: 'core_priorities',
                type: 'top5_checklist',
                required: true,
                maxSelect: MAX_PRIORITIES,
                options: [
                    { value: 'visuals', label: '🎨 Custom Branding & Visuals', desc: 'A sharper visual identity and a stronger premium feel.' },
                    { value: 'seo', label: '📍 Local SEO Focus', desc: 'Extra effort on Google Maps visibility and local search reach.' },
                    { value: 'booking', label: '📅 Online Booking / Scheduling', desc: 'A smoother way for customers to book with you any time.' },
                    { value: 'ecommerce', label: '🛍️ E-commerce / Selling', desc: 'Sell products, deposits, or gift cards directly from the site.' },
                    { value: 'reviews', label: '⭐ Customer Trust & Reviews', desc: 'Showcase social proof and turn reputation into conversions.' },
                    { value: 'portfolio', label: '📸 Project Galleries / Menus', desc: 'Present offerings clearly with visual depth and easy browsing.' },
                    { value: 'portals', label: '🔐 Customer Portals / Login', desc: 'Private spaces for clients to access history, files, or updates.' },
                    { value: 'contact', label: '✉️ Advanced Quote Forms', desc: 'Capture more useful lead details before the first call.' }
                ]
            }
        ]
    },
    {
        title: 'Getting Ready to Launch',
        description: 'A few final details so I can understand your timeline and competitive landscape.',
        questions: [
            {
                id: 'p4_q1',
                text: 'Who are a couple of other local businesses doing what you do?',
                placeholder: 'This helps me see what we need to beat...',
                type: 'textarea',
                required: true
            },
            {
                id: 'p4_q2',
                text: 'When would you ideally like this website to be live?',
                placeholder: 'e.g. Next month, before the holiday rush...',
                type: 'input',
                inputType: 'text',
                autocomplete: 'off',
                required: true
            },
            {
                id: 'p4_q3',
                text: 'Do you already own your domain name?',
                placeholder: 'Yes, with details, or no...',
                type: 'input',
                inputType: 'text',
                autocomplete: 'off',
                required: true
            }
        ]
    }
];

const focusAreas = [
    'Brand & Visual Design',
    'Backend Operations',
    'Content & Structure',
    'Local SEO Focus',
    'Customer Engagement'
];

const state = {
    answers: {},
    currentStep: 0,
    isFinished: false,
    toastTimer: null,
    successTimer: null,
    hasSentLeadStart: false,
    hasSentLeadComplete: false,
    isSubmittingLeadComplete: false,
    radarChart: null
};

const elements = {
    wizardContainer: document.getElementById('wizard-container'),
    wizardForm: document.getElementById('wizard-form'),
    contentDisplay: document.getElementById('content-display'),
    stepIndicator: document.getElementById('step-indicator'),
    progressBar: document.getElementById('progress-bar'),
    prevButton: document.getElementById('btn-prev'),
    nextButton: document.getElementById('btn-next'),
    loadingContainer: document.getElementById('loading-container'),
    resultsContainer: document.getElementById('results-container'),
    heroCard: document.getElementById('hero-card'),
    complexityRadar: document.getElementById('complexityRadar'),
    toast: document.getElementById('error-toast'),
    toastTitle: document.getElementById('toast-title'),
    toastMessage: document.getElementById('toast-message'),
    successBubble: document.getElementById('success-bubble')
};

const externalScriptCache = new Map();

function createElement(tagName, options = {}) {
    const element = document.createElement(tagName);
    const { className, text, attributes = {}, dataset = {} } = options;

    if (className) {
        element.className = className;
    }

    if (typeof text === 'string') {
        element.textContent = text;
    }

    Object.entries(attributes).forEach(([name, value]) => {
        if (value === undefined || value === null || value === false) {
            return;
        }

        if (value === true) {
            element.setAttribute(name, '');
            return;
        }

        element.setAttribute(name, value);
    });

    Object.entries(dataset).forEach(([name, value]) => {
        if (value !== undefined) {
            element.dataset[name] = value;
        }
    });

    return element;
}

function appendChildren(parent, children) {
    children.forEach((child) => {
        if (child) {
            parent.appendChild(child);
        }
    });
}

function loadExternalScript(src) {
    if (externalScriptCache.has(src)) {
        return externalScriptCache.get(src);
    }

    const promise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });

    externalScriptCache.set(src, promise);
    return promise;
}

function ensureChartJs() {
    if (typeof window.Chart === 'function') {
        return Promise.resolve();
    }

    return loadExternalScript(CHART_JS_URL);
}

function ensureConfetti() {
    if (typeof window.confetti === 'function') {
        return Promise.resolve();
    }

    return loadExternalScript(CONFETTI_URL);
}

function persistData() {
    const payload = {
        answers: state.answers,
        step: state.currentStep,
        finished: state.isFinished,
        leadStarted: state.hasSentLeadStart,
        leadCompleted: state.hasSentLeadComplete
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadPersistedData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        return;
    }

    try {
        const parsed = JSON.parse(saved);
        state.answers = parsed.answers || {};
        state.currentStep = Number.isInteger(parsed.step) ? parsed.step : 0;
        state.isFinished = Boolean(parsed.finished);
        state.hasSentLeadStart = Boolean(parsed.leadStarted);
        state.hasSentLeadComplete = Boolean(parsed.leadCompleted);
    } catch (error) {
        console.error('Could not load saved data.', error);
        localStorage.removeItem(STORAGE_KEY);
    }
}

function getCurrentStepConfig() {
    return pillarData[state.currentStep];
}

function getInputId(questionId) {
    return `input_${questionId}`;
}

function updateHeroCardVisibility() {
    if (!(elements.heroCard instanceof HTMLElement)) {
        return;
    }

    const shouldShow = !state.isFinished && state.currentStep === 0;
    elements.heroCard.classList.toggle('u-hidden', !shouldShow);
}

function updateWizardChrome() {
    elements.stepIndicator.textContent = `Step ${state.currentStep + 1} of ${pillarData.length}`;
    const progressValue = ((state.currentStep + 1) / pillarData.length) * 100;
    elements.progressBar.style.width = `${progressValue}%`;
    elements.progressBar.setAttribute('aria-valuenow', String(Math.round(progressValue)));
    elements.prevButton.classList.toggle('u-hidden', state.currentStep === 0);

    if (state.currentStep === pillarData.length - 1) {
        elements.nextButton.textContent = 'Calculate Scope ✨';
        elements.nextButton.classList.add('wizard__button-final');
    } else {
        elements.nextButton.textContent = 'Next Step →';
        elements.nextButton.classList.remove('wizard__button-final');
    }

    updateHeroCardVisibility();
}

function renderRequiredMarker(isRequired) {
    if (isRequired) {
        return createElement('span', {
            className: 'questionnaire__required',
            text: '*',
            attributes: { 'aria-hidden': 'true', title: 'Required' }
        });
    }

    return createElement('span', {
        className: 'questionnaire__optional',
        text: '(Optional)'
    });
}

function buildQuestionLabel(question, controlId) {
    const label = createElement('label', {
        className: 'questionnaire__label',
        attributes: { for: controlId }
    });
    const text = createElement('span', {
        className: 'questionnaire__label-text',
        text: question.text
    });
    text.appendChild(renderRequiredMarker(question.required));
    label.appendChild(text);
    return label;
}

function buildTextQuestion(question) {
    const wrapper = createElement('div', { className: 'questionnaire__item' });
    const controlId = getInputId(question.id);
    const errorMessageId = `${question.id}_error`;

    wrapper.appendChild(buildQuestionLabel(question, controlId));

    const attributes = {
        id: controlId,
        name: question.id,
        placeholder: question.placeholder,
        required: question.required,
        autocomplete: question.autocomplete,
        'aria-required': question.required ? 'true' : 'false',
        'aria-invalid': 'false',
        'aria-describedby': errorMessageId
    };

    let control;
    if (question.type === 'textarea') {
        control = createElement('textarea', {
            className: 'form-control form-control-textarea custom-scrollbar',
            attributes: { ...attributes, rows: '4' }
        });
        control.value = state.answers[question.id] || '';
    } else {
        control = createElement('input', {
            className: 'form-control',
            attributes: { ...attributes, type: question.inputType || 'text', inputmode: question.inputType === 'email' ? 'email' : undefined }
        });
        control.value = state.answers[question.id] || '';
    }

    wrapper.appendChild(control);
    wrapper.appendChild(createElement('p', {
        className: 'questionnaire__error-message',
        attributes: {
            id: errorMessageId,
            hidden: true
        }
    }));
    return wrapper;
}

function buildChecklistQuestion(question) {
    const wrapper = createElement('fieldset', {
        className: 'questionnaire__item questionnaire__item-group',
        attributes: {
            id: getInputId(question.id),
            'aria-describedby': `${question.id}_hint`,
            'aria-required': question.required ? 'true' : 'false',
            'aria-invalid': 'false',
            tabindex: '-1'
        }
    });

    const legend = createElement('legend', {
        className: 'questionnaire__legend'
    });
    const legendText = createElement('span', {
        className: 'questionnaire__label-text',
        text: 'Choose your priority areas'
    });
    legendText.appendChild(renderRequiredMarker(question.required));
    legend.appendChild(legendText);

    const hint = createElement('p', {
        className: 'questionnaire__helper',
        text: `Select up to ${question.maxSelect} options that matter most for this project.`,
        attributes: { id: `${question.id}_hint` }
    });

    const list = createElement('div', { className: 'feature-list' });
    const selections = state.answers[question.id] || [];

    question.options.forEach((option) => {
        const optionLabel = createElement('label', { className: 'feature-list__option' });
        const checkbox = createElement('input', {
            className: 'feature-list__checkbox u-sr-only',
            attributes: {
                type: 'checkbox',
                name: question.id,
                value: option.value,
                'aria-describedby': `${question.id}_hint`
            }
        });
        checkbox.checked = selections.includes(option.value);

        const card = createElement('span', { className: 'feature-list__card' });
        const head = createElement('span', { className: 'feature-list__head' });
        const title = createElement('span', { className: 'feature-list__title', text: option.label });
        const check = createElement('span', { className: 'feature-list__check', attributes: { 'aria-hidden': 'true' } });
        const checkIcon = createElement('span', { className: 'feature-list__check-icon', text: '✓' });
        const description = createElement('span', { className: 'feature-list__description', text: option.desc });

        check.appendChild(checkIcon);
        appendChildren(head, [title, check]);
        appendChildren(card, [head, description]);
        appendChildren(optionLabel, [checkbox, card]);
        list.appendChild(optionLabel);
    });

    appendChildren(wrapper, [legend, hint, list]);
    return wrapper;
}

function renderStep() {
    const step = getCurrentStepConfig();
    const fragment = document.createDocumentFragment();

    const title = createElement('h2', {
        className: 'questionnaire__title typography__display',
        text: step.title
    });
    const description = createElement('p', {
        className: 'questionnaire__description',
        text: step.description
    });
    const list = createElement('div', { className: 'questionnaire__list' });

    step.questions.forEach((question) => {
        list.appendChild(question.type === 'top5_checklist' ? buildChecklistQuestion(question) : buildTextQuestion(question));
    });

    appendChildren(fragment, [title, description]);

    if (step.helper) {
        fragment.appendChild(createElement('p', {
            className: 'questionnaire__helper questionnaire__helper-intro',
            text: step.helper
        }));
    }

    fragment.appendChild(list);

    elements.contentDisplay.classList.remove('fade-in');
    void elements.contentDisplay.offsetWidth;
    elements.contentDisplay.replaceChildren(fragment);
    elements.contentDisplay.classList.add('fade-in');
    elements.contentDisplay.scrollTop = 0;

    updateWizardChrome();
    initInteractiveModifiers();
}

function clearValidationError(target) {
    if (!target) {
        return;
    }

    target.classList.remove('form-control-error');
    target.classList.remove('questionnaire__item-error');
    target.setAttribute('aria-invalid', 'false');

    const wrapper = target.closest('.questionnaire__item') || target;
    const errorMessage = wrapper.querySelector('.questionnaire__error-message');
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.hidden = true;
    }
}

function syncTextValue(target) {
    if (!target.name) {
        return;
    }

    state.answers[target.name] = target.value;
    clearValidationError(target);
    persistData();
}

function handleChecklistChange(target) {
    const selectedValues = Array.from(elements.wizardForm.querySelectorAll(`input[name="${target.name}"]:checked`), (input) => input.value);

    if (selectedValues.length > MAX_PRIORITIES) {
        target.checked = false;
        showToast('Top 5 Reached', `You can only select up to ${MAX_PRIORITIES} core priorities. Remove one selection before adding another.`);
        return;
    }

    state.answers[target.name] = selectedValues;
    const group = document.getElementById(getInputId(target.name));
    clearValidationError(group);
    persistData();
}

function handleFormInput(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }

    if (target.matches('input:not([type="checkbox"]), textarea')) {
        syncTextValue(target);
    }
}

function handleFormChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
        return;
    }

    if (target.type === 'checkbox') {
        handleChecklistChange(target);
        return;
    }

    syncTextValue(target);
}

function showToast(title, message) {
    window.clearTimeout(state.toastTimer);
    elements.toastTitle.textContent = title;
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('toast-hidden');
    state.toastTimer = window.setTimeout(() => {
        elements.toast.classList.add('toast-hidden');
    }, TOAST_TIMEOUT_MS);
}

function showSuccessBubble() {
    window.clearTimeout(state.successTimer);
    elements.successBubble.classList.remove('success-bubble-hidden');
    state.successTimer = window.setTimeout(() => {
        elements.successBubble.classList.add('success-bubble-hidden');
    }, SUCCESS_TIMEOUT_MS);
}

function markInvalid(target, message) {
    if (!target) {
        return false;
    }

    target.classList.add(target.matches('.form-control') ? 'form-control-error' : 'questionnaire__item-error');
    target.setAttribute('aria-invalid', 'true');

    const wrapper = target.closest('.questionnaire__item') || target;
    const errorMessage = wrapper.querySelector('.questionnaire__error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.hidden = false;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement || target instanceof HTMLFieldSetElement) {
        target.focus({ preventScroll: true });
    }
    showToast('Oops', message);
    return false;
}

function validateCurrentStep() {
    const step = getCurrentStepConfig();

    for (const question of step.questions) {
        const target = document.getElementById(getInputId(question.id));
        if (!target) {
            continue;
        }

        if (question.type === 'top5_checklist') {
            const selections = state.answers[question.id] || [];
            if (question.required && selections.length === 0) {
                return markInvalid(target, 'Please select at least one core priority before moving on.');
            }
            continue;
        }

        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
            if (!target.reportValidity()) {
                target.classList.add('form-control-error');
                return markInvalid(target, 'Please complete the required field before moving on.');
            }
        }
    }

    return true;
}

async function sendLead(status, includeSummary = false) {
    const payload = {
        name: state.answers.c_name || 'Unknown',
        email: state.answers.c_email || 'Unknown',
        company: state.answers.c_company || 'Not provided',
        phone: state.answers.c_phone || 'Not provided',
        status
    };

    if (includeSummary) {
        payload.summary = formatAnswers();
    }

    const response = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
    });

    if (!response.ok) {
        throw new Error('Lead submission failed.');
    }
}

async function maybeSendStartedLead() {
    if (state.currentStep !== 0 || state.hasSentLeadStart) {
        return;
    }

    await sendLead('Started Discovery Form');
    state.hasSentLeadStart = true;
    persistData();
}

function computeMetrics() {
    let metrics = [20, 20, 20, 20, 20];
    const features = state.answers.core_priorities || [];

    if (features.includes('visuals')) {
        metrics[0] += 36;
    }
    if (features.includes('seo')) {
        metrics[3] += 36;
    }
    if (features.includes('booking')) {
        metrics[1] += 24;
        metrics[4] += 16;
    }
    if (features.includes('ecommerce')) {
        metrics[1] += 24;
        metrics[2] += 16;
    }
    if (features.includes('reviews')) {
        metrics[4] += 32;
    }
    if (features.includes('portfolio')) {
        metrics[0] += 16;
        metrics[2] += 24;
    }
    if (features.includes('portals')) {
        metrics[1] += 32;
    }
    if (features.includes('contact')) {
        metrics[4] += 24;
        metrics[1] += 8;
    }

    return metrics.map((value) => Math.min(value, 100));
}

function renderRadarChart() {
    if (!elements.complexityRadar || typeof window.Chart !== 'function') {
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const metrics = computeMetrics();
    const startMetrics = metrics.map(() => 0);
    const context = elements.complexityRadar.getContext('2d');

    if (state.radarChart) {
        state.radarChart.destroy();
        state.radarChart = null;
    }

    state.radarChart = new window.Chart(context, {
        type: 'radar',
        data: {
            labels: focusAreas,
            datasets: [
                {
                    label: 'Project Focus Area',
                    data: prefersReducedMotion ? metrics : startMetrics,
                    backgroundColor: 'rgba(4, 120, 87, 0.14)',
                    borderColor: 'rgba(6, 95, 70, 1)',
                    pointBackgroundColor: '#047857',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    borderWidth: 3.5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 8,
                    bottom: 8,
                    left: 18,
                    right: 18
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: { display: false },
                    grid: { color: 'rgba(24, 33, 38, 0.10)' },
                    angleLines: { color: 'rgba(24, 33, 38, 0.14)' },
                    pointLabels: {
                        color: '#065f46',
                        padding: 8,
                        centerPointLabels: false,
                        font: (ctx) => {
                            const w = ctx.chart.width;
                            const size = w < 320 ? 10 : w < 480 ? 12 : 14;
                            return {
                                family: 'Quantico, Inter, sans-serif',
                                size,
                                weight: '700'
                            };
                        },
                        callback: (label) => {
                            const words = label.split(' ');
                            const lines = [];
                            let current = '';
                            words.forEach((word) => {
                                if ((current + ' ' + word).trim().length > 9) {
                                    if (current) lines.push(current);
                                    current = word;
                                } else {
                                    current = (current + ' ' + word).trim();
                                }
                            });
                            if (current) lines.push(current);
                            return lines;
                        }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
            animation: {
                duration: prefersReducedMotion ? 0 : 550,
                easing: 'easeOutCubic'
            }
        }
    });

    if (!prefersReducedMotion && state.radarChart?.data?.datasets?.[0]) {
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                state.radarChart.data.datasets[0].data = metrics;
                state.radarChart.update();
            });
        });
    }
}

function triggerConfetti() {
    if (typeof window.confetti !== 'function') {
        return;
    }

    const duration = 1200;
    const end = Date.now() + duration;

    (function fire() {
        window.confetti({
            particleCount: 4,
            angle: 60,
            spread: 58,
            origin: { x: 0 },
            colors: ['#047857', '#10b981', '#34d399', '#111827']
        });
        window.confetti({
            particleCount: 4,
            angle: 120,
            spread: 58,
            origin: { x: 1 },
            colors: ['#047857', '#10b981', '#34d399', '#111827']
        });

        if (Date.now() < end) {
            window.requestAnimationFrame(fire);
        }
    })();
}

function formatAnswers() {
    let output = 'SRTtrail.dev | Discovery Outline\n';
    output += '========================================\n\n';

    pillarData.forEach((pillar, index) => {
        output += `--- Step ${index + 1}: ${pillar.title} ---\n\n`;
        pillar.questions.forEach((question) => {
            let answer = state.answers[question.id];
            if (question.type === 'top5_checklist') {
                answer = Array.isArray(answer) && answer.length > 0 ? answer.join(', ') : 'None selected';
            } else {
                answer = answer || '[No answer provided]';
            }
            output += `${question.text || 'Selected Priorities'}:\n> ${answer}\n\n`;
        });
    });

    return output;
}

async function submitFinalScope() {
    if (state.hasSentLeadComplete || state.isSubmittingLeadComplete) {
        return;
    }

    state.isSubmittingLeadComplete = true;

    try {
        await sendLead('Completed Discovery Form', true);
        state.hasSentLeadComplete = true;
        persistData();
        showSuccessBubble();
    } catch (error) {
        console.error(error);
        showToast('Submission Failed', 'Could not send your project scope. Please try again.');
    } finally {
        state.isSubmittingLeadComplete = false;
    }
}

function showResults() {
    elements.loadingContainer.classList.add('u-hidden');
    elements.resultsContainer.classList.remove('u-hidden');
    elements.resultsContainer.classList.add('fade-in');
    void ensureChartJs()
        .then(() => {
            renderRadarChart();
        })
        .catch((error) => {
            console.error(error);
        });

    // Snap users directly to the graph after completion.
    window.setTimeout(() => {
        const chartContainer = elements.complexityRadar?.closest('.chart-container');
        if (chartContainer instanceof HTMLElement) {
            chartContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 120);

    if (!state.hasSentLeadComplete) {
        window.setTimeout(() => {
            void submitFinalScope();
        }, 220);
    }

    void ensureConfetti()
        .then(() => {
            triggerConfetti();
        })
        .catch((error) => {
            console.error(error);
        });
}

function finishAndCalculate() {
    state.isFinished = true;
    persistData();
    elements.wizardContainer.classList.add('u-hidden');
    elements.loadingContainer.classList.remove('u-hidden');
    window.setTimeout(showResults, LOADING_DELAY_MS);
}

async function handleWizardSubmit(event) {
    event.preventDefault();

    if (!validateCurrentStep()) {
        return;
    }

    try {
        await maybeSendStartedLead();
    } catch (error) {
        console.error(error);
        showToast('Lead Capture Failed', 'We could not save your first-step details right now, but you can still continue.');
    }

    if (state.currentStep < pillarData.length - 1) {
        state.currentStep += 1;
        persistData();
        renderStep();
        const firstField = elements.contentDisplay.querySelector('input, textarea, button');
        if (firstField instanceof HTMLElement) {
            firstField.focus();
        }
        return;
    }

    finishAndCalculate();
}

function handlePreviousStep() {
    if (state.currentStep === 0) {
        return;
    }

    state.currentStep -= 1;
    persistData();
    renderStep();
    const firstField = elements.contentDisplay.querySelector('input, textarea, button');
    if (firstField instanceof HTMLElement) {
        firstField.focus();
    }
}

function restoreWizardForEditing() {
    state.isFinished = false;
    state.currentStep = pillarData.length - 1;
    persistData();
    elements.resultsContainer.classList.add('u-hidden');
    elements.resultsContainer.classList.remove('fade-in');
    elements.wizardContainer.classList.remove('u-hidden');
    renderStep();
}

function resetAllData() {
    const confirmed = window.confirm('Are you sure you want to start over? All saved answers will be deleted.');
    if (!confirmed) {
        return;
    }

    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
}

function handleResultsAction(event) {
    const button = event.target instanceof HTMLElement ? event.target.closest('[data-action]') : null;
    if (!(button instanceof HTMLButtonElement)) {
        return;
    }

    const { action } = button.dataset;
    if (action === 'edit') {
        restoreWizardForEditing();
        return;
    }
    if (action === 'reset') {
        resetAllData();
    }
}

function initInteractiveModifiers() {
    // Avatar scale on hover
    const avatarRing = document.querySelector('.hero__avatar-ring');
    if (avatarRing && !avatarRing.dataset.boundHover) {
        const avatarImg = avatarRing.querySelector('.hero__avatar-image');
        if (avatarImg) {
            avatarRing.addEventListener('mouseenter', () => avatarImg.classList.add('hero__avatar-image-scaled'));
            avatarRing.addEventListener('mouseleave', () => avatarImg.classList.remove('hero__avatar-image-scaled'));
            avatarRing.addEventListener('focus', () => avatarImg.classList.add('hero__avatar-image-scaled'), true);
            avatarRing.addEventListener('blur', () => avatarImg.classList.remove('hero__avatar-image-scaled'), true);
            avatarRing.dataset.boundHover = 'true';
        }
    }

    // Feature list check highlight on hover
    document.querySelectorAll('.feature-list__option').forEach((option) => {
        const check = option.querySelector('.feature-list__check');
        if (check) {
            option.addEventListener('mouseenter', () => check.classList.add('feature-list__check-highlighted'));
            option.addEventListener('mouseleave', () => check.classList.remove('feature-list__check-highlighted'));
        }
    });

    // Feature list card checked state modifier
    document.querySelectorAll('.feature-list__checkbox').forEach((checkbox) => {
        const card = checkbox.nextElementSibling;
        if (card && card.classList.contains('feature-list__card')) {
            const syncModifier = () => {
                if (checkbox.checked) {
                    card.classList.add('feature-list__card-checked');
                } else {
                    card.classList.remove('feature-list__card-checked');
                }
            };
            checkbox.addEventListener('change', syncModifier);
            syncModifier();
        }
    });
}

function initEventListeners() {
    elements.wizardForm.addEventListener('submit', handleWizardSubmit);
    elements.wizardForm.addEventListener('input', handleFormInput);
    elements.wizardForm.addEventListener('change', handleFormChange);
    elements.prevButton.addEventListener('click', handlePreviousStep);
    elements.resultsContainer.addEventListener('click', handleResultsAction);
}

function init() {
    loadPersistedData();
    initEventListeners();
    initInteractiveModifiers();
    updateHeroCardVisibility();

    if (state.isFinished) {
        elements.wizardContainer.classList.add('u-hidden');
        elements.resultsContainer.classList.remove('u-hidden');
        void ensureChartJs()
            .then(() => {
                renderRadarChart();
            })
            .catch((error) => {
                console.error(error);
            });

        if (!state.hasSentLeadComplete) {
            void submitFinalScope();
        }
        return;
    }

    renderStep();
}

init();
