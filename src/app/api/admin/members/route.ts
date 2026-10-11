import { randomBytes } from 'node:crypto';
import { getAdminAuth } from '@/lib/firebase-admin';
import { requireAdmin, apiError, readJson, HttpError, privateHeaders } from '@/lib/admin-access';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    const current = await requireAdmin(request);
    const admins = [];
    let token: string | undefined;
    do {
      const page = await getAdminAuth().listUsers(1000, token);
      admins.push(...page.users.filter(user => user.customClaims?.admin === true).map(user => ({ uid: user.uid, email: user.email, disabled: user.disabled })));
      token = page.pageToken;
    } while (token);
    return Response.json({ admins, currentUid: current.uid }, { headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const data = await readJson(request);
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address.');
    let user;
    let created = false;
    try { user = await getAdminAuth().getUserByEmail(email); }
    catch (error) {
      if ((error as { code?: string }).code !== 'auth/user-not-found') throw error;
      user = await getAdminAuth().createUser({ email, password: randomBytes(32).toString('base64url') });
      created = true;
    }
    if (user.disabled) throw new HttpError(400, 'This account is disabled.');
    await getAdminAuth().setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
    let setupLink: string | null = null;
    if (created) setupLink = await getAdminAuth().generatePasswordResetLink(email);
    return Response.json({ email, created, setupLink, message: created ? 'Admin created. Share the setup link privately so they can choose a password.' : 'Admin access granted. They can sign in with their existing password.' }, { status: created ? 201 : 200, headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
