/* Reusable interactive widgets for project pages */
window.Widgets = (function () {
  /* Auto-advancing stepper: steps = [{t:'Title', d:'Description'}] */
  function stepper(root, steps, ms) {
    ms = ms || 2800;
    var wrap = root.querySelector('.steps'), detail = root.querySelector('.step-detail');
    var cur = 0, timer = null, visible = false, pause = 0;
    wrap.innerHTML = '';
    var btns = steps.map(function (s, i) {
      var b = document.createElement('button');
      b.className = 'step';
      b.innerHTML = '<span class="n">' + (i + 1) + '</span><span class="t">' + s.t + '</span>';
      b.addEventListener('click', function () { pause = Date.now() + 9000; go(i); });
      wrap.appendChild(b); return b;
    });
    function go(i) {
      cur = i;
      btns.forEach(function (b, k) {
        b.classList.remove('on'); void b.offsetWidth;
        if (k === i) b.classList.add('on');
      });
      detail.innerHTML = '<h4>' + steps[i].t + '</h4><p>' + steps[i].d + '</p>';
      var on = btns[i]; if (on.scrollIntoView && wrap.scrollWidth > wrap.clientWidth) wrap.scrollTo({ left: on.offsetLeft - 20, behavior: 'smooth' });
    }
    go(0);
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: .3 }).observe(root);
    timer = setInterval(function () {
      if (!visible || Date.now() < pause) return;
      go((cur + 1) % steps.length);
    }, ms);
    return { go: go };
  }

  /* Animated comparison bars. rows: [{name, sub, v, best}] */
  function bars(root, rows, unit, dec) {
    root.innerHTML = '';
    var max = Math.max.apply(null, rows.map(function (r) { return r.v; }));
    rows.forEach(function (r) {
      var d = document.createElement('div');
      d.className = 'bar-row' + (r.best ? ' best' : '');
      d.innerHTML = '<div class="top"><span><b>' + r.name + '</b> <span style="color:var(--muted)">' + (r.sub || '') + '</span>' +
        (r.best ? ' <span class="badge">best</span>' : '') + '</span><span class="val">' + r.v.toFixed(dec) + unit + '</span></div>' +
        '<div class="bar-track"><div class="bar-fill"></div></div>';
      root.appendChild(d);
      var f = d.querySelector('.bar-fill');
      requestAnimationFrame(function () { requestAnimationFrame(function () { f.style.width = (r.v / max * 100) + '%'; }); });
    });
  }

  /* Terminal that reveals lines one by one */
  function terminal(pre, html, speed, done) {
    var lines = html.split('\n'), i = 0;
    pre.innerHTML = '';
    (function next() {
      if (i >= lines.length) { if (done) done(); return; }
      pre.innerHTML += (i ? '\n' : '') + lines[i++];
      setTimeout(next, speed || 70);
    })();
  }

  /* Run fn the first time el becomes visible */
  function onceVisible(el, fn) {
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold: .25 });
    io.observe(el);
  }

  /* HiDPI canvas helper */
  function canvas(c, h) {
    var dpr = Math.min(devicePixelRatio || 1, 2), w = c.clientWidth;
    c.width = w * dpr; c.height = h * dpr; c.style.height = h + 'px';
    var x = c.getContext('2d'); x.scale(dpr, dpr);
    return { ctx: x, w: w, h: h };
  }
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  return { stepper: stepper, bars: bars, terminal: terminal, onceVisible: onceVisible, canvas: canvas, css: css };
})();
