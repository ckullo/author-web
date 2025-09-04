(function () {
  // --- Konfigurasi ---
  const ITEMS_PER_PAGE = 6;
  const LIST_SELECTOR  = '#book-list > .col-md-6.col-lg-6.d-flex';
  const PAGINATION_EL  = document.querySelector('#book-pagination');
  const ALL_CARDS      = Array.from(document.querySelectorAll(LIST_SELECTOR));
  let filteredCards    = ALL_CARDS.slice();
  let currentPage      = 1;

  if (!ALL_CARDS.length || !PAGINATION_EL) return;

  // --- Helper untuk ambil/set page dari URL (opsional) ---
  function getInitialPage() {
    const usp = new URLSearchParams(window.location.search);
    const p = parseInt(usp.get('bpage') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }
  function setPageInURL(p) {
    const usp = new URLSearchParams(window.location.search);
    usp.set('bpage', p);
    const newUrl = window.location.pathname + '?' + usp.toString() + '#books';
    history.replaceState(null, '', newUrl);
  }

  function renderPage(page) {
    currentPage = page;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end   = start + ITEMS_PER_PAGE;

    // Hide all first
    ALL_CARDS.forEach(el => el.classList.add('book-hidden'));
    // Show only filtered and paginated
    filteredCards.forEach((el, idx) => {
      if (idx >= start && idx < end) {
        el.classList.remove('book-hidden');
      }
    });

    renderPaginationUI(page);
    setPageInURL(page);

    const booksSection = document.querySelector('#books');
    if (booksSection) {
      booksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderPaginationUI(activePage) {
    PAGINATION_EL.innerHTML = '';
    const totalItems = filteredCards.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

    function li(label, page, disabled = false, active = false) {
      const li = document.createElement('li');
      li.className = `page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}`;
      const a = document.createElement('a');
      a.className = 'page-link';
      a.textContent = label;
      if (!disabled && !active) {
        a.addEventListener('click', () => renderPage(page));
      }
      li.appendChild(a);
      return li;
    }

    // Prev
    PAGINATION_EL.appendChild(li('«', Math.max(1, activePage - 1), activePage === 1, false));

    // Logic penomoran (window kecil + ellipsis)
    const windowSize = 2;
    const pages = [];
    const push = (p) => { if (!pages.includes(p) && p >= 1 && p <= totalPages) pages.push(p); };

    push(1);
    for (let p = activePage - windowSize; p <= activePage + windowSize; p++) push(p);
    push(totalPages);
    pages.sort((a,b) => a-b);

    let last = 0;
    pages.forEach(p => {
      if (p - last > 1) {
        const liGap = document.createElement('li');
        liGap.className = 'page-item disabled';
        liGap.innerHTML = `<span class="page-link">…</span>`;
        PAGINATION_EL.appendChild(liGap);
      }
      PAGINATION_EL.appendChild(li(String(p), p, false, p === activePage));
      last = p;
    });

    // Next
    PAGINATION_EL.appendChild(li('»', Math.min(totalPages, activePage + 1), activePage === totalPages, false));
  }

  // --- Filtering ---
  function filterByAuthor(author) {
    if (!author || author === 'all') {
      filteredCards = ALL_CARDS.slice();
    } else {
      filteredCards = ALL_CARDS.filter(card => card.getAttribute('data-author') === author);
    }
    currentPage = 1;
    renderPage(currentPage);
  }

  // --- Expose filter function globally ---
  window.filterBooksByAuthor = filterByAuthor;

  // --- Inisialisasi ---
  currentPage = Math.min(getInitialPage(), Math.ceil(filteredCards.length / ITEMS_PER_PAGE));
  renderPage(currentPage);
})();