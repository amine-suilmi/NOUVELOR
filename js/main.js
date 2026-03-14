import { supabase, getCurrentUser, getUserProfile } from './supabase.js'

// ── AUTH STATE ──
export let currentUser = null
export let currentProfile = null

export async function initAuth() {
  const user = await getCurrentUser()
  if (user) {
    currentUser = user
    const { data } = await getUserProfile(user.id)
    currentProfile = data
  }
  updateNavbar()
  return { user: currentUser, profile: currentProfile }
}

function updateNavbar() {
  const authButtons = document.getElementById('auth-buttons')
  const userMenu = document.getElementById('user-menu')
  const userNameEl = document.getElementById('user-name')
  const notifBadge = document.getElementById('notif-badge')

  if (!authButtons) return

  if (currentUser && currentProfile) {
    authButtons.classList.add('hidden')
    userMenu?.classList.remove('hidden')
    if (userNameEl) userNameEl.textContent = currentProfile.nom
    loadUnreadNotifications(notifBadge)
  } else {
    authButtons.classList.remove('hidden')
    userMenu?.classList.add('hidden')
  }
}

async function loadUnreadNotifications(badge) {
  if (!badge || !currentUser) return
  const { data } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', currentUser.id)
    .eq('lu', false)
  if (data && data.length > 0) {
    badge.textContent = data.length
    badge.classList.remove('hidden')
  }
}

// ── NAVBAR HTML ──
export function renderNavbar() {
  return `
  <nav class="navbar">
    <a href="/index.html" class="navbar-logo">NOUVEL<span>OR</span></a>
    <ul class="navbar-nav">
      <li><a href="/index.html">Accueil</a></li>
      <li><a href="/pages/listings.html">Parcourir</a></li>
      <li><a href="/pages/publish.html">Publier</a></li>
    </ul>
    <div class="navbar-actions">
      <div id="auth-buttons" class="flex gap-8">
        <a href="/pages/auth.html" class="btn btn-ghost btn-sm">Connexion</a>
        <a href="/pages/auth.html?mode=register" class="btn btn-gold btn-sm">S'inscrire</a>
      </div>
      <div id="user-menu" class="flex gap-8 hidden" style="align-items:center">
        <a href="/pages/notifications.html" style="position:relative">
          <span style="font-size:18px">🔔</span>
          <span id="notif-badge" class="hidden" style="position:absolute;top:-4px;right:-4px;background:var(--gold);color:var(--dark);font-size:9px;font-weight:700;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center"></span>
        </a>
        <a href="/pages/profile.html" class="btn btn-ghost btn-sm" id="user-name">Mon profil</a>
        <button class="btn btn-outline btn-sm" onclick="signOut()">Sortir</button>
      </div>
    </div>
  </nav>`
}

// ── FOOTER HTML ──
export function renderFooter() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-logo">NOUVELOR</div>
      <div class="footer-tagline">Le nouvel or de la location en Tunisie</div>
      <div class="footer-bottom">
        <span>© 2025 Nouvelor. Tous droits réservés.</span>
        <span>Fait avec passion en Tunisie 🇹🇳</span>
      </div>
    </div>
  </footer>`
}

// ── SIGN OUT ──
window.signOut = async function() {
  await supabase.auth.signOut()
  window.location.href = '/index.html'
}

// ── CATEGORY ICONS ──
export const CATEGORY_ICONS = {
  'Véhicules': '🚗',
  'Électronique': '📷',
  'Immobilier & Espaces': '🏠',
  'Outils & Équipement': '🔧',
  'Mode & Vêtements': '👗'
}

// ── WILAYAS ──
export const WILAYAS = [
  'Ariana','Béja','Ben Arous','Bizerte','Gabès','Gafsa','Jendouba',
  'Kairouan','Kasserine','Kébili','Le Kef','Mahdia','La Manouba',
  'Médenine','Monastir','Nabeul','Sfax','Sidi Bouzid','Siliana',
  'Sousse','Tataouine','Tozeur','Tunis','Zaghouan'
]

// ── FORMAT PRICE ──
export function formatPrice(price) {
  return new Intl.NumberFormat('fr-TN').format(price) + ' DT'
}

// ── FORMAT DATE ──
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-TN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

// ── RENDER STARS ──
export function renderStars(rating) {
  const full = Math.round(rating)
  return Array.from({length: 5}, (_, i) =>
    `<span class="${i < full ? 'star' : ''}" style="color:${i < full ? 'var(--gold)' : 'var(--dark4)'}">★</span>`
  ).join('')
}

// ── LISTING CARD ──
export function renderListingCard(listing) {
  const icon = CATEGORY_ICONS[listing.categories?.nom] || '📦'
  const img = listing.photos?.[0]
    ? `<img class="card-img" src="${listing.photos[0]}" alt="${listing.titre}" loading="lazy">`
    : `<div class="card-img-placeholder">${icon}</div>`

  return `
  <a href="/pages/listing.html?id=${listing.id}" class="card" style="display:block">
    ${img}
    <div class="card-body">
      <div class="card-category">${listing.categories?.nom || 'Autre'}</div>
      <div class="card-title">${listing.titre}</div>
      <div class="card-location">📍 ${listing.ville ? listing.ville + ', ' : ''}${listing.wilaya}</div>
      <div class="card-footer">
        <div class="card-price">${formatPrice(listing.prix_par_jour)}<span>/jour</span></div>
        <div class="card-rating">
          <span class="star">★</span>
          ${listing.note_moyenne > 0 ? listing.note_moyenne.toFixed(1) : 'Nouveau'}
        </div>
      </div>
    </div>
  </a>`
}

// ── SHOW TOAST ──
export function showToast(msg, type = 'info') {
  const existing = document.getElementById('toast')
  if (existing) existing.remove()
  const toast = document.createElement('div')
  toast.id = 'toast'
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    padding:14px 20px;border-radius:6px;font-size:13px;
    background:var(--dark3);border:1px solid var(--dark4);
    color:var(--light);box-shadow:var(--shadow-lg);
    animation:slideUp 0.3s ease;max-width:320px;
    border-left:3px solid ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : 'var(--gold)'};
  `
  toast.textContent = msg
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 4000)
}

const style = document.createElement('style')
style.textContent = `@keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }`
document.head.appendChild(style)
