@echo off
echo Starting Tileset Editor Server...
echo.
echo The editor will open in your browser at http://localhost:8000/tileset-editor.html
echo Press Ctrl+C to stop the server when done.
echo.
python -m http.server 8000
