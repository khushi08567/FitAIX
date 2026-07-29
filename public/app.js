const state = { email: '', otp: '' };
const forms = {
  email: document.querySelector('#email-form'),
  otp: document.querySelector('#otp-form'),
  password: document.querySelector('#password-form'),
};
const notice = document.querySelector('#notice');
const complete = document.querySelector('#complete');
const progress = [...document.querySelectorAll('.progress li')];

function showStep(name) {
  Object.entries(forms).forEach(([key, form]) => { form.hidden = key !== name; });
  complete.hidden = true;
  const index = ['email', 'otp', 'password'].indexOf(name);
  progress.forEach((item, itemIndex) => item.classList.toggle('active', itemIndex <= index));
  notice.textContent = '';
}

function message(text, type = 'info') {
  notice.textContent = text;
  notice.dataset.type = type;
}

async function request(path, payload) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.success) throw new Error(body.message || 'Something went wrong. Please try again.');
  return body;
}

function setSubmitting(form, isSubmitting) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = isSubmitting;
  button.dataset.label ??= button.textContent;
  button.textContent = isSubmitting ? 'Please wait…' : button.dataset.label;
}

forms.email.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = new FormData(forms.email).get('email').trim().toLowerCase();
  setSubmitting(forms.email, true);
  try {
    const result = await request('/api/auth/forgot-password', { email });
    state.email = email;
    showStep('otp');
    message(result.message, 'success');
    document.querySelector('#otp').focus();
  } catch (error) { message(error.message, 'error'); }
  finally { setSubmitting(forms.email, false); }
});

forms.otp.addEventListener('submit', async (event) => {
  event.preventDefault();
  const otp = new FormData(forms.otp).get('otp').trim();
  setSubmitting(forms.otp, true);
  try {
    const result = await request('/api/auth/verify-reset-otp', { email: state.email, otp });
    state.otp = otp;
    showStep('password');
    message(result.message, 'success');
    document.querySelector('#new-password').focus();
  } catch (error) { message(error.message, 'error'); }
  finally { setSubmitting(forms.otp, false); }
});

forms.password.addEventListener('submit', async (event) => {
  event.preventDefault();
  const newPassword = new FormData(forms.password).get('new-password');
  const confirmation = new FormData(forms.password).get('confirm-password');
  if (newPassword !== confirmation) return message('The passwords do not match.', 'error');
  setSubmitting(forms.password, true);
  try {
    await request('/api/auth/reset-password', { email: state.email, otp: state.otp, newPassword });
    Object.values(forms).forEach((form) => form.hidden = true);
    complete.hidden = false;
    progress.forEach((item) => item.classList.add('active'));
    notice.textContent = '';
  } catch (error) { message(error.message, 'error'); }
  finally { setSubmitting(forms.password, false); }
});

document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => showStep(button.dataset.back)));
document.querySelector('#restart').addEventListener('click', () => {
  state.email = ''; state.otp = '';
  forms.email.reset(); forms.otp.reset(); forms.password.reset();
  showStep('email');
  document.querySelector('#email').focus();
});
