from __future__ import annotations

from uuid import UUID, SafeUUID

from . import __version__, _uuid4_int, _uuid7_int

NIL = UUID("00000000-0000-0000-0000-000000000000")
MAX = UUID("ffffffff-ffff-ffff-ffff-ffffffffffff")


def _from_int(value: int) -> UUID:
    uuid_obj = object.__new__(UUID)
    object.__setattr__(uuid_obj, "int", value)
    object.__setattr__(uuid_obj, "is_safe", SafeUUID.unknown)
    return uuid_obj


def uuid4() -> UUID:
    return _from_int(_uuid4_int())


def uuid7(
    timestamp: int | None = None,
    nanos: int | None = None,
) -> UUID:
    return _from_int(_uuid7_int(timestamp, nanos))


__all__ = [
    "__version__",
    "MAX",
    "NIL",
    "uuid4",
    "uuid7",
]
