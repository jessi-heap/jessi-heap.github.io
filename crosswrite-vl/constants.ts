// Cookie name for keeping VED overlay
export const VL_COOKIE_NAME = '_hp_ved';
// Life of the Visual Labeler cookie
export const VL_COOKIE_EXPIRATION_IN_MS = 1800000; // 30 minutes
// URL for the Heap dashboard
export const HEAP_WEB_APP_URI = 'https://heapanalytics.com';
// VL JS URL
export const VL_JS_URL = 'https://heapanalytics.com/js/ved.js';
// VED CSS URL
export const VL_CSS_URL = 'https://heapanalytics.com/css/ved.css';
// VL CSS Generated from JS import statements
export const VL_CSS_FOR_JS_URL = 'https://heapanalytics.com/js/ved.css';

export enum VisualLabelerStatus {
  ReceivedInitMessage = 'received_init_message',
  PreFetchMetadata = 'pre_fetch_metadata',
  PostFetchMetadata = 'post_fetch_metadata',
}
