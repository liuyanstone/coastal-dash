# Coastal Dash / 海岸疾驰

An original, bilingual three-lane racing game for GitHub Pages. No account, ChatGPT, build tools, or server required.

## Controls and goal

Use left/right arrow keys, A/D, or the large on-screen arrows. Tap for one lane change or hold to cross multiple lanes. These are the only movement directions. Acceleration is automatic. Each race lasts 60 seconds of active play. Collisions slow the car but never end the race early.

Read the three-lane warning sign: symbols mark obstacles and a dash marks an open lane. Every obstacle, including other racers, has advance warning. All groups leave at least one open lane. Difficulty controls top speed, warning distance and the frequency of two-lane obstacles.

| Level | Starting speed | Maximum speed | Minimum warning at top speed |
| --- | ---: | ---: | ---: |
| Easy | 70 km/h | 150 km/h | 2.25 seconds |
| Medium | 85 km/h | 185 km/h | 1.60 seconds |
| Hard | 100 km/h | 220 km/h | 1.00 second |

Warnings start farther ahead than the steering time required to reach any lane. Consecutive warning groups are spaced so the previous rough patch clears before the next warning. Courses are seeded by local date, difficulty and race number. Each group of four hazards includes all four types.

## Obstacles

- **Rough road:** caps speed at 55 km/h while the car overlaps its lane and 24-metre patch. Changing lanes removes the cap immediately; speed then recovers automatically.
- **Traffic cones:** immediately removes 40% of current speed.
- **Tumbleweed:** stops the car for 0.8 seconds.
- **Other racer:** stops the car for 1.6 seconds.

After a collision, automatic acceleration is reduced to 65% for three seconds. Each obstacle group can count as a collision only once, including when the car remains stopped beside it. Road motion and obstacle approach follow actual driving distance, so stopping the car stops the scenery rather than making hazards slide past a stationary driver. The displayed warning ETA is an estimate based on current speed, and increases when the car slows.

## Scoring and saved progress

Average speed (km/h) = distance (metres) × 3.6 ÷ active elapsed seconds. The score is average speed × 1,000, rounded to the nearest 10. Hits do not incur a separate score penalty: they lower speed and therefore the time-weighted average, including time stopped after collisions.

A fixed 120 Hz simulation makes scoring independent of rendering frame rate. Every finished race includes exactly 7,200 simulation ticks. Pause, instructions, a hidden page or loss of window focus stop the race; paused time never enters the average. Reopening an unfinished drive resumes it paused, preserving distance, speed, lane, hazards and remaining time.

Choose any of three difficulties and replay freely. Keep only the highest finished score at each difficulty for each local calendar day. A lower or unfinished replay does not replace a best. Previous daily records, sound, language and active race are saved on the same browser/device. There are no accounts, cross-device sync or analytics.

## Reference

Lumosity’s public [Highway Hazards guide](https://help.lumosity.com/hc/en-us/articles/12847066257303-Highway-Hazards) describes left/right three-lane controls, advance warning signs, rough road, tumbleweeds, other racers, and scoring based on average speed. Coastal Dash follows those public principles with original SVG art, interface, courses, physics, 60-second duration, obstacle tuning and difficulty settings. Unlike the reference, all racers are warned, as requested. It does not use Lumosity source code, assets, recordings or private specifications, and is not affiliated with Lumosity.

## Run, verify and publish

Serve this directory with `python3 -m http.server 8783`, then open localhost:8783. ES modules require HTTP(S), not a file URL.

Run `node check.mjs` with Node.js. The checks cover 180 fair courses, all obstacle types, 3 fully avoidable 60-second races, safe lane reachability, time-weighted scoring, exact fixed-speed distance, collision effects, ongoing rough-road caps, full stops, steering bounds, pause/resume, frame-rate independence, daily best scores, replay, saved state, corruption handling, local dates and English/Chinese parity.

Publish the main branch root with GitHub Pages. Google Fonts are optional, with local fallbacks. Sound is generated locally through Web Audio and requires no downloads or microphone.
