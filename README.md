# Vulcan Pro – machetă demo (vulcanizare, echilibrare, hotel de anvelope)

Site static (fără framework) în `site/`, construit din modelul „vulcanizare” din CristianWeb.
**Prețurile, duratele, orele ocupate și datele firmei sunt de exemplu.**

## Fișiere
- `site/js/data.js` – **prima linie: `WHATSAPP_NUMBER`** (format internațional fără „+”, exemplu `40700000000`). Tot aici:
  - `PROGRAM` – singura sursă pentru programul afișat, indicatorul „Deschis/Închis” și sloturile de programare (L–S 08:00–20:00, duminică închis);
  - `TARIFE` – prețuri pe diametru R13–R22 (schimb 4 roți cu echilibrare, echilibrare, durate, hotel/sezon), toate cu `exemplu: true`;
    `faraLevier: true` → mențiunea „montaj fără levier” (acum de la R19 în sus);
  - `SUV_PROCENT` (+20%) și `SUV_MIN_EXTRA` (+10 min); `SERVICII`, `EXTRA` (valve ×4, TPMS, curățare jante, azot); `HOTEL` (supliment cu jante, reducere la plata pe un an); `TELEFON`.
- `site/js/app.js` – logica: „Deschis/Închis”, banda sezonieră, tabelul de prețuri, programarea, asistentul „Ce dimensiune am?”, hotelul de anvelope, trimiterea formularelor.
- `site/css/style.css` – designul modelului (Teko + Chivo, gri antracit / roșu #e10600).

## Reguli de calcul (exemple)
- Programare: preț și durată după serviciu + diametru + tip vehicul + extra-uri.
  SUV/van: +20% la schimb și echilibrare (rotunjit la 5 lei), +10 min la durată (nu la pană).
  Pană: 50 lei/roată, 30 min. Hotel (în programare): prețul pe sezon pentru diametru, cu schimb inclus.
- Un slot se poate alege doar dacă toată durata încape până la închidere și nu se suprapune cu ore ocupate.
  Orele ocupate sunt generate determinist (aceeași zi arată la fel); pe site-ul real se leagă de un calendar real.
- Hotel: preț/sezon din `TARIFE.hotel` (+30 lei cu jante); pe an = 2 sezoane −10%.
- Ora curentă e ora României (UTC+2/+3, calculată fără Intl). Test: `?acum=2026-11-08T10:00`.
- Banda sezonieră: oct–nov iarnă, mar–apr vară; altfel ascunsă.

## Formulare (Netlify Forms)
- `programare`: serviciu, diametru, tip_vehicul, extra, ziua, ora, durata, total, nume, telefon, numar_inmatriculare.
- `hotel-anvelope`: dimensiune, jante, sezon, plata, pret_sezon, pret_an, total_de_plata, nume, telefon, numar_inmatriculare.
- Ambele cu `data-netlify="true"` și honeypot `bot-field`, trimise prin `fetch`, cu mesaj de mulțumire și rezumat.
- Alternativ: butonul „Trimite pe WhatsApp” deschide `wa.me/WHATSAPP_NUMBER` cu rezumatul precompletat.
- După deploy: Netlify → Forms → activează detectarea formularelor și notificările pe e-mail.

## Afirmații
- Fără note, stele sau recenzii inventate. În loc: „Garanțiile noastre” + placeholder „Review-urile reale de pe Google apar aici”.

## Media (din `cristianweb/modele/media/vulcanizare/`)
- `clip1.webp` (poster 720×1020), `clip1.webm`, `clip1.mp4` – erou; `clip1-480.webp` – poster redus pentru telefon (generat din `clip1.webp`).
- Video-ul pornește doar pe ecrane > 980 px, după încărcarea paginii (nu și cu „reduce motion” / economisire date).
- Fonturi: Teko și Chivo (SIL Open Font License), subseturi latin + latin-ext.

## Altele
- `noindex,nofollow` + `site/robots.txt` cu `Disallow: /` (de aceea Lighthouse SEO = 66, intenționat).
- Deploy: Netlify (`netlify.toml` publică `site/`). Test local: orice server static pe `site/`.
