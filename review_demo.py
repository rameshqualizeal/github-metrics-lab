"""Demo helpers for review-wait and human-review coverage metrics."""


def human_review_rate(reviewed_prs, merged_prs, ndigits=2):
    """Share of merged PRs that received a human review (0–100)."""
    if merged_prs == 0:
        return 0.0
    return round(reviewed_prs / merged_prs * 100, ndigits)


def prs_without_human_review(merged_prs, reviewed_prs):
    """Count of merged PRs with no qualifying human review."""
    return max(merged_prs - reviewed_prs, 0)


def review_coverage_summary(merged_prs, reviewed_prs):
    return {
        "human_review_rate_pct": human_review_rate(reviewed_prs, merged_prs),
        "prs_merged_without_human_review": prs_without_human_review(
            merged_prs, reviewed_prs
        ),
    }


def test_human_review_rate():
    assert human_review_rate(2, 3) == 66.67
    assert human_review_rate(0, 0) == 0.0


def test_prs_without_human_review():
    assert prs_without_human_review(3, 2) == 1
    assert prs_without_human_review(2, 5) == 0


def test_review_coverage_summary():
    assert review_coverage_summary(3, 2) == {
        "human_review_rate_pct": 66.67,
        "prs_merged_without_human_review": 1,
    }


if __name__ == "__main__":
    print(review_coverage_summary(3, 2))
