//development  localhost
(function (window) {
  window.__env = window.__env || {};
  //  window.__env.apiUrl = 'http://localhost/Tailoring/api/';
  window.__env.apiUrl = "http://localhost:5294/api/";
  window.__env.fileUrl = "http://localhost:5294/";

  window.__env.enableDebug = true;
  window.__env.uiVersion = "0.0.1.7";
})(this);
