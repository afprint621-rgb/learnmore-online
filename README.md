# LearnMore Academy

A mobile-friendly starter landing page for a Zimbabwean learning platform serving ECD through Grade 7, in English and Shona.

## Current status

This is the first visual website prototype only. It includes a responsive home page, grade selector, English/Shona text toggle, learning/game/quiz/shop concept sections, and a parent information area. It is not yet a production learning platform: there is no login, learner data, video playback, quiz scoring, subscription/payment processing, order system, admin panel, or mobile app. The grade selector and language toggle are front-end demonstrations.

## Run locally

Open `index.html` in a browser. Fonts load from Google Fonts when online; the page falls back to system sans-serif fonts if unavailable.

## Product decisions captured

- Audience: children in Zimbabwe, ECD through Grade 7
- Languages: English and Shona
- Platforms: responsive website plus planned iOS and Android apps
- Access: sample lessons and subscription content
- Family: one adult account managing up to two children
- Subscription: monthly (30 days, provisional) or termly (120 days)
- Payment: EcoCash, with adult-submitted proof reviewed by an administrator before activation
- Shop: learning materials; manual payment review; delivery currently in Mutare

## Safety and production requirements

- Keep account creation, payment proofs, subscriptions, and purchases in an adult-controlled area.
- Do not collect unnecessary personal information about children; do not add public child profiles or open chat.
- Store payment evidence privately with restricted admin access; never put it in a public repository.
- Before launch, select and verify a video host/DRM provider for FairPlay (iOS) and Widevine (Android), including offline-license support, expiry behavior, and device compatibility.
- Implement secure authentication, server-side authorization, content moderation/parent controls as appropriate, privacy notices, backups, and support processes.
- Review Apple/Google store billing requirements and Zimbabwean privacy, consumer, and commerce obligations with qualified providers before launch.

## Suggested next build milestones

1. Confirm final brand/content details, exact monthly-plan dates, and subscription pricing.
2. Create a secure backend and adult/child profile model (maximum two child profiles per adult account).
3. Add admin-managed courses, lessons, quizzes, shop items, and payment-verification workflows.
4. Integrate video hosting and DRM after a vendor proof-of-concept on real iOS and Android devices.
5. Build the apps, test accessibility and safety, then stage and launch the website and apps.
