/* DESIGN EXPO+ — interactions partagées */
(function(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reveals au scroll */
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e,i) => {
      if (e.isIntersecting){ setTimeout(()=>e.target.classList.add('visible'), i*70); obs.unobserve(e.target); }
    });
  }, { threshold:.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  /* Accordéon : parallax souris + défilement auto léger */
  const zone = document.querySelector('.accordion-zone');
  const acc  = document.querySelector('.accordion');
  if (zone && acc && !reduced){
    let raf, targetX = 0, curX = 0, drift = 0;
    zone.addEventListener('mousemove', e => {
      const r = zone.getBoundingClientRect();
      targetX = ((e.clientX - r.left)/r.width - .5) * -60; // px
    });
    zone.addEventListener('mouseleave', ()=> targetX = 0);
    (function loop(){
      drift -= .12;
      const w = acc.scrollWidth/2;
      if (Math.abs(drift) > w*0.18) drift = 0;
      curX += (targetX - curX)*.06;
      acc.style.transform = `rotate(-2.5deg) translateX(calc(-2% + ${curX+drift}px))`;
      raf = requestAnimationFrame(loop);
    })();
  }

  /* Compteurs stats */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length){
    const cObs = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, dur = 1400, t0 = performance.now();
      (function tick(t){
        const p = Math.min((t-t0)/dur, 1);
        el.textContent = Math.round(end * (1-Math.pow(1-p,3)));
        if (p<1) requestAnimationFrame(tick);
      })(t0);
      cObs.unobserve(el);
    }), { threshold:.6 });
    counters.forEach(c => cObs.observe(c));
  }

  /* Lightbox (groupes via data-lb-group) */
  const lb = document.querySelector('.lightbox');
  if (lb){
    const img = lb.querySelector('img'), cap = lb.querySelector('.lb-caption');
    let group = [], idx = 0;
    function show(i){
      idx = (i + group.length) % group.length;
      img.src = group[idx].dataset.full || group[idx].querySelector('img').src;
      cap.textContent = group[idx].dataset.caption || '';
    }
    document.querySelectorAll('[data-lb-group]').forEach(btn => {
      btn.addEventListener('click', () => {
        group = [...document.querySelectorAll(`[data-lb-group="${btn.dataset.lbGroup}"]`)];
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
        show(group.indexOf(btn));
      });
    });
    function close(){ lb.classList.remove('open'); document.body.style.overflow=''; }
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', ()=>show(idx-1));
    lb.querySelector('.lb-next').addEventListener('click', ()=>show(idx+1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key==='Escape') close();
      if (e.key==='ArrowLeft') show(idx-1);
      if (e.key==='ArrowRight') show(idx+1);
    });
  }
})();
