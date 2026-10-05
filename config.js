/* Runtime config. At deploy time, generate this file from env vars, e.g.
   echo "window.TASKYN_CONFIG={GOOGLE_MAPS_API_KEY:'$GOOGLE_MAPS_API_KEY'}" > config.js
   Never commit a real key. Empty key => Live Operations uses the built-in fallback map. */
window.TASKYN_CONFIG={GOOGLE_MAPS_API_KEY:''};
