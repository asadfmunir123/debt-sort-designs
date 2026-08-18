(function () {
  'use strict';

  var CTA_LABEL = 'See my options';

  var steps = [
    {
      key: 'debt', type: 'choice',
      q: 'Roughly how much do you owe altogether?',
      sub: 'Include things like loans, credit cards, overdrafts and catalogue accounts. An estimate is fine - you do not need exact figures.',
      options: [
        { label: 'Less than £5,000', value: 'Under £5,000' },
        { label: '£5,000 to £10,000', value: '£5,000–£10,000' },
        { label: '£10,000 to £20,000', value: '£10,000–£20,000' },
        { label: '£20,000 to £30,000', value: '£20,000–£30,000' },
        { label: 'More than £30,000', value: '£30,000+' }
      ]
    },
    {
      key: 'count', type: 'choice',
      q: 'About how many debts do you have?',
      sub: 'A rough count is fine. We can go through the details with you later.',
      options: [
        { label: '1 to 2 debts', value: '1–2' },
        { label: '3 to 5 debts', value: '3–5' },
        { label: '6 to 10 debts', value: '6–10' },
        { label: 'More than 10 debts', value: '10+' }
      ]
    },
    {
      key: 'work', type: 'choice',
      q: 'What is your work situation at the moment?',
      sub: 'This helps us understand your circumstances and the support that may be suitable.',
      options: [
        { label: 'Employed', value: 'Employed' },
        { label: 'Self-employed', value: 'Self-employed' },
        { label: 'Not currently working', value: 'Not working' },
        { label: 'Retired', value: 'Retired' },
        { label: 'Something else', value: 'Other' }
      ]
    },
    {
      key: 'details', type: 'form',
      q: 'How would you like us to contact you?',
      sub: 'Share your details and a friendly adviser will contact you to talk things through. There is no pressure to make a decision.'
    }
  ];

  var faqData = [
    { q: 'Is it free to make an enquiry?', a: 'Yes. Completing the form and having an initial conversation about your situation is free.' },
    { q: 'Do I need to know exactly how much I owe?', a: 'No. A rough estimate is enough to get started. We can help you work through the details later.' },
    { q: 'Will submitting the form affect my credit score?', a: 'No. Sending an enquiry does not itself affect your credit score. If a particular debt solution may affect your credit file, this should be explained to you before you decide whether to proceed.' },
    { q: 'Will I be pressured into a solution?', a: 'No. The first conversation is about understanding your situation and explaining possible next steps. You can take time to decide what is right for you.' },
    { q: 'Can you guarantee that my debts will be written off or reduced?', a: 'No. Every situation is different. The options available, fees, outcomes and any effect on your credit rating depend on your circumstances and will be explained clearly before you make a decision.' }
  ];

  var state = {
    step: 0,
    done: false,
    answers: { name: '', email: '', phone: '', consent: false }
  };
  var faqOpen = 0;

  function $(id) { return document.getElementById(id); }

  function canSubmit() {
    var a = state.answers;
    return !!(a.name.trim() && a.email.trim() && a.phone.trim() && a.consent);
  }

  function renderQuiz() {
    var total = steps.length;
    var step = steps[state.step] || steps[0];
    var a = state.answers;

    var stepView = $('quiz-step-view');
    var doneView = $('quiz-done-view');
    if (state.done) {
      stepView.style.display = 'none';
      doneView.style.display = 'block';
      $('quiz-done-title').textContent = 'Thanks, ' + (a.name.trim().split(' ')[0] || 'friend') + " - we've received your enquiry.";
      $('quiz-sum-debt').textContent = a.debt || '-';
      $('quiz-sum-count').textContent = a.count || '-';
      $('quiz-sum-work').textContent = a.work || '-';
      return;
    }
    stepView.style.display = 'block';
    doneView.style.display = 'none';

    var pct = Math.round((state.step / total) * 100) + 12;
    $('quiz-progress-fill').style.width = pct + '%';
    $('quiz-step-meta').textContent = 'Step ' + (state.step + 1) + ' of ' + total;
    $('quiz-question').textContent = step.q;
    $('quiz-sub').textContent = step.sub;

    var isChoice = step.type === 'choice';
    var isForm = step.type === 'form';

    var optionsWrap = $('quiz-options-wrap');
    var formWrap = $('quiz-form-wrap');
    optionsWrap.style.display = isChoice ? 'flex' : 'none';
    formWrap.style.display = isForm ? 'flex' : 'none';

    if (isChoice) {
      optionsWrap.innerHTML = '';
      step.options.forEach(function (opt) {
        var selected = a[step.key] === opt.value;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'q-option' + (selected ? ' selected' : '');
        btn.innerHTML =
          '<span class="q-option-dot"><span class="q-option-dot-inner"></span></span>' +
          '<span class="q-option-label-wrap">' +
          '<span class="q-option-label"></span>' +
          '<span class="q-option-sub"></span>' +
          '</span>';
        btn.querySelector('.q-option-label').textContent = opt.label;
        btn.querySelector('.q-option-sub').textContent = opt.sub || '';
        btn.addEventListener('click', function () { pick(step.key, opt.value); });
        optionsWrap.appendChild(btn);
      });
    }

    if (isForm) {
      $('quiz-name').value = a.name;
      $('quiz-email').value = a.email;
      $('quiz-phone').value = a.phone;
      $('quiz-consent').checked = a.consent;
      var submitBtn = $('quiz-submit');
      var enabled = canSubmit();
      submitBtn.disabled = !enabled;
      submitBtn.className = 'q-submit' + (enabled ? ' enabled' : '');
      submitBtn.textContent = CTA_LABEL;
    }

    $('quiz-back').style.display = state.step > 0 ? 'block' : 'none';
  }

  function pick(key, value) {
    state.answers[key] = value;
    state.step = Math.min(state.step + 1, steps.length - 1);
    renderQuiz();
  }

  function back() {
    state.step = Math.max(0, state.step - 1);
    state.done = false;
    renderQuiz();
  }

  function restart() {
    state.step = 0;
    state.done = false;
    state.answers = { name: '', email: '', phone: '', consent: false };
    renderQuiz();
  }

  function submit() {
    var a = state.answers;
    var parts = (a.name || '').trim().split(' ').filter(Boolean);
    var first = parts.shift() || '';
    var last = parts.join(' ') || first;
    var setVal = function (id, val) { var el = $(id); if (el) el.value = val; };
    setVal('flg-firstname', first);
    setVal('flg-lastname', last);
    setVal('flg-phone', a.phone || '');
    setVal('flg-email', a.email || '');
    setVal('flg-debt', a.debt || '');
    setVal('flg-count', a.count || '');
    setVal('flg-work', a.work || '');
    var dpa = a.consent ? '1' : '2';
    setVal('flg-dpa-phone', dpa);
    setVal('flg-dpa-sms', dpa);
    setVal('flg-dpa-email', dpa);
    setVal('flg-dpa-mail', dpa);
    var flgForm = $('flg-form');
    if (flgForm) flgForm.submit();
    state.done = true;
    renderQuiz();
  }

  function renderFaq() {
    var list = $('faq-list');
    list.innerHTML = '';
    faqData.forEach(function (f, i) {
      var open = faqOpen === i;
      var item = document.createElement('div');
      item.style.cssText = 'background:#FFFFFF; border:1px solid #E3E6E2; border-radius:16px; overflow:hidden;';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = "width:100%; text-align:left; background:none; border:none; padding:20px 24px; display:flex; justify-content:space-between; align-items:center; gap:16px; cursor:pointer; font:600 18px 'Figtree'; color:#16211D;";
      var qSpan = document.createElement('span');
      qSpan.textContent = f.q;
      var iconSpan = document.createElement('span');
      iconSpan.className = 'faq-icon' + (open ? ' open' : '');
      iconSpan.textContent = '+';
      btn.appendChild(qSpan);
      btn.appendChild(iconSpan);
      btn.addEventListener('click', function () {
        faqOpen = faqOpen === i ? null : i;
        renderFaq();
      });
      item.appendChild(btn);

      if (open) {
        var p = document.createElement('p');
        p.style.cssText = 'margin:0; padding:0 24px 22px; color:#5C6C66; line-height:1.6; font-size:16px;';
        p.textContent = f.a;
        item.appendChild(p);
      }

      list.appendChild(item);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('quiz-name').addEventListener('input', function (e) { state.answers.name = e.target.value; renderQuiz(); });
    $('quiz-email').addEventListener('input', function (e) { state.answers.email = e.target.value; renderQuiz(); });
    $('quiz-phone').addEventListener('input', function (e) { state.answers.phone = e.target.value; renderQuiz(); });
    $('quiz-consent').addEventListener('change', function (e) { state.answers.consent = e.target.checked; renderQuiz(); });
    $('quiz-submit').addEventListener('click', submit);
    $('quiz-back').addEventListener('click', back);
    $('quiz-restart').addEventListener('click', restart);

    renderQuiz();
    renderFaq();
  });
})();
