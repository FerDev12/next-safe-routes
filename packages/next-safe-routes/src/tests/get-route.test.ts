import { createGetSafeRoute } from '../navigation/create-get-safe-route';
import { expect, test } from 'vitest';

test('Handles route without dynamic params', () => {
  const getRoute = createGetSafeRoute();
  expect(getRoute('/posts')).toEqual('/posts');
});

test('Handles route with dynamic params', () => {
  const getRoute = createGetSafeRoute();
  const route = getRoute('/posts/[postId]', {
    params: {
      postId: '123',
    },
  });
  expect(route).toEqual('/posts/123');
});

test('Handles route with catch-all params', () => {
  const getRoute = createGetSafeRoute();
  const path = '/auth/sign-in/[...provider]';
  const routeWithParam = getRoute(path, {
    params: {
      provider: ['github'],
    },
  });
  const routeWithParams = getRoute(path, {
    params: {
      provider: ['github', 'google'],
    },
  });
  expect(routeWithParam).toEqual('/auth/sign-in/github');
  expect(routeWithParams).toEqual('/auth/sign-in/github/google');
});

test('Handles route with optional catch-all params', () => {
  const getRoute = createGetSafeRoute();
  const path = '/auth/sign-in/[[...provider]]';
  const routeWithoutParams = getRoute(path, {
    params: {},
  });
  const routeWithParam = getRoute(path, {
    params: {
      provider: ['github'],
    },
  });
  const routeWithParams = getRoute(path, {
    params: {
      provider: ['github', 'google'],
    },
    query: {
      foo: 'bar',
    },
  });
  expect(routeWithoutParams).toEqual('/auth/sign-in');
  expect(routeWithParam).toEqual('/auth/sign-in/github');
  expect(routeWithParams).toEqual('/auth/sign-in/github/google?foo=bar');
});

test('Adds query paramters', () => {
  const getRoute = createGetSafeRoute();
  const route = getRoute('/test', {
    query: {
      foo: 'bar',
      bar: 'foo',
    },
  });
  expect(route).toEqual('/test?foo=bar&bar=foo');
});

test('throws an error when a required parameter is missing', () => {
  const getRoute = createGetSafeRoute();
  try {
    expect(getRoute('/profiles/[profileId]')).toThrowError();
  } catch (err: any) {}
});

test('Allows for empty optional-catch-all param', () => {
  const getRoute = createGetSafeRoute();
  const route = getRoute('/auth/sign-in/[[...provider]]');
  expect(route).toEqual('/auth/sign-in');
});

test('Adds locale when using i18n routing', () => {
  const getLocalizedRoute = createGetSafeRoute({
    withI18N: true,
    defaultLocale: 'es',
  });

  const localizedRoute = getLocalizedRoute('/', { locale: 'en' });
  const localizedProductRoute = getLocalizedRoute('/products', {
    locale: 'en',
  });
  const localizedDynamicProductRoute = getLocalizedRoute(
    '/products/[productId]',
    {
      locale: 'en',
      params: {
        productId: '123',
      },
    }
  );
  const defaultLocaleRoute = getLocalizedRoute('/');
  expect(localizedRoute).toBe('/en');
  expect(defaultLocaleRoute).toBe('/es');
  expect(localizedProductRoute).toBe('/en/products');
  expect(localizedDynamicProductRoute).toBe('/en/products/123');
});
