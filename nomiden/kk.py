"""
KK (Kartu Keluarga) parser — Indonesian family identity number.

This module provides functions to extract information from a 16-digit KK.
The KK encodes: province, city, district, registration date, and registration order.

Refactored to:
- Use shared region lookup from _common.py (eliminates duplication with nik.py)
- Delegate date parsing to kk_logic.py (pure functions, deterministic)
- Keep the public API identical to the original
"""

from typing import Union
from datetime import date

from nomiden._common import validate_id_length, lookup_province, lookup_city, lookup_district
from nomiden.kk_logic import (
    parse_reg_code,
    extract_nth_pub as _extract_nth_pub,
    validate_kk_length as _validate_kk_length,
)


def _check_length(idnum: Union[str, int]) -> str:
    """Validate KK length — delegates to shared validator."""
    return _validate_kk_length(idnum)


def _check_reg(idnum: str):
    """
    Parse registration date from KK using pure logic.
    Returns a dict with date components, or NaN if invalid.
    """
    from datetime import datetime
    rcode = idnum[6:12]
    result = parse_reg_code(rcode, datetime.now().year)
    if result is None:
        return float('nan')
    return result


def province(idnum: Union[str, int]):
    """Extract province name from KK."""
    idnum = _check_length(idnum)
    return lookup_province(idnum)


def city(idnum: Union[str, int]):
    """Extract city name from KK."""
    idnum = _check_length(idnum)
    return lookup_city(idnum)


def district(idnum: Union[str, int]):
    """Extract district name from KK."""
    idnum = _check_length(idnum)
    return lookup_district(idnum)


def regdate(idnum: Union[str, int]):
    """Extract registration day (1-31) from KK."""
    idnum = _check_length(idnum)
    rdtm = _check_reg(idnum)
    try:
        return rdtm['day']
    except (TypeError, KeyError):
        return float('nan')


def regmonth(idnum: Union[str, int]):
    """Extract registration month (1-12) from KK."""
    idnum = _check_length(idnum)
    rdtm = _check_reg(idnum)
    try:
        return rdtm['month']
    except (TypeError, KeyError):
        return float('nan')


def regyear(idnum: Union[str, int]):
    """Extract registration year from KK."""
    idnum = _check_length(idnum)
    rdtm = _check_reg(idnum)
    try:
        return rdtm['year']
    except (TypeError, KeyError):
        return float('nan')


def regdtm(idnum: Union[str, int]):
    """Extract registration date as datetime object from KK."""
    idnum = _check_length(idnum)
    rdtm = _check_reg(idnum)
    try:
        from datetime import datetime
        return datetime(rdtm['year'], rdtm['month'], rdtm['day'])
    except (TypeError, KeyError, ValueError):
        return float('nan')


def regday(idnum: Union[str, int]):
    """Extract registration date as formatted string (e.g., '10 January 1964') from KK."""
    idnum = _check_length(idnum)
    rdtm = _check_reg(idnum)
    try:
        return rdtm['formatted']
    except (TypeError, KeyError):
        return float('nan')


def nth_pub(idnum: Union[str, int]) -> int:
    """Extract the KK registration sequence number (digits 14-16)."""
    idnum = _check_length(idnum)
    return _extract_nth_pub(idnum)


def all_info(idnum: Union[str, int]) -> dict:
    """Extract all available information from KK as a dictionary."""
    idnum = _check_length(idnum)
    return {
        'NIK': int(idnum),
        'province': province(idnum),
        'city': city(idnum),
        'district': district(idnum),
        'regist_datetime': regdtm(idnum),
        'regist_day': regday(idnum),
        'regist_code': nth_pub(idnum),
    }
