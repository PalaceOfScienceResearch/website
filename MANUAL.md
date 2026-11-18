# Uputstvo: kako pokrenuti sajt na GitHub Pages

Ovo uputstvo vodi korak po korak od foldera na računaru do sajta koji radi na internetu.
Sajt je statički (HTML, CSS i JavaScript), pa ne treba nikakva instalacija ni build. GitHub ga samo servira.

**Adresa sajta kada se uključi:**
<https://palaceofscienceresearch.github.io/demo-repository/>

---

## Sadržaj

1. [Šta vam treba](#1-šta-vam-treba)
2. [Pošaljite kod na GitHub](#2-pošaljite-kod-na-github)
3. [Repozitorijum mora biti javan](#3-repozitorijum-mora-biti-javan)
4. [Uključite GitHub Pages](#4-uključite-github-pages)
5. [Proverite da sajt radi](#5-proverite-da-sajt-radi)
6. [Kako se sajt ažurira](#6-kako-se-sajt-ažurira)
7. [Pre nego što pošaljete link ljudima](#7-pre-nego-što-pošaljete-link-ljudima)
8. [Opciono: kraća adresa i sopstveni domen](#8-opciono-kraća-adresa-i-sopstveni-domen)
9. [Rešavanje problema](#9-rešavanje-problema)

---

## 1. Šta vam treba

- [ ] GitHub nalog koji ima pristup repozitorijumu `PalaceOfScienceResearch/demo-repository`.
- [ ] **Admin prava** na repozitorijumu. Bez njih se ne vidi meni *Settings*; ako ih nemate, zamolite vlasnika organizacije.
- [ ] Instaliran **Git** (proverite komandom `git --version`).
- [ ] Ovaj folder: `C:\Users\mdodovic\Desktop\PalataNauke`.

---

## 2. Pošaljite kod na GitHub

Otvorite terminal (PowerShell ili Git Bash) i pokrenite:

```bash
cd C:\Users\mdodovic\Desktop\PalataNauke
git add .
git commit -m "Sajt laboratorije Palata Nauke AI Lab"
git push
```

- Ako Git zatraži prijavu, otvoriće se pretraživač. Ulogujte se na GitHub i odobrite pristup.
- Ako `git push` javi grešku *„rejected … fetch first“*, neko je u međuvremenu menjao repo. Pokrenite `git pull --rebase`, pa ponovo `git push`.

> **Bez komandne linije:** možete koristiti [GitHub Desktop](https://desktop.github.com/) (*Commit to main → Push origin*) ili na GitHub-u *Add file → Upload files* i prevući sve fajlove.

---

## 3. Repozitorijum mora biti javan

Na besplatnom GitHub planu Pages radi **samo za javne repozitorijume**.

1. Otvorite repo na GitHub-u.
2. **Settings → General**, pa skroz dole do **Danger Zone**.
3. **Change visibility → Change to public** i potvrdite.

> Ako organizacija ima plaćeni plan (Team/Enterprise), Pages radi i za privatne repozitorijume, pa ovaj korak možete preskočiti.

---

## 4. Uključite GitHub Pages

1. U repozitorijumu kliknite **Settings** (gornja traka, ikonica zupčanika ⚙️).
2. U levom meniju, u grupi *Code and automation*, kliknite **Pages**.
3. Pod **Build and deployment**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main`, folder `/ (root)`
4. Kliknite **Save**.

```
Build and deployment
  Source:  [ Deploy from a branch ▾ ]
  Branch:  [ main ▾ ]  [ / (root) ▾ ]  [ Save ]
```

---

## 5. Proverite da sajt radi

1. Otvorite tab **Actions**. Pojaviće se posao **„pages build and deployment“**. Sačekajte zelenu kvačicu ✅ (obično 1–2 minuta).
2. Vratite se na **Settings → Pages**. Gore treba da piše: *„Your site is live at …“*, uz dugme **Visit site**.
3. Otvorite <https://palaceofscienceresearch.github.io/demo-repository/> i proverite:
   - [ ] 3D neuronsko jezgro se vrti na početnoj.
   - [ ] Sve stranice iz menija se otvaraju (Istraživanje, Tim, Publikacije, Kontakt).
   - [ ] Dugme ☀️/🌙 menja temu.
   - [ ] Na telefonu se otvara meni ☰.
4. U tabu **Actions** treba da prođe i **Proof HTML**. On pri svakom push-u proverava HTML i linkove.

---

## 6. Kako se sajt ažurira

Svaki push na `main` automatski osvežava sajt:

```bash
git add .
git commit -m "Kratak opis izmene"
git push
```

- Promena je vidljiva za 1–2 minuta. Ako je ne vidite, osvežite stranicu sa **Ctrl + F5** (pretraživač čuva staru verziju).
- **Lokalni pregled pre slanja:** dvaput kliknite na `index.html`, ili pokrenite `python -m http.server 8000` i otvorite <http://localhost:8000>.
- Kako se dodaju član tima, publikacija, vest ili projekat, piše u [README.md](README.md), u odeljku *Kako se menja sadržaj*.

---

## 7. Pre nego što pošaljete link ljudima

Deo sadržaja je još uvek **primer**. Pre deljenja sajta zamenite ga pravim podacima:

- [ ] **`tim.html`**: izmišljeni članovi tima. Upišite prava imena, uloge, kratke biografije i email-ove.
- [ ] **Email `kontakt@example.com`**: nalazi se u podnožju **svih 5 stranica** i na `kontakt.html`. U VS Code-u: **Ctrl + Shift + H**, tražite `example.com` i zamenite svuda.
- [ ] **`kontakt.html`**: prava adresa (sada piše *„Ulica i broj“*).
- [ ] **`index.html`**: vesti u sekciji *Šta je novo* i brojka *„9 članova tima“*.
- [ ] **`istrazivanje.html`**: projekti u sekciji *Na čemu radimo*.
- [x] **`publikacije.html`**: radovi su pravi (preuzeti iz Crossref/OpenAlex baza).

---

## 8. Opciono: kraća adresa i sopstveni domen

### Kraća adresa

Ako repozitorijum preimenujete u **`palaceofscienceresearch.github.io`**, sajt će biti na
<https://palaceofscienceresearch.github.io/> (bez `/demo-repository/`).

1. **Settings → General → Repository name** → upišite `palaceofscienceresearch.github.io` → **Rename**.
2. Na računaru ažurirajte adresu repozitorijuma:
   ```bash
   git remote set-url origin https://github.com/PalaceOfScienceResearch/palaceofscienceresearch.github.io.git
   ```
3. U HTML fajlovima zamenite `demo-repository` novim imenom. Pominje se u linku *„Izvorni kod sajta“* u podnožju i u linku za issue na `kontakt.html`. GitHub preusmerava stare linkove, ali je bolje da budu tačni.

Svi ostali linkovi na sajtu su relativni, pa radi na obe adrese bez izmena.

### Sopstveni domen (npr. `ailab.vasdomen.rs`)

1. **Settings → Pages → Custom domain** → upišite domen → **Save**.
   GitHub će u repo dodati fajl `CNAME`, pa pre sledećeg push-a pokrenite `git pull`.
2. Kod registra domena dodajte DNS zapis:
   - **za poddomen** (`ailab.vasdomen.rs`): `CNAME` → `palaceofscienceresearch.github.io`
   - **za glavni domen** (`vasdomen.rs`): četiri `A` zapisa → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Kada GitHub izda sertifikat (do nekoliko sati), uključite **Enforce HTTPS**.

---

## 9. Rešavanje problema

| Problem | Rešenje |
|---|---|
| U *Settings* nema stavke **Pages** | Nemate admin prava na repozitorijumu. Zamolite vlasnika organizacije. |
| Pages traži nadogradnju plana | Repozitorijum je privatan. Vidite [korak 3](#3-repozitorijum-mora-biti-javan). |
| Adresa vraća **404** | Sačekajte nekoliko minuta posle prvog uključivanja. Proverite da je u Pages izabrano `main` i `/ (root)` i da je `index.html` u korenu repozitorijuma. |
| Sajt je bez stilova i animacija | Folder `assets/` nije poslat. Pokrenite `git status`; ako je `assets/` neoznačen, uradite `git add assets` i ponovo commit i push. |
| Promene se ne vide | Sačekajte da se posao u *Actions* završi, pa osvežite sa **Ctrl + F5**. |
| **Proof HTML** je crven ❌ | Otvorite *Actions → Proof HTML* i u logu pogledajte koji link ne radi. Ispravite ga, ili ga dodajte u `url_ignore_re` u `.github/workflows/proof-html.yml` (tako su već isključeni `doi.org` linkovi). |
| Na stranici *Istraživanje* nema repozitorijuma | Organizacija nema javnih repozitorijuma, ili je posetilac prešao GitHub limit (60 zahteva na sat). Sajt tada prikazuje poruku sa linkom ka GitHub-u. To je očekivano ponašanje. |
