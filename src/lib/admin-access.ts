import 'server-only';
import { getAdminAuth } from './firebase-admin';
import { InputError } from './collection-schema';

export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function requireAdmin(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) throw new HttpError(401, 'Sign in to continue.');
  let decoded;
  try { decoded = await getAdminAuth().verifyIdToken(authorization.slice(7), true); }
  catch { throw new HttpError(401, 'Your session expired. Please sign in again.'); }
  const user = await getAdminAuth().getUser(decoded.uid);
  if (user.disabled || user.customClaims?.admin !== true) throw new HttpError(403, 'This account does not have administrator access.');
  return user;
}
export async function readJson(request: Request) {
  const content = await request.text();
  if (content.length > 500000) throw new HttpError(413, 'This collection is too large.');
  try { return JSON.parse(content); } catch { throw new InputError('Invalid JSON request.'); }
}
export function apiError(error: unknown) {
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof InputError) return Response.json({ error: error.message }, { status: 400 });
  console.error('Portfolio API failed:', error instanceof Error ? error.message : 'Unknown error');
  return Response.json({ error: 'The service is unavailable. Please try again.' }, { status: 503 });
}
export const privateHeaders = { 'Cache-Control': 'private, no-store' };
