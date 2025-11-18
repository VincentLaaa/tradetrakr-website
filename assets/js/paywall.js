;(() => {
  const CHECKOUT = {
    monthly:  'https://whop.com/checkout/plan_mkRYtNPWxqQ7O?d2c=true',
    yearly:   'https://whop.com/checkout/plan_U7h0RWow4rgZ9?d2c=true',
    ultimate: 'https://whop.com/checkout/plan_CEiG78wQHpn90?d2c=true',
  };

  const modal = document.getElementById('ttr-paywall');
  if (!modal) return;

  const dialog       = modal.querySelector('.ttr-dialog');
  const closeBtn     = modal.querySelector('.ttr-close');
  const stepsMount   = document.getElementById('ttr-steps-mount');
  const bar          = modal.querySelector('.ttr-bar');
  const planSummary  = document.getElementById('ttr-plan-summary');
  const checkoutBtn  = document.getElementById('ttr-checkout');
  const trialText    = document.getElementById('ttr-trial-text');
  const billingText  = document.getElementById('ttr-billing-text');

  const q = (sel, root = modal) => root.querySelector(sel);

  const QUESTIONS = [
    {
      id: 'experience',
      label: 'How many years have you been trading?',
      type: 'select',
      options: ['Less than 1 year', '1–2 years', '3–5 years', '5+ years'],
    },
    {
      id: 'goals',
      label: 'Main goals',
      type: 'multi',
      options: ['Consistency', 'Risk discipline', 'Find top setups', 'Reduce tilt', 'Faster reviews'],
    },
    {
      id: 'pain',
      label: 'Biggest struggle lately',
      type: 'select',
      options: ['Overtrading', 'Revenge trades', 'Sizing drift', 'Late entries', 'No review habit'],
    },
    {
      id: 'timeframe',
      label: 'When do you want to achieve this goal?',
      type: 'select',
      options: ['Within 1 month', '1–3 months', '3–6 months', '6+ months'],
    },
  ];

  const FLOW = [
    'intro',
    'q-0',
    'q-1',
    'value-potential',
    'q-2',
    'q-3',
    'value-comparison',
    'generate',
    'plan',
    'paywall',
  ];

  let answers = {};
  let stepIndex = 0;
  let reachedPaywall = false;
  let hasShownOneTimeOffer = false;

  function renderQuestion(qi) {
    const qDef = QUESTIONS[qi];
    const wrap = document.createElement('div');
    wrap.className = 'ttr-step';
    wrap.dataset.step = `q-${qi}`;

    let controls = '';
    if (qDef.type === 'select') {
      controls = `<select id="q-${qDef.id}" class="ttr-input">
        ${qDef.options.map(o => `<option>${o}</option>`).join('')}
      </select>`;
    } else if (qDef.type === 'multi') {
      controls = `<div class="ttr-chips">
        ${qDef.options.map(o => `
          <label class="ttr-chip">
            <input type="checkbox" value="${o}">
            <span>${o}</span>
          </label>
        `).join('')}
      </div>`;
    }

    wrap.innerHTML = `
      <h2>${qDef.label}</h2>
      ${controls}
      <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
        <button class="btn ghost ttr-prev" type="button">Back</button>
        <button class="btn primary ttr-next" type="button">Continue</button>
        <button class="btn ghost" type="button" data-skip-personalization>Skip quiz & see plans</button>
      </div>
    `;
    return wrap;
  }

  QUESTIONS.forEach((_, i) => stepsMount.appendChild(renderQuestion(i)));

  const valuePotentialEl = document.createElement('div');
  valuePotentialEl.className = 'ttr-step ttr-value-screen';
  valuePotentialEl.dataset.step = 'value-potential';
  stepsMount.appendChild(valuePotentialEl);

  const valueComparisonEl = document.createElement('div');
  valueComparisonEl.className = 'ttr-step ttr-value-screen';
  valueComparisonEl.dataset.step = 'value-comparison';
  stepsMount.appendChild(valueComparisonEl);

  function renderValueScreen(stepName, el) {
    if (stepName === 'value-potential') {
      const goals = answers.goals || [];
      const goalText = goals.length > 0 ? goals[0].toLowerCase() : 'your trading goals';

      el.innerHTML = `
        <h2>You have great potential to crush <span class="ttr-highlight">${goalText}</span></h2>
        <div class="ttr-value-card">
          <h3>Your consistency improvement</h3>
          <div class="ttr-chart-container">
            <canvas></canvas>
          </div>
          <p class="ttr-chart-note">
            Based on TradeTrakR's historical data, traders see
            <strong class="ttr-stat">73% better rule adherence</strong> after 2 weeks of daily journaling.
          </p>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:20px;gap:10px;flex-wrap:wrap">
          <button class="btn ghost" type="button" data-skip-personalization>Skip quiz & see plans</button>
          <button class="btn primary ttr-next" type="button">Continue</button>
        </div>
      `;
    } else if (stepName === 'value-comparison') {
      const timeframe = answers.timeframe || '3–6 months';
      const timeframeText =
        timeframe.includes('1 month') ? '1 month' :
        timeframe.includes('1–3')    ? '3 months' :
        timeframe.includes('3–6')    ? '6 months' : '6 months';

      el.innerHTML = `
        <h2>TradeTrakR creates <span class="ttr-highlight">long-term results</span></h2>
        <div class="ttr-value-card">
          <h3>Win rate over time</h3>
          <div class="ttr-comparison-chart">
            <div class="ttr-comparison-bars">
              <div class="ttr-bar-group">
                <label>Without Journal</label>
                <div class="ttr-bar-container">
                  <div class="ttr-bar ttr-bar-without" data-value="35">
                    <span class="ttr-bar-label">35%</span>
                  </div>
                </div>
              </div>
              <div class="ttr-bar-group">
                <label>With TradeTrakR</label>
                <div class="ttr-bar-container">
                  <div class="ttr-bar ttr-bar-with" data-value="68">
                    <span class="ttr-bar-label">2X</span>
                  </div>
                </div>
              </div>
            </div>
            <p class="ttr-comparison-note">
              <strong>85% of TradeTrakR users</strong> maintain improved consistency even ${timeframeText} later.
            </p>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:20px;gap:10px;flex-wrap:wrap">
          <button class="btn ghost" type="button" data-skip-personalization>Skip quiz & see plans</button>
          <button class="btn primary ttr-next" type="button">Continue</button>
        </div>
      `;
    }
  }

  function animateValueScreen(stepEl) {
    stepEl.querySelectorAll('.ttr-stat').forEach(stat => {
      const text = stat.textContent;
      const match = text.match(/(\d+)%/);
      if (match) {
        const target = parseInt(match[1], 10);
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          stat.textContent = text.replace(/\d+%/, Math.round(current) + '%');
        }, 30);
      }
    });

    stepEl.querySelectorAll('.ttr-bar').forEach(bar => {
      const value = parseInt(bar.dataset.value, 10);
      bar.style.height = '0%';
      setTimeout(() => {
        bar.style.transition = 'height 1s ease-out';
        bar.style.height = value + '%';
      }, 300);
    });

    const canvas = stepEl.querySelector('canvas');
    if (canvas) {
      setTimeout(() => animateChart(canvas), 500);
    }
  }

  function animateChart(canvas) {
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const aspectRatio = 2;
    const maxWidth = Math.min(400, containerWidth - 20);
    const calculatedHeight = maxWidth / aspectRatio;

    canvas.width = maxWidth;
    canvas.height = calculatedHeight;
    canvas.style.width = maxWidth + 'px';
    canvas.style.height = calculatedHeight + 'px';
    canvas.style.maxWidth = '100%';

    const W = canvas.width;
    const H = canvas.height;
    const padding = Math.max(30, W * 0.1);
    const chartW = W - padding * 2;
    const chartH = H - padding * 2;

    const data = [45, 52, 58, 65, 73];
    const maxValue = 80;

    let progress = 0;

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(255,255,255,.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(W - padding, y);
        ctx.stroke();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      drawGrid();

      ctx.strokeStyle = '#2fed84';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const pointsToDraw = Math.floor((data.length - 1) * progress);

      for (let i = 0; i <= pointsToDraw; i++) {
        const x = padding + (chartW / (data.length - 1)) * i;
        const y = padding + chartH - (data[i] / maxValue) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (pointsToDraw >= 0) {
        ctx.fillStyle = 'rgba(47,237,132,.15)';
        ctx.beginPath();
        ctx.moveTo(padding, padding + chartH);
        for (let i = 0; i <= pointsToDraw; i++) {
          const x = padding + (chartW / (data.length - 1)) * i;
          const y = padding + chartH - (data[i] / maxValue) * chartH;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(
          padding + (chartW / (data.length - 1)) * pointsToDraw,
          padding + chartH
        );
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = '#2fed84';
      for (let i = 0; i <= pointsToDraw; i++) {
        const x = padding + (chartW / (data.length - 1)) * i;
        const y = padding + chartH - (data[i] / maxValue) * chartH;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e6e8ef';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data[i] + '%', x, y - 10);
        ctx.fillStyle = '#2fed84';
      }

      if (progress >= 1) {
        const trophyX = padding + chartW;
        const trophyY = padding + chartH - (data[data.length - 1] / maxValue) * chartH;
        ctx.font = '24px';
        ctx.textAlign = 'center';
        ctx.fillText('🏆', trophyX, trophyY - 15);
      }

      progress += 0.02;
      if (progress <= 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  function updateProgress() {
    if (!bar) return;
    const pct = Math.round((stepIndex / (FLOW.length - 1)) * 100);
    bar.style.width = pct + '%';
  }

  function showStep() {
    const stepName = FLOW[stepIndex];

    modal.querySelectorAll('.ttr-step').forEach(el => {
      el.hidden = el.dataset.step !== stepName;
    });

    updateProgress();

    if (stepName === 'value-potential' || stepName === 'value-comparison') {
      const stepEl = modal.querySelector(`[data-step="${stepName}"]`);
      if (stepEl) {
        renderValueScreen(stepName, stepEl);
        setTimeout(() => animateValueScreen(stepEl), 100);
      }
    }

    if (stepName === 'paywall') {
      preselectYearlyPlan();
      reachedPaywall = true;
    }
  }

  function buildPlan() {
    const features = [];
    const painPoints = [];

    if ((answers.goals || []).includes('Reduce tilt')) {
      features.push({title:'Tilt Meter Coaching', desc:'Real-time emotion tracking prevents revenge trades'});
      painPoints.push('emotional trading');
    }
    if ((answers.goals || []).includes('Consistency')) {
      features.push({title:'Daily Rule Checklist', desc:'Automated compliance tracking for every trade'});
      painPoints.push('rule violations');
    }
    if ((answers.goals || []).includes('Find top setups')) {
      features.push({title:'AI Setup Analysis', desc:'Discover your highest-probability entry patterns'});
      painPoints.push('unclear edge');
    }
    if ((answers.pain || '').includes('Overtrading')) {
      features.push({title:'Max-Trades Guardrail', desc:'Automatic alerts when you exceed daily limits'});
      painPoints.push('overtrading');
    }
    if ((answers.pain || '').includes('Revenge trades')) {
      features.push({title:'Psychology Prompts', desc:'Pre-trade mindset checks prevent emotional decisions'});
      painPoints.push('revenge trading');
    }
    if ((answers.pain || '').includes('Sizing drift')) {
      features.push({title:'Position Size Tracker', desc:'Visual alerts when sizing deviates from plan'});
      painPoints.push('sizing mistakes');
    }

    if (features.length === 0) {
      features.push(
        {title:'AI Performance Insights', desc:'Discover hidden patterns in your trading data'},
        {title:'Psychology Tracking', desc:'Understand how emotions impact your results'},
        {title:'Rule Compliance', desc:'Track adherence to your trading plan'}
      );
    }

    const experience = answers.experience || 'Less than 1 year';

    let mainMessage = '';
    if (painPoints.length > 0) {
      mainMessage = `Based on your answers, you're struggling with ${painPoints.slice(0, 2).join(' and ')}. TradeTrakR is designed specifically to solve these problems.`;
    } else {
      const goalsList = (answers.goals || []).join(', ') || 'improving your trading';
      mainMessage = `You're focused on ${goalsList}. TradeTrakR will help you get there faster with data-driven insights.`;
    }

    if (planSummary) {
      planSummary.innerHTML = `
        <div class="ttr-plan-header">
          <h3>Your Personalized Trading Journal Plan</h3>
          <p>${mainMessage}</p>
        </div>
        
        <div class="ttr-plan-stats">
          <div class="ttr-plan-stat">
            <span class="ttr-plan-stat-value">${features.length}+</span>
            <span class="ttr-plan-stat-label">Custom Features</span>
          </div>
          <div class="ttr-plan-stat">
            <span class="ttr-plan-stat-value">${experience.includes('Less than 1 year') ? 'Beginner' : 'Advanced'}</span>
            <span class="ttr-plan-stat-label">Level</span>
          </div>
          <div class="ttr-plan-stat">
            <span class="ttr-plan-stat-value">Ready</span>
            <span class="ttr-plan-stat-label">To Start</span>
          </div>
        </div>

        <div class="ttr-plan-features">
          ${features.map(f => `
            <div class="ttr-plan-feature">
              <h4>${f.title}</h4>
              <p>${f.desc}</p>
            </div>
          `).join('')}
        </div>

        <div style="margin-top:12px;padding:14px;background:rgba(47,237,132,.08);border-radius:12px;border-left:3px solid #2fed84">
          <p style="margin:0;color:#e6e8ef;font-size:.9rem;line-height:1.5">
            <strong style="color:#2fed84">Why this matters:</strong> Traders who journal daily for 2+ weeks see 
            <strong>73% better rule adherence</strong> and <strong>45% fewer impulse trades</strong>. 
            ${experience.includes('Less than 1')
              ? 'Starting with proper journaling habits now will accelerate your learning curve.'
              : 'Your experience level means you\'re ready for advanced analytics that reveal your true edge.'}
          </p>
        </div>
      `;
    }

    try {
      localStorage.setItem('ttr_onboard', JSON.stringify({ answers, ts: Date.now() }));
    } catch {}
  }

  function updateBillingText() {
    if (!checkoutBtn) return;
    const selected = modal.querySelector('input[name="ttr-plan"]:checked');
    const plan = selected ? selected.value : 'yearly';

    if (plan === 'yearly') {
      if (trialText) trialText.textContent = 'Free for 3 days';
      if (billingText) billingText.textContent = 'billed as $95.88 per year';
      checkoutBtn.textContent = 'Start 3-Day Free Trial';
    } else {
      if (trialText) trialText.textContent = 'No free trial';
      if (billingText) billingText.textContent = 'billed as $14.99 per month';
      checkoutBtn.textContent = 'Start Monthly Plan';
    }
  }

  function preselectYearlyPlan() {
    const yearlyOption = modal.querySelector('[data-plan="yearly"]');
    if (yearlyOption) {
      modal.querySelectorAll('.ttr-pricing-option').forEach(opt => opt.classList.remove('selected'));
      yearlyOption.classList.add('selected');
    }
    const yearlyRadio = modal.querySelector('input[name="ttr-plan"][value="yearly"]');
    if (yearlyRadio) {
      yearlyRadio.checked = true;
    }
    updateBillingText();
  }

  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    stepIndex = 0;
    showStep();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showOneTimeOffer() {
    if (hasShownOneTimeOffer) {
      closeModal();
      return;
    }
    hasShownOneTimeOffer = true;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const oneTimeStep = modal.querySelector('[data-step="one-time-offer"]');
    if (oneTimeStep) {
      modal.querySelectorAll('.ttr-step').forEach(el => {
        el.hidden = el.dataset.step !== 'one-time-offer';
      });
    }
  }

  function fastTrackToPaywall(useStoredAnswers = true) {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (useStoredAnswers) {
      try {
        const raw = localStorage.getItem('ttr_onboard');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.answers) answers = parsed.answers;
        }
      } catch {}
    }

    buildPlan();
    stepIndex = FLOW.indexOf('paywall');
    showStep();
  }

  function openPaywallWithPlan(plan) {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    try {
      const raw = localStorage.getItem('ttr_onboard');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.answers) answers = parsed.answers;
      }
    } catch {}

    if (typeof buildPlan === 'function') {
      buildPlan();
    }

    stepIndex = FLOW.indexOf('paywall');
    if (stepIndex < 0) stepIndex = FLOW.length - 1;
    showStep();

    const targetRadio = modal.querySelector(`input[name="ttr-plan"][value="${plan}"]`);
    if (targetRadio) {
      targetRadio.checked = true;
    }

    if (modal.querySelector('.ttr-pricing-option')) {
      modal.querySelectorAll('.ttr-pricing-option').forEach(opt => {
        const r = opt.querySelector('input[name="ttr-plan"]');
        opt.classList.toggle('selected', !!(r && r.value === plan));
      });
    }

    if (typeof updateBillingText === 'function') {
      updateBillingText();
    }
  }

  function getCurrentStepName() {
    return FLOW[stepIndex];
  }

  function handleNext() {
    const stepName = getCurrentStepName();

    if (stepName.startsWith('q-')) {
      const index = parseInt(stepName.split('-')[1], 10);
      const qDef = QUESTIONS[index];
      if (qDef) {
        if (qDef.type === 'select') {
          const sel = modal.querySelector(`#q-${qDef.id}`);
          if (sel) answers[qDef.id] = sel.value;
        } else {
          answers[qDef.id] = [
            ...modal.querySelectorAll(`[data-step="${stepName}"] input:checked`)
          ].map(i => i.value);
        }
      }
    }

    if (stepName === 'value-comparison') {
      stepIndex = FLOW.indexOf('generate');
      showStep();
      setTimeout(() => {
        buildPlan();
        stepIndex = FLOW.indexOf('plan');
        showStep();
      }, 1200);
      return;
    }

    if (stepName === 'plan') {
      stepIndex = FLOW.indexOf('paywall');
      showStep();
      return;
    }

    if (stepIndex < FLOW.length - 1) {
      stepIndex++;
      showStep();
    }
  }

  function handlePrev() {
    const stepName = getCurrentStepName();

    if (stepName === 'intro') {
      return;
    }

    if (stepName === 'paywall') {
      stepIndex = FLOW.indexOf('plan');
      showStep();
      return;
    }

    if (stepName === 'plan') {
      stepIndex = FLOW.indexOf('generate');
      showStep();
      return;
    }

    if (stepName === 'generate') {
      stepIndex = FLOW.indexOf('value-comparison');
      showStep();
      return;
    }

    if (stepIndex > 0) {
      stepIndex--;
      showStep();
    }
  }

  document.querySelectorAll('[data-open-paywall]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openModal();
    });
  });

  document.querySelectorAll('[data-open-paywall-direct]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      fastTrackToPaywall(true);
    });
  });

  document.querySelectorAll('[data-open-plan]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const plan = btn.getAttribute('data-open-plan') || 'yearly';
      openPaywallWithPlan(plan);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      const currentStep = modal.querySelector('.ttr-step:not([hidden])');
      if (currentStep && currentStep.dataset.step === 'paywall') {
        showOneTimeOffer();
      } else {
        closeModal();
      }
    });
  }

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      const currentStep = modal.querySelector('.ttr-step:not([hidden])');
      if (currentStep && currentStep.dataset.step === 'paywall') {
        showOneTimeOffer();
      } else {
        closeModal();
      }
    }
  });

  modal.addEventListener('click', e => {
    const target = e.target;

    if (target.matches('[data-skip-personalization]')) {
      e.preventDefault();
      fastTrackToPaywall(true);
      return;
    }

    if (target.closest('.ttr-next')) {
      handleNext();
      return;
    }

    if (target.closest('.ttr-prev')) {
      handlePrev();
      return;
    }
  });

  function addAttribution(url) {
    const params = new URLSearchParams(window.location.search);
    const extras = params.toString();
    return extras ? (url + (url.includes('?') ? '&' : '?') + extras) : url;
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const selected = modal.querySelector('input[name="ttr-plan"]:checked');
      const plan = selected ? selected.value : 'yearly';
      const link = plan === 'yearly' ? CHECKOUT.yearly : CHECKOUT.monthly;
      window.location.href = addAttribution(link);
    });
  }

  modal.querySelectorAll('.ttr-pricing-option').forEach(option => {
    option.addEventListener('click', () => {
      modal.querySelectorAll('.ttr-pricing-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      updateBillingText();
    });
  });

  if (new URLSearchParams(location.search).get('trial_cancelled') === '1') {
    try {
      localStorage.setItem('ttr_show_cancel_offer', '1');
    } catch {}
  }

  if (location.pathname === '/' || location.pathname.endsWith('/index.html')) {
    if (localStorage.getItem('ttr_show_cancel_offer') === '1') {
      setTimeout(() => {
        fastTrackToPaywall(true);
        try { localStorage.removeItem('ttr_show_cancel_offer'); } catch {}
      }, 400);
    }
  }

  updateBillingText();

  const ultimateCheckoutBtn = document.getElementById('ttr-ultimate-checkout');
  const ultimateCloseBtn = document.getElementById('ttr-ultimate-close');

  if (ultimateCheckoutBtn) {
    ultimateCheckoutBtn.addEventListener('click', () => {
      window.location.href = addAttribution(CHECKOUT.ultimate);
    });
  }
  if (ultimateCloseBtn) {
    ultimateCloseBtn.addEventListener('click', () => {
      closeModal();
    });
  }

  const introNext = q('[data-step="intro"] .ttr-next');
  if (introNext) {
    introNext.addEventListener('click', () => {
      stepIndex = FLOW.indexOf('q-0');
      showStep();
    });
  }

  const introSkip = q('[data-step="intro"] [data-skip-personalization]');
  if (introSkip) {
    introSkip.addEventListener('click', e => {
      e.preventDefault();
      fastTrackToPaywall(true);
    });
  }
})();


