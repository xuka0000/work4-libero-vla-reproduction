# Public Baseline Queue Status

Truth level: `public_baseline_queue_status_libero10_n263b_visual_capture_no_metric`

## Current Active Algorithm

The public LIBERO Spatial baseline queue is no longer the priority route. PUB01
OpenVLA-OFT and PUB02 openpi pi0.5 both reached near-ceiling same-protocol
Spatial results, so LIBERO Spatial is now treated as a saturation and sanity
gate rather than a main algorithm-ranking protocol.

N251 has completed the first harder-suite pivot. It ran openpi pi0.5 on
`libero_10`, using 10 tasks by 10 episodes. N252B has completed the
OpenVLA-OFT harder-suite row on the same `libero_10` 10-task by 10-episode
protocol with seed 7.

After the user asked to keep the VLA branch going, the next bounded VLA row was
selected from the already smoke-tested openpi path. N254V was interrupted before
health because the harness file named `configs/model_servers/pi0/libero.yaml`
actually loaded `pi05_libero`, which would have duplicated the pi0.5 row under
the wrong label. N254W replaced it with an explicit custom server config using
`config_name: pi0_libero`. N254W completed the same `libero_10` 10-task by
10-episode protocol with seed 7 after a one-object cache repair. The final
aggregate reported mean_success 0.01 over 100 episodes.

The next top-down public row is PUB05 Isaac GR00T N1.6 LIBERO. N255 was
launched as a `libero_10` 10-task by one-episode smoke with a GitHub proxy for
the pinned Isaac-GR00T dependency. The old Git fetch blocker was passed, and
the fixed commit `e29d8fc50b0e4745120ae3fb72447986fe638aa6` plus the `gr00t`
package built successfully. N255 then failed before health because the GR00T
model weights were not available in the Hugging Face cache. N255C validated a
local 14-file, 9.81 GB `0xAnkitSingh/GR00T-N1.6-LIBERO` snapshot, and N255D
was relaunched with the shared Hugging Face cache. N255D reached service
health and wrote an aggregate, but all 10 one-episode tasks errored at step 0
with `CUDA error: no kernel image is available for execution on the device`.
N256 repaired this by copying the GR00T uv environment into an isolated
`groot_n16_sm120_repair_20260614` environment, upgrading torch to
`2.7.1+cu128`, and verifying `sm_120` CUDA matmul before startup. N256 then
completed the same LIBERO-10 10-task by one-episode smoke with a valid
aggregate. The final smoke result was mean_success 0.0 over 10 episodes, with
0 success, 10 normal FAIL rows, 0 error rows, and average steps 220.0 for each
task.

After the user explicitly asked to continue to the full 100 episodes, N257
promoted the repaired GR00T route to the same `libero_10` 10-task by
10-episode protocol. N257 completed at the harness level with status `passed`,
valid metric claim `true`, run return code 0, 0 error episodes, and one
aggregate over 100 episodes. The final result was mean_success 0.0, with
0 SUCCESS and 100 normal FAIL rows. Every task had mean_success 0.0 and average
steps 220.0.

After N257, PUB06 DB-CogACT LIBERO was started as N258. It uses the same
`libero_10` 10-task smoke gate with one episode per task before any possible
10-task by 10-episode promotion. The launch uses
`configs/model_servers/db_cogact/libero.yaml`, GitHub proxy rewriting, port
8068, and output
`/root/shared-nvme/work4/outputs/n258_db_cogact_libero10_10task1ep_public_smoke_20260614`.
At the first probe, N258 was `RUNNING`, manifest reason `server_starting`,
runtime preflight passed, task order was `[0,1,2,3,4,5,6,7,8,9]`, suite was
`libero_10`, and the model-server script resolved to
`src/vla_eval/model_servers/dexbotic/cogact.py`. No service health, rollout
log, progress file, or aggregate existed yet.

At 2026-06-15 03:23 +08, N258 was confirmed failed before service health. The
manifest status was `failed`, reason `server_health_stalled_after_timeout`,
failure layer `dependency_or_model_asset_cold_start`, and
`queue_advance_requires_review=true`. The runtime preflight had passed, but no
health file, rollout log, progress file, or aggregate was produced. The
model-server log repeated `Downloading nvidia-cudnn-cu12 (674.0MiB)` and then
stalled. This is an infrastructure dependency or model-service cold-start
failure, not a DB-CogACT performance metric.

The first repair added uv download hardening to the generic public-baseline
launcher. A short N258B attempt verified that hardcoding the Tsinghua PyPI
mirror is unsafe for DB-CogACT because `dexbotic/cogact.py` uses
`exclude-newer=2026-02-24` and the mirror lacks upload-date metadata for
`PasteDeploy`, causing uv dependency resolution to fail. The launcher was then
changed again so `UV_HTTP_TIMEOUT=600` and `UV_HTTP_RETRIES=10` are always set,
while `UV_DEFAULT_INDEX` is optional. N258C was launched on port 8070 with the
official index and the hardened timeout/retry settings. At the first N258C
probe, it was `RUNNING`, reason `server_starting`, runtime preflight passed,
the runner showed `UV_DEFAULT_INDEX=""`, and `model_server.log` again reached
`Downloading nvidia-cudnn-cu12 (674.0MiB)`. No health, rollout, or aggregate
existed yet.

At 2026-06-15 04:59 +08, N258C had completed the repair smoke. The CUDNN
dependency and the `Dexmal/libero-db-cogact` model weights were downloaded,
service health passed, rollout ran, and the aggregate reported mean_success
0.10 over 10 episodes. N258D then promoted the cached DB-CogACT route to the
same `libero_10` 10-task by 10-episode protocol. At 2026-06-15 05:28 +08,
N258D was `DONE` with status `passed`, reason
`harness_public_baseline_completed`, health ready `true`, episode started
`true`, run return code 0, and one aggregate over 100 episodes. The final
result was mean_success 0.13, with 13 success files and 87 fail files. This is
a valid same-protocol LIBERO-10 public-baseline row and not a download or
startup failure.

After N258D, the top-down scan advanced to PUB07 X-VLA LIBERO. The old N236C
attempt had failed before health during dependency or model-asset cold start
under a short health window. N259 retried X-VLA on `libero_10` after the uv
download hardening but failed before health with a specific service error:
`AutoProcessor.from_pretrained` required `protobuf`, which was absent from the
X-VLA PEP dependency block. The remote `xvla.py` file was backed up and patched
to add `protobuf`; the generic launcher was also updated to export
`HF_HUB_ETAG_TIMEOUT=60` and `HF_HUB_DOWNLOAD_TIMEOUT=600` to avoid the
default 10-second Hugging Face metadata timeout. N259B was launched as an
X-VLA repair smoke on `libero_10`, 10 tasks by one episode. It reached service
health, loaded the model on RTX 5090, completed rollout, and wrote an aggregate
with mean_success 0.20 over 10 episodes, with 2 SUCCESS, 8 FAIL, and 0 ERROR
lines. N259C then promoted the same repaired X-VLA route to the full
`libero_10` 10-task by 10-episode main run. At 2026-06-15 06:35 +08, N259C was
`DONE` with status `passed`, reason `harness_public_baseline_completed`, run
return code 0, and one aggregate over 100 episodes. The final result was
mean_success 0.21, with 21 success files, 79 fail files, and 0 error lines.
This is a valid same-protocol LIBERO-10 public-baseline row.

After N259C, PUB08 VLANeXt was reviewed before relaunch. The old N236B attempt
failed at the service-health stage while `model_server.log` was still
downloading uv dependencies such as torch, cuDNN, diffusers, transformers, and
related CUDA packages. It did not reach Hugging Face model download, service
health, rollout, or aggregate generation. Because the harness already contains
`configs/model_servers/vlanext/libero_10.yaml`, N260 was launched as a correct
`libero_10` 10-task by one-episode smoke with longer health and HF Hub
timeouts. N260 passed uv dependency installation and cloned the VLANeXt source,
but failed before service health because `require_model_available` requires
`DravenALG/VLANeXt` weights to be present in the shared Hugging Face cache. The
failure happened before health, rollout, or aggregate generation, so it is not
a performance metric. N260B was then launched as a single-file prefetch for
`VLANeXt_libero_10.pt`. N260B completed at 2026-06-15 07:12 +08 and cached
the 16,440,828,626 byte weight file. A follow-up environment probe showed that
the VLANeXt uv environment had installed `torch 2.11.0+cu130`; the RTX 5090
server driver reported CUDA 12.8 support, so `torch.cuda.is_available()` was
false. N260C was therefore started as a CUDA environment repair stage that
installs the previously validated cu128 torch stack and writes a local
checkpoint config before the next smoke launch. N260C completed at 2026-06-15
08:12 +08. Its probe reported `torch 2.7.1+cu128`, CUDA 12.8,
`torch.cuda.is_available()` true, arch list including `sm_120` and
`compute_120`, and a successful CUDA matmul on the RTX 5090. N260D was then
launched as the VLANeXt LIBERO-10 10-task by one-episode smoke using
`configs/model_servers/vlanext/libero_10_local_n260c.yaml`. At 2026-06-15
08:44 +08, N260D was `RUNNING`, reason `server_starting`; `model_server.log`
showed the VLANeXt source clone passed and the local `VLANeXt_libero_10.pt`
checkpoint was being loaded on `cuda`. No health file, rollout log, progress
file, or aggregate existed yet. N260D then completed the 10-task by
one-episode smoke at 2026-06-15 08:50 +08 with status `passed`, mean_success
0.30 over 10 episodes, 3 success files, 7 fail files, 0 error lines, and run
return code 0. Because the smoke reached health and had no error episodes,
N260E was launched as the full VLANeXt LIBERO-10 10-task by 10-episode main
run. N260E completed at 2026-06-15 09:27 +08 with status `passed`, reason
`harness_public_baseline_completed`, health ready, rollout started, run return
code 0, and one 100-episode aggregate. The final result was mean_success 0.26,
with 26 success rows, 74 normal fail rows, and 0 error rows. Task-level
success counts were 0/10, 0/10, 0/10, 8/10, 3/10, 8/10, 7/10, 0/10, 0/10,
and 0/10 across the ten LIBERO-10 tasks.

Human-facing report rule: collapse N252 and N252B into one OpenVLA-OFT
LIBERO-10 row. Do not list the earlier download interruption as a separate
algorithm attempt unless the user asks for debugging details.

Completed PUB05 full harder-suite evidence path:

`/root/shared-nvme/work4/outputs/n257_groot_n16_sm120_repair_libero10_10task10ep_public_main_20260614`

Completed PUB05 smoke evidence path:

`/root/shared-nvme/work4/outputs/n256_groot_n16_sm120_repair_libero10_10task1ep_public_smoke_20260614`

Failed PUB06 initial smoke evidence path:

`/root/shared-nvme/work4/outputs/n258_db_cogact_libero10_10task1ep_public_smoke_20260614`

Completed PUB06 repair smoke evidence path:

`/root/shared-nvme/work4/outputs/n258c_db_cogact_libero10_uv_retry_official_index_10task1ep_public_smoke_20260615`

Completed PUB06 full harder-suite evidence path:

`/root/shared-nvme/work4/outputs/n258d_db_cogact_libero10_uv_cached_10task10ep_public_main_20260615`

Failed PUB08 smoke evidence path:

`/root/shared-nvme/work4/outputs/n260_vlanext_libero10_hf_timeout_10task1ep_public_smoke_20260615`

Completed PUB08 prefetch evidence path:

`/root/shared-nvme/work4/outputs/n260b_vlanext_libero10_hf_singlefile_prefetch_20260615`

Running PUB08 environment repair path:

`/root/shared-nvme/work4/outputs/n260c_vlanext_libero10_local_ckpt_sm120_repair_prep_20260615`

Running PUB08 smoke evidence path:

`/root/shared-nvme/work4/outputs/n260d_vlanext_libero10_local_ckpt_sm120_10task1ep_public_smoke_20260615`

Running PUB08 main evidence path:

`/root/shared-nvme/work4/outputs/n260e_vlanext_libero10_local_ckpt_sm120_10task10ep_public_main_20260615`

Completed openpi pi0 base harder-suite evidence path:

`/root/shared-nvme/work4/outputs/n254w_openpi_pi0_base_libero10_10task10ep_harder_suite_20260613`

Completed OpenVLA-OFT harder-suite evidence path:

`/root/shared-nvme/work4/outputs/n252b_openvla_oft_libero10_prefetch_retry_10task10ep_harder_suite_20260613`

Completed openpi pi0.5 harder-suite evidence path:

`/root/shared-nvme/work4/outputs/n251_openpi_pi05_libero10_10task10ep_harder_suite_20260613`

Preservation rule:

Do not delete, overwrite, or clean
`/root/shared-nvme/work4/outputs/n251_openpi_pi05_libero10_10task10ep_harder_suite_20260613`.
It is the completed PUB02 LIBERO-10 result with mean_success 0.21 over 100
episodes and is a required comparison anchor for later harder-suite rows.

Completed PUB02 Spatial evidence path:

`/root/shared-nvme/work4/outputs/n250_openpi_pi05_libero_curl56_retry_10task10ep_public_main_20260613`

Previous PUB02 failed cache-repair path:

`/root/shared-nvme/work4/outputs/n249_openpi_pi05_libero_cache_timeout_repair_10task10ep_public_main_20260612`

Completed main evidence path:

`/root/shared-nvme/work4/outputs/n248_openvla_oft_sm120_repair_10task10ep_public_main_20260612`

Completed smoke evidence path:

`/root/shared-nvme/work4/outputs/n247_openvla_oft_sm120_numpy_pin_retry_10task1ep_public_smoke_20260612`

Previous failed repair evidence path:

`/root/shared-nvme/work4/outputs/n245_openvla_oft_sm120_repair_10task1ep_public_smoke_20260612`

`/root/shared-nvme/work4/outputs/n246_openvla_oft_sm120_download_retry_10task1ep_public_smoke_20260612`

Latest probe:

At 2026-06-12 17:45 +08:00, N245 had failed during environment repair with
manifest reason `env_repair_failed` and failure layer
`sm120_environment_repair_failed`. The failing package was
`nvidia-cuda-runtime-cu12==12.8.57`, which timed out while `uv` installed
`torch==2.7.1+cu128`. N245 never started the model server and produced no
health, rollout, or aggregate.

The launcher was then patched to harden `uv` downloads with
`UV_HTTP_TIMEOUT=600`, `UV_HTTP_RETRIES=10`, and
`UV_DEFAULT_INDEX=https://pypi.tuna.tsinghua.edu.cn/simple`. At 2026-06-12
17:53 +08:00, N246 had passed the CUDA 12.8 package download and torch probe.
The torch probe reported `torch==2.7.1+cu128`, CUDA 12.8, `sm_120` and
`compute_120` support, and a successful CUDA matmul on the RTX 5090. N246 then
failed before health because the torch upgrade changed NumPy to 2.4.6, while
the TensorFlow path imported by OpenVLA-OFT requires NumPy 1.x ABI
compatibility.

The launcher was patched again to pin `numpy==1.26.4` and to run a TensorFlow
import probe before model-server startup. At 2026-06-12 20:09 +08:00, N247 had
already completed. The shard download finished at about 19:27, health became
ready at about 19:31, and the 10-task smoke rollout completed at 19:33. The
aggregate file reports 10 episodes and `mean_success=1.0`. All 10 listed
LIBERO Spatial tasks succeeded in the one-episode smoke. The model-server and
launcher processes had exited, health was no longer available after cleanup,
and the GPU was idle at 1 MiB.

At 2026-06-12 20:17 +08:00, N248 had started the 10-task by 10-episode main
promotion. The manifest truth level was
`openvla_oft_sm120_repair_10task10ep_main_no_sota`, `episodes_per_task=10`,
`max_tasks=10`, and `planned_total_episodes=100`. The model service was
healthy, GPU memory was about 16.7 GiB, and the run log showed 7/100 episodes
completed, all SUCCESS. No aggregate existed yet.

At 2026-06-12 20:38 +08:00, N248 had completed and cleaned up. The DONE marker
was written at 2026-06-12 20:33:41 +08:00, the manifest status was `passed`
with reason `harness_public_baseline_completed`, and the aggregate reported
`mean_success=0.99` over 100 LIBERO Spatial episodes. The single failed episode
was episode_idx 5 for `pick up the black bowl next to the cookie box and place
it on the plate`, which ran 220 steps and had `success=false`. The launcher and
model-server PIDs were no longer alive, no work4 Python evaluation process was
running, and the GPU was idle at about 1 MiB.

At 2026-06-12 20:56 +08:00, PUB02 N249 was launched as an openpi pi0.5 LIBERO
cache-timeout repair. The N228 root cause was a hard per-shard
`subprocess.run(... timeout=7200)` in the public GCS HTTP cache downloader. The
large pi0.5 LIBERO shards were downloading too slowly and one curl process was
killed by this local timeout after about two hours. The launcher now exposes
`CacheDownloadTimeoutSeconds` and N249 was started with 86400 seconds while
preserving the existing partial cache. The first post-launch probe showed
launcher PID 656235 alive, four curl workers active, partial cache growth from
about 2.787 GiB to about 2.805 GiB, no server health yet, no rollout, no
aggregate, and the GPU idle at about 1 MiB.

At 2026-06-12 20:58 +08:00, N249 was still running normally. The partial cache
was 2,825,773,194 bytes, with about 8.95 GiB remaining out of 12,439,085,481
bytes total. Four curl workers and the launcher were alive. The run remained in
cache acquisition, with no server health, rollout, or aggregate yet.

At 2026-06-12 21:03 +08:00, a 45-second speed probe showed the partial cache
growing from 2,850,128,010 bytes to 2,854,707,338 bytes. The short-window rate
was about 0.097 MiB/s, or 0.341 GiB/h. At that rate the remaining cache time is
about 26.2 hours before any model-server health or LIBERO rollout can start.

At 2026-06-13 04:10 +08:00, N249 was confirmed failed. It wrote FAILED at
2026-06-13 02:14:43 +08:00 with manifest reason
`pi05_libero_public_http_cache_failed`. The old 7200 s subprocess timeout was
not the active failure. The cache log shows transient public GCS transport
failures, including `curl: (56) Recv failure: Connection reset by peer` and
`curl: (28) Operation too slow`. The partial cache remained usable at
8,273,601,480 bytes, or about 66.51 percent of the expected
12,439,085,481-byte cache. N249 did not reach model-server health, rollout, or
aggregate generation.

The launcher was patched to expose `CacheDownloadAttempts=12`, to retry each
curl command in an outer Python loop, and to accept a shard when curl returns
nonzero but the resumed output file already matches the expected GCS size.
Local validation passed with 10/10 targeted tests and PowerShell `parse_ok`.
N250 was launched at 2026-06-13 04:11 +08:00 using the preserved partial
cache. By 04:15 +08:00 the final cache was complete at 12,439,085,481 bytes,
the pi0.5 model server returned `{"status": "ok"}`, and the 10-task by
10-episode LIBERO Spatial run had started. At the 04:25 +08:00 probe, N250 was
RUNNING with 64/100 episodes completed, all 64 SUCCESS, no aggregate yet, and
the RTX 5090 using about 25.2 GiB.

At 2026-06-13 04:32 +08:00, N250 had completed. The DONE marker was written at
2026-06-13 04:31:43 +08:00. The manifest status was `passed`, with reason
`openpi_pi05_libero_main_baseline_completed`, and the aggregate reported
`mean_success=0.98` over 100 LIBERO Spatial episodes. The two failures were
episode 35 for `pick up the black bowl on the cookie box and place it on the
plate`, episode_idx 4, and episode 95 for `pick up the black bowl on the wooden
cabinet and place it on the plate`, episode_idx 4. Both ran 220 steps.

After the user directed that public Spatial baselines should stop and the route
should switch to a harder LIBERO suite, the N228/N250 launcher was parameterized
with `LiberoSuite`. Local validation passed with 11/11 targeted tests and
PowerShell `parse_ok`. N251 was launched at 2026-06-13 04:33 +08:00 with
`LiberoSuite=libero_10`, run label
`LIBEROBenchmark_libero10_openpi_pi05_10task10ep_harder_suite`, and output
`/root/shared-nvme/work4/outputs/n251_openpi_pi05_libero10_10task10ep_harder_suite_20260613`.
The cache was reused, LIBERO runtime precheck reported task orders
`[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]`, server health returned `{"status": "ok"}`,
and evaluation began. At the 04:40 +08:00 probe, N251 had 17/100 episodes
completed, all 17 FAIL. The first task, `put both the alphabet soup and the
tomato sauce in the basket`, failed 10/10 episodes. The second task,
`put both the cream cheese box and the butter in the basket`, had failed 7/7
observed episodes. Each observed failure ran 220 steps. No aggregate exists
yet.

At 2026-06-13 06:13 +08:00, N251 was confirmed complete. The DONE marker was
written at 2026-06-13 05:04:05 +08:00. The manifest status was `passed`, with
reason `openpi_pi05_libero_main_baseline_completed`, suite `libero_10`, and
run_rc 0. The aggregate
`LIBEROBenchmark_LIBEROBenchmark_libero10_openpi_pi05_10task10ep_harder_suite_aggregate.json`
reported `mean_success=0.21` over 100 episodes. The run had 21 successes and
79 failures. The GPU was idle after cleanup.

After the user asked to start the next row, the OpenVLA-OFT sm120 repair
launcher was parameterized for suite, checkpoint, and unnormalization key. The
launcher was also patched to prefetch the checkpoint with `snapshot_download`,
`max_workers=1`, longer Hugging Face timeouts, and `ModelDownloadAttempts`, so
download interruptions are treated as infrastructure retries rather than model
rows. Local validation passed with 9/9 targeted tests and PowerShell
`parse_ok`. N252B was launched at 2026-06-13 06:30 +08:00 with the same
`libero_10` protocol and the same checkpoint. At the 06:47 +08:00 probe,
N252B had completed checkpoint prefetch on attempt 1, loaded the checkpoint,
reached server health, and started the 100-episode rollout. The HF cache was
about 15 GiB. The run log showed 3/100 observed episodes, all failed on
`put both the alphabet soup and the tomato sauce in the basket` with 220 steps.
No aggregate was available yet.

At 2026-06-13 08:04 +08:00, N252B was confirmed complete. The DONE marker was
written at 2026-06-13 07:18:45 +08:00. The manifest status was `passed`, with
reason `harness_public_baseline_completed`, suite `libero_10`, and run_rc 0.
The aggregate
`LIBEROBenchmark_LIBEROBenchmark_libero_10_openvla_oft_sm120_repair_10task10ep_public_main_aggregate.json`
reported `mean_success=0.24` over 100 episodes. The run had 24 successes and
76 failures. The GPU was idle after cleanup.

At 2026-06-13 after the user asked to keep the VLA line running, N254V was
briefly launched for PUB04 openpi pi0 LIBERO on `libero_10`, 10 tasks by 10
episodes, seed 7. Its server log showed that the harness file
`configs/model_servers/pi0/libero.yaml` actually loaded `pi05_libero` and
`gs://openpi-assets/checkpoints/pi05_libero`. The run was interrupted before
health and marked `INTERRUPTED_WRONG_CONFIG_LABEL`; it should not be counted as
a metric row or as openpi pi0 evidence.

N254W then replaced N254V with an explicit custom model server config using
`config_name: pi0_libero`. The output path is
`/root/shared-nvme/work4/outputs/n254w_openpi_pi0_base_libero10_10task10ep_harder_suite_20260613`.
The first probe showed marker `RUNNING`, manifest status `running`, reason
`server_starting`, truth level
`openpi_pi0_base_libero10_10task10ep_harder_suite_no_sota`, and no aggregate.
The runtime preflight passed with task orders `[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]`,
suite `libero_10`, and model server script `src/vla_eval/model_servers/pi0.py`.
The model-server log confirmed `Loading OpenPI config: pi0_libero` and started
downloading `gs://openpi-assets/checkpoints/pi0_libero`. The GPU was still idle
at about 1 MiB during early checkpoint acquisition.

At the follow-up N254W probes, checkpoint download was progressing normally.
The latest observed progress was 7.58 GiB out of 11.2 GiB. The instantaneous
download estimate had slowed to about 7 minutes 19 seconds remaining. The
manifest still reported `running`, reason `server_starting`, with no health,
rollout, or aggregate yet.

At the latest N254W probe, the job was still not complete. The manifest still
reported `running`, reason `server_starting`, health `false`, episode started
`false`, and aggregate count `0`. The model-server process was alive with
`config_name=pi0_libero`, and the checkpoint download had reached 9.11 GiB out
of 11.2 GiB. The instantaneous download estimate had slowed to roughly 3 to 4
hours remaining. The GPU was still idle at about 1 MiB because model loading
and LIBERO rollout had not started.

At the next N254W probe, the job was still in checkpoint acquisition rather
than evaluation. The manifest remained `running` with reason `server_starting`,
health `false`, episode started `false`, and aggregate count `0`. The download
had reached 10.1 GiB out of 11.2 GiB after about 3 hours of elapsed checkpoint
download time. The latest instantaneous estimates ranged from about 5 hours 50
minutes to 7 hours 40 minutes remaining. The model-server and `pi0_libero`
processes were still alive, and the GPU remained idle at about 1 MiB.

At a later probe, N254W had failed before health with manifest reason
`server_health_max_timeout`. This was not an evaluation failure. No health,
rollout, progress file, or aggregate was produced. The failure occurred during
checkpoint acquisition after the partial cache reached about 11 GiB. The
stale diagnostic `find` process from a timed-out probe was killed, the existing
`pi0_libero.partial` cache was preserved, and N254W was relaunched in the same
output directory with `health_max_timeout_seconds=86400` and
`health_stall_timeout_seconds=7200`.

After the N254W relaunch, the job returned to `RUNNING`, reason
`server_starting`, with the same custom `pi0_libero` model-server config.
The relaunch reused the partial cache rather than starting from zero. The latest
probe still had no health, rollout, progress file, or aggregate. The cache was
still in `.partial` form, with progress around 11.1 GiB out of 11.2 GiB and a
short-window estimate of a few minutes for the remaining checkpoint transfer.
The GPU remained idle at about 1 MiB because model loading had not started.

At 2026-06-14 00:20 +08, N254W was still running but had not reached health or
evaluation. The manifest remained `running`, reason `server_starting`,
health `false`, episode started `false`, and aggregate count `0`. The
model-server log still showed only checkpoint acquisition for `pi0_libero`.
The progress display reached about 11.5 GiB against a reported 11.2 GiB total,
but the cache directory remained `pi0_libero.partial` rather than the finalized
`pi0_libero` directory. The partial cache contained 38 files and about
12,384,013,572 bytes. GPU memory was still about 1 MiB, so model loading and
LIBERO rollout had not started.

At 2026-06-14 03:12 +08, N254W had failed before service health. The marker was
`FAILED`, the manifest status was `failed`, reason
`server_process_exited_before_health`, and failure layer
`pre_health_unclassified_failure`. No run log, progress file, rollout, health,
or aggregate existed. The `pi0_libero` cache had finalized from `.partial` to
`pi0_libero`, but model loading failed while reading the OCDBT checkpoint. The
server log reported TensorStore and Orbax errors including
`OUT_OF_RANGE: Error reading "params.PaliGemma.llm.embedder.input_embedding.value/0.0"`,
where the requested byte range was larger than the stored value size. The
finalized cache contained 38 files and about 23,821,229,562 bytes. This is a
checkpoint-cache integrity or checkpoint-variant mismatch failure before
health, not a LIBERO-10 algorithm metric.

The N254W cache was then repaired instead of redownloading the full checkpoint.
A GCS object-size comparison showed exactly one mismatched object:
`params/ocdbt.process_0/d/f251f0005f1667fe8e596da96c894e50`, expected
1,957,442,360 bytes but locally 1,750,408,146 bytes. The missing 207,034,214
bytes were resumed from public GCS, and the repaired file matched the GCS MD5
hash. A full prefix size check then passed with 19 objects, expected total
12,014,131,888 bytes, local total 12,014,131,888 bytes, and mismatch count 0.

After the repair, N254W was relaunched in the same output directory. At
2026-06-14 05:38 +08, the model server reached health with
`{"status": "ok"}`, the `pi0_libero` policy loaded successfully, and GPU memory
rose to about 25.3 GiB. At 2026-06-14 05:42 +08, rollout was active with
progress 10/100 episodes. The first 10 episodes all failed on
`put both the alphabet soup and the tomato sauce in the basket`, each at
220 steps. No aggregate existed yet.

At 2026-06-14 05:46 +08, N254W was still running normally. The server health
file reported `{"status": "ok"}`, the rollout progress file reported 26/100
episodes complete, and the run log contained 0 SUCCESS and 26 FAIL events. No
aggregate existed yet. The observed failures covered the first two complete
tasks and the first six episodes of `turn on the stove and put the moka pot on
it`, each at 220 steps.

At 2026-06-14 05:48 +08, the rollout progress file reported 34/100 episodes
complete. The run log contained 0 SUCCESS and 34 FAIL events. No aggregate
existed yet. The run had entered `put the black bowl in the bottom drawer of
the cabinet and close it`.

At 2026-06-14 06:34 +08, N254W was confirmed complete. The marker was `DONE`,
the manifest status was `passed`, reason `harness_public_baseline_completed`,
run_rc `0`, and the aggregate
`LIBEROBenchmark_LIBEROBenchmark_libero_10_openpi_pi0_base_10task10ep_harder_suite_aggregate.json`
reported mean_success 0.01 over 100 episodes. The run log contained 1 SUCCESS
and 99 FAIL events. The only nonzero task was `pick up the book and place it in
the back compartment of the caddy`, with mean_success 0.1 and average steps
215.0. The GPU was idle after cleanup.

After N254W completed, PUB05 Isaac GR00T N1.6 was selected as the next
top-down algorithm. Old N230 and N234 GR00T attempts had failed before health
because uv could not fetch the pinned Isaac-GR00T GitHub dependency. A manual
proxy fetch through `https://gh-proxy.com/https://github.com/` succeeded for
commit `e29d8fc50b0e4745120ae3fb72447986fe638aa6`, so N255 was launched with
that proxy. N255 passed the Git blocker and built `gr00t`, then failed before
health because the GR00T Hugging Face model weights were not cached. The
launcher was patched to use a shared Hugging Face cache. N255C validated a
complete local `0xAnkitSingh/GR00T-N1.6-LIBERO` snapshot with 14 files and
9,813,920,596 bytes. N255D was launched from that cache at 2026-06-14 16:12
+08. At 2026-06-14 17:28 +08, N255D had marker `DONE`, manifest status
`passed`, reason `harness_public_baseline_completed`, service health `true`,
episode started `true`, run return code 0, and one aggregate. The aggregate
reported mean_success 0.0 over 10 episodes, but every task had one error and
average steps 0.0. The model-server stack trace shows `CUDA error: no kernel
image is available for execution on the device` during GR00T Eagle backbone
inference. This matches the earlier RTX 5090 `sm_120` warning against a
PyTorch install supporting up to `sm_90`. Treat this as an environment
compatibility failure, not as a valid GR00T performance row.

N256 repaired the GR00T environment with a cu128 torch stack. The torch probe
reported `torch==2.7.1+cu128`, CUDA 12.8, arch list containing `sm_120` and
`compute_120`, and a successful CUDA matmul on the RTX 5090. The shared
Hugging Face model cache probe also passed. N256 reached health at 17:52 +08
and completed the LIBERO-10 10-task by one-episode smoke at 17:54 +08. At the
17:55 +08 probe, marker was `DONE`, manifest status `passed`, valid metric
claim `true`, error episode count `0`, and aggregate mean_success 0.0 over 10
episodes. The run log had 0 SUCCESS, 10 FAIL, and 0 ERROR lines. Every task
ran to 220 steps, so this is a valid smoke metric rather than the N255D CUDA
environment failure.

At 2026-06-14 22:31 +08, N257 was confirmed complete after the user requested
the full 100-episode run. The marker was `DONE`, manifest status `passed`,
reason `harness_public_baseline_completed`, health ready `true`, episode
started `true`, valid metric claim `true`, error episode count `0`, and run
return code 0. The aggregate reported mean_success 0.0 over 100 episodes. The
run log contained 0 SUCCESS, 100 FAIL, and 0 ERROR lines. Each of the 10
LIBERO-10 tasks had mean_success 0.0 and average steps 220.0. This is now the
PUB05 full same-protocol LIBERO-10 row, while N256 remains only the smoke gate.

N251 task-level means:

| Task | Mean success | Avg steps |
| --- | ---: | ---: |
| pick up the book and place it in the back compartment of the caddy | 0.9 | 176.6 |
| put the black bowl in the bottom drawer of the cabinet and close it | 0.6 | 215.1 |
| put the white mug on the plate and put the chocolate pudding to the right of the plate | 0.5 | 214.1 |
| put the white mug on the left plate and put the yellow and white mug on the right plate | 0.1 | 219.1 |
| put both moka pots on the stove | 0.0 | 220.0 |
| put both the alphabet soup and the cream cheese box in the basket | 0.0 | 220.0 |
| put both the alphabet soup and the tomato sauce in the basket | 0.0 | 220.0 |
| put both the cream cheese box and the butter in the basket | 0.0 | 220.0 |
| put the yellow and white mug in the microwave and close it | 0.0 | 220.0 |
| turn on the stove and put the moka pot on it | 0.0 | 220.0 |

N252B task-level means:

| Task | Mean success | Avg steps |
| --- | ---: | ---: |
| pick up the book and place it in the back compartment of the caddy | 1.0 | 166.8 |
| put the white mug on the plate and put the chocolate pudding to the right of the plate | 0.6 | 212.4 |
| put the black bowl in the bottom drawer of the cabinet and close it | 0.5 | 216.7 |
| put the white mug on the left plate and put the yellow and white mug on the right plate | 0.3 | 218.7 |
| put both moka pots on the stove | 0.0 | 220.0 |
| put both the alphabet soup and the cream cheese box in the basket | 0.0 | 220.0 |
| put both the alphabet soup and the tomato sauce in the basket | 0.0 | 220.0 |
| put both the cream cheese box and the butter in the basket | 0.0 | 220.0 |
| put the yellow and white mug in the microwave and close it | 0.0 | 220.0 |
| turn on the stove and put the moka pot on it | 0.0 | 220.0 |

Previous N244B note:

At 2026-06-12 13:46 +08:00, N244B had failed at 2026-06-12 07:39 +08:00
with manifest reason `server_process_exited_before_health`. The launcher wrote
a per-output Git config that rewrites
both `https://github.com/` and `git@github.com:` through
`https://gh-proxy.com/https://github.com/`. This passed the previous
MME-VLA blocker: the main `RoboMME/robomme_policy_learning.git` dependency and
the SSH-style submodule were fetched far enough for `openpi` and
`openpi-client` to build. Dependency installation also completed. The next
blocker is a runtime import error in the MME-VLA source: `cv2` imports
`/usr/lib/x86_64-linux-gnu/libGL.so.1`, which fails with undefined symbol
`_glapi_tls_Current`. N244B has no service health file, no rollout log, no
aggregate, and no GPU model load.

Runtime repair note:

OpenVLA-OFT and later waiting jobs were restarted with a four-hour health wait
after the common pre-health timeout pattern was identified. OpenVLA-OFT then
failed before service health with `server_process_exited_before_health`; its
server log ends in `RuntimeError: CUDA error: no kernel image is available for
execution on the device`. Base pi0 then completed the 10-task one-episode
smoke, but its child model-server process stayed alive and held about 24.7 GiB
of GPU memory. The generic public-baseline launcher now starts model servers in
a separate process group and cleans the process group plus same-address child
processes on exit. Downstream waiting jobs were regenerated with this patched
runner, the stale pi0 process was cleaned, and StarVLA Qwen2.5 OFT advanced to
active startup.

StarVLA repair note:

At 2026-06-15 09:47 +08, the StarVLA `cv2` blocker was reproduced as a model
server environment boundary issue. The StarVLA uv environment could import
`cv2` with a clean library path, but failed when the generic launcher injected
the LIBERO EGL and NVIDIA `LD_LIBRARY_PATH`. The generic launcher now has a
`CleanModelServerGlEnv` switch that removes GL and EGL variables only from the
model server process while keeping the LIBERO rollout process unchanged.
N261A also repaired the StarVLA uv environment from `torch 2.11.0+cu130` to
`torch 2.7.1+cu128`; CUDA was available, `sm_120` was present in the arch
list, and a CUDA matmul passed. N261C2 cached
`StarVLA/Qwen2.5-VL-OFT-LIBERO-4in1`, including the 8.22 GB
`steps_30000_pytorch_model.pt` checkpoint. N261D then loaded the cached
StarVLA checkpoint and the Qwen2.5-VL-3B base model, reached service health,
completed a LIBERO-10 10-task by one-episode smoke, and wrote an aggregate with
mean_success 0.0 over 10 episodes and 0 error rows. N261E was then launched as
the full LIBERO-10 10-task by 10-episode main run. It completed at
2026-06-15 11:23 +08 with mean_success 0.04, 4/100 successes, 96 normal fail
rows, and 0 error rows.

N262A StarVLA Qwen2.5 FAST was launched as a waiting 10-task by one-episode
smoke on port 8078 with the same clean model-server GL environment. After N261E
finished, N262A failed before health because the FAST StarVLA repository was
not present in the shared Hugging Face cache. This is a cache-preparation
failure, not a model metric. N262B was launched at 2026-06-15 11:29 +08 to
prefetch `StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1`; it completed at
2026-06-15 11:44 +08 and the shared cache now contains the 8.146 GB checkpoint.
N262C was launched as the clean-GL FAST smoke retry. It reached health,
completed the LIBERO-10 10-task by one-episode smoke at 2026-06-15 12:10 +08,
and wrote an aggregate with mean_success 0.0 over 10 episodes, 0/10 successes,
10 normal fail rows, and 0 error rows. N262D was then launched as the full
LIBERO-10 10-task by 10-episode main row. At 2026-06-15 15:13 +08, N262D was
`DONE` with status `passed`, reason `harness_public_baseline_completed`,
health ready `true`, episode started `true`, run return code 0, and one
100-episode aggregate. The final result was mean_success 0.02, with 2 success
rows, 98 normal fail rows, and 0 errors.

After the user corrected the project-page direction, N263 was launched as an
OpenVLA-OFT visual-capture job for the LIBERO-10 robotic-arm scene. N263 first
failed before rollout because the harness video recorder used a Python 3.8
incompatible runtime type alias. N263B added a compatibility patch and import
check for `vla_eval.benchmarks.video`, then completed two task-0 rollout
episodes at 2026-06-15 15:24 +08. It exported two real MP4 videos, each with
221 frames at 20 FPS. This is visual evidence for the project page, not a
main metric row.

Failure-triage note:

The earlier failures are now separated into candidate-specific layers in
`benchmark_swarm_rl/docs/n242_public_baseline_failure_triage_20260612.md`.
The public-baseline launcher also writes `failure_layer`, `repair_hint`, and
`queue_advance_requires_review` into future manifests. This prevents the queue
from reducing many pre-health failures to a generic `FAILED` state before pi0.

## Completed Or Failed Attempts

| Algorithm | Current state | Interpretation |
| --- | --- | --- |
| OpenVLA-OFT | failed before service health | CUDA runtime compatibility blocker, not an evaluation result |
| OpenVLA-OFT N245 sm120 repair | failed during environment repair | PyPI download timeout for `nvidia-cuda-runtime-cu12==12.8.57`, not an evaluation result |
| OpenVLA-OFT N246 sm120 download retry | failed before service health | torch sm120 probe passed, then TensorFlow import failed due NumPy 2.4.6 ABI incompatibility, not an evaluation result |
| OpenVLA-OFT N247 sm120 NumPy-pin retry | completed 10-task one-episode smoke | mean_success 1.0, 10/10 episodes succeeded; smoke only, not 10-episode main comparison |
| OpenVLA-OFT N248 sm120 NumPy-pin main | completed 10-task 10-episode main row | mean_success 0.99, 99/100 episodes succeeded; same LIBERO Spatial protocol, seed 7, no public SOTA claim |
| OpenVLA-OFT N252B `libero_10` row | completed harder-suite row | same suite, checkpoint, unnorm key, seed, and 10 by 10 protocol as the intended OpenVLA-OFT LIBERO-10 row; mean_success 0.24, 24/100 successes |
| openpi pi0.5 N249 cache-timeout repair | failed before service health | fixed the N228 two-hour per-shard timeout but then failed on transient public GCS curl 56 or curl 28 transport failures; partial cache reached 8.27 GB; no rollout or aggregate |
| openpi pi0.5 N250 curl retry repair | completed Spatial main row | final pi05_libero cache complete, server health ok, 100 LIBERO Spatial episodes completed, mean_success 0.98, 98/100 successes |
| openpi pi0.5 N251 `libero_10` harder-suite pivot | completed harder-suite row | suite `libero_10`, 100 episodes, mean_success 0.21, 21/100 successes; strong contrast with Spatial 0.98 |
| openpi pi0 N254V internal label check | interrupted before health | harness config named pi0 loaded `pi05_libero`; interrupted before health so it is not a metric row and not openpi pi0 evidence |
| openpi pi0 base N254W `libero_10` harder-suite row | completed harder-suite row | cache repaired, model health ready, `pi0_libero` loaded, aggregate mean_success 0.01, 1/100 successes |
| Isaac GR00T N1.6 N255D `libero_10` smoke | completed with environment error | Reached health and wrote aggregate mean_success 0.0 over 10 episodes, but all 10 episodes errored at step 0 with CUDA `no kernel image` on RTX 5090 `sm_120`; superseded by N256 |
| Isaac GR00T N1.6 N256 `libero_10` sm120 repair smoke | completed valid smoke | cu128 torch probe passed with `sm_120`; 10-task by one-episode smoke produced mean_success 0.0, 0/10 successes, 10 normal FAIL rows, and no error episodes |
| Isaac GR00T N1.6 N257 `libero_10` sm120 repair main | completed harder-suite row | promoted after user request; same 10-task by 10-episode LIBERO-10 protocol as N251, N252B, and N254W; aggregate mean_success 0.0, 0/100 successes, 100 normal FAIL rows, 0 error episodes |
| base pi0 | completed 10-task one-episode smoke | Local smoke aggregate exists, not the 10-episode main comparison |
| StarVLA Qwen2.5 OFT first route | failed before service health | Cold-start dependency timeout, not an evaluation result |
| StarVLA Qwen2.5 OFT cached retry | failed before service health | `cv2` import failed on `libGL.so.1` undefined symbol, not an evaluation result |
| StarVLA Qwen2.5 FAST | failed before service health | Same `cv2` and `libGL.so.1` runtime conflict, not an evaluation result |
| StarVLA Qwen2.5 GR00T | failed before service health | Same `cv2` and `libGL.so.1` runtime conflict, not an evaluation result |
| StarVLA Qwen3 OFT | failed before service health | Same `cv2` and `libGL.so.1` runtime conflict, not an evaluation result |
| StarVLA Qwen3 PI | failed before service health | Same `cv2` and `libGL.so.1` runtime conflict, not an evaluation result |
| StarVLA Qwen2.5 OFT N261A clean-GL and sm120 repair | completed environment repair | Model server GL environment separated from LIBERO EGL path; StarVLA uv env repaired to `torch 2.7.1+cu128`; CUDA `sm_120` probe and CUDA matmul passed |
| StarVLA Qwen2.5 OFT N261C2 weight prefetch | completed cache repair | Cached `StarVLA/Qwen2.5-VL-OFT-LIBERO-4in1` and Qwen2.5-VL-3B base-model files under the shared Hugging Face cache; no metric row |
| StarVLA Qwen2.5 OFT N261D `libero_10` smoke | completed valid smoke | Reached service health and completed 10 LIBERO-10 one-episode tasks with mean_success 0.0, 0/10 successes, 10 normal FAIL rows, and 0 error rows |
| StarVLA Qwen2.5 OFT N261E `libero_10` main | completed main row | Final mean_success 0.04, 4/100 successes, 96 normal FAIL rows, and 0 error rows |
| StarVLA Qwen2.5 FAST N262A `libero_10` smoke | failed before health | FAST weights were not cached; no rollout, no aggregate, and no metric row |
| StarVLA Qwen2.5 FAST N262B weight prefetch | completed cache repair | `StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1` snapshot_download completed at 2026-06-15 11:44 +08; cache size 7.6 GiB with 8.146 GB checkpoint |
| StarVLA Qwen2.5 FAST N262C `libero_10` smoke retry | completed valid smoke | Reached health and completed 10 LIBERO-10 one-episode tasks with mean_success 0.0, 0/10 successes, 10 normal FAIL rows, and 0 error rows |
| StarVLA Qwen2.5 FAST N262D `libero_10` main | completed main row | Launched after valid smoke; final mean_success 0.02, 2/100 successes, 98 normal FAIL rows, 0 errors, and a valid 100-episode aggregate |
| OpenVLA-OFT N263B visual capture | completed visual evidence | Two LIBERO-10 task-0 MP4 rollouts exported after the video-recorder compatibility patch; visual page evidence only, not a main metric row |
| MME-VLA pi0.5 baseline | failed before service health | Network git dependency fetch failed for pinned `RoboMME/robomme_policy_learning.git`, not an evaluation result |
| MME-VLA pi0.5 N244B git-proxy ssh-rewrite retry | failed before service health | Git proxy fixed the earlier fetch blocker, but startup then failed on the same `cv2` and `libGL.so.1` runtime conflict seen in StarVLA, not an evaluation result |
| CogACT Base | failed before service health | Network git dependency fetch failed for pinned `arnoldland/openvla`, not an evaluation result |
| StarVLA Qwen2.5 OFT long-health retry | failed before service health | Same `cv2` and `libGL.so.1` runtime conflict, not an evaluation result |
| pi0 FAST | failed before service health | Dependency build and service startup timeout, not an evaluation result |
| DB-CogACT | failed before service health | Dependency build and service startup timeout, not an evaluation result |

The failed rows are not performance comparisons. They happened before model
health and before any LIBERO episode.

Base pi0 smoke result:

| Field | Value |
| --- | --- |
| Output | `/root/shared-nvme/work4/outputs/n241b_openpi_pi0_libero_10task1ep_public_smoke_20260612` |
| Aggregate | `results/LIBEROBenchmark_LIBEROBenchmark_libero_spatial_openpi_pi0_libero_10task1ep_public_smoke_aggregate.json` |
| Scope | LIBERO Spatial, 10 tasks, 1 episode per task, seed 7 |
| Mean success | 0.90 |
| Failed task | `pick up the black bowl in the top drawer of the wooden cabinet and place it on the plate` |
| Boundary | Smoke aggregate only, not a public SOTA or 10-episode main row |

Common root cause:

The failed candidates exhausted the earlier one-hour health window while still
building dependencies or downloading model assets. Their logs contain no
rollout, no aggregate, and no decisive inference traceback. The queue now uses
a four-hour health window for repaired public-smoke attempts.

## Waiting Order

| Order | Algorithm |
| ---: | --- |
| 1 | N261E StarVLA Qwen2.5 OFT LIBERO-10 10task10ep main run completed at 2026-06-15 11:23 +08 with mean_success 0.04, 4/100 successes, 96 normal fail rows, and 0 errors. |
| 2 | N262A StarVLA Qwen2.5 FAST LIBERO-10 10task1ep smoke failed before health because FAST weights were not cached. It has no metric. |
| 3 | N262B StarVLA Qwen2.5 FAST weight prefetch completed at 2026-06-15 11:44 +08. |
| 4 | N262C StarVLA Qwen2.5 FAST LIBERO-10 10task1ep smoke retry completed at 2026-06-15 12:10 +08 with mean_success 0.0, 0/10 successes, 10 normal fail rows, and 0 errors. |
| 5 | N262D StarVLA Qwen2.5 FAST LIBERO-10 10task10ep main completed at 2026-06-15 15:13 +08 with mean_success 0.02, 2/100 successes, 98 normal fail rows, and 0 errors. |
| 6 | N263B OpenVLA-OFT visual capture completed at 2026-06-15 15:24 +08 and exported two real LIBERO-10 MP4 rollout videos for the project homepage. |

The N241 public-smoke queue has no remaining waiting job. N244B was a new
single-candidate repair retry, not a relaunch of the full public queue.

Execution order rule:

After N244B, continue by scanning the current true progress table from top to
bottom. Completed rows are skipped. Blocked rows are handled only through their
recorded repair action. Do not special-case PUB04 openpi pi0 for the next
launch unless it is the first unblocked executable row reached by this
top-down scan.

## Same-Protocol Result State

OpenVLA-OFT N248 completed the first public same-protocol main aggregate:
LIBERO Spatial, 10 tasks by 10 episodes, seed 7, mean_success 0.99, 99/100
episodes. openpi pi0.5 N250 completed the second public same-protocol Spatial
main aggregate at mean_success 0.98, 98/100 episodes. Existing local
same-protocol rows remain LOCAL01 H-MAC-E at 0.87 and LOCAL02 OpenVLA
fine-tuned LIBERO Spatial at 0.82. Public smoke aggregates also exist for
OpenVLA-OFT N247 at 1.0 over 10 one-episode tasks and base pi0 at 0.90 over 10
one-episode tasks, but those smoke rows are not main comparisons.

Spatial saturation decision:

LIBERO Spatial is now treated as a runability and sanity gate. It is not a
decisive main ranking protocol for frontier public VLA comparisons because two
strong public rows reached 0.98 or higher under the same seed and 100-episode
protocol. The active route has pivoted to `libero_10`.

## Current True Progress Table

Latest probe time: 2026-06-15 15:25 +08:00

Use this table for human-facing recovery status instead of only reporting
aggregate counts.

## Current LIBERO-10 User Report Table

| Algorithm | Current state |
| --- | --- |
| openpi pi0.5 N251 | LIBERO-10 completed. Final mean_success 0.21, 21/100 successes. Preserve this result. |
| OpenVLA-OFT N252B | LIBERO-10 completed. Final mean_success 0.24, 24/100 successes. |
| openpi pi0 base N254W | LIBERO-10 completed. Final mean_success 0.01, 1/100 successes. |
| Isaac GR00T N1.6 N257 | LIBERO-10 completed after sm120 repair. Final mean_success 0.0, 0/100 successes, 100 normal FAIL rows, 0 error rows. |
| DB-CogACT N258D | LIBERO-10 completed after uv and model-cache repair. Final mean_success 0.13, 13/100 successes, 87 normal FAIL rows, 0 error rows. |
| X-VLA N259C | LIBERO-10 completed after protobuf and HF-timeout repair. Final mean_success 0.21, 21/100 successes, 79 normal FAIL rows, 0 error rows. |
| VLANeXt N260E | LIBERO-10 completed. Final mean_success 0.26, 26/100 successes, 74 normal FAIL rows, 0 error rows. |
| StarVLA Qwen2.5 OFT N261E | LIBERO-10 completed after clean-GL, cu128, and weight-cache repair. Final mean_success 0.04, 4/100 successes, 96 normal FAIL rows, 0 error rows. |
| StarVLA Qwen2.5 FAST N262A | Failed before health because FAST weights were not cached. No metric row. |
| StarVLA Qwen2.5 FAST N262B | FAST weight prefetch completed at 11:44 +08; cache now has the 8.146 GB checkpoint. |
| StarVLA Qwen2.5 FAST N262C | LIBERO-10 smoke completed. Final mean_success 0.0, 0/10 successes, 10 normal FAIL rows, 0 error rows. |
| StarVLA Qwen2.5 FAST N262D | LIBERO-10 main completed. Final mean_success 0.02, 2/100 successes, 98 normal FAIL rows, 0 errors. |
| OpenVLA-OFT N263B visual capture | Completed two real LIBERO-10 MP4 rollout videos for the project homepage. This is visual evidence only, not a metric row. |

N253 has frozen the two-row LIBERO-10 VLA sanity table and task-level matrix in
`benchmark_swarm_rl/docs/n253_libero10_vla_sanity_gate_20260613.md`. The VLA
branch can continue as a bounded robotic-manipulation simulation benchmark
branch, but it should not be used as UAV/UGV deployment evidence.

| ID | Method | Year | Current state | Evidence or blocker |
| --- | --- | ---: | --- | --- |
| LOCAL01 | H-MAC-E surface close hold | 0 | completed main row | 10 tasks by 10 episodes, mean success 0.87 |
| LOCAL02 | OpenVLA fine-tuned LIBERO Spatial | 2024 | completed public anchor row | 10 tasks by 10 episodes, mean success 0.82 |
| PUB01 | OpenVLA-OFT | 2025 | completed Spatial and `libero_10` rows | N247 completed 10 tasks by 1 episode with mean_success 1.0; N248 completed Spatial 10 tasks by 10 episodes with mean_success 0.99, 99/100 episodes, seed 7; N252B completed `libero_10` 10 tasks by 10 episodes with mean_success 0.24, 24/100 successes |
| PUB02 | openpi pi0.5 LIBERO | 2025 | completed Spatial and `libero_10` rows | N250 completed LIBERO Spatial 10 by 10 with mean_success 0.98, 98/100 successes; after the user stopped further public Spatial baselines, N251 ran `libero_10` 10 by 10 and completed with mean_success 0.21, 21/100 successes, showing that the harder suite restores useful discriminative pressure |
| PUB03 | openpi pi0 FAST LIBERO | 2025 | no metric | failed before health during dependency startup |
| PUB04 | openpi pi0 LIBERO | 2025 | completed `libero_10` row | prior 10-task one-episode Spatial smoke mean success 0.90; N254W completed `libero_10` 10 tasks by 10 episodes with custom `pi0_libero` config after cache repair; final mean_success 0.01, 1/100 successes |
| PUB05 | Isaac GR00T N1.6 LIBERO | 2025 | completed `libero_10` row after sm120 repair | N256 repaired torch to `2.7.1+cu128`, confirmed `sm_120` CUDA matmul, and passed the 10-task by one-episode smoke; N257 then completed the full LIBERO-10 10-task by 10-episode row with mean_success 0.0, 0/100 successes, and no error episodes |
| PUB06 | DB-CogACT LIBERO | 2025 | completed `libero_10` row after uv and model-cache repair | N258 failed before health with `dependency_or_model_asset_cold_start` while repeatedly downloading `nvidia-cudnn-cu12`; N258C completed the 10-task by one-episode smoke with mean_success 0.10; N258D completed the full LIBERO-10 10-task by 10-episode row with mean_success 0.13, 13/100 successes, and no error episodes |
| PUB07 | X-VLA LIBERO | 2025 | completed `libero_10` row after repair | N236C failed before health during dependency or model-asset cold start; N259 identified missing `protobuf` in the X-VLA service dependency block; N259B completed the 10-task by one-episode repair smoke with mean_success 0.20; N259C completed the full LIBERO-10 10-task by 10-episode row with mean_success 0.21, 21/100 successes, and no error episodes |
| PUB08 | VLANeXt LIBERO | 2025 | completed `libero_10` row after weight-cache and CUDA repair | N236B failed before health while uv dependencies were still downloading; N260 passed dependencies and source clone but failed before health because weights were not cached; N260B cached `VLANeXt_libero_10.pt`; N260C repaired torch to cu128 with CUDA available; N260D completed the 10-task by one-episode smoke with mean_success 0.30 and 0 errors; N260E completed the 10-task by 10-episode main row with mean_success 0.26, 26/100 successes, and 0 errors |
| PUB09 | StarVLA Qwen2.5 OFT LIBERO | 2026 | completed `libero_10` row after clean-GL and sm120 repair | Earlier cached retry and queue-end retry failed before health on the `cv2` and `libGL` conflict; N261A separated the model server GL environment and repaired torch to cu128; N261C2 cached the StarVLA and Qwen base weights; N261D completed the 10-task by one-episode smoke with mean_success 0.0 and 0 errors; N261E completed the full 10-task by 10-episode main row with mean_success 0.04, 4/100 successes, and 0 errors |
| PUB10 | StarVLA Qwen2.5 FAST LIBERO | 2026 | completed `libero_10` main after cache repair and smoke | Earlier attempt failed before health on the same `cv2` and `libGL` conflict; N262A then failed before health because FAST weights were not cached; N262B cached FAST weights; N262C completed the 10-task by one-episode smoke with mean_success 0.0 and 0 errors; N262D completed the full 10-task by 10-episode main row with mean_success 0.02, 2/100 successes, and no error episodes |
| PUB11 | StarVLA Qwen2.5 GR00T LIBERO | 2026 | no metric | failed before health on the same cv2 and libGL conflict |
| PUB12 | StarVLA Qwen3 OFT LIBERO | 2026 | no metric | failed before health on the same cv2 and libGL conflict |
| PUB13 | StarVLA Qwen3 PI LIBERO | 2026 | no metric | failed before health on the same cv2 and libGL conflict |
| PUB14 | MME-VLA pi0.5 baseline | 2026 | no metric | N244B failed before health after git and dependency fixes; current blocker is `cv2` and `libGL.so.1` undefined symbol `_glapi_tls_Current` |
| PUB15 | CogACT Base | 2025 | no metric | git dependency fetch failed before health |
| CTX01 | UniVLA | 2025 | context only | no confirmed runnable local harness route |
| CTX02 | DB-pi0 LIBERO | 2025 | context only | no confirmed runnable local harness route |
| CTX03 | DB-MemVLA LIBERO | 2025 | context only | no confirmed runnable local harness route |
| CTX04 | pi0.7 | 2026 | frontier context only | no confirmed public LIBERO route in work4 |
| CTX05 | SmolVLA LeRobot | 2025 | frontier context only | no confirmed local LIBERO route |

## Queue Governance Rule

Use this file as the plain-language queue state. Remote manifests may still say
`waiting_for_openpi_or_gpu` because that is the legacy waiting label in the
launcher. The actual active blocker should be read from this file and the most
recent remote probe.

When a candidate fails before service health, update three fields:

| Field | Meaning |
| --- | --- |
| Active algorithm | Which model is currently starting, loading, or evaluating |
| Failed attempts | Which model failed before health, during rollout, or after aggregate |
| Waiting order | Which model should start next without concurrent GPU or port contention |

## Subagent Boundary

Safe for subagents:

- Queue status inspection.
- Read-only aggregate checks.
- Action-schema audit cards.
- StarVLA or pi0 failure-log diagnosis.
- Same-backbone wrapper planning.
- Engineering-extension planning before final ablation and seed stability.

Controller-only tasks:

- Remote GPU submission.
- Model-server startup.
- Process cleanup.
- Queue ordering changes.
- Wrapped rollout launch.
- Engineering stress launches.
- Bridge checkpoint and evidence-log edits.

## Non Claims

- No public SOTA claim.
- Do not collapse the earlier public candidates into performance failures; use
  N242 failure layers before interpreting the queue.
- The pi0 aggregate is a 10-task one-episode smoke row, not a 10-episode main
  comparison.
- The earlier pre-repair OpenVLA-OFT attempt did not produce a rollout or
  aggregate; the repaired N248 OpenVLA-OFT row did produce a same-protocol main
  aggregate.
- N244B did not produce health, rollout, or aggregate.
