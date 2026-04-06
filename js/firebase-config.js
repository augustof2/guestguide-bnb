// ════════════════════════════════════════════
//  FIREBASE CONFIG
//  Inizializzazione Firebase con compat SDK (no bundler)
//  ⚠️  Sostituire i valori placeholder con le credenziali del
//      proprio progetto Firebase (vedi FIREBASE_SETUP.md)
// ════════════════════════════════════════════

(function() {
  'use strict';

  var PLACEHOLDER_API_KEY = 'YOUR_API_KEY';

  const firebaseConfig = {
    apiKey: "AIzaSyCxIkr92R5YNdTqFiyzLB_lQmNw0JQOd0w",
    authDomain: "guestguide-saas.firebaseapp.com",
    projectId: "guestguide-saas",
    storageBucket: "guestguide-saas.firebasestorage.app",
    messagingSenderId: "164526468307",
    appId: "1:164526468307:web:4ca6d35eda5dd6de553826"
  };

  // Se le credenziali sono ancora i placeholder, non inizializzare Firebase
  if (firebaseConfig.apiKey === PLACEHOLDER_API_KEY) {
    window._firebaseConfigured = false;
    return;
  }

  try {
    // Inizializza Firebase (compat SDK già caricato via CDN)
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    window.db   = firebase.firestore();
    window.auth = firebase.auth();
    window._firebaseConfigured = true;
  } catch (e) {
    console.error('[firebase-config] Inizializzazione Firebase fallita:', e);
    window._firebaseConfigured = false;
  }
})();
