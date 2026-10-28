# Coastal Dash / 海岸疾驰

An original, bilingual three-lane racing game for GitHub Pages. No account, ChatGPT, build tools, or server required.

## Controls and goal

Use left/right arrow keys, A/D, or the large on-screen arrows. Tap for one lane change or hold to cross multiple lanes. These are the only movement directions. Acceleration is automatic. Each race lasts 90 seconds of active play. Collisions slow the car but never end the race early.

There is one fast racing mode, with no difficulty selector. Start at **220 km/h**, reach **360 km/h** in about two clean seconds, and recover much faster after collisions. Most groups block two lanes, and the planned open lane changes at every group. At top speed, warnings give **1.2 seconds initially, tightening to 0.75 seconds**. Groups arrive roughly every **2.15–2.4 seconds** when driving at full speed. Each group of four includes all four obstacle types.

Read the three-lane sign: symbols mark obstacles and a dash marks an open lane. Every obstacle has advance warning, and every group leaves a reachable open lane. Presentation uses amplified optical flow: lane markings move at 6× the driving distance, roadside landmarks and guideposts at 10×, and shoreline waves at 7×. Large palms, rocks, shrubs and beach shelters rush from the horizon past the bottom edge, with directional motion trails. SVG objects are reused between frames for smooth movement. These optical-flow multipliers do not change the displayed speed or average-speed scoring. Motion still stops when the car stops or the race is paused.

Warnings allow more time than the lane-crossing movement requires. Consecutive groups are spaced so the previous rough patch clears before the next warning. Courses are seeded by local date and race number.

## Obstacles

- **Rough road:** caps speed at 55 km/h while the car overlaps its lane and 24-metre patch. Changing lanes removes the cap immediately; speed then recovers automatically.
- **Traffic cones:** immediately removes 40% of current speed.
- **Tumbleweed:** stops the car for 0.8 seconds.
- **Other racer:** stops the car for 1.6 seconds.

After a collision, automatic acceleration is reduced to 65% for three seconds. Each obstacle group can count as a collision only once, including when the car remains stopped beside it. Road motion and obstacle approach follow actual driving distance, so stopping the car stops the scenery rather than making hazards slide past a stationary driver. The displayed warning ETA is an estimate based on current speed, and increases when the car slows.

## Scoring and saved progress

Average speed (km/h) = distance (metres) × 3.6 ÷ active elapsed seconds. The score is average speed × 1,000, rounded to the nearest 10. Hits do not incur a separate score penalty: they lower speed and therefore the time-weighted average, including time stopped after collisions.

A fixed 120 Hz simulation makes scoring independent of rendering frame rate. Every finished race includes exactly 7,200 simulation ticks. Pause, instructions, a hidden page or loss of window focus stop the race; paused time never enters the average. Reopening an unfinished drive resumes it paused, preserving distance, speed, lane, hazards and remaining time.

Replay the single racing mode freely. Keep only the highest finished score for each local calendar day. A lower or unfinished replay does not replace a best. Previous daily records, sound, language and the active race are saved on the same browser/device. There are no accounts, cross-device sync or analytics.

Earlier completed records are archived separately as “Earlier version” so they do not compete with the new 360 km/h mode. When migrating, the original three-level save is also backed up locally under `coastal-dash-archive-v1`. An unfinished earlier-version course is not resumed with different physics; the new mode starts fresh.

## Reference

Lumosity’s public [Highway Hazards guide](https://help.lumosity.com/hc/en-us/articles/12847066257303-Highway-Hazards) describes left/right three-lane controls, advance warning signs, rough road, tumbleweeds, other racers, and scoring based on average speed. Coastal Dash follows those public principles with original SVG art, interface, courses, physics, 90-second duration, obstacle tuning and single fast mode. Unlike the reference, all racers are warned, as requested. It does not use Lumosity source code, assets, recordings or private specifications, and is not affiliated with Lumosity.

## Run, verify and publish

Serve this directory with `python3 -m http.server 8783`, then open localhost:8783. ES modules require HTTP(S), not a file URL.

Run `node check.mjs` and `node check-motion.mjs` with Node.js. The motion checks verify fast foreground traversal, continuous object positions, frozen paused/stopped frames and bounded reusable scene pools. The checks cover 180 fair single-mode courses, all obstacle types, fully avoidable 90-second races, safe lane reachability, time-weighted scoring, exact fixed-speed distance, collision effects, ongoing rough-road caps, full stops, steering bounds, pause/resume, frame-rate independence, single daily best scores, replay, saved state, earlier-version migration, corruption handling, local dates and English/Chinese parity.

Publish the main branch root with GitHub Pages. Google Fonts are optional, with local fallbacks. Sound is generated locally through Web Audio and requires no downloads or microphone.

Cars and tumbleweeds can cross one adjacent lane during their approach. Warnings name the origin and destination (for example, “Left → Middle”), outline the origin and emphasize the destination. One actual object moves smoothly between these lanes; rendering and collision detection share its exact position. The lane outside the swept pair remains safe throughout. Completed 60-second best scores are preserved using their original elapsed time; unfinished older courses restart under the new rules.
