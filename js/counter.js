/**
 * Animação fluida de contagem subindo (Counter Animation)
 * Aciona quando os elementos entram na área de visualização (IntersectionObserver).
 */
(function() {
  function animateNumber(el) {
    const rawText = el.getAttribute('data-counter-target') || el.innerText.trim();
    
    // Tratamento especial para infinito ou caracteres puramente não numéricos
    if (rawText === '∞' || rawText === 'inf' || rawText === 'Infinito') {
      el.style.display = 'inline-block';
      el.style.opacity = '0';
      el.style.transform = 'translateY(15px) scale(0.7)';
      el.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) scale(1)';
      });
      return;
    }

    // Identificar prefixo (ex: "+"), número alvo (inteiro ou decimal), e sufixo (ex: "+", "%", " ★")
    // Regex para extrair: prefixo, número, sufixo
    const match = rawText.match(/^([^\d]*)([\d]+(?:[.,]\d+)?)(.*)$/);
    if (!match) return;

    const prefix = match[1] || '';
    const numStr = match[2].replace(',', '.');
    const suffix = match[3] || '';
    const targetValue = parseFloat(numStr);
    const isDecimal = numStr.includes('.');
    const decimalPlaces = isDecimal ? (numStr.split('.')[1] || '').length : 0;

    const duration = 2000; // 2 segundos de animação
    const startTime = performance.now();

    // Easing out quart: desaceleração suave e premium
    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = targetValue * easedProgress;

      let formattedNum;
      if (decimalPlaces > 0) {
        formattedNum = currentValue.toFixed(decimalPlaces);
      } else {
        formattedNum = Math.floor(currentValue).toString();
      }

      el.textContent = `${prefix}${formattedNum}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // Garante o valor final exato
        const finalNum = decimalPlaces > 0 ? targetValue.toFixed(decimalPlaces) : targetValue.toString();
        el.textContent = `${prefix}${finalNum}${suffix}`;
      }
    }

    // Inicializa com 0
    const startZero = decimalPlaces > 0 ? (0).toFixed(decimalPlaces) : '0';
    el.textContent = `${prefix}${startZero}${suffix}`;
    requestAnimationFrame(updateCounter);
  }

  function initCounterAnimation(selector) {
    const elements = document.querySelectorAll(selector);
    if (!elements || elements.length === 0) return;

    // Se o navegador não suportar IntersectionObserver, roda direto
    if (!('IntersectionObserver' in window)) {
      elements.forEach(animateNumber);
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateNumber(entry.target);
          obs.unobserve(entry.target); // Anima apenas uma vez ao entrar em tela
        }
      });
    }, {
      threshold: 0.2, // Dispara assim que 20% do elemento estiver visível
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCounterAnimation('.stat-number, .stat-num');
    });
  } else {
    initCounterAnimation('.stat-number, .stat-num');
  }
})();
