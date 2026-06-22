(function () {
  'use strict';

  const MAX_QUESTIONS = 100;
  const MAX_ANSWERS = 6;
  const MIN_ANSWERS = 2;

  let quizzes = JSON.parse(localStorage.getItem('blitziq-quizzes') || '[]');
  function reloadQuizzesFromStorage() {
    quizzes = JSON.parse(localStorage.getItem('blitziq-quizzes') || '[]');
  }
  window.blitziqReloadQuizzes = reloadQuizzesFromStorage;
  let editorQuizId = null;
  let currentQIndex = 0;

  function saveQuizzes() {
    localStorage.setItem('blitziq-quizzes', JSON.stringify(quizzes));
    syncToServer();
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  function getQuiz(id) {
    return quizzes.find(q => q.id === id);
  }

  window.blitziqCreateDraft = function (payload) {
    const avatar = document.querySelector('.navbar-avatar');
    if (!avatar) { showToast(t('toast_login_to_create')); return null; }
    const count = Math.max(1, Math.min(MAX_QUESTIONS, parseInt(payload.questionCount) || 10));
    const ansCount = Math.max(MIN_ANSWERS, Math.min(MAX_ANSWERS, parseInt(payload.answerCount) || 4));
    const questions = Array.from({ length: count }, (_, i) => ({
      index: i,
      text: '',
      answers: Array.from({ length: ansCount }, () => ({ text: '', correct: false })),
      type: 'single',
      time: Math.max(5, Math.min(300, parseInt(payload.timePerQuestion) || 30)),
      points: Math.max(1, parseInt(payload.pointsPerAnswer) || 10),
    }));
    if (questions.length > 0) questions[0].answers[0].correct = true;

    const quiz = {
      id: Date.now().toString(),
      name: payload.name,
      description: payload.description || '',
      subject: payload.subject || '',
      language: payload.language || '',
      visibility: payload.visibility || 'public',
      answerCount: ansCount,
      timePerQ: Math.max(5, Math.min(300, parseInt(payload.timePerQuestion) || 30)),
      questionOrder: payload.questionOrder,
      answerOrder: payload.answerOrder,
      attempts: Math.max(1, Math.min(10, parseInt(payload.attempts) || 1)),
      passScore: Math.max(0, Math.min(100, parseInt(payload.passScore) || 60)),
      points: Math.max(1, parseInt(payload.pointsPerAnswer) || 10),
      displayOptions: payload.displayOptions || [],
      status: 'draft',
      createdAt: Date.now(),
      questions,
    };
    quizzes.unshift(quiz);
    saveQuizzes();
    renderMyQuizzes();
    return quiz;
  };

  function renderMyQuizzes() {
    const section = document.getElementById('section-quizzes');
    if (!section) return;
    if (quizzes.length === 0) {
      section.innerHTML = `
        <div class="mq-empty">
          <div class="mq-empty__icon"><img src="img/quizzes.png" width="40" height="40" alt=""></div>
          <p class="mq-empty__title">${t('no_quizzes_title')}</p>
          <p class="mq-empty__sub">${t('no_quizzes_sub')}</p>
        </div>
      `;
      return;
    }
    section.innerHTML = `
      <div class="mq-header">
        <h2 class="mq-header__title">${t('my_quizzes_title')}</h2>
        <span class="mq-header__count">${quizzes.length} ${quizzes.length !== 1 ? t('quizzes_word') : t('quiz_word')}</span>
      </div>
      <div class="mq-grid" id="mq-grid"></div>
    `;
    const grid = document.getElementById('mq-grid');
    quizzes.forEach(quiz => grid.appendChild(buildQuizCard(quiz)));
  }

  function buildQuizCard(quiz) {
    const card = document.createElement('div');
    card.className = 'mq-card';
    card.dataset.id = quiz.id;
    const filled = quiz.questions.filter(q => q.text.trim()).length;
    const total = quiz.questions.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    const statusLabel = quiz.status === 'draft' ? t('draft_label') : t('published_label');
    card.innerHTML = `
      <div class="mq-card__top">
        <span class="mq-card__status mq-card__status--${quiz.status}">${statusLabel}</span>
        <button class="mq-card__delete" data-id="${quiz.id}" aria-label="Delete quiz" title="${t('delete')}">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="mq-card__body">
        <h3 class="mq-card__name">${escapeHtml(quiz.name)}</h3>
        <p class="mq-card__meta">${escapeHtml(quiz.subject || 'No subject')} · ${total} questions · ${quiz.timePerQ}s</p>
      </div>
      <div class="mq-card__footer">
        <div class="mq-card__progress-wrap">
          <div class="mq-card__progress-bar">
            <div class="mq-card__progress-fill" style="width:${pct}%"></div>
          </div>
          <span class="mq-card__progress-label">${filled}/${total} ${t('filled')}</span>
        </div>
        <button class="mq-card__edit" data-id="${quiz.id}">
          <img src="img/edit.png" width="12" height="12" alt="" style="filter:invert(1)">
          ${t('edit')}
        </button>
      </div>
    `;
    card.addEventListener('click', e => {
      if (e.target.closest('.mq-card__edit') || e.target.closest('.mq-card__delete')) return;
      window.blitziqOpenStartModal(quiz);
    });
    card.querySelector('.mq-card__edit').addEventListener('click', () => openEditor(quiz.id));
    card.querySelector('.mq-card__delete').addEventListener('click', e => {
      e.stopPropagation();
      deleteQuiz(quiz.id);
    });
    return card;
  }

  function deleteQuiz(id) {
    quizzes = quizzes.filter(q => q.id !== id);
    saveQuizzes();
    renderMyQuizzes();
  }

  function setNavbarEditorMode(hidden) {
    const search = document.querySelector('.navbar-search');
    const newBtn = document.getElementById('btn-new-quiz');
    const bell = document.querySelector('.navbar-bell');
    [search, newBtn, bell].forEach(el => {
      if (!el) return;
      if (hidden) { el.classList.add('is-hidden'); }
      else { el.classList.remove('is-hidden'); el.style.display = ''; }
    });
  }

  window.blitziqOpenEditor = function(quizId) { openEditor(quizId); };

  function openEditor(quizId) {
    editorQuizId = quizId;
    currentQIndex = 0;
    const quiz = getQuiz(quizId);
    if (!quiz) return;
    switchSection('quizzes');
    setNavbarEditorMode(true);
    const section = document.getElementById('section-quizzes');
    section.innerHTML = buildEditorHTML(quiz);
    attachEditorEvents(quiz);
    renderQuestionList(quiz);
    loadQuestion(quiz, 0);
  }

  function closeEditor() {
    editorQuizId = null;
    setNavbarEditorMode(false);
    renderMyQuizzes();
    renderDiscoverCategories();
    syncToServer();
  }

  function buildEditorHTML(quiz) {
    const descBlock = quiz.description
      ? `<div class="qe-desc-banner">
           <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;opacity:0.6">
             <path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 2.5a.75.75 0 110 1.5.75.75 0 010-1.5zM6 6.5h2v3.5H6V6.5z" fill="currentColor"/>
           </svg>
           <span>${escapeHtml(quiz.description)}</span>
         </div>`
      : '';

    return `
      <div class="qe-wrap">
        <aside class="qe-sidebar">
          <div class="qe-sidebar__header">
            <button class="qe-back" id="qe-back">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              ${t('editor_back')}
            </button>
            <span class="qe-sidebar__title">${escapeHtml(quiz.name)}</span>
          </div>
          <div class="qe-q-list" id="qe-q-list"></div>
          <div class="qe-q-add-wrap" id="qe-q-add-wrap">
            <button class="qe-q-add-btn" id="qe-q-add" title="${t('editor_add_question')}" aria-label="${t('editor_add_question')}">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              ${t('editor_add_question')}
            </button>
          </div>
        </aside>
        <main class="qe-main">
          <div class="qe-topbar">
            <span class="qe-topbar__info" id="qe-q-label">${t('editor_q_of')} 1 ${t('editor_of')} ${quiz.questions.length}</span>
            <div class="qe-topbar__right">
              <div style="position:relative;display:inline-flex;">
                <button class="qe-save-btn" id="qe-folder-btn" style="border-radius:8px;">
                  <img src="img/folder.png" width="16" height="16" alt="">
                </button>
                <div class="qe-folder-dropdown" id="qe-folder-dropdown"></div>
              </div>
              <button class="qe-save-btn" id="qe-save">
                <img src="img/save.png" width="14" height="14" alt="">
                ${t('editor_save')}
              </button>
              <button class="qe-publish-btn" id="qe-publish">${t('editor_publish')}</button>
            </div>
          </div>
          <div class="qe-editor" id="qe-editor">
            ${descBlock}
            <div class="qe-field">
              <label class="qe-field__label">${t('editor_question_label')}</label>
              <textarea class="qe-field__input qe-field__input--textarea" id="qe-q-text" placeholder="${t('question_text_placeholder')}" rows="3"></textarea>
            </div>
            <div class="qe-meta-row">
              <div class="qe-field qe-field--small">
                <label class="qe-field__label">${t('time_sec')}</label>
                <input class="qe-field__input" id="qe-q-time" type="number" min="5" max="300">
              </div>
              <div class="qe-field qe-field--small">
                <label class="qe-field__label">${t('points')}</label>
                <input class="qe-field__input" id="qe-q-pts" type="number" min="1">
              </div>
              <div class="qe-field qe-field--small">
                <label class="qe-field__label">${t('type')}</label>
                <div class="qe-field__select-wrap" style="position:relative;">
                  <select class="qe-field__input" id="qe-q-type" style="padding-right:28px;cursor:pointer;appearance:none;">
                    <option value="single">${t('editor_option_single')}</option>
                    <option value="multi">${t('editor_option_multiple')}</option>
                    <option value="truefalse">${t('editor_option_truefalse')}</option>
                  </select>
                  <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:#6b7280;" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <div class="qe-divider"></div>
            <p class="qe-section-label">${t('editor_answers_label')} <span class="qe-section-hint">${t('editor_answers_hint')}</span></p>
            <div class="qe-answers" id="qe-answers"></div>
            <div class="qe-nav">
              <button class="qe-nav-btn" id="qe-prev">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                ${t('editor_prev')}
              </button>
              <button class="qe-nav-btn qe-nav-btn--primary" id="qe-next-q">
                ${t('editor_next_q')}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  function attachEditorEvents(quiz) {
    document.getElementById('qe-back')?.addEventListener('click', () => {
      saveCurrentQuestion(quiz);
      closeEditor();
    });
    document.getElementById('qe-save')?.addEventListener('click', () => {
      saveCurrentQuestion(quiz);
      showSaveToast();
    });

    const folderBtn = document.getElementById('qe-folder-btn');
    const folderDropdown = document.getElementById('qe-folder-dropdown');

    function renderFolderDropdown() {
      const folders = getFolders();
      if (!folders.length) {
        folderDropdown.innerHTML = `<div class="qe-folder-dropdown__empty">${t('editor_no_folders')}</div>`;
        return;
      }
      const currentFolders = quiz.folders || [];
      folderDropdown.innerHTML = folders.map((f, i) => `
        <button class="qe-folder-dropdown__item ${currentFolders.includes(i) ? 'is-active' : ''}" data-fi="${i}">
          <span class="qe-folder-dropdown__dot" style="background:${COLORS[i % COLORS.length]}"></span>
          ${escapeHtml(f.name)}
          ${currentFolders.includes(i) ? '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
        </button>
      `).join('');
      folderDropdown.querySelectorAll('.qe-folder-dropdown__item').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const fi = parseInt(btn.dataset.fi);
          if (!quiz.folders) quiz.folders = [];
          const idx = quiz.folders.indexOf(fi);
          if (idx === -1) { 
            quiz.folders.push(fi);
            btn.classList.add('is-active');
            btn.insertAdjacentHTML('beforeend', '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>');
          } else { 
            quiz.folders.splice(idx, 1);
            btn.classList.remove('is-active');
            btn.querySelector('svg')?.remove();
          }
          saveQuizzes();
        
          if (typeof window.blitziqRenderFolders === 'function') {
            window.blitziqRenderFolders();
          }
          const allQuizzesBtn = document.querySelector('.sidebar-item--active');
          if (allQuizzesBtn) {
            allQuizzesBtn.classList.add('is-expanded');
          }
          if (typeof window.blitziqUpdateFolderVisibility === 'function') {
            window.blitziqUpdateFolderVisibility();
          }
          const subList = document.querySelector(`.sidebar-folder-quizzes[data-fi="${fi}"]`);
          if (subList) subList.classList.add('is-open');
          const folderRow = document.querySelector(`.sidebar-folder[data-index="${fi}"]`);
          if (folderRow) folderRow.classList.add('is-expanded');
        
          setTimeout(() => {
            renderFolderDropdown();
            folderDropdown.classList.add('is-open');
          }, 0);
        });
      });
    }
    
    folderBtn?.addEventListener('click', e => {
      e.stopPropagation();
      renderFolderDropdown();
      folderDropdown.classList.toggle('is-open');
    });

    document.addEventListener('click', function closeFolderDropdown(e) {
      if (!folderBtn.contains(e.target) && !folderDropdown.contains(e.target)) {
        folderDropdown.classList.remove('is-open');
      }
    });

    document.getElementById('qe-publish')?.addEventListener('click', () => {
      saveCurrentQuestion(quiz);
      quiz.status = 'published';
      saveQuizzes();
      addNotification({ text: `"${quiz.name}" ${t('toast_published')}` });
      closeEditor();
    });
    document.getElementById('qe-prev')?.addEventListener('click', () => {
      saveCurrentQuestion(quiz);
      if (currentQIndex > 0) { currentQIndex--; renderQuestionList(quiz); loadQuestion(quiz, currentQIndex); }
    });
    document.getElementById('qe-next-q')?.addEventListener('click', () => {
      saveCurrentQuestion(quiz);
      if (currentQIndex < quiz.questions.length - 1) { currentQIndex++; renderQuestionList(quiz); loadQuestion(quiz, currentQIndex); }
    });
    document.getElementById('qe-q-add')?.addEventListener('click', () => {
      if (quiz.questions.length >= MAX_QUESTIONS) return;
      saveCurrentQuestion(quiz);
      const newQ = {
        index: quiz.questions.length,
        text: '',
        answers: Array.from({ length: quiz.answerCount }, () => ({ text: '', correct: false })),
        type: 'single',
        time: quiz.timePerQ,
        points: quiz.points,
      };
      newQ.answers[0].correct = true;
      quiz.questions.push(newQ);
      saveQuizzes();
      currentQIndex = quiz.questions.length - 1;
      renderQuestionList(quiz);
      loadQuestion(quiz, currentQIndex);
      updateAddQuestionBtn(quiz);
      const list = document.getElementById('qe-q-list');
      if (list) list.scrollTop = list.scrollHeight;
    });

    updateAddQuestionBtn(quiz);
  }

  function updateAddQuestionBtn(quiz) {
    const btn = document.getElementById('qe-q-add');
    if (!btn) return;
    const atMax = quiz.questions.length >= MAX_QUESTIONS;
    btn.disabled = atMax;
    btn.title = atMax ? t('max_questions_reached') : t('editor_add_question');
    btn.style.opacity = atMax ? '0.4' : '';
    btn.style.cursor = atMax ? 'not-allowed' : '';
    const topLabel = document.getElementById('qe-q-label');
    if (topLabel) topLabel.textContent = `${t('editor_q_of')} ${currentQIndex + 1} ${t('editor_of')} ${quiz.questions.length}`;
  }

  function showQuestionDeleteConfirm(itemEl, quiz, index) {
    if (itemEl.querySelector('.qe-q-delete-confirm')) return;
    itemEl.classList.add('is-confirming');

    const confirm = document.createElement('div');
    confirm.className = 'qe-q-delete-confirm';
    confirm.innerHTML = `
      <span class="qe-q-delete-confirm__text">${t('delete_confirm')}</span>
      <button class="qe-q-delete-confirm__yes">${t('yes')}</button>
      <button class="qe-q-delete-confirm__no">${t('no')}</button>
    `;
    itemEl.appendChild(confirm);
    requestAnimationFrame(() => confirm.classList.add('is-visible'));

    confirm.querySelector('.qe-q-delete-confirm__yes').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      itemEl.classList.add('is-removing');
      setTimeout(() => {
        quiz.questions.splice(index, 1);
        quiz.questions.forEach((q, i) => q.index = i);
        saveQuizzes();
        if (currentQIndex >= quiz.questions.length) {
          currentQIndex = Math.max(0, quiz.questions.length - 1);
        }
        if (quiz.questions.length === 0) {
          quiz.questions.push({
            index: 0, text: '',
            answers: Array.from({ length: quiz.answerCount }, () => ({ text: '', correct: false })),
            type: 'single', time: quiz.timePerQ, points: quiz.points,
          });
          quiz.questions[0].answers[0].correct = true;
          saveQuizzes();
          currentQIndex = 0;
        }
        renderQuestionList(quiz);
        loadQuestion(quiz, currentQIndex);
        updateAddQuestionBtn(quiz);
      }, 220);
    });

    confirm.querySelector('.qe-q-delete-confirm__no').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      confirm.classList.remove('is-visible');
      itemEl.classList.remove('is-confirming');
      setTimeout(() => confirm.remove(), 180);
    });

    function outsideClick(e) {
      if (!itemEl.contains(e.target)) {
        confirm.classList.remove('is-visible');
        itemEl.classList.remove('is-confirming');
        setTimeout(() => confirm.remove(), 180);
        document.removeEventListener('click', outsideClick);
      }
    }
    setTimeout(() => document.addEventListener('click', outsideClick), 0);
  }

  function renderQuestionList(quiz) {
    const list = document.getElementById('qe-q-list');
    if (!list) return;
    list.innerHTML = '';
    quiz.questions.forEach((q, i) => {
      const item = document.createElement('div');
      item.className = 'qe-q-item' + (i === currentQIndex ? ' is-active' : '');
      item.dataset.index = i;
      const filled = q.text.trim() !== '';
      item.innerHTML = `
        <span class="qe-q-item__num">${i + 1}</span>
        <span class="qe-q-item__text">${filled ? escapeHtml(q.text.substring(0, 40)) + (q.text.length > 40 ? '…' : '') : '<em>Empty</em>'}</span>
        <button class="qe-q-item__delete" data-index="${i}" aria-label="Delete question" title="Delete question">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </button>
        ${filled ? '<span class="qe-q-item__dot qe-q-item__dot--filled"></span>' : '<span class="qe-q-item__dot"></span>'}
      `;
      item.addEventListener('click', e => {
        if (e.target.closest('.qe-q-item__delete')) return;
        saveCurrentQuestion(quiz);
        currentQIndex = i;
        renderQuestionList(quiz);
        loadQuestion(quiz, i);
      });
      item.querySelector('.qe-q-item__delete').addEventListener('click', e => {
        e.stopPropagation();
        showQuestionDeleteConfirm(item, quiz, i);
      });
      list.appendChild(item);
    });
  }

  function loadQuestion(quiz, index) {
    const q = quiz.questions[index];
    if (!q) return;
    document.getElementById('qe-q-label').textContent = `${t('editor_q_of')} ${index + 1} ${t('editor_of')} ${quiz.questions.length}`;
    document.getElementById('qe-q-text').value = q.text || '';

    const timeInput = document.getElementById('qe-q-time');
    timeInput.value = Math.max(5, Math.min(300, q.time || quiz.timePerQ));
    timeInput.min = 5; timeInput.max = 300;
    timeInput.onchange = () => {
      let v = parseInt(timeInput.value);
      if (isNaN(v)) v = 5;
      timeInput.value = Math.max(5, Math.min(300, v));
    };

    const ptsInput = document.getElementById('qe-q-pts');
    ptsInput.value = Math.max(1, q.points || quiz.points);
    ptsInput.min = 1;
    ptsInput.onchange = () => {
      let v = parseInt(ptsInput.value);
      if (isNaN(v)) v = 1;
      ptsInput.value = Math.max(1, v);
    };

    const typeSelect = document.getElementById('qe-q-type');
    if (typeSelect) {
      typeSelect.value = q.type || 'single';
      const freshSelect = typeSelect.cloneNode(true);
      typeSelect.parentNode.replaceChild(freshSelect, typeSelect);
      freshSelect.value = q.type || 'single';
      freshSelect.addEventListener('change', () => {
        q.text = document.getElementById('qe-q-text').value;
        q.time = Math.max(5, Math.min(300, parseInt(document.getElementById('qe-q-time').value) || quiz.timePerQ));
        q.points = Math.max(1, parseInt(document.getElementById('qe-q-pts').value) || quiz.points);
        q.type = freshSelect.value;
        if (q.type === 'truefalse') {
          const prev = q.answers || [];
          q.answers = [
            { text: prev[0]?.text || 'True', correct: prev[0]?.correct || false },
            { text: prev[1]?.text || 'False', correct: prev[1]?.correct || false },
          ];
          if (!q.answers[0].correct && !q.answers[1].correct) q.answers[0].correct = true;
        } else {
          const prev = q.answers || [];
          const target = quiz.answerCount;
          const tfDefaults = ['True', 'False'];
          const cleaned = prev.map(a => ({ text: tfDefaults.includes(a.text) ? '' : a.text, correct: a.correct }));
          while (cleaned.length < target) cleaned.push({ text: '', correct: false });
          q.answers = cleaned.slice(0, target);
          if (q.type === 'single' && !q.answers.some(a => a.correct)) q.answers[0].correct = true;
        }
        saveQuizzes();
        loadQuestion(quiz, index);
      });
    }

    renderAnswerRows(quiz, q, index);

    const prevBtn = document.getElementById('qe-prev');
    const nextBtn = document.getElementById('qe-next-q');
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === quiz.questions.length - 1;
  }

  function renderAnswerRows(quiz, q, questionIndex) {
    const answersEl = document.getElementById('qe-answers');
    answersEl.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const isTF = q.type === 'truefalse';
    const answers = isTF ? q.answers.slice(0, 2) : q.answers;
    const canAdd = !isTF && answers.length < MAX_ANSWERS;
    const canRemove = !isTF && answers.length > MIN_ANSWERS;

    answers.forEach((ans, ai) => {
      const row = document.createElement('div');
      row.className = 'qe-answer-row' + (ans.correct ? ' is-correct' : '');
      row.innerHTML = `
        <button class="qe-answer-correct" data-ai="${ai}" aria-label="Mark correct" title="Mark as correct">
          <img src="${ans.correct ? 'img/correct.png' : 'img/correct-empty.png'}" width="16" height="16" alt="" class="qe-correct-img">
        </button>
        <span class="qe-answer-letter">${letters[ai]}</span>
        <input class="qe-answer-input" type="text" placeholder="${isTF ? (ai === 0 ? 'True' : 'False') : t('editor_answer_placeholder') + ' ' + letters[ai] + '...'}" value="${escapeHtml(ans.text)}" data-ai="${ai}">
        ${canRemove ? `
        <button class="qe-answer-remove" data-ai="${ai}" aria-label="Remove answer" title="Remove answer">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>` : ''}
      `;

      row.querySelector('.qe-answer-correct').addEventListener('click', () => {
        q.text = document.getElementById('qe-q-text').value;
        q.time = Math.max(5, Math.min(300, parseInt(document.getElementById('qe-q-time').value) || quiz.timePerQ));
        q.points = Math.max(1, parseInt(document.getElementById('qe-q-pts').value) || quiz.points);
        if (q.type === 'single' || q.type === 'truefalse') {
          q.answers.forEach(a => a.correct = false);
        }
        q.answers[ai].correct = !q.answers[ai].correct;
        if ((q.type === 'single' || q.type === 'truefalse') && !q.answers.some(a => a.correct)) {
          q.answers[ai].correct = true;
        }
        saveQuizzes();
        renderAnswerRows(quiz, q, questionIndex);
      });

      row.querySelector('.qe-answer-input').addEventListener('input', e => {
        q.answers[ai].text = e.target.value;
      });

      if (canRemove) {
        row.querySelector('.qe-answer-remove').addEventListener('click', e => {
          e.stopPropagation();
          syncAnswerTexts(q);
          q.answers.splice(ai, 1);
          if (q.type === 'single' && !q.answers.some(a => a.correct)) q.answers[0].correct = true;
          saveQuizzes();
          renderAnswerRows(quiz, q, questionIndex);
        });
      }

      answersEl.appendChild(row);
    });

    if (!isTF) {
      const addRow = document.createElement('div');
      addRow.className = 'qe-answer-add-row';
      addRow.innerHTML = `
        <button class="qe-answer-add-btn" id="qe-answer-add" ${!canAdd ? 'disabled' : ''} title="${!canAdd ? t('max_answers') : t('editor_add_answer')}">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          ${!canAdd ? `${t('editor_add_answer')} (${t('editor_max_answers')} ${MAX_ANSWERS})` : `${t('editor_add_answer')} (${answers.length}/${MAX_ANSWERS})`}
        </button>
      `;
      if (canAdd) {
        addRow.querySelector('#qe-answer-add').addEventListener('click', () => {
          syncAnswerTexts(q);
          q.answers.push({ text: '', correct: false });
          saveQuizzes();
          renderAnswerRows(quiz, q, questionIndex);
          setTimeout(() => {
            const inputs = document.querySelectorAll('.qe-answer-input');
            inputs[inputs.length - 1]?.focus();
          }, 30);
        });
      }
      answersEl.appendChild(addRow);
    }
  }

  function syncAnswerTexts(q) {
    document.querySelectorAll('.qe-answer-input').forEach((input, i) => {
      if (q.answers[i]) q.answers[i].text = input.value;
    });
  }

  function saveCurrentQuestion(quiz) {
    const q = quiz.questions[currentQIndex];
    if (!q) return;
    q.text = document.getElementById('qe-q-text')?.value || '';
    q.time = Math.max(5, Math.min(300, parseInt(document.getElementById('qe-q-time')?.value) || quiz.timePerQ));
    q.points = Math.max(1, parseInt(document.getElementById('qe-q-pts')?.value) || quiz.points);
    const typeSelect = document.getElementById('qe-q-type');
    if (typeSelect) q.type = typeSelect.value;
    syncAnswerTexts(q);
    saveQuizzes();
    renderQuestionList(quiz);
  }

  function showSaveToast() {
    if (typeof showToast === 'function') {
      showToast(t('toast_saved'));
    } else {
      console.log('Quiz saved');
      const saveBtn = document.getElementById('qe-save');
      if (saveBtn) {
        const originalBg = saveBtn.style.background;
        saveBtn.style.background = '#10b981';
        setTimeout(() => { saveBtn.style.background = originalBg; }, 500);
      }
    }
  }

  function switchSection(id) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('is-active'));
    document.querySelectorAll('.navbar-links a[data-section]').forEach(l => l.classList.remove('active'));
    const target = document.getElementById('section-' + id);
    if (target) target.classList.add('is-active');
    const link = document.querySelector(`.navbar-links a[data-section="${id}"]`);
    if (link) link.classList.add('active');
    history.replaceState(null, '', '#' + id);
  }
  window.blitziqSwitchSection = switchSection;

  renderMyQuizzes();
})();