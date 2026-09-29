import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function checkIsAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token) return false;

  const session = await prisma.adminSession.findUnique({
    where: { token },
  });

  if (!session) return false;
  if (session.expiresAt < new Date()) {
    await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {});
    return false;
  }

  return true;
}
