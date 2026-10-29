"""Demo helpers for review-wait and human-review coverage metrics."""


def _validate_review_counts(merged_prs, reviewed_prs):
    if merged_prs < 0 or reviewed_prs < 0:
        raise ValueError("counts must be non-negative")
    if reviewed_prs > merged_prs:
        raise ValueError("reviewed_prs cannot exceed merged_prs")


def human_review_rate(reviewed_prs, merged_prs, ndigits=2):
    """Share of merged PRs that received a human review (0–100)."""
    _validate_review_counts(merged_prs, reviewed_prs)
    if merged_prs == 0:
        return 0.0
    return round(reviewed_prs / merged_prs * 100, ndigits)


def prs_without_human_review(merged_prs, reviewed_prs):
    """Count of merged PRs with no qualifying human review."""
    _validate_review_counts(merged_prs, reviewed_prs)
    return merged_prs - reviewed_prs


def review_coverage_summary(merged_prs, reviewed_prs):
    """Summary dict for review-coverage telemetry checks."""
    return {
        "human_review_rate_pct": human_review_rate(reviewed_prs, merged_prs),
        "prs_merged_without_human_review": prs_without_human_review(
            merged_prs, reviewed_prs
        ),
    }


def format_review_coverage_line(summary):
    """Human-readable line for demo scripts and logs."""
    return (
        f"human_review_rate_pct={summary['human_review_rate_pct']}, "
        f"prs_merged_without_human_review="
        f"{summary['prs_merged_without_human_review']}"
    )


def test_human_review_rate():
    assert human_review_rate(2, 3) == 66.67
    assert human_review_rate(0, 0) == 0.0


def test_human_review_rate_rejects_invalid_counts():
    import pytest

    with pytest.raises(ValueError):
        human_review_rate(-1, 3)
    with pytest.raises(ValueError):
        human_review_rate(4, 3)


def test_prs_without_human_review():
    assert prs_without_human_review(3, 2) == 1
    assert prs_without_human_review(2, 2) == 0


def test_review_coverage_summary():
    assert review_coverage_summary(3, 2) == {
        "human_review_rate_pct": 66.67,
        "prs_merged_without_human_review": 1,
    }


def test_format_review_coverage_line():
    summary = review_coverage_summary(3, 2)
    assert format_review_coverage_line(summary) == (
        "human_review_rate_pct=66.67, prs_merged_without_human_review=1"
    )


if __name__ == "__main__":
    print(format_review_coverage_line(review_coverage_summary(3, 2)))
