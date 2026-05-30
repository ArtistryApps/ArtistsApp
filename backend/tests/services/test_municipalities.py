"""Tests for municipalities service."""
from app.services.municipalities import fetch_municipalities


def test_returns_nonempty_list():
    result = fetch_municipalities()
    assert len(result) > 0


def test_all_items_are_strings():
    for item in fetch_municipalities():
        assert isinstance(item, str)


def test_list_is_sorted():
    result = fetch_municipalities()
    assert result == sorted(result)
