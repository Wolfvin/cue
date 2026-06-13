"""
NIK (Nomor Induk Kependudukan) parser — Indonesian personal identity number.

This module provides functions to extract information from a 16-digit NIK.
The NIK encodes: province, city, district, gender, birth date, and registration order.

Refactored to:
- Use shared region lookup from _common.py (eliminates duplication with kk.py)
- Delegate date parsing to nik_logic.py (pure functions, deterministic)
- Keep the public API identical to the original
"""

from typing import Union
from datetime import date

from nomiden._common import validate_id_length, lookup_province, lookup_city, lookup_district
from nomiden.nik_logic import (
    parse_birth_code,
    extract_gender as _extract_gender,
    extract_nth_person as _extract_nth_person,
    validate_nik_length as _validate_nik_length,
    calculate_age,
)


def _check_length(idnum: Union[str, int]) -> str:
    """Validate NIK length — delegates to shared validator."""
    return _validate_nik_length(idnum)


def _check_birth(idnum: str):
    """
    Parse birth date from NIK using pure logic.
    Returns a dict with birth date components, or NaN if invalid.
    """
    from datetime import datetime
    bcode = idnum[6:12]
    result = parse_birth_code(bcode, datetime.now().year)
    if result is None:
        return float('nan')
    return result


def province(idnum: Union[str, int]):
    """Extract province name from NIK."""
    idnum = _check_length(idnum)
    return lookup_province(idnum)


def city(idnum: Union[str, int]):
    """Extract city name from NIK."""
    idnum = _check_length(idnum)
    return lookup_city(idnum)


def district(idnum: Union[str, int]):
    """Extract district name from NIK."""
    idnum = _check_length(idnum)
    return lookup_district(idnum)


def gender(idnum: Union[str, int]) -> str:
    """Extract gender from NIK. Male: day code 1-31, Female: day code 41-71."""
    idnum = _check_length(idnum)
    gend_code = int(idnum[6:8])
    return _extract_gender(gend_code)


def birthdate(idnum: Union[str, int]):
    """Extract birth day (1-31) from NIK."""
    idnum = _check_length(idnum)
    bdtm = _check_birth(idnum)
    try:
        return bdtm['day']
    except (TypeError, KeyError):
        return float('nan')


def birthmonth(idnum: Union[str, int]):
    """Extract birth month (1-12) from NIK."""
    idnum = _check_length(idnum)
    bdtm = _check_birth(idnum)
    try:
        return bdtm['month']
    except (TypeError, KeyError):
        return float('nan')


def birthyear(idnum: Union[str, int]):
    """Extract birth year from NIK."""
    idnum = _check_length(idnum)
    bdtm = _check_birth(idnum)
    try:
        return bdtm['year']
    except (TypeError, KeyError):
        return float('nan')


def birthdtm(idnum: Union[str, int]):
    """Extract birth date as datetime object from NIK."""
    idnum = _check_length(idnum)
    bdtm = _check_birth(idnum)
    try:
        from datetime import datetime
        return datetime(bdtm['year'], bdtm['month'], bdtm['day'])
    except (TypeError, KeyError, ValueError):
        return float('nan')


def birthday(idnum: Union[str, int]):
    """Extract birth date as formatted string (e.g., '01 January 1964') from NIK."""
    idnum = _check_length(idnum)
    bdtm = _check_birth(idnum)
    try:
        return bdtm['formatted']
    except (TypeError, KeyError):
        return float('nan')


def age(idnum: Union[str, int]):
    """Calculate age from NIK based on current date."""
    idnum = _check_length(idnum)
    bdtm = _check_birth(idnum)
    today = date.today()
    try:
        return calculate_age(bdtm['year'], bdtm['month'], bdtm['day'], today)
    except (TypeError, KeyError):
        return float('nan')


def nth_person(idnum: Union[str, int]):
    """Extract the NIK registration sequence number (digits 14-16)."""
    idnum = _check_length(idnum)
    return _extract_nth_person(idnum)


def all_info(idnum: Union[str, int]) -> dict:
    """Extract all available information from NIK as a dictionary."""
    idnum = _check_length(idnum)
    return {
        'NIK': int(idnum),
        'province': province(idnum),
        'city': city(idnum),
        'district': district(idnum),
        'gender': gender(idnum),
        'birth_datetime': birthdtm(idnum),
        'birthday': birthday(idnum),
        'age': age(idnum),
        'regist_code': nth_person(idnum),
    }
