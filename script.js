/* small client-side behaviors:
   - visitor counter (localStorage)
   - simple calendar render
   - nav active highlighting
   - guestbook (localStorage)
*/

document.addEventListener('DOMContentLoaded', () => {

  // --- VISITOR COUNTER (localStorage) ---
  try {
    const key = 'kuranie_visitors_v1';
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    const next = prev + 1;
    localStorage.setItem(key, String(next));
    const vc = document.getElementById('visitor-count');
    if (vc) vc.textContent = next;
  } catch (e) { console.warn(e); }

  // --- NAV HIGHLIGHT ---
  document.querySelectorAll('.nav-link').forEach(a => {
    if (a.getAttribute('href') === location.pathname.split('/').pop() || (a.getAttribute('href') === 'index.html' && location.pathname.endsWith('/'))) {
      a.classList.add('active');
      a.style.boxShadow = 'inset 0 -3px 0 rgba(120,160,255,0.12)';
    }
  });

  // --- MINI CALENDAR (current month simple) ---
  (() => {
    const el = document.getElementById('mini-calendar');
    if (!el) return;
    const now = new Date();
    const month = now.toLocaleString(undefined, { month: 'long' });
    const year = now.getFullYear();
    const first = new Date(year, now.getMonth(), 1);
    const startDow = first.getDay(); // 0..6
    const days = new Date(year, now.getMonth() + 1, 0).getDate();

    const table = document.createElement('table');
    table.className = 'mini-table';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    const caption = document.createElement('caption');
    caption.textContent = `${month} ${year}`;
    caption.style.fontWeight = '700';
    caption.style.marginBottom = '6px';
    el.appendChild(caption);

    const header = document.createElement('tr');
    ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
      const th = document.createElement('th'); th.textContent = d; th.style.fontSize='0.7rem'; th.style.color='#7b8fb2';
      header.appendChild(th);
    });
    table.appendChild(header);

    let row = document.createElement('tr');
    // blanks
    for (let i=0;i<startDow;i++){
      row.appendChild(document.createElement('td'));
    }
    for (let date=1; date<=days; date++){
      if (row.children.length === 7){
        table.appendChild(row);
        row = document.createElement('tr');
      }
      const td = document.createElement('td');
      td.textContent = String(date);
      td.style.fontSize = '0.85rem';
      td.style.padding = '6px';
      if (date === now.getDate()) {
        td.style.background = 'linear-gradient(180deg,#d9edff,#cfe9ff)';
        td.style.borderRadius = '6px';
        td.style.fontWeight = '700';
      }
      row.appendChild(td);
    }
    if (row.children.length) table.appendChild(row);
    el.appendChild(table);
  })();

  // --- GUESTBOOK ---
  (() => {
    const form = document.getElementById('gb-form');
    const entriesEl = document.getElementById('gb-entries');
    const clearBtn = document.getElementById('clear-gb');
    const storageKey = 'kuranie_guestbook_v1';

    function loadEntries(){
      const raw = localStorage.getItem(storageKey);
      let arr = [];
      try { arr = raw ? JSON.parse(raw) : []; } catch(e){ arr=[]; }
      renderEntries(arr);
    }

    function saveEntry(name, msg){
      const raw = localStorage.getItem(storageKey);
      let arr = [];
      try { arr = raw ? JSON.parse(raw) : []; } catch(e){ arr=[]; }
      arr.unshift({ name, msg, date: new Date().toISOString() });
      localStorage.setItem(storageKey, JSON.stringify(arr));
      renderEntries(arr);
    }

    function renderEntries(arr){
      if (!entriesEl) return;
      entriesEl.innerHTML = '';
      if (!arr.length){
        entriesEl.innerHTML = '<p class="muted">No guestbook entries yet — be the first!</p>';
        return;
      }
      arr.forEach(item => {
        const div = document.createElement('div');
        div.className = 'gb-entry';
        div.innerHTML = `<strong>${escapeHtml(item.name)}</strong> <span style="color:#7b8fb2;font-size:0.85rem"> — ${new Date(item.date).toLocaleString()}</span>
                         <p style="margin-top:6px">${escapeHtml(item.msg)}</p>`;
        entriesEl.appendChild(div);
      });
    }

    if (form){
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('gb-name').value.trim() || 'anon';
        const msg = document.getElementById('gb-msg').value.trim();
        if (!msg) return;
        saveEntry(name, msg);
        form.reset();
      });
    }
    if (clearBtn){
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear all guestbook entries?')) {
          localStorage.removeItem(storageKey);
          loadEntries();
        }
      });
    }

    loadEntries();
  })();

}); // DOMContentLoaded

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, (m)=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])); }
