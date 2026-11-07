/* Runtime config. At deploy time, generate this file from environment variables, e.g.
     echo "window.TASKYN_CONFIG={GOOGLE_MAPS_API_KEY:'$MAPS_KEY',API_BASE:'$API_BASE',AI_ENDPOINT:'$AI_URL'}" > config.js
   Never commit real keys.

   GOOGLE_MAPS_API_KEY  empty => Live Operations uses the built-in schematic map (no external requests).
   API_BASE             empty => worker actions are applied to the in-browser DEMO workspace only.
                        set   => queued worker actions are POSTed to  {API_BASE}/sync  (photos as multipart).
   AI_ENDPOINT          empty => Taskyn AI uses its transparent deterministic engine over workspace data.
                        set   => questions are POSTed as {question, context} and {answer} is displayed. */
window.TASKYN_CONFIG={GOOGLE_MAPS_API_KEY:'',API_BASE:'',AI_ENDPOINT:''};
