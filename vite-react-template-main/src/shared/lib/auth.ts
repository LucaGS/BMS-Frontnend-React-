export const AUTH_TOKEN_STORAGE_KEY = 'token';
export const AUTH_TOKEN_CHANGED_EVENT = 'app-auth-token-changed';

const dispatchAuthChanged = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_TOKEN_CHANGED_EVENT));
};

export const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
};

export const storeToken = (token: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  dispatchAuthChanged();
};

export const clearStoredToken = () => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  dispatchAuthChanged();
};

export const createAuthHeaders = (headers?: HeadersInit) => {
  const mergedHeaders = new Headers(headers ?? {});
  const token = getStoredToken();

  if (token && !mergedHeaders.has('Authorization')) {
    mergedHeaders.set('Authorization', `bearer ${token}`);
  }

  return mergedHeaders;
};

export const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await fetch(input, {
    ...init,
    headers: createAuthHeaders(init?.headers),
  });

  if (response.status === 401 || response.status === 403) {
    clearStoredToken();
  }

  return response;
};