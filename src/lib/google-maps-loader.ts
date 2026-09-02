/**
 * Google Maps JS dynamic library loader (WO-1013).
 *
 * Replaces the hand-rolled `<script src=".../js?key=...&libraries=places">` tag we used to
 * append by hand. That legacy pattern pins the whole API at load time and pulls in the
 * deprecated Places widget; the dynamic library import below is Google's supported
 * bootstrap and is what `PlaceAutocompleteElement` requires.
 *
 * De-minified from the loader snippet Google publishes at
 * developers.google.com/maps/documentation/javascript/load-maps-js-api
 */

type ImportLibrary = (library: string, ...rest: unknown[]) => Promise<any>

declare global {
  interface Window {
    google: any
  }
}

interface BootstrapParams {
  key: string
  v?: string
  language?: string
  region?: string
}

let placesLibrary: Promise<any> | null = null

function installBootstrap(params: BootstrapParams) {
  const maps = (window.google || (window.google = {})).maps || (window.google.maps = {})
  if (maps.importLibrary) return

  const CALLBACK_KEY = '__ib__'
  const requested = new Set<string>()
  const query = new URLSearchParams()
  let loading: Promise<void> | null = null

  const loadScript = () =>
    loading ||
    (loading = new Promise<void>((resolve, reject) => {
      query.set('libraries', [...requested].join(','))
      for (const [name, value] of Object.entries(params)) {
        if (value === undefined) continue
        // camelCase option names travel on the URL as snake_case
        query.set(name.replace(/[A-Z]/g, (c) => `_${c[0].toLowerCase()}`), String(value))
      }
      query.set('callback', `google.maps.${CALLBACK_KEY}`)

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?${query}`
      script.nonce = document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce || ''
      script.onerror = () => reject(new Error('The Google Maps JavaScript API could not load.'))
      maps[CALLBACK_KEY] = resolve
      document.head.append(script)
    }))

  const importLibrary: ImportLibrary = (library, ...rest) => {
    requested.add(library)
    return loadScript().then(() => maps.importLibrary(library, ...rest))
  }
  maps.importLibrary = importLibrary
}

/**
 * Resolves with the `places` library (the namespace that carries PlaceAutocompleteElement).
 * Memoized — safe to call from every mounted autocomplete.
 */
export function loadPlacesLibrary(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only load in the browser'))
  }
  if (placesLibrary) return placesLibrary

  const key =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  if (!key) {
    return Promise.reject(new Error('Google Maps API key not configured'))
  }

  installBootstrap({ key, v: 'weekly' })
  placesLibrary = window.google.maps.importLibrary('places').catch((error: unknown) => {
    // Let a later mount retry rather than caching the failure forever.
    placesLibrary = null
    throw error
  })
  return placesLibrary
}
