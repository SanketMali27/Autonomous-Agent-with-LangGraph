from __future__ import annotations

import secrets
import time
from uuid import UUID

__version__ = "0.17.0-purepython"

_UUID7_TIMESTAMP_MASK = (1 << 48) - 1


def _timestamp_ms(
    timestamp: int | None = None,
    nanos: int | None = None,
) -> int:
    if timestamp is None:
        return time.time_ns() // 1_000_000

    timestamp_ms = int(timestamp) * 1_000

    if nanos is not None:
        safe_nanos = max(0, min(int(nanos), 999_999_999))
        timestamp_ms += safe_nanos // 1_000_000

    return timestamp_ms


def _uuid4_int() -> int:
    return secrets.randbits(128)


def _uuid7_int(
    timestamp: int | None = None,
    nanos: int | None = None,
) -> int:
    unix_ts_ms = _timestamp_ms(timestamp, nanos) & _UUID7_TIMESTAMP_MASK
    rand_a = secrets.randbits(12)
    rand_b = secrets.randbits(62)

    return (
        (unix_ts_ms << 80)
        | (0x7 << 76)
        | (rand_a << 64)
        | (0b10 << 62)
        | rand_b
    )


def uuid4() -> UUID:
    return UUID(int=_uuid4_int())


def uuid7(
    timestamp: int | None = None,
    nanos: int | None = None,
) -> UUID:
    return UUID(int=_uuid7_int(timestamp, nanos))


__all__ = [
    "__version__",
    "_uuid4_int",
    "_uuid7_int",
    "uuid4",
    "uuid7",
]
