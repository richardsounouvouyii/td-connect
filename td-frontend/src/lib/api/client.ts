const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
  console.warn(
    '[td-frontend] VITE_API_BASE_URL manquant. Copiez .env.example vers .env.',
  )
}

/**
 * Point d'entrée HTTP unique vers la Gateway.
 * Aucun appel direct aux microservices.
 */
export function getApiBaseUrl(): string {
  return apiBaseUrl ?? ''
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const base = getApiBaseUrl().replace(/\/$/, '')
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`

  return fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  })
}
