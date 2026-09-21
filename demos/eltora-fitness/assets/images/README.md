# Image library (batch 1 of 2)

These 20 images are the first batch. The site has 38 image slots, so some photos serve more than one slot, each with a different crop (set inline on the `<img>` in `index.html`). The hero has no backdrop photo. When batch 2 arrives, swap the `src` (and adjust `object-position` if needed) on any slot you want to replace.

| # | File | Subject | Used in slot(s) |
|---|---|---|---|
| 01 | `eltora-01-elan-strength-coach.jpg` | Elan, strength coach (poster) | coach-elan |
| 02 | `eltora-02-rithaniya-wellness-coach.jpg` | Rithaniya, wellness coach (poster) | coach-rithaniya |
| 03 | `eltora-03-ryan-conditioning-coach.jpg` | Ryan, conditioning coach (poster) | coach-ryan |
| 04 | `eltora-04-maya-performance-coach.jpg` | Maya, performance coach (poster) | coach-maya |
| 05 | `eltora-05-battle-rope-female.jpg` | Female battle-rope training | edit-cardio, results-discipline |
| 06 | `eltora-06-back-workout-chalk.jpg` | Male back workout with chalk | studio-strength, lookbook-01 |
| 07 | `eltora-07-functional-training-area.jpg` | Functional training area / gym interior | studio-functional, studio-cardio, location-interior |
| 08 | `eltora-08-dumbbell-rack.jpg` | Dumbbell rack | studio-freeweights, lookbook-02, lookbook-09 |
| 09 | `eltora-09-barbell-plates.jpg` | Barbell with plates | edit-barbell, lookbook-03, cta-bg |
| 10 | `eltora-10-sprint-athletic.jpg` | Male sprint / athletic training | program-athletic, edit-functional, lookbook-04 |
| 11 | `eltora-11-personal-training-session.jpg` | Personal training session (coach + member) | edit-dumbbell, lookbook-05 |
| 12 | `eltora-12-battle-rope-male.jpg` | Male battle-rope workout | program-functional, results-consistency, lookbook-06 |
| 13 | `eltora-13-post-workout-recovery.jpg` | Female post-workout recovery | results-progress, studio-recovery, lookbook-10 |
| 14 | `eltora-14-premium-gym-interior.jpg` | Premium ELTORA gym interior | studio-floor, lookbook-08 |
| 15 | `eltora-15-discipline-barbell-banner.jpg` | Discipline / barbell banner | banner-discipline |
| 16 | `eltora-16-personal-training-program.jpg` | Personal training programme | program-personal |
| 17 | `eltora-17-fat-loss-program.jpg` | Fat-loss training | program-fatloss, lookbook-07 |
| 18 | `eltora-18-muscle-building-program.jpg` | Muscle-building / dumbbell | program-muscle |
| 19 | `eltora-19-strength-deadlift-program.jpg` | Strength / deadlift | program-strength |
| 20 | `eltora-20-arjun-strength-coach.jpg` | Arjun, strength coach (poster) | edit-strength |

Source sizes: 1145x1374 (coach posters), 1536x1024 (programme and banner images), 1672x941 (scene images). They are saved as high-quality JPEG at native size with no upscaling.

Run `python3 tools/check_images.py` after changing any image to confirm nothing is missing or unused.
