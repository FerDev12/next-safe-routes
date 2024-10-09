import { createGetSafeRoute } from '../navigation/create-get-safe-route';
import { expect, test } from 'vitest';

const getRoute = createGetSafeRoute();

test('Handles route without dynamic params', () => {
  expect(getRoute('/posts')).toEqual('/posts');
});

test('Handles route with dynamic params', () => {
  const route = getRoute('/posts/[postId]', {
    params: {
      postId: '123',
    },
  });
  expect(route).toEqual('/posts/123');
});

test('Handles route with catch-all params', () => {
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
  const route = getRoute('/test', {
    query: {
      foo: 'bar',
      bar: 'foo',
    },
  });
  expect(route).toEqual('/test?foo=bar&bar=foo');
});

test('throws an error when a required parameter is missing', () => {
  try {
    expect(getRoute('/profiles/[profileId]')).toThrowError();
  } catch (err: any) {}
});

test('Allows for empty optional-catch-all param', () => {
  const route = getRoute('/auth/sign-in/[[...provider]]');
  expect(route).toEqual('/auth/sign-in');
});
