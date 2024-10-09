import { redirect } from '@/navigation';

export const dynamic = 'force-dynamic';
export default function UserProfilePage() {
  const x = true;

  if (x) {
    return redirect('/auth/sign-in/[[...provider]]', {
      params: {
        provider: ['github'],
      },
    });
  }
  return null;
}
