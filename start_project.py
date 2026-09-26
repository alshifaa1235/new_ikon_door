"""
New Ikon Doors — One-Click Unified Project Launcher
Starts Vite development server with integrated API middleware on an unused port,
and automatically opens the browser showroom.

Usage:
    python start_project.py
    python start_project.py --port 5175
    python start_project.py --no-browser
"""

import argparse
import json
import os
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
import webbrowser

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 5173


def is_port_in_use(port: int, host: str = DEFAULT_HOST) -> bool:
    """Check if a TCP port is currently accepting connections."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex((host, port)) == 0


def is_new_ikon_server(port: int, host: str = DEFAULT_HOST) -> bool:
    """Check if an active HTTP service on host:port is specifically New Ikon Doors."""
    try:
        req = urllib.request.Request(f"http://{host}:{port}/api/health")
        with urllib.request.urlopen(req, timeout=1.5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                return data.get("service") == "new-ikon-doors"
    except Exception:
        pass
    return False


def find_unused_port(start_port: int, host: str = DEFAULT_HOST, max_attempts: int = 50) -> int:
    """Find the first genuinely unused, bindable port starting from start_port."""
    for offset in range(max_attempts):
        port = start_port + offset
        if not is_port_in_use(port, host):
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                    s.bind((host, port))
                    return port
            except OSError:
                continue
    raise RuntimeError(f"Unable to find an unused port in range {start_port}–{start_port + max_attempts}")


def wait_for_service(url: str, timeout: int = 20) -> bool:
    """Poll a URL until it responds with 200/204/304 or times out."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=1) as response:
                if response.status in (200, 204, 304):
                    return True
        except (urllib.error.URLError, socket.timeout, ConnectionRefusedError):
            time.sleep(0.5)
    return False


def parse_args():
    parser = argparse.ArgumentParser(description="New Ikon Doors Digital Showroom Launcher")
    parser.add_argument(
        "-p", "--port",
        type=int,
        default=int(os.environ.get("PORT", DEFAULT_PORT)),
        help=f"Preferred server port (default: {DEFAULT_PORT}, auto-finds unused if occupied by another project)"
    )
    parser.add_argument(
        "--host",
        type=str,
        default=DEFAULT_HOST,
        help=f"Host address to bind server (default: {DEFAULT_HOST})"
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Do not open the browser automatically upon launch"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    host = args.host
    target_port = args.port

    print("=" * 68)
    print("  NEW IKON DOORS - DIGITAL SHOWROOM & API LAUNCHER")
    print("=" * 68)

    processes = []
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"

    try:
        # 1. Verify dependencies
        node_modules_path = os.path.join(PROJECT_ROOT, "node_modules")
        if not os.path.exists(node_modules_path):
            print("[*] node_modules not found. Installing project dependencies...")
            subprocess.run([npm_cmd, "install"], cwd=PROJECT_ROOT, check=True)
            print("[+] Dependencies installed successfully.")

        # 2. Port conflict resolution
        server_already_running = False
        if is_port_in_use(target_port, host):
            if is_new_ikon_server(target_port, host):
                print(f"[+] Found existing New Ikon Doors server on http://{host}:{target_port}")
                chosen_port = target_port
                server_already_running = True
            else:
                print(f"[!] Port {target_port} is occupied by another application/project.")
                chosen_port = find_unused_port(target_port + 1, host)
                print(f"[*] Allocated dedicated unused port for New Ikon Doors: {chosen_port}")
        else:
            chosen_port = target_port

        showroom_url = f"http://localhost:{chosen_port}"

        # 3. Start dev server if not already running
        if not server_already_running:
            print(f"[*] Launching Vite Dev Server & API on http://{host}:{chosen_port}...")
            server_env = os.environ.copy()
            server_env["PORT"] = str(chosen_port)
            server_env["VITE_PORT"] = str(chosen_port)

            cmd = [
                npm_cmd,
                "run",
                "dev",
                "--",
                "--host",
                host,
                "--port",
                str(chosen_port),
                "--strictPort"
            ]
            server_proc = subprocess.Popen(cmd, cwd=PROJECT_ROOT, env=server_env)
            processes.append(server_proc)

            print("[*] Waiting for digital showroom server to initialize...")
            if wait_for_service(f"http://{host}:{chosen_port}", timeout=15):
                print(f"[+] New Ikon Doors server initialized successfully on port {chosen_port}!")
            else:
                poll = server_proc.poll()
                if poll is not None:
                    print(f"[!] Server failed to start with exit code {poll}")
                    return
                print("[!] Server starting, proceeding to open browser...")

        # 4. Open browser
        if not args.no_browser:
            print(f"\n[+] Opening New Ikon Doors in browser: {showroom_url}")
            webbrowser.open(showroom_url)

        print("\n" + "=" * 68)
        print("  NEW IKON DOORS IS LIVE!")
        print(f"  * Digital Showroom: {showroom_url}")
        print(f"  * Door Collections: {showroom_url}/collections")
        print(f"  * Showroom Branches:{showroom_url}/branches")
        print(f"  * Catalogue:        {showroom_url}/catalogue")
        print(f"  * Admin Panel:      {showroom_url}/admin")
        print("  Press Ctrl+C at any time to stop the server.")
        print("=" * 68 + "\n")

        # Keep process alive
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n[*] Stopping New Ikon Doors server...")
    finally:
        for p in processes:
            try:
                p.terminate()
                p.wait(timeout=3)
            except Exception:
                try:
                    p.kill()
                except Exception:
                    pass
        print("[+] Server stopped cleanly. Goodbye!")


if __name__ == "__main__":
    main()
