import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    data = json.loads((ROOT / "data" / "site.json").read_text(encoding="utf-8"))

    task_groups = data.get("visual_task_groups")
    assert isinstance(task_groups, list) and len(task_groups) >= 3, (
        "visual_task_groups must contain at least three LIBERO tasks"
    )

    task_ids = [group.get("task_id") for group in task_groups]
    assert len(task_ids) == len(set(task_ids)), "task groups must be unique tasks"

    for group in task_groups:
        assert group.get("task_name"), "each task group needs a task_name"
        rollouts = group.get("rollouts")
        assert isinstance(rollouts, list) and rollouts, "each task needs at least one rollout"
        for rollout in rollouts:
            video = ROOT / rollout["video"]
            assert video.exists(), f"missing rollout video: {video}"
            assert video.stat().st_size > 0, f"empty rollout video: {video}"

    reproduction_rows = data.get("reproduction_rows")
    assert isinstance(reproduction_rows, list) and len(reproduction_rows) >= 10, (
        "reproduction_rows must include the public baseline table"
    )
    assert all("algorithm" in row and "success_rate" in row for row in reproduction_rows)

    performance = data.get("performance_comparison")
    assert isinstance(performance, list) and len(performance) >= 8, (
        "performance_comparison must include completed algorithm rows"
    )
    rates = [row["success_rate"] for row in performance]
    assert rates == sorted(rates, reverse=True), "performance rows must be sorted best first"

    print("WORK4_VISUAL_TASK_PAGE_CONTRACT_OK")


if __name__ == "__main__":
    main()
