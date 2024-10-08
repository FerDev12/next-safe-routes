'use client';

import { Link, useRouter, getRoute } from '@/navigation';

export default function Home() {
  const router = useRouter();

  console.time('get route');
  const route = getRoute('/products/[productId]', {
    params: { productId: '123' },
    query: { foo: 'bar', bar: 'foo', explore: '123412341234' },
  });
  console.timeEnd('get route');

  const onClick = () => {
    router.push('/users/[userId]', {
      params: {
        userId: '123',
      },
    });
  };

  return (
    <main className='flex flex-col items-center'>
      <Link href={{ pathname: '/' }}>Go to home</Link>
      <Link
        href={{
          pathname: '/users/[userId]',
          params: {
            userId: '123',
          },
        }}
      >
        Go to user Id Link
      </Link>
      <Link
        href={{
          pathname: '/profile',
          context: 'user',
          query: {
            userId: '123',
          },
        }}
      >
        Go to user profile
      </Link>
      <Link
        href={{
          pathname: '/profile',
          context: 'org',
          query: {
            orgId: '123',
            employeeId: '123',
          },
        }}
      >
        Go to org profile
      </Link>
      <Link href={route}>Go to product Id</Link>
      <button onClick={onClick}>Go to user Id Button</button>
      <div>{route}</div>
    </main>
  );
}
