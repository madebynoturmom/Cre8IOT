Local testing notes for Cre8IOT static site

Why: Browsers block fetch() for file:// pages and paths behave differently than when served from HTTP. Use a tiny local HTTP server to test changes quickly before pushing to GitHub Pages.

Quick commands (Windows cmd.exe):

- If you have Python 3 installed (recommended):
  cd %USERPROFILE%\OneDrive\Desktop\website\cre8iot-static
  python -m http.server 8000

  Then open http://localhost:8000 in your browser.

- If you have Node.js installed and prefer http-server:
  npm install -g http-server
  cd %USERPROFILE%\OneDrive\Desktop\website\cre8iot-static
  http-server -p 8000

  Then open http://localhost:8000 in your browser.

Notes:
- Use the server approach to reliably load partials, assets, and test root-relative paths like /Cre8IOT/.
- If you test with a different port, change the URL accordingly.

