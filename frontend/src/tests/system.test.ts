/**
 * Automated Verification Suite for Trust Link Bank
 * Tests all core domain logic, accounting ledger integrity, multi-currency wallets,
 * transfers (P2P, MoMo, Bank), FX exchange, beneficiaries, admin back-office, and auth.
 */

// In-memory localStorage polyfill for Node.js CLI testing
const storageMap = new Map<string, string>();
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => storageMap.get(key) ?? null,
    setItem: (key: string, value: string) => { storageMap.set(key, String(value)); },
    removeItem: (key: string) => { storageMap.delete(key); },
    clear: () => { storageMap.clear(); },
  };
}

import {
  authApi,
  walletsApi,
  transactionsApi,
  transfersApi,
  exchangeApi,
  beneficiariesApi,
  adminApi,
  notificationsApi,
  profileApi,
} from '../services/api/client';
import { getDatabase } from '../services/api/mockData';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import frTrans from '../i18n/fr/translation.json';
import enTrans from '../i18n/en/translation.json';
import esTrans from '../i18n/es/translation.json';
import ptTrans from '../i18n/pt/translation.json';
import swTrans from '../i18n/sw/translation.json';
import arTrans from '../i18n/ar/translation.json';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('  TRUST LINK BANK - SUITE DE TESTS FONCTIONNELS');
  console.log('====================================================\n');

  // --- Test 1: Authentification ---
  console.log('--- TEST GROUP 1: Authentification & Utilisateurs ---');
  const userAmina = await authApi.login('amina.diallo@novapay.africa');
  assert(userAmina !== null, 'Connexion réussie avec Amina Diallo');
  assert(userAmina.novatag === '@amina.diallo', `Novatag correct (${userAmina.novatag})`);
  assert(userAmina.role === 'client', 'Rôle correct pour Amina (client)');

  const userAdmin = await authApi.login('admin@novapay.africa');
  assert(userAdmin !== null, 'Connexion réussie avec Chef Administrateur');
  assert(userAdmin.role === 'super_admin', 'Rôle super_admin validé pour Administrateur');

  // Test Inscription par Numéro de Téléphone
  console.log('\n--- TEST: Inscription & Vérification par Téléphone (SMS) ---');
  const phoneReg = await authApi.register({
    firstName: 'Samuel',
    lastName: 'Eto\'o',
    country: 'Cameroun',
    countryCode: '+237',
    flag: '🇨🇲',
    identifier: '+237 671 22 33 44',
    isPhone: true,
    language: 'fr',
  });
  assert(phoneReg.isPhone === true, 'Canal SMS détecté pour inscription téléphone');
  assert(phoneReg.otpSentTo === '+237 671 22 33 44', 'Code envoyé au numéro exact saisi (+237 671 22 33 44)');
  assert(Boolean(phoneReg.code), `Code OTP généré: ${phoneReg.code}`);
  const verifiedPhoneUser = await authApi.verifyOtp(phoneReg.code);
  assert(verifiedPhoneUser.id === phoneReg.user.id, 'Validation OTP réussie pour utilisateur téléphone');

  // Test Inscription par Adresse Email
  console.log('\n--- TEST: Inscription & Vérification par E-mail ---');
  const emailReg = await authApi.register({
    firstName: 'Clarisse',
    lastName: 'Kouassi',
    country: 'Côte d\'Ivoire',
    countryCode: '+225',
    flag: '🇨🇮',
    identifier: 'clarisse.kouassi@gmail.com',
    isPhone: false,
    language: 'fr',
  });
  assert(emailReg.isPhone === false, 'Canal E-mail détecté pour inscription e-mail');
  assert(emailReg.otpSentTo === 'clarisse.kouassi@gmail.com', 'Code envoyé à l\'adresse e-mail exacte saisie');
  const resendEmail = await authApi.resendOtp('clarisse.kouassi@gmail.com', false);
  assert(resendEmail.success === true, 'Renvoi de code par e-mail avec succès');
  assert(resendEmail.message.includes('clarisse.kouassi@gmail.com'), 'Message de confirmation mentionne l\'e-mail saisi');
  const verifiedEmailUser = await authApi.verifyOtp(emailReg.code);
  assert(verifiedEmailUser.id === emailReg.user.id, 'Validation OTP réussie pour utilisateur e-mail');

  // Test Inscription avec Email spécifique de l'utilisateur
  console.log('\n--- TEST: Inscription avec envoi du code sur l\'adresse e-mail de la personne ---');
  const userSpecificEmailReg = await authApi.register({
    firstName: 'Tokyo',
    lastName: 'Client',
    country: 'France',
    countryCode: '+33',
    flag: '🇫🇷',
    email: 'mctokyo12@gmail.com',
    phone: '+33 6 12 34 56 78',
    identifier: 'mctokyo12@gmail.com',
    isPhone: false,
    language: 'fr',
  });
  assert(userSpecificEmailReg.otpSentTo === 'mctokyo12@gmail.com', 'Code envoyé avec succès à l\'adresse email de la personne (mctokyo12@gmail.com)');
  assert(userSpecificEmailReg.user.email === 'mctokyo12@gmail.com', 'Compte utilisateur associé à l\'adresse email exacte de la personne');
  assert(userSpecificEmailReg.user.phone === '+33 6 12 34 56 78', 'Numéro de téléphone de la personne enregistré conjointement');

  // Switch back to Amina for financial tests
  await authApi.login('amina.diallo@novapay.africa');

  // --- Test 2: Multi-Devises & Portefeuilles ---
  console.log('\n--- TEST GROUP 2: Portefeuilles Multi-Devises (XAF, USD, EUR) ---');
  const wallets = await walletsApi.getWallets(userAmina.id);
  assert(wallets.length >= 3, `L'utilisateur dispose de ${wallets.length} portefeuilles`);

  const xafWallet = wallets.find((w) => w.currency === 'XAF');
  const usdWallet = wallets.find((w) => w.currency === 'USD');
  const eurWallet = wallets.find((w) => w.currency === 'EUR');

  assert(Boolean(xafWallet), 'Portefeuille XAF actif');
  assert(Boolean(usdWallet), 'Portefeuille USD actif');
  assert(Boolean(eurWallet), 'Portefeuille EUR actif');
  assert(typeof xafWallet!.balance === 'number' && xafWallet!.balance > 0, `Solde XAF: ${xafWallet!.balance.toLocaleString()} FCFA`);
  assert(typeof usdWallet!.balance === 'number' && usdWallet!.balance > 0, `Solde USD: $${usdWallet!.balance.toLocaleString()}`);
  assert(typeof eurWallet!.balance === 'number' && eurWallet!.balance > 0, `Solde EUR: €${eurWallet!.balance.toLocaleString()}`);

  // Test wallet details & entries
  const walletDetails = await walletsApi.getWalletById(xafWallet!.id);
  assert(walletDetails !== null && walletDetails.id === xafWallet!.id, 'Récupération détaillée du portefeuille XAF');
  assert(walletDetails!.account_number.length > 5, `Numéro de compte formaté valide: ${walletDetails!.account_number}`);

  const entries = await walletsApi.getWalletEntries(xafWallet!.id);
  assert(entries.length > 0, `${entries.length} écritures comptables trouvées pour le portefeuille XAF`);

  // --- Test 3: Grand Livre Comptable (Double-Entry Ledger) ---
  console.log('\n--- TEST GROUP 3: Grand Livre & Intégrité Double-Entry ---');
  const db = getDatabase();
  const txEntries = db.transaction_entries;
  assert(txEntries.length > 0, `${txEntries.length} écritures comptables enregistrées`);

  let unbalanceCount = 0;
  for (const tx of db.transactions) {
    const matchedEntries = txEntries.filter((e) => e.transaction_id === tx.id);
    if (matchedEntries.length >= 2) {
      const debits = matchedEntries.filter((e) => e.direction === 'debit').reduce((sum, e) => sum + e.amount, 0);
      const credits = matchedEntries.filter((e) => e.direction === 'credit').reduce((sum, e) => sum + e.amount, 0);
      if (Math.abs(debits - credits) > 0.01) {
        unbalanceCount++;
      }
    }
  }
  assert(unbalanceCount === 0, 'Principe de la partie double respecté (Débits = Crédits pour chaque transaction)');

  // --- Test 4: Virement P2P Trust Link Bank ---
  console.log('\n--- TEST GROUP 4: Transfert P2P (Trust Link Bank) ---');
  const initialXafBalance = xafWallet!.balance;
  const transferAmount = 10000;

  const p2pResult = await transfersApi.sendMoney({
    sourceWalletId: xafWallet!.id,
    mode: 'novapay',
    recipientIdentifier: '@kofi.m',
    recipientName: 'Kofi Mensah',
    amount: transferAmount,
    currency: 'XAF',
    reason: 'Test virement P2P instantané',
  });

  assert(p2pResult.transaction.status === 'completed', 'Statut du virement: complété avec succès');
  assert(p2pResult.transaction.fee === 0, 'Frais P2P Trust Link gratuits (0 FCFA)');
  assert(p2pResult.newBalance === initialXafBalance - transferAmount, `Nouveau solde débité exactement de ${transferAmount} FCFA`);

  // --- Test 5: Transfert Mobile Money (Orange / MTN / Wave) ---
  console.log('\n--- TEST GROUP 5: Transfert Mobile Money ---');
  const momoResult = await transfersApi.sendMoney({
    sourceWalletId: xafWallet!.id,
    mode: 'momo',
    provider: 'Orange Money',
    recipientIdentifier: '+237699112233',
    recipientName: 'Paul Biya',
    amount: 5000,
    currency: 'XAF',
    reason: 'Retrait Orange Money Cameroun',
  });
  assert(momoResult.transaction.status === 'completed', 'Virement Mobile Money Orange complété');
  assert(momoResult.transaction.fee === 500, `Frais réseau conformes: ${momoResult.transaction.fee} FCFA`);

  // --- Test 6: Conversion FX Multi-Devises ---
  console.log('\n--- TEST GROUP 6: Change de Devises FX (USD -> XAF) ---');
  const rates = await exchangeApi.getRates();
  assert(rates.length >= 3, `Grille des taux de change disponible (${rates.length} paires)`);

  const initialUsd = (await walletsApi.getWallets(userAmina.id)).find((w) => w.currency === 'USD')!.balance;
  const initialXaf2 = (await walletsApi.getWallets(userAmina.id)).find((w) => w.currency === 'XAF')!.balance;
  const exchangeAmountUsd = 100;
  const targetRate = 604;
  const buyAmountXaf = exchangeAmountUsd * targetRate;

  const swapResult = await exchangeApi.executeSwap({
    sourceWalletId: usdWallet!.id,
    targetWalletId: xafWallet!.id,
    sellAmount: exchangeAmountUsd,
    sellCurrency: 'USD',
    buyAmount: buyAmountXaf,
    buyCurrency: 'XAF',
    rate: targetRate,
    fee: 0,
  });

  assert(swapResult.transaction.status === 'completed', 'Opération de change FX exécutée avec succès');
  const postFxUsd = (await walletsApi.getWallets(userAmina.id)).find((w) => w.currency === 'USD')!.balance;
  const postFxXaf = (await walletsApi.getWallets(userAmina.id)).find((w) => w.currency === 'XAF')!.balance;

  assert(postFxUsd === initialUsd - exchangeAmountUsd, 'Portefeuille USD débité correctement (-100 USD)');
  assert(postFxXaf === initialXaf2 + buyAmountXaf, `Portefeuille XAF crédité du montant converti (+${buyAmountXaf} FCFA)`);

  // --- Test 7: Gestion des Bénéficiaires ---
  console.log('\n--- TEST GROUP 7: Gestion des Bénéficiaires ---');
  const initialBeneficiaries = await beneficiariesApi.getBeneficiaries(userAmina.id);
  const initialCount = initialBeneficiaries.length;

  const newBeneficiary = await beneficiariesApi.addBeneficiary({
    user_id: userAmina.id,
    full_name: 'Fatou Ndiaye',
    alias: 'Fatou Dakar',
    type: 'momo',
    provider: 'Wave',
    identifier: '+221771234567',
    currency: 'XAF',
  });

  assert(newBeneficiary.id !== '', `Bénéficiaire ajouté avec succès (ID: ${newBeneficiary.id})`);
  const updatedBeneficiaries = await beneficiariesApi.getBeneficiaries(userAmina.id);
  assert(updatedBeneficiaries.length === initialCount + 1, 'Liste des bénéficiaires incrémentée');

  await beneficiariesApi.deleteBeneficiary(newBeneficiary.id);
  const finalBeneficiaries = await beneficiariesApi.getBeneficiaries(userAmina.id);
  assert(finalBeneficiaries.length === initialCount, 'Suppression du bénéficiaire confirmée');

  // --- Test 8: Notifications & Profil ---
  console.log('\n--- TEST GROUP 8: Notifications & Sessions ---');
  const notifications = await notificationsApi.getNotifications(userAmina.id);
  assert(notifications.length > 0, `Centre de notifications fonctionnel (${notifications.length} notifications)`);

  const sessions = await profileApi.getSessions(userAmina.id);
  assert(sessions.length > 0, `Gestion des sessions active (${sessions.length} sessions actives)`);

  // --- Test 9: Administration & Back-Office ---
  console.log('\n--- TEST GROUP 9: Module Administration & Surveillance ---');
  const kpis = await adminApi.getKpis();
  assert(kpis.activeUsers >= 2, `Utilisateurs actifs supervisés: ${kpis.activeUsers}`);
  assert(kpis.gmvXaf > 0, `Volume GMV consolidé: ${kpis.gmvXaf.toLocaleString()} FCFA`);
  assert(kpis.totalTransactions > 0, `Total des transactions enregistrées: ${kpis.totalTransactions}`);

  const adminUsers = await adminApi.getUsers();
  assert(adminUsers.length >= 3, `Liste complète des utilisateurs disponible (${adminUsers.length} comptes)`);

  const auditLogs = await adminApi.getAuditLogs();
  assert(auditLogs.length > 0, `Piste d'audit de sécurité active (${auditLogs.length} entrées enregistrées)`);

  // --- Test 10: Support Multilingue International (FR, EN, ES, PT, SW, AR) ---
  console.log('\n--- TEST GROUP 10: Support Multilingue International ---');
  assert(SUPPORTED_LANGUAGES.length >= 6, `Au moins 6 langues officielles supportées (${SUPPORTED_LANGUAGES.length})`);
  const expectedCodes = ['fr', 'en', 'es', 'pt', 'sw', 'ar'];
  for (const code of expectedCodes) {
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    assert(Boolean(found), `Langue "${code}" configurée avec drapeau (${found?.flag}) et nom natif (${found?.nativeName})`);
  }

  assert(Boolean(esTrans.brand?.name && esTrans.nav?.home && esTrans.common?.loading), 'Dictionnaire Espagnol (es) complet et valide');
  assert(Boolean(ptTrans.brand?.name && ptTrans.nav?.home && ptTrans.common?.loading), 'Dictionnaire Portugais (pt) complet et valide');
  assert(Boolean(swTrans.brand?.name && swTrans.nav?.home && swTrans.common?.loading), 'Dictionnaire Kiswahili (sw) complet et valide');
  assert(Boolean(arTrans.brand?.name && arTrans.nav?.home && arTrans.common?.loading), 'Dictionnaire Arabe (ar) complet et valide');
  const arLang = SUPPORTED_LANGUAGES.find((l) => l.code === 'ar');
  assert(arLang?.dir === 'rtl', 'Support de l\'orientation de droite à gauche (RTL) configuré pour l\'Arabe');

  // --- Bilan Final ---
  console.log('\n====================================================');
  console.log(`  BILAN DES TESTS: ${testsPassed} PASSÉ(S), ${testsFailed} ÉCHOUÉ(S)`);
  console.log('====================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Erreur non interceptée pendant les tests:', err);
  process.exit(1);
});
