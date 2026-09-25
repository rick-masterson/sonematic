"""Serve the repo root plus the browser test page; the page POSTs its results to /result."""
import http.server, os, sys
TESTS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(TESTS)
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8931

class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        path = path.split('?')[0]
        if path == '/test.html':
            return os.path.join(TESTS, 'browser-test.html')
        return os.path.join(ROOT, path.lstrip('/'))

    def do_POST(self):
        body = self.rfile.read(int(self.headers['Content-Length']))
        open(os.path.join(TESTS, '.result.txt'), 'wb').write(body)
        self.send_response(200)
        self.end_headers()

    def log_message(self, *args):
        pass

http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
