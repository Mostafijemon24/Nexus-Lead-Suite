# Items requiring your approval

Nothing below has been applied to the live site. Reply with the item IDs you approve.

| ID | Decision needed | Default in the current build |
| --- | --- | --- |
| A1 | **Homepage hero wording.** The brief suggests "Professional Logo & Graphic Design, Enhanced by AI". The live site's actual AI service is *AI logo cleanup and vectorization* (fixing logos made with ChatGPT/Midjourney/Canva), not AI-assisted design. To avoid an unsupported claim, the hero keeps the approved H1 "Custom Logo Design & AI Logo Redesign in Austin, TX" and the existing AI-cleanup copy, with the requested CTA set (Get a Free Design Consultation / Explore Our Portfolio / Read Customer Reviews). Confirm, or confirm that AI-assisted design is genuinely offered so the headline can change | Existing H1 kept |
| A2 | **Spanish.** No Spanish content exists; the live switcher opens a Google-translated copy. The new switcher does the same for now. Native `/es/` routes (hreflang, translated navigation, metadata and content) need professionally translated copy before they can be published | Google-translate link, `/es/` disabled |
| A3 | **Navigation grouping.** Proposed desktop menu: Home · Logo Design ▾ · Industries ▾ · Branding ▾ · Graphic Design · Website Design · Portfolio · Blog (+ phone + Free Consultation). Mobile: Home, Services, Industries, Portfolio, About, Locations, Blog, Contact. All URLs unchanged | Proposed grouping live in staging |
| A4 | **Typography unification.** Older pages used Antonio + Saira Condensed; the newer pages Inter + DM Serif Display. The rebuild uses Inter + DM Serif Display everywhere | Unified |
| A5 | **Accessible orange.** Text and button fills use a slightly deeper orange (`#c44100` / `#bf3f00`) so text passes WCAG AA; large accents keep brand `#e04a00` | Applied |
| A6 | **Thin/duplicate pages.** 14 location pages and 8 industry pages share a template. All are kept. Say if any should be consolidated or expanded; none were removed | All kept |
| A7 | **Reviews.** Provide verified reviews (text, reviewer name, source link, date, rating) to show on-site, or confirm the "Read our Google reviews" approach. The Google listing link uses the Maps CID from your footer map embed; confirm it is the correct profile | Link-only, no fabricated reviews |
| A8 | **Portfolio names.** 10 portfolio images have no descriptive alt text; supply project names/industries (see `portfolio-inventory.md`) or approve the generic caption | Generic caption |
| A9 | **Analytics and conversion tracking.** No GA4/GTM is configured on the live site either. Provide IDs to add at launch (not on staging) | None |
| A10 | **Lead email recipient.** Live forms email `zalalbd@gmail.com`; the staging endpoint sends to the staging WordPress admin email until you confirm the production recipient and SMTP details for the VPS | Staging admin email |
| A11 | **Business facts to verify**: address 7600 Chevy Chase Dr Suite 300, Austin TX 78752; phones (512) 782-9748 and 512-717-7453; WhatsApp +1 979-250-7486; hours "seven days a week"; payment methods; legal name Logo In Hours LLC; Facebook URL; price range $125–$175 and $950 package. The live schema listed the city as Houston, which was corrected to Austin | As listed |
| A12 | **Broken portfolio images.** 41 image URLs on the live site return 404 and were dropped. Supply the originals if they should return | Dropped |
| A13 | **Staging password.** Optional HTTP basic-auth block is ready in `deploy/staging/htaccess-staging.txt`; say if you want it enabled (I will set a password) | noindex + robots disallow only |
| A14 | **Hosting target.** The temporary domain runs on Hostinger managed hosting (LiteSpeed/PHP, no Node), so staging uses the static export. The production VPS build (Node standalone) is ready; confirm the VPS details when you want it provisioned | Static export on staging |
| A15 | **Blog author.** Posts show "Logo Austin Design Team" (the live author is the "admin" account). Provide a named author/bio if you prefer personal authorship | Team author |
