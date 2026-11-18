import os, time, jwt
from passlib.context import CryptContext
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

SECRET = os.environ.get("JWT_SECRET", "change-me-in-prod")
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
ROLES = ("field_officer", "zonal_admin", "lab", "prosecutor")  # prosecutor/lab = read-only


def make_token(officer_id: str, role: str, hours: int = 12) -> str:
    return jwt.encode({"sub": officer_id, "role": role, "exp": int(time.time()) + hours * 3600}, SECRET, "HS256")


def read_token(token: str) -> dict:
    return jwt.decode(token, SECRET, algorithms=["HS256"])


# AES-256-GCM for images / sensitive fields at rest. Key = 32 bytes from env/KMS.
def _key() -> bytes:
    return bytes.fromhex(os.environ.get("DATA_KEY_HEX", "00" * 32))


def encrypt(data: bytes) -> bytes:
    nonce = os.urandom(12)
    return nonce + AESGCM(_key()).encrypt(nonce, data, None)


def decrypt(blob: bytes) -> bytes:
    return AESGCM(_key()).decrypt(blob[:12], blob[12:], None)
