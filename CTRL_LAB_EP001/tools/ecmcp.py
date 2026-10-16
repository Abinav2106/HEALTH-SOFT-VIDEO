"""Minimal MCP stdio client for EffectCraft (`effectcraft-cli mcp`).

Speaks JSON-RPC 2.0, one message per line, as docs/agents.md describes.

    from ecmcp import EC
    with EC() as ec:
        ec.tool("get_state")
        ec.cmd("comp.new", name="Intro", width=1920, height=1080, frameRate=30, duration=4)
        ec.js("app.project.numItems")
"""
from __future__ import annotations

import base64
import json
import os
import subprocess
from pathlib import Path

CLI = os.environ.get(
    "EFFECTCRAFT_CLI", "/home/user/storytold/effectcraft/target/release/effectcraft-cli"
)


class ToolError(RuntimeError):
    pass


class EC:
    def __init__(self, *extra: str, autosave: bool = True, log: Path | None = None):
        args = [CLI, "mcp", *(["--autosave"] if autosave else []), *extra]
        self.log = open(log, "a") if log else None
        self.p = subprocess.Popen(
            args, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            text=True, bufsize=1,
        )
        self._id = 0
        self.info = self._rpc("initialize", {
            "protocolVersion": "2025-06-18", "capabilities": {},
            "clientInfo": {"name": "ctrl-lab-ep001", "version": "1"},
        })
        self._send({"jsonrpc": "2.0", "method": "notifications/initialized"})

    # -- transport -------------------------------------------------------
    def _send(self, msg: dict) -> None:
        line = json.dumps(msg)
        if self.log:
            self.log.write(">> " + line[:2000] + "\n")
        self.p.stdin.write(line + "\n")
        self.p.stdin.flush()

    def _rpc(self, method: str, params: dict) -> dict:
        self._id += 1
        my = self._id
        self._send({"jsonrpc": "2.0", "id": my, "method": method, "params": params})
        while True:
            line = self.p.stdout.readline()
            if not line:
                raise ToolError("effectcraft-cli exited")
            msg = json.loads(line)
            if msg.get("id") != my:
                continue  # notifications (progress etc.)
            if self.log:
                self.log.write("<< " + line[:2000] + "\n")
            if "error" in msg:
                raise ToolError(json.dumps(msg["error"]))
            return msg["result"]

    # -- helpers ---------------------------------------------------------
    def tool(self, name: str, **arguments):
        res = self._rpc("tools/call", {"name": name, "arguments": arguments})
        texts, images = [], []
        for c in res.get("content", []):
            if c.get("type") == "text":
                texts.append(c["text"])
            elif c.get("type") == "image":
                images.append(base64.b64decode(c["data"]))
        out = "\n".join(texts)
        try:
            val = json.loads(out) if out else None
        except json.JSONDecodeError:
            val = out
        if res.get("isError"):
            raise ToolError(f"{name}: {out[:4000]}")
        if images:
            return {"value": val, "images": images}
        return val

    def cmd(self, command: str, **params):
        return self.tool("execute_command", command=command, params=params)

    def js(self, code: str, name: str = "script"):
        r = self.tool("run_script", code=code, name=name)
        if isinstance(r, dict) and r.get("ok") is False:
            raise ToolError(f"script {name}: {r.get('error')} | output: {r.get('output')}")
        return r

    def close(self):
        try:
            self.p.stdin.close()
            self.p.wait(timeout=600)
        except Exception:
            self.p.kill()
        if self.log:
            self.log.close()

    def __enter__(self):
        return self

    def __exit__(self, *a):
        self.close()
