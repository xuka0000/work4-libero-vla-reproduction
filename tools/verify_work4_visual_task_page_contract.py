import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    data = json.loads((ROOT / "data" / "site.json").read_text(encoding="utf-8"))
    libero_data = json.loads((ROOT / "data" / "libero_vla_site.json").read_text(encoding="utf-8"))
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "styles.css").read_text(encoding="utf-8")
    app = (ROOT / "app.js").read_text(encoding="utf-8")

    assert "UAV" in data.get("title", ""), "site.json must make the UAV paper page primary"
    teaser_src = data.get("teaser", {}).get("src", "")
    assert teaser_src.startswith("media/wef_bench/"), (
        "primary teaser must use local WEF-Bench or AirSim media"
    )
    assert teaser_src.endswith(".webm"), "primary teaser must use a browser-compatible WebM"
    teaser_poster = data.get("teaser", {}).get("poster")
    assert teaser_poster, "primary teaser must define a poster to avoid a blank hero"
    assert (ROOT / teaser_poster).exists(), f"missing primary teaser poster: {teaser_poster}"
    assert "overflow-wrap: anywhere" in css, "mobile hero text must have an explicit wrap rule"
    assert "value.href || value.url" in app, "link renderer must support href and url fields"
    assert "VLA Sanity Gate" in html, "secondary LIBERO/VLA section must remain visible"

    task_groups = data.get("visual_task_groups")
    assert isinstance(task_groups, list) and len(task_groups) >= 5, (
        "visual_task_groups must contain the selected UAV task groups"
    )

    task_ids = [group.get("task_id") for group in task_groups]
    assert len(task_ids) == len(set(task_ids)), "task groups must be unique tasks"
    assert {"T2", "T3", "T4", "T5", "T12"}.issubset(set(task_ids)), (
        "primary page must cover T2, T3, T4, T5, and T12"
    )

    rollout_count = 0
    for group in task_groups:
        assert group.get("task_name"), "each task group needs a task_name"
        rollouts = group.get("rollouts")
        assert isinstance(rollouts, list) and rollouts, "each task needs at least one rollout"
        for rollout in rollouts:
            rollout_count += 1
            video = ROOT / rollout["video"]
            evidence = ROOT / rollout["evidence"]
            assert rollout["video"].endswith(".webm"), (
                f"primary UAV rollout video must be WebM for Chrome playback: {rollout['video']}"
            )
            assert video.exists(), f"missing rollout video: {video}"
            assert video.stat().st_size > 0, f"empty rollout video: {video}"
            assert evidence.exists(), f"missing rollout evidence: {evidence}"
            assert rollout.get("truth_level"), "each rollout needs a visible truth level"
    assert rollout_count >= 8, "expected at least eight UAV videos on the primary page"

    reproduction_rows = data.get("reproduction_rows")
    assert isinstance(reproduction_rows, list) and len(reproduction_rows) >= 5, (
        "reproduction_rows must include UAV status rows"
    )
    assert all("algorithm" in row and "truth_level" in row for row in reproduction_rows)

    performance = data.get("performance_comparison")
    assert isinstance(performance, list) and len(performance) >= 5, (
        "performance_comparison must include UAV metric and diagnostic rows"
    )
    assert all("truth_level" in row and "evidence" in row for row in performance)

    libero_groups = libero_data.get("visual_task_groups")
    assert isinstance(libero_groups, list) and len(libero_groups) >= 3, (
        "secondary LIBERO data must preserve the VLA video sanity rows"
    )
    libero_rollout_count = 0
    for group in libero_groups:
        assert group.get("task_name"), "each LIBERO task group needs a task_name"
        for rollout in group.get("rollouts", []):
            libero_rollout_count += 1
            video = ROOT / rollout["video"]
            evidence = ROOT / rollout["evidence"]
            assert video.exists(), f"missing LIBERO video: {video}"
            assert video.stat().st_size > 0, f"empty LIBERO video: {video}"
            assert evidence.exists(), f"missing LIBERO evidence: {evidence}"
    assert libero_rollout_count >= 6, "expected preserved LIBERO visual sanity clips"

    print("WORK4_VISUAL_TASK_PAGE_CONTRACT_OK")


if __name__ == "__main__":
    main()
