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


def test_pr_throughput():
    assert pr_throughput(3, 30) == 0.1
    assert pr_throughput(0, 7) == 0.0
    assert pr_throughput(1, 0) == 0.0


def test_deploy_match_ratio():
    assert deploy_match_ratio(2, 3) == 66.67
    assert deploy_match_ratio(0, 0) == 0.0


if __name__ == "__main__":
    print(f"throughput={pr_throughput(3, 30)} prs/day")
    print(f"deploy_match={deploy_match_ratio(2, 3)}%")
