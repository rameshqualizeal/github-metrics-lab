"""Demo helpers for PR throughput and deploy-matching metrics."""


def pr_throughput(merged_prs, days, ndigits=2):
    """Average merged PRs per day over the window."""
    if days <= 0:
        return 0.0
    return round(merged_prs / days, ndigits)


def deploy_match_ratio(matched_prs, merged_before_deploy, ndigits=2):
    """Share of merged PRs linked to the next successful deploy (0–100)."""
    if merged_before_deploy == 0:
        return 0.0
    return round(matched_prs / merged_before_deploy * 100, ndigits)


def throughput_summary(merged_prs, days, matched_prs, merged_before_deploy):
    """One-line summary for AT-10 telemetry webhook checks."""
    return {
        "throughput_prs_per_day": pr_throughput(merged_prs, days),
        "deploy_match_pct": deploy_match_ratio(matched_prs, merged_before_deploy),
    }


def format_throughput_line(summary):
    """Human-readable line for demo scripts and logs.

    Args:
        summary: Dict returned by ``throughput_summary``.
    """
    throughput = summary["throughput_prs_per_day"]
    deploy_match = summary["deploy_match_pct"]
    return (
        f"merged_prs_per_day={throughput}, "
        f"deploy_match_pct={deploy_match}"
    )


def test_pr_throughput():
    assert pr_throughput(3, 30) == 0.1
    assert pr_throughput(0, 7) == 0.0
    assert pr_throughput(1, 0) == 0.0


def test_deploy_match_ratio():
    assert deploy_match_ratio(2, 3) == 66.67
    assert deploy_match_ratio(0, 0) == 0.0


def test_throughput_summary():
    assert throughput_summary(3, 30, 2, 3) == {
        "throughput_prs_per_day": 0.1,
        "deploy_match_pct": 66.67,
    }


def test_format_throughput_line():
    summary = throughput_summary(3, 30, 2, 3)
    assert format_throughput_line(summary) == (
        "merged_prs_per_day=0.1, deploy_match_pct=66.67"
    )


if __name__ == "__main__":
    print(format_throughput_line(throughput_summary(3, 30, 2, 3)))
