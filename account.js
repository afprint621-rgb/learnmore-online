import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const isConfigured = !SUPABASE_URL.includes('YOUR-PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR_');
const notice = document.querySelector('#account-notice');
const childForm = document.querySelector('#child-form');
const childrenList = document.querySelector('#children-list');
const emptyState = document.querySelector('#empty-state');
const childCount = document.querySelector('#child-count');
const welcome = document.querySelector('#welcome');
const emailLabel = document.querySelector('#account-email');
const profileForm = document.querySelector('#profile-form');
const signOutButton = document.querySelector('#sign-out');

function showNotice(text, kind = 'info') {
  notice.textContent = text;
  notice.className = `notice notice-${kind}`;
  notice.hidden = false;
}

function renderChildren(children) {
  childrenList.replaceChildren();
  childCount.textContent = `${children.length} / 2`;
  emptyState.hidden = children.length > 0;
  childForm.hidden = children.length >= 2;

  for (const child of children) {
    const row = document.createElement('article');
    row.className = 'child-item';
    const details = document.createElement('div');
    details.className = 'child-main';
    const name = document.createElement('strong');
    name.textContent = child.first_name;
    const detail = document.createElement('small');
    detail.textContent = `${child.grade} · ${child.preferred_language}`;
    details.append(name, detail);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-child';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove learner profile ${child.first_name}`);
    remove.addEventListener('click', async () => {
      if (!window.confirm(`Remove the learner profile for ${child.first_name}?`)) return;
      const { error } = await supabase.from('child_profiles').delete().eq('id', child.id);
      if (error) return showNotice(error.message, 'error');
      showNotice('Learner profile removed.', 'success');
      await loadChildren();
    });
    row.append(details, remove);
    childrenList.append(row);
  }
}

let supabase;
let parentProfile;

async function ensureParentProfile(user) {
  const { data: existing, error: findError } = await supabase
    .from('parent_profiles').select('id, guardian_name').eq('user_id', user.id).maybeSingle();
  if (findError) throw findError;
  if (existing) return existing;

  const guardianName = String(user.user_metadata?.guardian_name || '').trim() || 'Parent or guardian';
  const { data, error } = await supabase.from('parent_profiles')
    .insert({ user_id: user.id, guardian_name: guardianName })
    .select('id, guardian_name').single();
  if (error) throw error;
  return data;
}

async function loadChildren() {
  const { data, error } = await supabase.from('child_profiles')
    .select('id, first_name, grade, preferred_language, created_at')
    .eq('parent_id', parentProfile.id).order('created_at', { ascending: true });
  if (error) throw error;
  renderChildren(data || []);
}

if (!isConfigured) {
  childForm.hidden = true;
  profileForm.hidden = true;
  showNotice('Account setup is not connected. Follow AUTH_SETUP.md before using this page.', 'error');
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
  });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.replace('auth.html');
    } else {
      const user = session.user;
      parentProfile = await ensureParentProfile(user);
      welcome.textContent = `Welcome, ${parentProfile.guardian_name}`;
      emailLabel.textContent = user.email || '';
      profileForm.elements.guardianName.value = parentProfile.guardian_name;
      await loadChildren();
    }
  } catch (error) {
    showNotice(error.message || 'Could not load the family account.', 'error');
  }

  childForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = childForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    const values = new FormData(childForm);
    const firstName = String(values.get('firstName')).trim();
    if (!firstName || !parentProfile) {
      submit.disabled = false;
      return showNotice('Sign in before adding a learner.', 'error');
    }
    const { error } = await supabase.from('child_profiles').insert({
      parent_id: parentProfile.id,
      first_name: firstName,
      grade: String(values.get('grade')),
      preferred_language: String(values.get('language'))
    });
    submit.disabled = false;
    if (error) return showNotice(error.message.includes('maximum of two') ? 'Each parent account can have up to two learner profiles.' : error.message, 'error');
    childForm.reset();
    showNotice('Learner profile added.', 'success');
    try { await loadChildren(); } catch (loadError) { showNotice(loadError.message, 'error'); }
  });

  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!parentProfile) return showNotice('Sign in before changing account details.', 'error');
    const guardianName = profileForm.elements.guardianName.value.trim();
    const { data, error } = await supabase.from('parent_profiles').update({ guardian_name: guardianName })
      .eq('id', parentProfile.id).select('id, guardian_name').single();
    if (error) return showNotice(error.message, 'error');
    parentProfile = data;
    welcome.textContent = `Welcome, ${data.guardian_name}`;
    showNotice('Account name saved.', 'success');
  });

  signOutButton.addEventListener('click', async () => {
    signOutButton.disabled = true;
    const { error } = await supabase.auth.signOut();
    if (error) {
      signOutButton.disabled = false;
      return showNotice(error.message, 'error');
    }
    window.location.assign('auth.html');
  });
}
