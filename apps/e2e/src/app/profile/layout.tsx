import { ReactNode } from 'react';

export default function ProfileLayout({
  user,
  org,
}: {
  user: ReactNode;
  org: ReactNode;
}) {
  const x = true;

  if (x) {
    return <>{org}</>;
  }

  return <>{user}</>;
}
