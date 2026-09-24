// Page extractor. Run inside the loaded page:
//   agent-browser eval --stdin < extract.js      or   Playwright MCP browser_evaluate (paste as function body)
// Returns one JSON object. Read-only: never clicks, types or submits.
(() => {
  const T = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const abs = (u) => { try { return u ? new URL(u, location.href).href : null; } catch { return null; } };
  const meta = (k) => document.querySelector(`meta[name="${k}" i],meta[property="${k}" i]`)?.content || null;
  const where = (el) => el.closest('header,[role=banner]') ? 'header' : el.closest('footer,[role=contentinfo]') ? 'footer' : el.closest('nav') ? 'nav' : 'main';
  const list = (ul) => [...ul.children].filter((li) => li.tagName === 'LI').map((li) => {
    const a = li.querySelector(':scope > a, :scope > * > a');
    const sub = li.querySelector('ul,ol');
    return { label: T((a || li.firstElementChild || li).textContent), url: abs(a?.getAttribute('href')), children: sub ? list(sub) : undefined };
  });

  // Site chrome = banner/contentinfo, or a header/footer holding nav links, outside <main>/<article>.
  // A hero <header> without navigation is content.
  const CH = 'header,footer,[role=banner],[role=contentinfo]';
  const isChrome = (x) => !x.closest('main,[role=main],article') && (x.matches('[role=banner],[role=contentinfo],footer') || !!x.querySelector('nav,ul a'));
  const chrome = (el) => { for (let x = el.closest(CH); x; x = x.parentElement?.closest(CH)) if (isChrome(x)) return true; return false; };
  const SKIP = 'nav,script,style,noscript,template,svg,[hidden],[aria-hidden=true],[role=dialog]';

  // Page content as one ordered block stream; headings mark the sections.
  const content = [...document.body.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,blockquote,pre,table,img,video,iframe,form,a,button,dt,dd,summary')]
    .filter((el) => !el.closest(SKIP) && !chrome(el))
    .filter((el) => !(/^(A|BUTTON)$/.test(el.tagName) && el.closest('p,li,h1,h2,h3,h4,h5,h6,dt,dd,summary')))
    .filter((el) => !(el.tagName !== 'LI' && el.parentElement.closest('li,blockquote,table,form,pre')))
    .map((el) => {
      const t = el.tagName.toLowerCase();
      if (/^h\d$/.test(t)) return { h: +t[1], text: T(el.textContent) };
      if (t === 'img') return { img: abs(el.currentSrc || el.getAttribute('src') || el.getAttribute('data-src')), alt: el.getAttribute('alt') };
      if (t === 'video' || t === 'iframe') return { media: t, src: abs(el.currentSrc || el.src || el.querySelector('source')?.src) };
      if (t === 'form') return { form: T(el.getAttribute('aria-label') || el.querySelector('h1,h2,h3,legend')?.textContent) || 'form' };
      if (t === 'a' || t === 'button') return T(el.innerText) ? { action: T(el.innerText), url: abs(el.getAttribute('href')) } : null;
      if (t === 'table') return { table: [...el.rows].slice(0, 30).map((r) => [...r.cells].map((c) => T(c.textContent))) };
      if (t === 'pre') return { code: el.innerText.slice(0, 4000) };
      const text = T(el.innerText || el.textContent);
      return text ? { [t === 'li' ? 'li' : t === 'blockquote' ? 'quote' : t === 'summary' || t === 'dt' ? 'q' : 'p']: text } : null;
    })
    .filter(Boolean);

  return {
    url: location.href,
    status: performance.getEntriesByType('navigation')[0]?.responseStatus ?? null,
    title: document.title,
    lang: document.documentElement.lang || null,
    meta: {
      description: meta('description'),
      robots: meta('robots'),
      canonical: abs(document.querySelector('link[rel=canonical]')?.getAttribute('href')),
      og: Object.fromEntries([...document.querySelectorAll('meta[property^="og:"]')].map((m) => [m.getAttribute('property'), m.content])),
      twitter: Object.fromEntries([...document.querySelectorAll('meta[name^="twitter:"]')].map((m) => [m.name, m.content])),
      favicon: abs(document.querySelector('link[rel*=icon]')?.getAttribute('href')),
    },
    headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => `${h.tagName} ${T(h.textContent)}`).filter((h) => h.length > 3),
    navs: [...document.querySelectorAll('nav,[role=navigation]')].filter((n) => !n.parentElement.closest('nav')).map((n) => ({
      label: n.getAttribute('aria-label'),
      where: where(n.parentElement || n),
      items: n.querySelector('ul,ol')
        ? [...n.querySelectorAll('ul,ol')].filter((u) => !u.parentElement.closest('li')).flatMap(list)
        : [...n.querySelectorAll('a[href]')].map((a) => ({ label: T(a.textContent), url: abs(a.getAttribute('href')) })),
    })),
    footer: [...document.querySelectorAll('footer ul, footer ol')].filter((u) => !u.parentElement.closest('li')).map((u) => ({
      title: T(u.previousElementSibling?.textContent || u.parentElement.firstElementChild?.textContent).slice(0, 60),
      items: list(u),
    })),
    breadcrumbs: [...document.querySelectorAll('[aria-label*=breadcrumb i] a,[class*=breadcrumb i] a')].map((a) => T(a.textContent)),
    content,
    links: [...document.querySelectorAll('a[href],area[href]')]
      .map((a) => ({ text: T(a.textContent || a.getAttribute('aria-label') || a.querySelector('img')?.alt), href: abs(a.getAttribute('href')), where: where(a) }))
      .filter((l) => l.href && !/^javascript:/i.test(l.href)),
    srcs: [...document.querySelectorAll('img,source,video,audio,iframe,embed,object,[style*="url("]')].map((e) => ({
      tag: e.tagName.toLowerCase(),
      src: abs(e.currentSrc || e.getAttribute('src') || e.getAttribute('data-src') || e.getAttribute('data') || e.getAttribute('srcset')?.split(/[\s,]+/)[0] || /url\(["']?([^"')]+)/.exec(e.getAttribute('style') || '')?.[1]),
      alt: e.getAttribute('alt'),
      w: e.naturalWidth || +e.getAttribute('width') || null,
      h: e.naturalHeight || +e.getAttribute('height') || null,
      caption: T(e.closest('figure')?.querySelector('figcaption')?.textContent) || null,
      where: where(e),
    })).filter((s) => s.src && !s.src.startsWith('data:')),
    forms: [...document.querySelectorAll('form')].map((f) => ({
      title: T(f.getAttribute('aria-label') || f.querySelector('h1,h2,h3,legend')?.textContent) || null,
      action: abs(f.getAttribute('action')),
      method: (f.getAttribute('method') || 'get').toUpperCase(),
      fields: [...f.querySelectorAll('input,select,textarea')].filter((i) => !/^(hidden|submit|button)$/.test(i.type)).map((i) => ({
        label: T((i.id && document.querySelector(`label[for="${CSS.escape(i.id)}"]`)?.textContent) || i.closest('label')?.textContent || i.getAttribute('aria-label')) || null,
        name: i.name || null,
        type: i.tagName === 'INPUT' ? i.type : i.tagName.toLowerCase(),
        required: i.required,
        placeholder: i.placeholder || null,
        options: i.tagName === 'SELECT' ? [...i.options].map((o) => T(o.text)).slice(0, 30) : undefined,
      })),
      submit: T(f.querySelector('[type=submit],button')?.textContent || f.querySelector('[type=submit]')?.value) || null,
    })),
    jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { return JSON.parse(s.textContent); } catch { return { invalid: s.textContent.slice(0, 500) }; } }),
    contact: {
      emails: [...new Set([...document.querySelectorAll('a[href^="mailto:"]')].map((a) => a.href.slice(7).split('?')[0]))],
      phones: [...new Set([...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.href.slice(4)))],
    },
    words: T(document.body.innerText).split(' ').length,
  };
})()
