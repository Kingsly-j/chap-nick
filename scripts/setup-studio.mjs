import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import nextEnv from '@next/env';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

nextEnv.loadEnvConfig(process.cwd());
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
if (projectId !== 'nick-dac56') throw new Error('Unexpected Firebase project. Setup stopped.');
const app = initializeApp({ credential: applicationDefault(), projectId });
const auth = getAuth(app);
const db = getFirestore(app);
const email = 'cheking1270@gmail.com';
let user, created = false;
try { user = await auth.getUserByEmail(email); }
catch (error) { if (error.code !== 'auth/user-not-found') throw error; user = await auth.createUser({ email, password: randomBytes(32).toString('base64url') }); created = true; }
if (user.disabled) throw new Error('The first administrator account is disabled.');
await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
console.log('First administrator ready:', email, created ? '(created)' : '(existing account)');
if (created) {
  const link = await auth.generatePasswordResetLink(email);
  fs.mkdirSync('.private', {recursive:true});
  fs.writeFileSync('.private/first-admin-setup.txt', 'First admin: ' + email + '\n\nOpen this private link to choose your password:\n' + link + '\n\nNo email was sent automatically.\n');
  console.log('Private password setup link saved to .private/first-admin-setup.txt');
}
const seeds = JSON.parse(fs.readFileSync('src/lib/starter-collections.json','utf8'));
for (const collection of seeds) {
  const ref = db.collection('portfolioCollections').doc(collection.id);
  await db.runTransaction(async transaction => {
    const old = await transaction.get(ref);
    if (!old.exists) transaction.create(ref, { ...collection, updatedBy: user.uid });
  });
}
console.log('Starter collections available:', seeds.length);
const token = (await app.options.credential.getAccessToken()).access_token;
const headers = { Authorization: 'Bearer ' + token, 'Content-Type':'application/json' };
const configUrl = 'https://identitytoolkit.googleapis.com/admin/v2/projects/' + projectId + '/config';
const current = await fetch(configUrl, {headers});
if (current.ok) {
  const config = await current.json();
  const domains = [...new Set([...(config.authorizedDomains || []), 'localhost'])];
  const update = await fetch(configUrl + '?updateMask=signIn.email.enabled,signIn.email.passwordRequired,authorizedDomains', {method:'PATCH',headers,body:JSON.stringify({signIn:{email:{enabled:true,passwordRequired:true}},authorizedDomains:domains})});
  console.log('Email/password authentication configuration:', update.status);
  if (!update.ok) console.log('Enable Email/Password in the Firebase console; configuration update was not accepted.');
} else console.log('Authentication configuration inspection:',current.status,'- check Email/Password in Firebase console.');
const rulesUrl='https://firebaserules.googleapis.com/v1/projects/'+projectId+'/releases/cloud.firestore';
const release=await fetch(rulesUrl,{headers});
if(release.ok){
  const info=await release.json();
  const rules=await fetch('https://firebaserules.googleapis.com/v1/'+info.rulesetName,{headers});
  if(rules.ok){const body=await rules.json();console.log('Current Firestore rules:',JSON.stringify(body.source?.files?.map(file=>({name:file.name,content:file.content}))));}
}else console.log('Firestore rules inspection:',release.status);
