# Palata Nauke · Laboratorija za primenjenu veštačku inteligenciju

Sajt **Laboratorije za primenjenu veštačku inteligenciju** Palate Nauke. To je statički sajt (HTML, CSS i malo JavaScript-a) spreman za **GitHub Pages**: nema build koraka, nema zavisnosti i nema spoljnih biblioteka.

> ⚠️ **Sav sadržaj je primer.** Imena, publikacije, projekti, vesti, brojke, adresa i email-ovi su izmišljeni i služe kao šablon. Zamenite ih pravim podacima pre objavljivanja.

## Stranice

| Fajl | Sadržaj |
| --- | --- |
| `index.html` | Početna: 3D neuronsko jezgro, oblasti, način rada, vesti, izdvojeni radovi |
| `istrazivanje.html` | Oblasti istraživanja, projekti i GitHub repozitorijumi (učitavaju se automatski) |
| `tim.html` | Rukovodstvo, istraživači, doktorandi, studenti, alumni |
| `publikacije.html` | Radovi sa pretragom, filterima po tipu i BibTeX-om |
| `kontakt.html` | Kontakt, otvorene pozicije i proces prijave |
| `assets/css/style.css` | Svi stilovi; boje su promenljive na vrhu fajla |
| `assets/js/main.js` | Animacije i interakcije |
| `assets/favicon.svg` | Ikonica sajta |
| `.nojekyll` | Kaže GitHub Pages-u da fajlove servira takve kakvi jesu |

## Objavljivanje na GitHub Pages

> 📘 Detaljno uputstvo korak po korak, uz rešavanje problema: **[MANUAL.md](MANUAL.md)**

1. Pošaljite izmene na `main` granu (`git push`).
2. Na GitHub-u otvorite **Settings → Pages**.
3. Pod **Build and deployment** izaberite **Source: Deploy from a branch**, granu **`main`** i folder **`/ (root)`**, pa kliknite **Save**.
4. Posle minut-dva sajt je dostupan na adresi
   `https://palaceofscienceresearch.github.io/demo-repository/`

**Savet:** ako repozitorijum preimenujete u `palaceofscienceresearch.github.io`, sajt će biti na kraćoj adresi `https://palaceofscienceresearch.github.io/`. Svi linkovi su relativni, pa sajt radi na obe adrese.

## Lokalni pregled

Najjednostavnije je da otvorite `index.html` u pretraživaču. Ako želite lokalni server:

```bash
python -m http.server 8000
# zatim otvorite http://localhost:8000
```

## Kako se menja sadržaj

- **Član tima** (`tim.html`): kopirajte jedan blok `<article class="card card-hover member">`. Inicijale upišite u `<span>` unutar `.avatar`, a boju prstena podesite preko `style="--hue: 200"` (0–360). Za fotografiju zamenite inicijale sa `<img src="assets/img/ime.jpg" alt="Ime Prezime">`.
- **Publikacija** (`publikacije.html`, „Signali iz laboratorije“): radovi od 2024. su preuzeti iz Crossref/OpenAlex baza. Za novi rad kopirajte jedan `<li class="pub">` blok. U `data-type` upišite tip (`casopis` ili `konferencija`) i teme odvojene razmakom (`nlp`, `vid`, `medicina`, `obrazovanje`, `bezbednost`). BibTeX bloku dajte jedinstven `id` (i isti `aria-controls` na dugmetu). Brojači u filterima se računaju sami.
- **Vesti** (`index.html`, sekcija `#vesti`): kopirajte jedan `<li class="news-item">`.
- **Projekti** (`istrazivanje.html`, sekcija `#projekti`): kopirajte jednu karticu `project`. Za status koristite `status-active` ili `status-done`.
- **Repozitorijumi**: učitavaju se sami preko GitHub API-ja za organizaciju iz atributa `data-github-repos`. Prikazuje se do 6 javnih repozitorijuma koji nisu forkovi ni arhivirani.
- **Reči koje se smenjuju u naslovu**: atribut `data-scramble="budućnost|medicinu|nauku|…"` u `index.html`.
- **Boje**: promenljive `--c-cyan`, `--c-violet` itd. na vrhu `style.css`, posebno za tamnu (`:root`) i svetlu (`[data-theme="light"]`) temu. Animacija jezgra automatski preuzima iste boje.
- **Zaglavlje i podnožje** ponavljaju se na svih 5 stranica, pa izmenu navigacije uradite na svakoj.

## Animacije

- **3D neuronsko jezgro** (canvas): rotirajuća mreža neurona po kojoj putuju impulsi, sa orbitama i HUD radarom. Prati miš, a klik pokreće udarni talas i rafal impulsa. Pauzira se kada nije na ekranu.
- Naslov koji se „dekodira“, brojači, terminal koji sam kuca, klizna traka sa pojmovima, svetlo koje prati kursor i okviri kartica koji zasvetle ispod kursora.
- Ako korisnik u sistemu ima uključeno **„smanji pokrete“** (`prefers-reduced-motion`), animacije se gase i sve se prikazuje statično.
- Bez JavaScript-a sajt i dalje radi: sav sadržaj je vidljiv i čitljiv.

## GitHub Actions

- **Proof HTML** (`.github/workflows/proof-html.yml`): pri svakom push-u proverava HTML i linkove.
- **Auto Assign** (`.github/workflows/auto-assign.yml`): automatski dodeljuje nove issue-e i PR-ove.
