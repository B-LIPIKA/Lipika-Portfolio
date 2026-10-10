/* Shared behaviour: nav/footer injection, theme, reveal, counters, tilt, transitions */
(function () {
  var root = document.body.getAttribute('data-root') || '';
  var accent = document.body.getAttribute('data-accent');
  if (accent) document.documentElement.style.setProperty('--pa', accent);

  /* ---- theme ---- */
  var saved = null;
  try { saved = localStorage.getItem('lp-theme'); } catch (e) { }
  var prefersDark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

  var sun = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var moon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  /* ---- chrome (nav + footer) ---- */
  var nav = document.getElementById('site-nav');
  if (nav) {
    nav.className = 'nav';
    nav.innerHTML =
      '<div class="wrap"><a class="logo" href="' + root + 'index.html"><i>L</i>B. Lipika</a>' +
      '<nav class="links" id="links">' +
      '<a href="' + root + 'index.html#work">Work</a>' +
      '<a href="' + root + 'index.html#about">About</a>' +
      '<a href="' + root + 'index.html#contact">Contact</a></nav>' +
      '<div style="display:flex;gap:10px"><button class="icon-btn" id="theme" aria-label="Toggle theme"></button>' +
      '<button class="icon-btn menu-btn" id="menu" aria-label="Menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></div></div>';
  }
  var foot = document.getElementById('site-footer');
  if (foot) foot.innerHTML = '<div class="wrap">Designed &amp; built by B. Lipika · <a href="mailto:kulal123lipika@gmail.com" style="color:var(--text);font-weight:600">kulal123lipika@gmail.com</a> · Source code on <a href="https://github.com/B-LIPIKA" target="_blank" rel="noopener" style="color:var(--pa);font-weight:600">GitHub</a></div>';

  var themeBtn = document.getElementById('theme');
  function paintTheme() {
    if (themeBtn) themeBtn.innerHTML = document.documentElement.getAttribute('data-theme') === 'dark' ? sun : moon;
  }
  paintTheme();
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('lp-theme', next); } catch (e) { }
    paintTheme();
    window.dispatchEvent(new Event('themechange'));
  });
  var menu = document.getElementById('menu'), links = document.getElementById('links');
  if (menu) menu.addEventListener('click', function () { links.classList.toggle('open'); });
  if (links) links.addEventListener('click', function () { links.classList.remove('open'); });

  /* ---- scroll progress + nav state ---- */
  var prog = document.createElement('div'); prog.className = 'progress'; document.body.appendChild(prog);
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', scrollY > 24);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---- cursor glow (fine pointers only) ---- */
  if (matchMedia('(pointer:fine)').matches) {
    var g = document.createElement('div'); g.className = 'glow'; document.body.appendChild(g);
    var tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() { cx += (tx - cx) * .08; cy += (ty - cy) * .08; g.style.left = cx + 'px'; g.style.top = cy + 'px'; requestAnimationFrame(loop); })();
  }

  /* ---- reveal / bars / counters ---- */
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '', t0 = null, dur = 1600;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = pre + (end * e).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target; io.unobserve(el);
      el.classList.add('in');
      el.querySelectorAll('[data-count]').forEach(countUp);
      if (el.hasAttribute('data-count')) countUp(el);
      el.querySelectorAll('.bar-fill[data-w]').forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%'; });
      el.dispatchEvent(new CustomEvent('revealed'));
    });
  }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal, [data-count]').forEach(function (el) { io.observe(el); });

  /* ---- card tilt + spotlight ---- */
  document.querySelectorAll('.card').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
      if (matchMedia('(pointer:fine)').matches) c.style.transform = 'perspective(1000px) rotateX(' + (.5 - y) * 5 + 'deg) rotateY(' + (x - .5) * 6 + 'deg) translateY(-6px)';
    });
    c.addEventListener('mouseleave', function () { c.style.transform = ''; });
  });

  /* ---- smooth page transitions ---- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var h = a.getAttribute('href');
    if (!h || h.charAt(0) === '#' || /^(https?:|mailto:|tel:)/.test(h)) return;
    var url = new URL(a.href, location.href);
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(function () { location.href = a.href; }, 270);
  });
  addEventListener('pageshow', function (e) { if (e.persisted) document.body.classList.remove('leaving'); });

  /* ---- lightbox ---- */
  var lb = document.getElementById('lightbox');
  if (lb) {
    document.querySelectorAll('.gallery figure img').forEach(function (im) {
      im.parentNode.addEventListener('click', function () { lb.querySelector('img').src = im.src; lb.classList.add('open'); });
    });
    lb.addEventListener('click', function () { lb.classList.remove('open'); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('open'); });
  }

  /* ---- hero word rotator ---- */
  var rot = document.getElementById('rotator');
  if (rot) {
    var words = (rot.getAttribute('data-words') || '').split('|'), i = 0;
    setInterval(function () {
      i = (i + 1) % words.length;
      rot.innerHTML = '<span>' + words[i] + '</span>';
    }, 2600);
  }

  /* ---- contact form & emailjs ---- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var EMAILJS_SERVICE_ID = 'service_4986blu';
    var EMAILJS_TEMPLATE_ID = 'template_6djf3l2';
    var EMAILJS_PUBLIC_KEY = 'PAlHOqYdMB6Vc4oa5';

    if (window.emailjs) {
      try {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      } catch (err) {
        console.warn('EmailJS init:', err);
      }
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var statusEl = document.getElementById('form-status');
      var submitBtn = document.getElementById('submit-btn');
      var submitSpan = submitBtn ? submitBtn.querySelector('span') : null;
      var originalBtnText = submitSpan ? submitSpan.textContent : 'Send message';

      var userName = (document.getElementById('user_name') || {}).value || '';
      var userEmail = (document.getElementById('user_email') || {}).value || '';
      var message = (document.getElementById('message') || {}).value || '';

      if (!userName.trim() || !message.trim()) {
        if (statusEl) {
          statusEl.className = 'form-status error';
          statusEl.textContent = 'Please fill out your name and message.';
        }
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (submitSpan) submitSpan.textContent = 'Sending message...';
      if (statusEl) {
        statusEl.className = 'form-status info';
        statusEl.textContent = 'Sending your message...';
      }

      var templateParams = {
        name: userName,
        user_name: userName,
        from_name: userName,
        email: userEmail,
        user_email: userEmail,
        from_email: userEmail,
        reply_to: userEmail,
        message: message
      };

      if (window.emailjs) {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, { publicKey: EMAILJS_PUBLIC_KEY })
          .then(function () {
            if (statusEl) {
              statusEl.className = 'form-status success';
              statusEl.textContent = '✓ Message sent successfully! I will get back to you soon.';
            }
            contactForm.reset();
          })
          .catch(function (error) {
            console.error('EmailJS error:', error);
            var errText = (error && (error.text || error.message)) || '';
            var userMsg = 'Could not send message via EmailJS.';
            if (errText.indexOf('Invalid grant') !== -1) {
              userMsg = 'Gmail authorization expired in EmailJS. Please reconnect your Gmail in EmailJS dashboard.';
            } else if (errText) {
              userMsg += ' (' + errText + ')';
            }
            if (statusEl) {
              statusEl.className = 'form-status error';
              statusEl.innerHTML = userMsg + '<br><a href="mailto:kulal123lipika@gmail.com?subject=Contact%20from%20' + encodeURIComponent(userName) + '&body=' + encodeURIComponent(message + '\n\nFrom: ' + userName + ' (' + userEmail + ')') + '" style="text-decoration:underline;color:inherit;font-weight:600">Click to send directly via email app</a>';
            }
          })
          .finally(function () {
            if (submitBtn) submitBtn.disabled = false;
            if (submitSpan) submitSpan.textContent = originalBtnText;
          });
      } else {
        window.location.href = 'mailto:kulal123lipika@gmail.com?subject=Portfolio%20Message%20from%20' + encodeURIComponent(userName) + '&body=' + encodeURIComponent(message + '\n\n---\nSender: ' + userName + ' (' + userEmail + ')');
        if (submitBtn) submitBtn.disabled = false;
        if (submitSpan) submitSpan.textContent = originalBtnText;
      }
    });
  }
})();
