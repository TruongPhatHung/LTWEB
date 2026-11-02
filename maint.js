(function () {
  var VERSION = '1.1.0';

  // Dark mode (bảo trì hoàn thiện) - nhớ lựa chọn bằng localStorage
  var btn = document.getElementById('changeColorBtn');
  function safeGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function safeSet(k,v){ try { localStorage.setItem(k,v); } catch(e){} }

  function applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
    if (btn) btn.textContent = dark ? 'Light Mode' : 'Dark Mode';
    safeSet('theme', dark ? 'dark' : 'light');
  }
  applyTheme(safeGet('theme') === 'dark');
  if (btn) btn.addEventListener('click', function () {
    applyTheme(!document.body.classList.contains('dark'));
  });

  var v = document.getElementById('appVersion');
  if (v) v.textContent = VERSION;

  // Bug tracker mini (chỉ chạy ở maintenance.html)
  var form = document.getElementById('bugForm');
  if (!form) return;
  var list = document.getElementById('bugList');
  var stats = document.getElementById('bugStats');
  var STATUS = ['Mới', 'Đang sửa', 'Đã sửa'];

  function load() { try { return JSON.parse(safeGet('bugs') || '[]'); } catch (e) { return []; } }
  function save(b) { safeSet('bugs', JSON.stringify(b)); }

  function render() {
    var bugs = load();
    list.textContent = '';
    if (!bugs.length) { list.textContent = 'Chưa có báo cáo nào.'; }
    bugs.forEach(function (b, i) {
      var row = document.createElement('div'); row.className = 'bug-item';
      var left = document.createElement('div');
      var t = document.createElement('strong'); t.textContent = b.title;
      var meta = document.createElement('div'); meta.className = 'muted';
      meta.textContent = b.type + ' · Mức độ: ' + b.severity + ' · ' + b.date;
      var d = document.createElement('div'); d.textContent = b.desc;
      left.append(t, meta, d);
      var right = document.createElement('div');
      var sel = document.createElement('select');
      STATUS.forEach(function (s) {
        var o = document.createElement('option'); o.textContent = s; if (s === b.status) o.selected = true; sel.appendChild(o);
      });
      sel.onchange = function () { var all = load(); all[i].status = sel.value; save(all); render(); };
      var del = document.createElement('button'); del.className = 'small-btn'; del.textContent = 'Xóa';
      del.onclick = function () { var all = load(); all.splice(i, 1); save(all); render(); };
      right.append(sel, document.createElement('br'), del);
      row.append(left, right); list.appendChild(row);
    });
    var c = STATUS.map(function (s) { return bugs.filter(function (b) { return b.status === s; }).length; });
    stats.textContent = '';
    STATUS.forEach(function (s, k) {
      var box = document.createElement('div'); var n = document.createElement('b'); n.textContent = c[k];
      box.append(n, s); stats.appendChild(box);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bugs = load();
    bugs.unshift({
      title: form.title.value.trim(), type: form.type.value, severity: form.severity.value,
      desc: form.desc.value.trim(), status: 'Mới', date: new Date().toLocaleDateString('vi-VN')
    });
    save(bugs); form.reset(); render();
  });
  render();
})();