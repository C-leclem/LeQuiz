// ═══════════════════════════════════════════════════════════════════════════
// LEQUIZ — Module partagé d'authentification et de classement Supabase
// ═══════════════════════════════════════════════════════════════════════════
// À inclure dans chaque page via :
//   <script type="module" src="lequiz-auth.js"></script>
//
// ⚠️ AVANT UTILISATION : remplacer SUPABASE_URL et SUPABASE_ANON_KEY
//    par tes propres identifiants (trouvables dans Supabase > Project Settings
//    > API). La clé "anon" est publique, c'est normal — la sécurité est
//    assurée par la Row Level Security (RLS) définie dans le schéma SQL.
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ───────────────────────────────────────────────────────────────────────────
// CONFIGURATION — À MODIFIER
// ───────────────────────────────────────────────────────────────────────────
const SUPABASE_URL      = 'https://TON-PROJET.supabase.co';
const SUPABASE_ANON_KEY = 'TA_CLE_ANON_ICI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ───────────────────────────────────────────────────────────────────────────
// STYLES DE LA MODAL (injectés dynamiquement, cohérents avec l'aesthetic)
// ───────────────────────────────────────────────────────────────────────────
const MODAL_STYLES = `
  .lq-auth-overlay {
    position: fixed; inset: 0; background: rgba(10,8,4,0.85);
    backdrop-filter: blur(8px); z-index: 10000;
    display: none; align-items: center; justify-content: center;
    padding: 20px; animation: lqFadeIn 0.3s ease;
  }
  .lq-auth-overlay.show { display: flex; }
  @keyframes lqFadeIn { from{opacity:0} to{opacity:1} }

  .lq-auth-modal {
    background: #141008;
    border: 1px solid rgba(201,168,76,0.3);
    box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(201,168,76,0.1);
    max-width: 440px; width: 100%;
    padding: 44px 36px 36px;
    position: relative;
    font-family: 'Cormorant Garamond', serif;
    color: #f7f0e0;
    animation: lqSlideUp 0.4s cubic-bezier(.2,.8,.2,1);
  }
  @keyframes lqSlideUp {
    from { opacity:0; transform: translateY(30px); }
    to   { opacity:1; transform: translateY(0); }
  }

  .lq-auth-close {
    position: absolute; top: 14px; right: 18px;
    background: none; border: none; color: #6b6050;
    font-size: 1.4rem; cursor: pointer; line-height: 1;
    transition: color .2s;
  }
  .lq-auth-close:hover { color: #c9a84c; }

  .lq-auth-header {
    text-align: center; margin-bottom: 28px;
  }
  .lq-auth-star { color: #c9a84c; font-size: 1rem; letter-spacing: 1em; }
  .lq-auth-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem; font-weight: 700; color: #f5e4b0;
    letter-spacing: 0.04em; margin-top: 6px;
  }
  .lq-auth-subtitle {
    font-family: 'Oswald', sans-serif; font-weight: 300;
    font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: #c9a84c; margin-top: 4px;
  }

  .lq-auth-tabs {
    display: flex; border-bottom: 1px solid rgba(201,168,76,0.2);
    margin-bottom: 24px;
  }
  .lq-auth-tab {
    flex: 1; background: none; border: none; padding: 12px;
    font-family: 'Oswald', sans-serif; font-weight: 300;
    font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: #6b6050; cursor: pointer; transition: all .3s;
    border-bottom: 2px solid transparent;
  }
  .lq-auth-tab.active { color: #e8c870; border-bottom-color: #c9a84c; }

  .lq-auth-field { margin-bottom: 16px; }
  .lq-auth-label {
    display: block;
    font-family: 'Oswald', sans-serif; font-weight: 300;
    font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: #c9a84c; margin-bottom: 6px;
  }
  .lq-auth-input {
    width: 100%; padding: 11px 14px;
    background: #0a0804;
    border: 1px solid rgba(201,168,76,0.25);
    color: #f7f0e0;
    font-family: 'Cormorant Garamond', serif; font-size: 1.05rem;
    transition: border-color .2s;
  }
  .lq-auth-input:focus {
    outline: none; border-color: #c9a84c;
  }

  .lq-auth-submit {
    width: 100%; margin-top: 12px; padding: 13px;
    background: #c9a84c; color: #0a0804; border: none;
    font-family: 'Oswald', sans-serif; font-weight: 500;
    font-size: 0.85rem; letter-spacing: 0.3em; text-transform: uppercase;
    cursor: pointer; transition: background .2s, letter-spacing .3s;
  }
  .lq-auth-submit:hover:not(:disabled) {
    background: #e8c870; letter-spacing: 0.35em;
  }
  .lq-auth-submit:disabled { opacity: 0.5; cursor: wait; }

  .lq-auth-message {
    margin-top: 14px; padding: 10px 14px; font-size: 0.9rem;
    font-style: italic; text-align: center;
    border-left: 2px solid;
  }
  .lq-auth-message.error {
    background: rgba(139,26,26,0.15);
    border-color: #8b1a1a; color: #ffb4b4;
  }
  .lq-auth-message.success {
    background: rgba(42,107,58,0.15);
    border-color: #2a6b3a; color: #aaf0bc;
  }
  .lq-auth-message.hidden { display: none; }

  .lq-auth-help {
    text-align: center; font-size: 0.85rem; font-style: italic;
    color: rgba(247,240,224,0.5); margin-top: 18px; line-height: 1.5;
  }

  /* Bouton du badge utilisateur en haut de page */
  .lq-user-badge {
    font-family: 'Oswald', sans-serif; font-weight: 300;
    font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: #c9a84c;
    background: rgba(201,168,76,0.08);
    border: 1px solid rgba(201,168,76,0.3);
    padding: 8px 16px; cursor: pointer;
    transition: all .2s;
    text-decoration: none; display: inline-flex; align-items: center; gap: 10px;
  }
  .lq-user-badge:hover {
    background: rgba(201,168,76,0.15); color: #e8c870;
  }
  .lq-user-badge .dot {
    width: 6px; height: 6px; border-radius: 50%; background: #c9a84c;
  }
`;

// ───────────────────────────────────────────────────────────────────────────
// INJECTION DU HTML DE LA MODAL
// ───────────────────────────────────────────────────────────────────────────
function injectModal() {
  if (document.getElementById('lq-auth-overlay')) return;

  const styleEl = document.createElement('style');
  styleEl.textContent = MODAL_STYLES;
  document.head.appendChild(styleEl);

  const overlay = document.createElement('div');
  overlay.className = 'lq-auth-overlay';
  overlay.id = 'lq-auth-overlay';
  overlay.innerHTML = `
    <div class="lq-auth-modal" role="dialog" aria-modal="true">
      <button class="lq-auth-close" id="lq-auth-close" aria-label="Fermer">✕</button>

      <div class="lq-auth-header">
        <div class="lq-auth-star">✦ ✦ ✦</div>
        <div class="lq-auth-title">LeQuiz</div>
        <div class="lq-auth-subtitle">Accès réservé</div>
      </div>

      <div class="lq-auth-tabs">
        <button class="lq-auth-tab active" data-tab="signin">Connexion</button>
        <button class="lq-auth-tab" data-tab="signup">Inscription</button>
      </div>

      <form id="lq-auth-form">
        <div class="lq-auth-field" id="lq-field-username">
          <label class="lq-auth-label" for="lq-username">Pseudo</label>
          <input class="lq-auth-input" type="text" id="lq-username"
                 autocomplete="username" minlength="3" maxlength="20"
                 pattern="[a-zA-Z0-9_-]+"
                 placeholder="3 à 20 caractères">
        </div>

        <div class="lq-auth-field">
          <label class="lq-auth-label" for="lq-email">Email</label>
          <input class="lq-auth-input" type="email" id="lq-email"
                 autocomplete="email" required placeholder="vous@exemple.fr">
        </div>

        <div class="lq-auth-field">
          <label class="lq-auth-label" for="lq-password">Mot de passe</label>
          <input class="lq-auth-input" type="password" id="lq-password"
                 autocomplete="current-password" minlength="6" required
                 placeholder="6 caractères minimum">
        </div>

        <button type="submit" class="lq-auth-submit" id="lq-auth-submit">
          Se connecter
        </button>

        <div class="lq-auth-message hidden" id="lq-auth-message"></div>
      </form>

      <div class="lq-auth-help" id="lq-auth-help">
        Votre pseudo sera affiché dans le classement public.<br>
        Il ne pourra pas être modifié par la suite.
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // ─── Gestion des onglets ────────────────────────────────────────────────
  let mode = 'signin';
  const tabs        = overlay.querySelectorAll('.lq-auth-tab');
  const fieldUser   = overlay.querySelector('#lq-field-username');
  const submitBtn   = overlay.querySelector('#lq-auth-submit');
  const helpEl      = overlay.querySelector('#lq-auth-help');
  const msgEl       = overlay.querySelector('#lq-auth-message');
  const form        = overlay.querySelector('#lq-auth-form');
  const usernameEl  = overlay.querySelector('#lq-username');
  const emailEl     = overlay.querySelector('#lq-email');
  const passwordEl  = overlay.querySelector('#lq-password');

  function setMode(newMode) {
    mode = newMode;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === newMode));
    fieldUser.style.display = newMode === 'signup' ? '' : 'none';
    usernameEl.required = newMode === 'signup';
    submitBtn.textContent = newMode === 'signup' ? 'Créer mon compte' : 'Se connecter';
    helpEl.style.display = newMode === 'signup' ? '' : 'none';
    passwordEl.autocomplete = newMode === 'signup' ? 'new-password' : 'current-password';
    msgEl.classList.add('hidden');
  }
  setMode('signin');
  tabs.forEach(t => t.addEventListener('click', () => setMode(t.dataset.tab)));

  // ─── Fermeture ──────────────────────────────────────────────────────────
  overlay.querySelector('#lq-auth-close').addEventListener('click', hideAuthModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideAuthModal();
  });

  // ─── Soumission ─────────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgEl.classList.add('hidden');
    submitBtn.disabled = true;

    try {
      if (mode === 'signup') {
        const user = await signUp(usernameEl.value.trim(), emailEl.value.trim(), passwordEl.value);
        // Vérifier si la session est active (confirmation email désactivée)
        // ou si une confirmation est nécessaire
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          showMessage('Compte créé et connecté !', 'success');
          setTimeout(() => {
            hideAuthModal();
            if (_onAuthSuccess) _onAuthSuccess();
          }, 600);
        } else {
          showMessage('Compte créé ! Un email de confirmation vous a été envoyé. Cliquez sur le lien, puis revenez ici pour vous connecter.', 'success');
          // Ne pas fermer la modal, l'utilisateur doit confirmer puis se reconnecter
          setTimeout(() => { setMode('signin'); }, 2500);
        }
      } else {
        await signIn(emailEl.value.trim(), passwordEl.value);
        showMessage('Connecté !', 'success');
        setTimeout(() => {
          hideAuthModal();
          if (_onAuthSuccess) _onAuthSuccess();
        }, 600);
      }
    } catch (err) {
      showMessage(err.message || 'Erreur inconnue', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  function showMessage(text, type) {
    msgEl.textContent = text;
    msgEl.className = `lq-auth-message ${type}`;
  }
}

let _onAuthSuccess = null;

export function showAuthModal(onSuccess = null) {
  injectModal();
  _onAuthSuccess = onSuccess;
  document.getElementById('lq-auth-overlay').classList.add('show');
}

export function hideAuthModal() {
  const o = document.getElementById('lq-auth-overlay');
  if (o) o.classList.remove('show');
}

// ───────────────────────────────────────────────────────────────────────────
// API : AUTH
// ───────────────────────────────────────────────────────────────────────────
async function signUp(username, email, password) {
  if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
    throw new Error('Pseudo invalide : 3-20 caractères, lettres/chiffres/_-');
  }

  // 1. Vérifier que le pseudo est libre via la fonction RPC (insensible à la casse)
  const { data: available, error: rpcErr } = await supabase
    .rpc('username_available', { p_username: username });
  if (rpcErr) throw new Error('Impossible de vérifier le pseudo : ' + rpcErr.message);
  if (available === false) throw new Error('Ce pseudo est déjà pris.');

  // 2. Créer le compte avec le pseudo stocké dans les user_metadata
  //    Le trigger SQL `handle_new_user` se charge de créer le profil côté serveur.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });

  if (error) {
    // Peut aussi venir du trigger si pseudo pris entre-temps ou invalide
    throw new Error(translateError(error.message));
  }
  if (!data.user) throw new Error('Erreur de création du compte.');

  return data.user;
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(translateError(error.message));
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
  location.reload();
}

function translateError(msg) {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'Email ou mot de passe incorrect.';
  if (m.includes('already registered') || m.includes('user already')) return 'Cet email est déjà utilisé.';
  if (m.includes('pseudo est déjà pris') || m.includes('already taken')) return 'Ce pseudo est déjà pris.';
  if (m.includes('pseudo manquant') || m.includes('pseudo invalide')) return 'Pseudo manquant ou invalide.';
  if (m.includes('password'))      return 'Mot de passe trop faible (6 caractères minimum).';
  if (m.includes('email not confirmed')) return 'Email non confirmé. Vérifiez votre boîte de réception.';
  if (m.includes('email'))         return 'Email invalide.';
  if (m.includes('database error saving new user')) {
    // Ce message générique apparaît quand le trigger handle_new_user échoue
    return 'Erreur serveur : ce pseudo est probablement déjà pris, ou invalide.';
  }
  return msg;
}

// ───────────────────────────────────────────────────────────────────────────
// API : UTILISATEUR COURANT
// ───────────────────────────────────────────────────────────────────────────
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles').select('username').eq('id', user.id).maybeSingle();
  return { id: user.id, email: user.email, username: profile?.username || 'anonyme' };
}

// ───────────────────────────────────────────────────────────────────────────
// API : SCORES
// ───────────────────────────────────────────────────────────────────────────

// Soumet un score. Remplace l'ancien uniquement s'il est meilleur.
// Renvoie { inserted: boolean, best: { score, time } }
export async function submitScore(quizId, score, total, timeSeconds) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté.');

  // Vérifier le meilleur score existant
  const { data: existing } = await supabase
    .from('scores')
    .select('score, time_seconds')
    .eq('user_id', user.id)
    .eq('quiz_id', quizId)
    .maybeSingle();

  let shouldWrite = true;
  if (existing) {
    // Nouveau meilleur = score plus haut, ou score égal + temps plus court
    if (score < existing.score) shouldWrite = false;
    else if (score === existing.score && timeSeconds >= existing.time_seconds) shouldWrite = false;
  }

  if (!shouldWrite) {
    return { inserted: false, best: existing };
  }

  // Upsert : insère ou met à jour
  const { error } = await supabase.from('scores').upsert({
    user_id: user.id,
    quiz_id: quizId,
    score, total,
    time_seconds: timeSeconds
  }, { onConflict: 'user_id,quiz_id' });

  if (error) throw new Error('Erreur d\'enregistrement : ' + error.message);
  return { inserted: true, best: { score, time_seconds: timeSeconds } };
}

// Récupère le classement global d'un quiz (top N)
export async function fetchLeaderboard(quizId, limit = 50) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('username, score, total, time_seconds, created_at')
    .eq('quiz_id', quizId)
    .order('score', { ascending: false })
    .order('time_seconds', { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
}

// ───────────────────────────────────────────────────────────────────────────
// PREVIEW DU CLASSEMENT (sur l'écran de sélection du mode)
// ───────────────────────────────────────────────────────────────────────────
const PREVIEW_STYLES = `
  .lq-preview {
    width: 100%;
    max-width: 640px;
    margin: 50px auto 0;
    padding: 0 24px;
    animation: lqPreviewFade 0.8s ease both;
  }
  @keyframes lqPreviewFade {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .lq-preview-divider {
    display: flex; align-items: center; gap: 16px;
    margin-bottom: 28px;
  }
  .lq-preview-divider .line {
    flex: 1; height: 1px;
    background: linear-gradient(to right, transparent, rgba(201,168,76,0.4), transparent);
  }
  .lq-preview-divider .diamond {
    width: 7px; height: 7px; background: #c9a84c; transform: rotate(45deg);
  }

  .lq-preview-header {
    text-align: center;
    margin-bottom: 22px;
  }
  .lq-preview-label {
    font-family: 'Oswald', sans-serif;
    font-weight: 300;
    font-size: 0.7rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #c9a84c;
  }
  .lq-preview-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    font-weight: 700;
    color: #f5e4b0;
    letter-spacing: 0.04em;
    margin-top: 6px;
  }

  .lq-preview-box {
    background: #1e1810;
    border: 1px solid rgba(201,168,76,0.2);
    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  }

  .lq-preview-table { width: 100%; }

  .lq-preview-row {
    display: grid;
    grid-template-columns: 60px 1fr 90px 110px;
    align-items: center;
    padding: 14px 24px;
    border-bottom: 1px solid rgba(201,168,76,0.08);
  }
  .lq-preview-row:last-child { border-bottom: none; }

  .lq-preview-row.header {
    background: rgba(201,168,76,0.06);
    border-bottom: 1px solid rgba(201,168,76,0.2);
  }
  .lq-preview-row.header > div {
    font-family: 'Oswald', sans-serif;
    font-weight: 400;
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #c9a84c;
  }

  .lq-preview-row.me {
    background: rgba(201,168,76,0.08);
  }

  .lq-preview-rank {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 1.3rem;
    color: #c9a84c;
    text-align: center;
  }
  .lq-preview-name {
    color: #f7f0e0;
    font-size: 1.1rem;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .lq-preview-name .me-star {
    color: #c9a84c;
    margin-left: 6px;
    font-size: 0.9em;
  }
  .lq-preview-score {
    text-align: center;
    color: #e8c870;
    font-family: 'Oswald', sans-serif;
    font-weight: 400;
    font-size: 0.95rem;
  }
  .lq-preview-time {
    text-align: right;
    color: #f5e4b0;
    font-family: 'Oswald', sans-serif;
    font-weight: 300;
    font-size: 0.95rem;
  }

  .lq-preview-empty {
    padding: 40px 20px;
    text-align: center;
    color: #6b6050;
    font-style: italic;
  }

  .lq-preview-loading {
    padding: 40px 20px;
    text-align: center;
    color: #c9a84c;
    font-style: italic;
  }

  .lq-preview-expand {
    margin-top: 18px;
    text-align: center;
  }
  .lq-preview-expand button {
    background: none;
    border: 1px solid rgba(201,168,76,0.3);
    color: #c9a84c;
    font-family: 'Oswald', sans-serif;
    font-weight: 300;
    font-size: 0.75rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    padding: 10px 26px;
    cursor: pointer;
    transition: all 0.25s ease;
  }
  .lq-preview-expand button:hover {
    background: rgba(201,168,76,0.1);
    color: #e8c870;
    letter-spacing: 0.35em;
  }

  .lq-preview-extra {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s ease;
  }
  .lq-preview-extra.open {
    max-height: 3000px;
  }

  @media (max-width: 580px) {
    .lq-preview-row {
      grid-template-columns: 44px 1fr 70px 90px;
      padding: 12px 16px;
      font-size: 0.9rem;
    }
    .lq-preview-name { font-size: 1rem; }
  }
`;

let _previewStylesInjected = false;
function injectPreviewStyles() {
  if (_previewStylesInjected) return;
  const s = document.createElement('style');
  s.textContent = PREVIEW_STYLES;
  document.head.appendChild(s);
  _previewStylesInjected = true;
}

/**
 * Initialise (ou rafraîchit) un aperçu de classement dans le conteneur cible.
 * Affiche le top 5 + un bouton « Voir tout » qui déploie les suivants (jusqu'à 50).
 *
 * @param {string} containerId - L'id de la div où injecter le preview
 * @param {string} quizId      - 'oscars', 'departements', 'presidents'
 * @param {number} totalQuestions - 20 ou 10
 */
export async function renderLeaderboardPreview(containerId, quizId, totalQuestions) {
  injectPreviewStyles();
  const container = document.getElementById(containerId);
  if (!container) return;

  // Structure initiale avec loader
  container.innerHTML = `
    <div class="lq-preview">
      <div class="lq-preview-divider">
        <div class="line"></div>
        <div class="diamond"></div>
        <div class="line"></div>
      </div>
      <div class="lq-preview-header">
        <div class="lq-preview-label">✦ Hall of Fame ✦</div>
        <div class="lq-preview-title">Meilleurs joueurs</div>
      </div>
      <div class="lq-preview-box">
        <div class="lq-preview-table" id="lq-preview-table-${containerId}">
          <div class="lq-preview-loading">Chargement du classement…</div>
        </div>
      </div>
      <div class="lq-preview-expand" id="lq-preview-expand-${containerId}" style="display:none;">
        <button type="button">Voir tout</button>
      </div>
    </div>
  `;

  const tableEl  = document.getElementById(`lq-preview-table-${containerId}`);
  const expandEl = document.getElementById(`lq-preview-expand-${containerId}`);

  try {
    const [entries, me] = await Promise.all([
      fetchLeaderboard(quizId, 50),
      getCurrentUser()
    ]);

    if (entries.length === 0) {
      tableEl.innerHTML = `
        <div class="lq-preview-empty">
          Aucun score enregistré pour l'instant.<br>
          <span style="font-size:0.9em;opacity:0.8;">Soyez le premier à relever le défi.</span>
        </div>`;
      return;
    }

    // Top 5 + reste
    const top = entries.slice(0, 5);
    const rest = entries.slice(5);

    const renderRows = (rows, startIdx) => rows.map((entry, i) => {
      const idx = startIdx + i;
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (idx + 1);
      const isMe = me && entry.username === me.username;
      return `
        <div class="lq-preview-row${isMe ? ' me' : ''}">
          <div class="lq-preview-rank">${medal}</div>
          <div class="lq-preview-name">${_escapeHtml(entry.username)}${isMe ? '<span class="me-star">✦</span>' : ''}</div>
          <div class="lq-preview-score">${entry.score}/${entry.total}</div>
          <div class="lq-preview-time">${_formatTime(entry.time_seconds)}</div>
        </div>`;
    }).join('');

    let html = `
      <div class="lq-preview-row header">
        <div>Rang</div><div>Nom</div><div>Score</div><div>Temps</div>
      </div>
      ${renderRows(top, 0)}
    `;

    if (rest.length > 0) {
      html += `<div class="lq-preview-extra" id="lq-preview-extra-${containerId}">
                 ${renderRows(rest, 5)}
               </div>`;
    }

    tableEl.innerHTML = html;

    // Gestion du bouton « Voir tout »
    if (rest.length > 0) {
      expandEl.style.display = '';
      const btn = expandEl.querySelector('button');
      const extraEl = document.getElementById(`lq-preview-extra-${containerId}`);
      btn.addEventListener('click', () => {
        const isOpen = extraEl.classList.toggle('open');
        btn.textContent = isOpen ? 'Masquer' : `Voir tout (${entries.length})`;
      });
      btn.textContent = `Voir tout (${entries.length})`;
    }

  } catch (err) {
    tableEl.innerHTML = `
      <div class="lq-preview-empty">
        Impossible de charger le classement.<br>
        <span style="font-size:0.85em;opacity:0.7;">${_escapeHtml(err.message || '')}</span>
      </div>`;
  }
}

function _escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}

function _formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
