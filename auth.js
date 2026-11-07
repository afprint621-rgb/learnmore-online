import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const isConfigured = !SUPABASE_URL.includes('YOUR-PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR_');
const setupNotice = document.querySelector('#setup-notice');
const message = document.querySelector('#message');
const loginForm = document.querySelector('#login-panel');
const signupForm = document.querySelector('#signup-panel');
const loginTab = document.querySelector('#login-tab');
const signupTab = document.querySelector('#signup-tab');

function showMessage(text, kind = 'error') {
  message.textContent = text;
  message.className = `notice notice-${kind}`;
  message.hidden = false;
}

function setBusy(form, busy) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = busy;
  button.textContent = busy ? 'Please wait…' : form === loginForm ? 'Sign in' : 'Create account';
}

function selectTab(tab) {
  const loginSelected = tab === 'login';
  loginForm.hidden = !loginSelected;
  signupForm.hidden = loginSelected;
  loginTab.classList.toggle('active', loginSelected);
  signupTab.classList.toggle('active', !loginSelected);
  loginTab.setAttribute('aria-selected', String(loginSelected));
  signupTab.setAttribute('aria-selected', String(!loginSelected));
  message.hidden = true;
}

loginTab.addEventListener('click', () => selectTab('login'));
signupTab.addEventListener('click', () => selectTab('signup'));

if (isConfigured) {
  setupNotice.hidden = true;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
  });

  const { data: { session } } = await supabase.auth.getSession();
  if (session) window.location.replace('account.html');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setBusy(loginForm, true);
    const values = new FormData(loginForm);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(values.get('email')).trim(),
      password: String(values.get('password'))
    });
    setBusy(loginForm, false);
    if (error) return showMessage(error.message);
    window.location.assign('account.html');
  });

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setBusy(signupForm, true);
    const values = new FormData(signupForm);
    const guardianName = String(values.get('guardianName')).trim();
    const email = String(values.get('email')).trim();
    const password = String(values.get('password'));
    if (password.length < 10) {
      setBusy(signupForm, false);
      return showMessage('Choose a password with at least 10 characters.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { guardian_name: guardianName },
        emailRedirectTo: new URL('account.html', window.location.href).href
      }
    });
    setBusy(signupForm, false);
    if (error) return showMessage(error.message);
    if (data.session) {
      window.location.assign('account.html');
      return;
    }
    showMessage('Check your email for a confirmation link. After confirming, return here and sign in to finish setting up your account.', 'success');
  });
} else {
  for (const form of [loginForm, signupForm]) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      showMessage('Account sign-in is not connected yet. Complete the Supabase setup guide before entering real credentials.');
    });
  }
}
