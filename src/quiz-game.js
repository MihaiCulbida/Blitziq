(function () {
  const questions = [
    {
      text: "What will this PHP code output?",
      code: `<?php\n$a = "5";\n$b = 3;\necho $a + $b;\n?>`,
      opts: ["Fatal error", "53", "8", '"5"3'],
      correct: 2,
      feedback: {
        ok: "Correct! PHP converts the string \"5\" to an integer automatically and calculates 5 + 3 = 8. This is called type juggling.",
        ko: "PHP converts \"5\" (string) to 5 (integer) automatically and adds 3, resulting in 8. This is called type juggling."
      }
    },
    {
      text: "Which method is the best defense against SQL injection in PHP?",
      code: null,
      opts: [
        "mysql_real_escape_string()",
        "Prepared statements with PDO or MySQLi",
        "htmlspecialchars()",
        "strip_tags()"
      ],
      correct: 1,
      feedback: {
        ok: "Exactly! Prepared statements separate SQL code from data entirely. mysql_real_escape_string() is deprecated since PHP 7.",
        ko: "The correct answer is prepared statements with PDO or MySQLi - they fully separate SQL code from user-supplied data."
      }
    },
    {
      text: "What does this expression return in PHP 8?",
      code: `<?php\nvar_dump(0 == "foo");\n?>`,
      opts: [
        'bool(true) - PHP converts "foo" to 0',
        "bool(false) - PHP 8 changed this behavior",
        "NULL",
        "A type error is thrown"
      ],
      correct: 1,
      feedback: {
        ok: "Nice! In PHP 8, comparing an integer with a non-numeric string returns false. In PHP 7 it returned true - a classic gotcha!",
        ko: 'In PHP 8 this returns bool(false). PHP 7 would return true (converting "foo" to 0), but PHP 8 fixed this.'
      }
    }
  ];

  let current = 0, score = 0, timerInterval = null, answered = false;

  function renderQuestion(i) {
    answered = false;
    const q = questions[i];
    document.getElementById('g-num').textContent = `Question ${i + 1} of 3`;
    document.getElementById('g-text').textContent = q.text;

    const codeEl = document.getElementById('g-code');
    if (q.code) { codeEl.style.display = 'block'; codeEl.textContent = q.code; }
    else { codeEl.style.display = 'none'; }

    document.getElementById('g-feedback').className = 'game-feedback';
    document.getElementById('g-feedback').textContent = '';
    document.getElementById('btn-next').className = 'game-next';

    const optsEl = document.getElementById('g-opts');
    optsEl.innerHTML = '';
    ['A', 'B', 'C', 'D'].forEach((letter, idx) => {
      const btn = document.createElement('button');
      btn.className = 'game-opt';
      btn.innerHTML = `<span class="game-opt-letter">${letter}</span>${q.opts[idx]}`;
      btn.addEventListener('click', () => selectAnswer(idx));
      optsEl.appendChild(btn);
    });

    document.getElementById('game-prog').style.width = ((i + 1) / 3 * 100) + '%';
    updateDots(i);
    startTimer();
  }

  function startTimer() {
    clearInterval(timerInterval);
    let t = 15;
    const el = document.getElementById('g-timer');
    el.textContent = t;
    el.className = 'game-timer';
    timerInterval = setInterval(() => {
      t--;
      el.textContent = t;
      if (t <= 5) el.className = 'game-timer urgent';
      if (t <= 0) { clearInterval(timerInterval); timeUp(); }
    }, 1000);
  }

  function timeUp() {
    if (answered) return;
    answered = true;
    const q = questions[current];
    document.querySelectorAll('.game-opt').forEach((b, idx) => {
      b.disabled = true;
      b.className = 'game-opt ' + (idx === q.correct ? 'correct' : 'dimmed');
    });
    const fb = document.getElementById('g-feedback');
    fb.textContent = "Time's up! " + q.feedback.ko;
    fb.className = 'game-feedback show ko';
    document.getElementById('btn-next').className = 'game-next show';
  }

  function selectAnswer(idx) {
    if (answered) return;
    answered = true;
    clearInterval(timerInterval);
    const q = questions[current];
    document.querySelectorAll('.game-opt').forEach((b, i) => {
      b.disabled = true;
      if (i === q.correct) b.className = 'game-opt correct';
      else if (i === idx)  b.className = 'game-opt wrong';
      else                 b.className = 'game-opt dimmed';
    });
    const isCorrect = idx === q.correct;
    if (isCorrect) score++;
    const fb = document.getElementById('g-feedback');
    fb.textContent = isCorrect ? q.feedback.ok : q.feedback.ko;
    fb.className = 'game-feedback show ' + (isCorrect ? 'ok' : 'ko');
    document.getElementById('btn-next').className = 'game-next show';
  }

  function updateDots(active) {
    for (let i = 0; i < 3; i++) {
      const d = document.getElementById('gdot-' + i);
      d.className = 'game-dot' + (i < active ? ' done' : i === active ? ' active' : '');
    }
  }

  function showResult() {
    document.getElementById('game-main').style.display = 'none';
    document.getElementById('game-result').className = 'game-result show';
    document.getElementById('g-score').textContent = score;
    const titles = ['Keep practicing!', 'Good start!', 'PHP Master!'];
    const subs = [
      'PHP has many quirks. Review the docs and give it another shot!',
      "You're getting there - a bit more practice and you'll nail it.",
      'You know type juggling, security & breaking changes. Impressive!'
    ];
    document.getElementById('g-result-title').textContent = titles[score];
    document.getElementById('g-result-sub').textContent   = subs[score];
    for (let i = 0; i < 3; i++) document.getElementById('gdot-' + i).className = 'game-dot done';
    document.getElementById('game-prog').style.width = '100%';
  }

  document.getElementById('btn-next').addEventListener('click', () => {
    current++;
    if (current < 3) renderQuestion(current);
    else showResult();
  });

  document.getElementById('btn-restart').addEventListener('click', () => {
    current = 0; score = 0;
    document.getElementById('game-main').style.display = '';
    document.getElementById('game-result').className = 'game-result';
    renderQuestion(0);
  });

  renderQuestion(0);
})();