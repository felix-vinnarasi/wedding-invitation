# Lourdu Felix & Vinnarasi — Wedding Invitation (v3)

Static site: HTML + Tailwind (compiled) + GSAP/ScrollTrigger (vendored). No framework.

## Run
Open `index.html` through any static server (`npx serve .`) — or just double-click it.

## Edit Tailwind classes?
```
npm install
npm run build     # regenerates css/tailwind.css
npm run watch     # while editing
```
`css/tailwind.css` is committed, so you only need this if you add/change utility classes.

## Structure
- `index.html`   markup (sections: hero, story, countdown, scripture, timeline, ceremony, gallery, reception, rsvp)
- `style.css`    tokens, hero, glass cards, grain, marquee, reduced-motion
- `script.js`    menu, countdown (IST-fixed), lanterns, pinned hero, reveals
- `assets/img/`  optimized WebP used by the site (≈0.45 MB total)
- `assets/originals/` your original PNG/JPG/AVIF files (unused at runtime — safe to delete after backup)
- `vendor/`      gsap 3.12.7 + ScrollTrigger (no CDN dependency)

## Please confirm / replace (content I did not change)
1. Groom's surname: hero says "LEEKAK", story card says "Leecok".
2. Reception venue: timeline says "Groom's Residence, Maiyanur"; reception section says "Parish Hall / Michaelpuram, Kallakurichi District".
3. "Pre-Wedding Shoot" gallery, ceremony and reception photos are Unsplash stock placeholders — swap in real photos (put them in assets/img/ and update the <img src>).
4. "Open in Maps" uses a Google Maps search for the church name; replace with an exact pin link if you have one.
