from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        print("Received request -> returning 503")
        self.send_response(503)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"error":{"type":"server_error","message":"Temporary test failure"}}')

    def log_message(self, format, *args):
        pass

HTTPServer(("0.0.0.0", 9999), Handler).serve_forever()
