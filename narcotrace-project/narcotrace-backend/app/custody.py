"""Tamper-evident chain of custody (pure Python, no framework needed).

Every custody event stores:  hash = SHA256(prev_hash || canonical_json(payload))
Change any old event and every later hash stops matching -> tampering is detectable.
"""
import hashlib, json

GENESIS = "0" * 64


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical(payload: dict) -> bytes:
    # sorted keys + no spaces => same bytes on phone, server and in court
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()


def link_hash(prev_hash: str, payload: dict) -> str:
    return sha256_hex(prev_hash.encode() + canonical(payload))


def verify_chain(events: list[dict]) -> tuple[bool, int | None]:
    """events: [{'payload': {...}, 'prev_hash': str, 'hash': str}, ...] in order.
    Returns (ok, index_of_first_broken_event)."""
    prev = GENESIS
    for i, ev in enumerate(events):
        if ev["prev_hash"] != prev or link_hash(prev, ev["payload"]) != ev["hash"]:
            return False, i
        prev = ev["hash"]
    return True, None
