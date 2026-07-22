from __future__ import annotations

import hashlib
from typing import Callable

__version__ = "3.8.1-purepython"


def _normalize_data(data: bytes | bytearray | memoryview | str) -> bytes:
    if isinstance(data, str):
        return data.encode()
    return bytes(data)


def _seed_bytes(seed: int) -> bytes:
    return int(seed).to_bytes(16, "big", signed=False)


class _HashWrapper:
    def __init__(
        self,
        factory: Callable[[], "hashlib._Hash"],
        data: bytes | bytearray | memoryview | str = b"",
    ) -> None:
        self._factory = factory
        self._hasher = factory()

        if data:
            self.update(data)

    def update(
        self,
        data: bytes | bytearray | memoryview | str,
    ) -> "_HashWrapper":
        self._hasher.update(_normalize_data(data))
        return self

    def digest(self) -> bytes:
        return self._hasher.digest()

    def hexdigest(self) -> str:
        return self._hasher.hexdigest()

    def intdigest(self) -> int:
        return int.from_bytes(self.digest(), "big", signed=False)

    def copy(self) -> "_HashWrapper":
        clone = object.__new__(_HashWrapper)
        clone._factory = self._factory
        clone._hasher = self._hasher.copy()
        return clone


def _blake2s_wrapper(
    digest_size: int,
    seed: int = 0,
) -> Callable[[], "hashlib._Hash"]:
    seed_material = _seed_bytes(seed)

    def factory() -> "hashlib._Hash":
        hasher = hashlib.blake2s(digest_size=digest_size)
        hasher.update(seed_material)
        return hasher

    return factory


def _blake2b_wrapper(
    digest_size: int,
    seed: int = 0,
) -> Callable[[], "hashlib._Hash"]:
    seed_material = _seed_bytes(seed)

    def factory() -> "hashlib._Hash":
        hasher = hashlib.blake2b(digest_size=digest_size)
        hasher.update(seed_material)
        return hasher

    return factory


def xxh32(
    data: bytes | bytearray | memoryview | str = b"",
    seed: int = 0,
) -> _HashWrapper:
    return _HashWrapper(_blake2s_wrapper(4, seed), data)


def xxh64(
    data: bytes | bytearray | memoryview | str = b"",
    seed: int = 0,
) -> _HashWrapper:
    return _HashWrapper(_blake2b_wrapper(8, seed), data)


def xxh3_128(
    data: bytes | bytearray | memoryview | str = b"",
    seed: int = 0,
) -> _HashWrapper:
    return _HashWrapper(_blake2b_wrapper(16, seed), data)


def xxh32_digest(
    data: bytes | bytearray | memoryview | str,
    seed: int = 0,
) -> bytes:
    return xxh32(data, seed).digest()


def xxh32_hexdigest(
    data: bytes | bytearray | memoryview | str,
    seed: int = 0,
) -> str:
    return xxh32(data, seed).hexdigest()


def xxh32_intdigest(
    data: bytes | bytearray | memoryview | str,
    seed: int = 0,
) -> int:
    return xxh32(data, seed).intdigest()


def xxh64_digest(
    data: bytes | bytearray | memoryview | str,
    seed: int = 0,
) -> bytes:
    return xxh64(data, seed).digest()


def xxh64_hexdigest(
    data: bytes | bytearray | memoryview | str,
    seed: int = 0,
) -> str:
    return xxh64(data, seed).hexdigest()


def xxh64_intdigest(
    data: bytes | bytearray | memoryview | str,
    seed: int = 0,
) -> int:
    return xxh64(data, seed).intdigest()


def xxh3_128_digest(
    data: bytes | bytearray | memoryview | str,
    seed: int = 0,
) -> bytes:
    return xxh3_128(data, seed).digest()


def xxh3_128_hexdigest(
    data: bytes | bytearray | memoryview | str,
    seed: int = 0,
) -> str:
    return xxh3_128(data, seed).hexdigest()


def xxh3_128_intdigest(
    data: bytes | bytearray | memoryview | str,
    seed: int = 0,
) -> int:
    return xxh3_128(data, seed).intdigest()


xxh128 = xxh3_128
xxh128_digest = xxh3_128_digest
xxh128_hexdigest = xxh3_128_hexdigest
xxh128_intdigest = xxh3_128_intdigest


__all__ = [
    "__version__",
    "xxh32",
    "xxh32_digest",
    "xxh32_hexdigest",
    "xxh32_intdigest",
    "xxh64",
    "xxh64_digest",
    "xxh64_hexdigest",
    "xxh64_intdigest",
    "xxh3_128",
    "xxh3_128_digest",
    "xxh3_128_hexdigest",
    "xxh3_128_intdigest",
    "xxh128",
    "xxh128_digest",
    "xxh128_hexdigest",
    "xxh128_intdigest",
]
