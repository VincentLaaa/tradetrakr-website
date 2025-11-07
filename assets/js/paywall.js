;(() => {
  // -------- Config --------
  const CHECKOUT = {
    monthly: 'https://whop.com/checkout/plan_mkRYtNPWxqQ7O?d2c=true', // $14.99/month
    yearly:  'https://whop.com/checkout/plan_U7h0RWow4rgZ9?d2c=true', // $7.99/month yearly
    ultimate: 'https://whop.com/checkout/plan_CEiG78wQHpn90?d2c=true', // 60% off - $5.99/month yearly
  };

  // -------- Elements --------
  const modal = document.getElementById('ttr-paywall');
  if (!modal) return;
  const dialog = modal.querySelector('.ttr-dialog');
  const closeBtn = modal.querySelector('.ttr-close');
  const stepsMount = document.getElementById('ttr-steps-mount');
  const bar = modal.querySelector('.ttr-bar');
  const planSummary = document.getElementById('ttr-plan-summary');

  const q = (sel, root = modal) => root.querySelector(sel);
  const show = step => {
    modal.querySelectorAll('.ttr-step').forEach(s => s.hidden = s.dataset.step !== step);
  };

  // -------- Onboarding Questions (trading-specific) --------
  const QUESTIONS = [
    { id:'experience',  label:'How many years have you been trading?', type:'select', options:['Less than 1 year','1–2 years','3–5 years','5+ years'] },
    { id:'markets',     label:'What do you trade?', type:'multi', options:['Futures','Forex','Stocks','Crypto'] },
    { id:'account',     label:'Account type', type:'select', options:['Prop firm','Personal','Both'] },
    { id:'platform',    label:'Primary platform', type:'select', options:['NinjaTrader','TradingView','Thinkorswim','Sierra','ProjectX','Tradeovate','Other'] },
    { id:'goals',       label:'Main goals', type:'multi', options:['Consistency','Risk discipline','Find top setups','Reduce tilt','Faster reviews'] },
    { id:'primaryGoal', label:'What is your primary trading goal?', type:'select', options:['Increase win rate','Reduce drawdowns','Improve consistency','Get funded','Scale up size','Build discipline'] },
    { id:'timeframe',   label:'When do you want to achieve this goal?', type:'select', options:['Within 1 month','1–3 months','3–6 months','6+ months'] },
    { id:'pain',        label:'Biggest struggle lately', type:'select', options:['Overtrading','Revenge trades','Sizing drift','Late entries','No review habit'] },
    { id:'time',        label:'Daily journal time available', type:'select', options:['<5 min','5–10 min','10–20 min','20+ min'] },
    { id:'rules',       label:'Do you follow a written rule checklist?', type:'select', options:['Yes','Sometimes','No'] },
    { id:'winrate',     label:'Approx. win rate', type:'select', options:['<35%','35–50%','50–60%','60%+'] },
    { id:'drawdown',    label:'Typical daily drawdown limit', type:'select', options:['$100–$250','$250–$500','$500–$1k','>$1k'] },
  ];
  
  // Value screen positions (insert after these question indices)
  const VALUE_SCREEN_POSITIONS = [4, 6]; // After goals (4) and after timeframe (6)

  // -------- Build steps UI --------
  let answers = {};
  let stepIndex = -1; // intro = -1
  const totalSteps = QUESTIONS.length + VALUE_SCREEN_POSITIONS.length + 3; // intro + value screens + generate + plan + paywall
  function renderQuestion(qi){
    const q = QUESTIONS[qi];
    const wrap = document.createElement('div');
    wrap.className = 'ttr-step';
    wrap.dataset.step = `q-${qi}`;
    let controls = '';
    if (q.type === 'select') {
      controls = `<select id="q-${q.id}" class="ttr-input">${q.options.map(o=>`<option>${o}</option>`).join('')}</select>`;
    } else if (q.type === 'multi') {
      controls = `<div class="ttr-chips">
        ${q.options.map(o=>`<label class="ttr-chip"><input type="checkbox" value="${o}"><span>${o}</span></label>`).join('')}
      </div>`;
    }
    wrap.innerHTML = `
      <h2>${q.label}</h2>
      ${controls}
      <div style="display:flex;gap:10px;margin-top:12px">
        <button class="btn ghost ttr-prev" type="button">Back</button>
        <button class="btn primary ttr-next" type="button">Continue</button>
      </div>`;
    return wrap;
  }
  // mount Q steps once
  QUESTIONS.forEach((_, i)=> stepsMount.appendChild(renderQuestion(i)));
  
  // -------- Value Screen Functions --------
  function createValueScreen(type, afterQuestionIndex) {
    const wrap = document.createElement('div');
    wrap.className = 'ttr-step ttr-value-screen';
    wrap.dataset.step = `value-${afterQuestionIndex}`;
    
    if (type === 'potential') {
      // First value screen - after goals (question 4)
      const goals = answers.goals || [];
      const goalText = goals.length > 0 ? goals[0].toLowerCase() : 'your trading goals';
      wrap.innerHTML = `
        <h2>You have great potential to crush <span class="ttr-highlight">${goalText}</span></h2>
        <div class="ttr-value-card">
          <h3>Your consistency improvement</h3>
          <div class="ttr-chart-container">
            <canvas id="ttr-chart-${afterQuestionIndex}"></canvas>
          </div>
          <p class="ttr-chart-note">Based on TradeTrakR's historical data, traders see <strong class="ttr-stat">73% better rule adherence</strong> after 2 weeks of daily journaling.</p>
        </div>
        <button class="btn primary ttr-next" style="margin-top:20px">Continue</button>
      `;
    } else if (type === 'comparison') {
      // Second value screen - after timeframe (question 6)
      const timeframe = answers.timeframe || '3–6 months';
      const timeframeText = timeframe.includes('1 month') ? '1 month' : timeframe.includes('1–3') ? '3 months' : timeframe.includes('3–6') ? '6 months' : '6 months';
      wrap.innerHTML = `
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
            <p class="ttr-comparison-note"><strong>85% of TradeTrakR users</strong> maintain improved consistency even ${timeframeText} later.</p>
          </div>
        </div>
        <button class="btn primary ttr-next" style="margin-top:20px">Continue</button>
      `;
    }
    
    return wrap;
  }
  
  // Mount value screens
  VALUE_SCREEN_POSITIONS.forEach((pos, idx) => {
    const screenType = idx === 0 ? 'potential' : 'comparison';
    stepsMount.appendChild(createValueScreen(screenType, pos));
  });
  
  function animateValueScreen(stepEl) {
    // Animate numbers
    stepEl.querySelectorAll('.ttr-stat').forEach(stat => {
      const text = stat.textContent;
      const match = text.match(/(\d+)%/);
      if (match) {
        const target = parseInt(match[1]);
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
    
    // Animate bars
    stepEl.querySelectorAll('.ttr-bar').forEach(bar => {
      const value = parseInt(bar.dataset.value);
      bar.style.height = '0%';
      setTimeout(() => {
        bar.style.transition = 'height 1s ease-out';
        bar.style.height = value + '%';
      }, 300);
    });
    
    // Animate chart
    const canvas = stepEl.querySelector('canvas');
    if (canvas) {
      setTimeout(() => animateChart(canvas), 500);
    }
  }
  
  function animateChart(canvas) {
    const ctx = canvas.getContext('2d');
    // Make canvas responsive
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const aspectRatio = 2; // width/height ratio
    const maxWidth = Math.min(400, containerWidth - 20);
    const calculatedHeight = maxWidth / aspectRatio;
    
    canvas.width = maxWidth;
    canvas.height = calculatedHeight;
    canvas.style.width = maxWidth + 'px';
    canvas.style.height = calculatedHeight + 'px';
    canvas.style.maxWidth = '100%';
    
    const W = canvas.width, H = canvas.height;
    const padding = Math.max(30, W * 0.1);
    const chartW = W - padding * 2;
    const chartH = H - padding * 2;
    
    ctx.clearRect(0, 0, W, H);
    
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(W - padding, y);
      ctx.stroke();
    }
    
    // Data points (consistency improvement over weeks)
    const data = [45, 52, 58, 65, 73];
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
    const maxValue = 80;
    
    // Animate line drawing
    let progress = 0;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      
      // Redraw grid
      ctx.strokeStyle = 'rgba(255,255,255,.1)';
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(W - padding, y);
        ctx.stroke();
      }
      
      // Draw line up to current progress
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
      
      // Draw filled area
      if (pointsToDraw >= 0) {
        ctx.fillStyle = 'rgba(47,237,132,.15)';
        ctx.beginPath();
        ctx.moveTo(padding, padding + chartH);
        for (let i = 0; i <= pointsToDraw; i++) {
          const x = padding + (chartW / (data.length - 1)) * i;
          const y = padding + chartH - (data[i] / maxValue) * chartH;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(padding + (chartW / (data.length - 1)) * pointsToDraw, padding + chartH);
        ctx.closePath();
        ctx.fill();
      }
      
      // Draw points
      ctx.fillStyle = '#2fed84';
      for (let i = 0; i <= pointsToDraw; i++) {
        const x = padding + (chartW / (data.length - 1)) * i;
        const y = padding + chartH - (data[i] / maxValue) * chartH;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw value labels
        ctx.fillStyle = '#e6e8ef';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data[i] + '%', x, y - 10);
        ctx.fillStyle = '#2fed84';
      }
      
      // Draw trophy at end
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

  function updateProgress(){
    const shownIndex = Math.max(0, stepIndex + 1); // intro counts as 0
    const pct = Math.round((shownIndex / totalSteps) * 100);
    bar.style.width = pct + '%';
  }

  function openModal(){
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    stepIndex = -1; // intro
    show('intro'); updateProgress();
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }
  function showOneTimeOffer(){
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    show('one-time-offer');
  }

  // Track if user reached paywall step
  let reachedPaywall = false;

  // open hooks
  document.querySelectorAll('[data-open-paywall]').forEach(el=>{
    el.addEventListener('click',(e)=>{ e.preventDefault(); openModal(); });
  });
  
  // Close button handler - show one-time offer if they're on paywall step
  closeBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    const currentStep = modal.querySelector('.ttr-step:not([hidden])');
    if (currentStep && currentStep.dataset.step === 'paywall') {
      showOneTimeOffer();
    } else {
      closeModal();
    }
  });
  
  modal.addEventListener('click',(e)=>{ 
    if(e.target===modal) {
      const currentStep = modal.querySelector('.ttr-step:not([hidden])');
      if (currentStep && currentStep.dataset.step === 'paywall') {
        showOneTimeOffer();
      } else {
        closeModal();
      }
    }
  });

  // Helper to check if stepIndex should show a value screen
  // Value screens appear AFTER certain questions, so stepIndex 5 = after question 4, stepIndex 7 = after question 6
  function shouldShowValueScreen(stepIdx) {
    // After question 4 (index 4), stepIndex becomes 5 -> show value screen for position 4
    // After question 6 (index 6), stepIndex becomes 7 -> show value screen for position 6
    return stepIdx === 5 || stepIdx === 8; // 5 = after goals (q4), 8 = after timeframe (q6, accounting for first value screen)
  }
  
  function getValueScreenIndex(stepIdx) {
    if (stepIdx === 5) return 0; // First value screen (after goals)
    if (stepIdx === 8) return 1; // Second value screen (after timeframe)
    return -1;
  }
  
  // Helper to get actual question index from stepIndex
  function getActualQuestionIndex(stepIdx) {
    // stepIndex 0-4 = questions 0-4
    // stepIndex 5 = value screen (skip)
    // stepIndex 6-7 = questions 5-6
    // stepIndex 8 = value screen (skip)
    // stepIndex 9+ = questions 7+
    if (stepIdx <= 4) return stepIdx;
    if (stepIdx === 5) return -1; // value screen
    if (stepIdx <= 7) return stepIdx - 1; // account for one value screen
    if (stepIdx === 8) return -1; // value screen
    return stepIdx - 2; // account for two value screens
  }

  // nav within steps
  modal.addEventListener('click',(e)=>{
    if(e.target.classList.contains('ttr-next')){
      // Check if we're on a value screen
      const currentStep = modal.querySelector('.ttr-step:not([hidden])');
      const isValueScreen = currentStep && currentStep.classList.contains('ttr-value-screen');
      
      if (!isValueScreen && stepIndex >= 0) {
        // Save current question answer
        const actualQIdx = getActualQuestionIndex(stepIndex);
        if (actualQIdx >= 0 && actualQIdx < QUESTIONS.length) {
          const qDef = QUESTIONS[actualQIdx];
          if(qDef.type==='select'){
            answers[qDef.id] = modal.querySelector(`#q-${qDef.id}`).value;
          } else {
            answers[qDef.id] = [...modal.querySelectorAll(`[data-step="q-${actualQIdx}"] input:checked`)].map(i=>i.value);
          }
        }
      }

      stepIndex++;
      
      // Check if we should show a value screen
      if (shouldShowValueScreen(stepIndex)) {
        const valueScreenIdx = getValueScreenIndex(stepIndex);
        const valueScreenPos = VALUE_SCREEN_POSITIONS[valueScreenIdx];
        const valueStep = modal.querySelector(`[data-step="value-${valueScreenPos}"]`);
        
        // Update value screen content with current answers
        if (valueStep) {
          if (valueScreenIdx === 0) {
            // First value screen - update with goals
            const goals = answers.goals || [];
            const goalText = goals.length > 0 ? goals[0].toLowerCase() : 'your trading goals';
            const h2 = valueStep.querySelector('h2');
            if (h2) {
              h2.innerHTML = `You have great potential to crush <span class="ttr-highlight">${goalText}</span>`;
            }
          } else if (valueScreenIdx === 1) {
            // Second value screen - update with timeframe
            const timeframe = answers.timeframe || '3–6 months';
            const timeframeText = timeframe.includes('1 month') ? '1 month' : timeframe.includes('1–3') ? '3 months' : timeframe.includes('3–6') ? '6 months' : '6 months';
            const note = valueStep.querySelector('.ttr-comparison-note');
            if (note) {
              note.innerHTML = `<strong>85% of TradeTrakR users</strong> maintain improved consistency even ${timeframeText} later.`;
            }
          }
        }
        
        show(`value-${valueScreenPos}`);
        updateProgress();
        if (valueStep) {
          setTimeout(() => animateValueScreen(valueStep), 100);
        }
        return;
      }
      
      const actualQIdx = getActualQuestionIndex(stepIndex);
      
      if(stepIndex === 0){ show('q-0'); }
      else if(actualQIdx < QUESTIONS.length){ 
        show(`q-${actualQIdx}`); 
      }
      else if(actualQIdx === QUESTIONS.length){ // generate
        show('generate'); updateProgress();
        setTimeout(()=>{ // fake work then show plan
          buildPlan();
          show('plan'); updateProgress();
        }, 1200);
      }
      else if(actualQIdx === QUESTIONS.length+1){ // plan -> paywall
        show('paywall'); updateProgress();
        reachedPaywall = true;
      }
      updateProgress();
    }
    if(e.target.classList.contains('ttr-prev')){
      stepIndex = Math.max(-1, stepIndex-1);
      
      // Check if previous step was a value screen
      if (shouldShowValueScreen(stepIndex)) {
        const valueScreenIdx = getValueScreenIndex(stepIndex);
        const valueScreenPos = VALUE_SCREEN_POSITIONS[valueScreenIdx];
        show(`value-${valueScreenPos}`);
        updateProgress();
        return;
      }
      
      if(stepIndex===-1) show('intro');
      else {
        const actualQIdx = getActualQuestionIndex(stepIndex);
        if (actualQIdx >= 0 && actualQIdx < QUESTIONS.length) {
          show(`q-${actualQIdx}`);
        }
      }
      updateProgress();
    }
  });

  function buildPlan(){
    // Build personalized features based on answers
    const features = [];
    const painPoints = [];
    
    if ((answers.goals||[]).includes('Reduce tilt')) {
      features.push({title:'Tilt Meter Coaching',desc:'Real-time emotion tracking prevents revenge trades'});
      painPoints.push('emotional trading');
    }
    if ((answers.goals||[]).includes('Consistency')) {
      features.push({title:'Daily Rule Checklist',desc:'Automated compliance tracking for every trade'});
      painPoints.push('rule violations');
    }
    if ((answers.goals||[]).includes('Find top setups')) {
      features.push({title:'AI Setup Analysis',desc:'Discover your highest-probability entry patterns'});
      painPoints.push('unclear edge');
    }
    if ((answers.pain||'').includes('Overtrading')) {
      features.push({title:'Max-Trades Guardrail',desc:'Automatic alerts when you exceed daily limits'});
      painPoints.push('overtrading');
    }
    if (answers.time==='5–10 min' || answers.time==='<5 min') {
      features.push({title:'5-Minute Review Mode',desc:'Lightning-fast journaling that fits your schedule'});
    }
    if ((answers.pain||'').includes('Revenge trades')) {
      features.push({title:'Psychology Prompts',desc:'Pre-trade mindset checks prevent emotional decisions'});
      painPoints.push('revenge trading');
    }
    if ((answers.pain||'').includes('Sizing drift')) {
      features.push({title:'Position Size Tracker',desc:'Visual alerts when sizing deviates from plan'});
      painPoints.push('sizing mistakes');
    }
    
    // Default features if none matched
    if (features.length === 0) {
      features.push(
        {title:'AI Performance Insights',desc:'Discover hidden patterns in your trading data'},
        {title:'Psychology Tracking',desc:'Understand how emotions impact your results'},
        {title:'Rule Compliance',desc:'Track adherence to your trading plan'}
      );
    }

    // Calculate stats based on answers
    const experience = answers.experience || 'Less than 1 year';
    const winRate = answers.winrate || '35–50%';
    const accountType = answers.account || 'Personal';
    
    // Build compelling copy based on pain points
    let mainMessage = '';
    if (painPoints.length > 0) {
      mainMessage = `Based on your answers, you're struggling with ${painPoints.slice(0,2).join(' and ')}. TradeTrakR is designed specifically to solve these problems.`;
    } else {
      mainMessage = `You're focused on ${(answers.goals||[]).join(', ') || 'improving your trading'}. TradeTrakR will help you get there faster with data-driven insights.`;
    }

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
          <span class="ttr-plan-stat-value">${accountType === 'Prop firm' ? 'Prop-Ready' : 'Optimized'}</span>
          <span class="ttr-plan-stat-label">For ${accountType}</span>
        </div>
        <div class="ttr-plan-stat">
          <span class="ttr-plan-stat-value">${answers.time === '<5 min' || answers.time === '5–10 min' ? 'Fast' : 'Deep'}</span>
          <span class="ttr-plan-stat-label">Review Mode</span>
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
          ${experience.includes('Less than 1') ? 'Starting with proper journaling habits now will accelerate your learning curve.' : 'Your experience level means you\'re ready for advanced analytics that reveal your true edge.'}
        </p>
      </div>
    `;
    try{ localStorage.setItem('ttr_onboard', JSON.stringify({answers, ts: Date.now()})); }catch{}
  }

  // Paywall handlers
  const checkoutBtn = document.getElementById('ttr-checkout');
  const trialText = document.getElementById('ttr-trial-text');
  const billingText = document.getElementById('ttr-billing-text');
  
  // Update pricing option selection
  modal.querySelectorAll('.ttr-pricing-option').forEach(option => {
    option.addEventListener('click', () => {
      modal.querySelectorAll('.ttr-pricing-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      updateBillingText();
    });
  });
  
  function updateBillingText() {
    const plan = modal.querySelector('input[name="ttr-plan"]:checked').value;
    if (plan === 'yearly') {
      if (trialText) trialText.textContent = 'Free for 3 days';
      if (billingText) billingText.textContent = 'billed as $95.88 per year';
      if (checkoutBtn) checkoutBtn.textContent = 'Start 3-Day Free Trial';
    } else {
      if (trialText) trialText.textContent = 'No free trial';
      if (billingText) billingText.textContent = 'billed as $14.99 per month';
      if (checkoutBtn) checkoutBtn.textContent = 'Start Monthly Plan';
    }
  }
  
  checkoutBtn.addEventListener('click', ()=>{
    const plan = modal.querySelector('input[name="ttr-plan"]:checked').value;
    const link = (plan==='yearly' ? CHECKOUT.yearly : CHECKOUT.monthly);
    window.location.href = addAttribution(link);
  });

  // UTM passthrough
  function addAttribution(url){
    const params = new URLSearchParams(window.location.search);
    const extras = params.toString();
    return extras ? (url + (url.includes('?')?'&':'?') + extras) : url;
  }


  // -------- Cancel redirect → show paywall on homepage --------
  if (new URLSearchParams(location.search).get('trial_cancelled') === '1') {
    try{ localStorage.setItem('ttr_show_cancel_offer','1'); }catch{}
  }
  // On landing pages (home), if flag set, auto-open paywall with yearly preselected
  if (location.pathname === '/' || location.pathname.endsWith('/index.html')) {
    if (localStorage.getItem('ttr_show_cancel_offer') === '1') {
      setTimeout(()=> {
        openModal(); stepIndex = QUESTIONS.length+1; // jump to paywall
        show('paywall'); updateProgress();
        const yearlyOption = modal.querySelector('[data-plan="yearly"]');
        if (yearlyOption) {
          modal.querySelectorAll('.ttr-pricing-option').forEach(opt => opt.classList.remove('selected'));
          yearlyOption.classList.add('selected');
          modal.querySelector('input[value="yearly"]').checked = true;
          updateBillingText();
        }
        try{ localStorage.removeItem('ttr_show_cancel_offer'); }catch{}
      }, 400);
    }
  }
  
  // Initialize billing text on load
  updateBillingText();

  // One-time offer checkout handler
  const ultimateCheckoutBtn = document.getElementById('ttr-ultimate-checkout');
  const ultimateCloseBtn = document.getElementById('ttr-ultimate-close');
  if (ultimateCheckoutBtn) {
    ultimateCheckoutBtn.addEventListener('click', ()=>{
      window.location.href = addAttribution(CHECKOUT.ultimate);
    });
  }
  if (ultimateCloseBtn) {
    ultimateCloseBtn.addEventListener('click', closeModal);
  }

  // Start button in intro
  q('[data-step="intro"] .ttr-next').addEventListener('click', ()=>{ stepIndex=0; show('q-0'); updateProgress(); });

})();

