/* Email handoff until a server-side form delivery service is connected. */
(function () {
  'use strict';
  document.querySelectorAll('form[data-email-handoff]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var newsletter = form.getAttribute('name') === 'newsletter';
      var fields = [];
      new FormData(form).forEach(function (value, key) {
        fields.push(key.replace(/-/g, ' ') + ': ' + String(value));
      });
      var subject = newsletter ? 'Marketing updates inquiry' : 'Free strategy call inquiry';
      var body = (newsletter ? 'Please send me information about your marketing updates.\n\n' : 'I would like to discuss my business and arrange a strategy call.\n\n') + fields.join('\n');
      var status = form.querySelector('[role="status"]');
      if (status) status.textContent = 'Your request has not been sent yet. Review and send it in your email app. If no app opens, email hello@strategicmarketingadvisors.com or call 877-355-8745.';
      window.location.href = 'mailto:hello@strategicmarketingadvisors.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  });
})();
