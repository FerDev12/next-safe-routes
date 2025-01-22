'use client';

import { getRoute, Link, useRouter } from '@/navigation';

export default function HomePage() {
  const authRoute = getRoute('/auth/sign-in/[[...provider]]', {
    params: {
      provider: ['github'],
    },
  });
  console.log(authRoute);
  const router = useRouter();

  const handleClick = () => {
    router.push('/products/[productId]', {
      params: {
        productId: '123',
      },
    });
  };

  return (
    <main>
      <button onClick={handleClick}>Go to product by id</button>
      <Link
        href={{
          pathname: '/posts/[postId]',
          params: { postId: '123' },
        }}
      >
        Go to post by id
      </Link>
    </main>
  );
}
