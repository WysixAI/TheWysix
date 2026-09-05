# 🐾 KitekBot Dashboard & Discord Bot

> **Aktualna wersja:** `v5.3.0`  
> **Status:** Stabilna / Produkcyjna  
> **Ostatnia aktualizacja:** 05.09.2026

Oficjalna strona internetowa, panel zarządzania (Dashboard) oraz zintegrowany bot Discord — **KitekBot**.

---

## 📌 Zasada Wersjonowania i Aktualizacji (Versioning Policy)

> **Reguła projektu:**  
> **Każda zmiana, nowa funkcja lub poprawka na stronie internetowej lub w bocie ZAWSZE podbija wersję (np. `v5.2.0` ➔ `v5.3.0`) oraz jest automatycznie dokumentowana w pliku `README.md`, w historii zmian (Changelog w sekcji „Pobierz Pliki”) oraz w `package.json` bota.**

Dzięki temu użytkownik i administrator zawsze mają pewność, z której wersji korzystają i jakie zmiany zaszły w systemie.

---

## 🚀 Historia Wersji i Zmian (Changelog)

### 🌟 `v5.3.0` (Najnowsza — 05.09.2026)
- ⚡ **Akcje przycisków w Action Row (Button Actions)**:
  - Wprowadzono zaawansowany kreator akcji pod przyciskami:
    - **Kick (Wyrzucenie)**: wyrzucenie użytkownika z serwera z konfigurowalnym powodem.
    - **Ban (Zbanowanie)**: zbanowanie użytkownika z określeniem liczby dni usunięcia wiadomości (0-7) i powodem.
    - **Send Message**: wysłanie publicznej wiadomości na kanale z obsługą zmiennych (`{user}`, `{server.name}`).
    - **Ephemeral Message**: dyskretna odpowiedź tekstowa widoczna wyłącznie dla osoby klikającej przycisk.
    - **Give Role**: natychmiastowe nadanie wskazanej roli Discord po kliknięciu.
    - **Remove Role**: odebranie wskazanej roli Discord.
    - **Send DM**: wysłanie prywatnej wiadomości bezpośrednio na skrzynkę użytkownika (Direct Message).
- 🧹 **Usunięcie szablonów i automatyczny czysty/pusty embed**:
  - Całkowicie wycofano narzucone z góry szablony (Presets), aby dać użytkownikowi 100% swobody projektowania.
  - Nowy kontener Embed tworzy się teraz jako czysta, pusta karta z estetycznym placeholderem i podpowiedzią dodania pierwszego komponentu.
  - Wprowadzono przycisk **„Wyczyść do pustego embedu”**, który nie usuwa widoku, lecz przywraca pojedynczy czysty kontener.
- 🎨 **Pełna spójność kolorystyczna GUI z motywem KitekBot**:
  - Zsynchronizowano barwy kreatora z motywem strony: tło panelu (`#32333d`), belki nawigacyjne (`#2d2e36`), karty i kontenery (`#272831`, `#202128`), obramowania (`#3b3c47`) oraz akcent Blurple (`#5865F2`).
- 🧩 **Więcej komponentów Discord**:
  - Rozbudowane sekcje (Sections) z tekstem i załącznikami wizualnymi (Thumbnail i Image).
  - Pasek szybkiego formatowania Markdown (B, I, U, S, @, emoji).
  - Separatory (Spacing Small, Medium, Large) z opcją stylizowanej kreski (Divider).
  - Komponent Media (samodzielny baner graficzny ze spoilerem).
  - Wiersze akcji (Action Row) obsługujące przyciski oraz rozwijane menu (String Select Menu).
- 🔄 **Natychmiastowe wykonywanie akcji w silniku bota**:
  - Zaktualizowano zdarzenie `interactionCreate` w `index.js` o obsługę wszystkich zdefiniowanych w panelu akcji przycisków i menu.

---

### `v5.2.0` (05.09.2026)
- 🔘 **Obsługa interaktywnych menu (String Select Menu)**:
  - Dodano możliwość dodania Select Menu do Action Row (wielokrotne opcje, emoji, opisy, wartości, min/max wyborów).
- 🎯 **Symulator podglądu na żywo z interakcją**:
  - Kliknięcie przycisku lub wybór z menu w podglądzie symuluje wykonanie akcji (komunikat ephemeral i powiadomienie bota).

---

### `v5.1.0` (05.09.2026)
- 🌲 **Struktura drzewiasta komponentów (Component Tree Builder)**:
  - Wprowadzono wielopoziomowe kontenery Embed z możliwością dodawania sekcji, separatorów, grafik i wierszy akcji.
- 👋 **Moduł Pożegnań (/goodbye)**:
  - Dodano pełne wsparcie dla powiadomień o odejściu członków serwera z osobnym kreatorem wiadomości.

---

### `v5.0.0` (05.09.2026)
- 🧹 **Usunięcie zbędnych modułów bota**:
  - Całkowicie usunięto moduł Ekonomia (`/daily`, monety) oraz moduły moderacji i pożegnań z bota i konfiguracji serwerów.
  - Skupiono architekturę bota i panelu w 100% na najwyższej jakości module powitań (Welcome System).
- 🎨 **Zaawansowany edytor powitań w stylu message.style (`https://message.style/app/editor`)**:
  - Zbudowano kompleksowy kreator wiadomości tekstowej i bogatej karty Embed.
  - Pełne wsparcie dla wyboru kolorów HEX oraz oficjalnej palety kolorów Discorda.
  - Sekcje: Autor (nazwa, ikona, URL), Tytuł (z linkiem), Opis Markdown ze zmiennymi (`{user}`, `{server.name}`, `{memberCount}`).
  - Dynamiczny edytor pól (Fields) z możliwością dodawania, usuwania i układu inline.
  - Obsługa grafik: miniaturka (thumbnail) oraz duży baner (image).
  - Stopka z ikoną i przełącznikiem znacznika czasu (Timestamp).
- 🔘 **Obsługa przycisków Action Row (Components v2)**:
  - Do 5 przycisków w wierszu pod wiadomością: Primary, Secondary, Success, Danger, Link (URL).
  - Obsługa emoji i etykiet przycisków z automatyczną reakcją bota.
- 📐 **Powiększenie i unowocześnienie interfejsu (Enlarged GUI)**:
  - Zwiększono rozmiar modalnego okna konfiguratora do formatu pełnoekranowego z podziałem roboczym (Split View).
  - Lewa strona: intuicyjny inspektor z zakładkami i pigułkami zmiennych.
  - Prawa strona: realistyczny, renderowany na żywo podgląd wiadomości Discord (z awatarem, badge'em BOT ✓ i układem chatu).
- ⚡ **Szybkie szablony (Presets) & testowanie na Discord**:
  - 4 gotowe kompozycje: Nowoczesna Społeczność, Gaming & E-Sport, Elegancki Minimalizm, Czysty Tekst.
  - Narzędzie kopiowania surowego Discord JSON Payload.
  - Przycisk natychmiastowego wysłania wiadomości testowej bezpośrednio na kanał Discord bota.

---

### `v4.9.0` (05.09.2026)
- 🔒 **Uproszczenie widoku logowania**:
  - Usunięto pole ręcznego logowania nickiem/ID oraz sekcję informującą o błędzie nieprawidłowych parametrów URL.
  - Karta logowania zawiera teraz wyłącznie jeden oficjalny przycisk: **„Zaloguj się przez Discord”**.
  - Zapewniono pełną przejrzystość i minimalistyczny design ekranu logowania.

---

### `v4.8.0` (05.09.2026)
- 📌 **Zablokowanie lewego paska bocznego (Fixed Sidebar)**:
  - Lewy pasek boczny został na stałe przypięty do krawędzi ekranu (`fixed top-16 left-0 bottom-0`).
  - Podczas przewijania listy wersji bota w „Pobierz Pliki” lub siatki serwerów w „Dashboard”, pasek boczny nie przesuwa się i pozostaje stale widoczny.
- 🗑️ **Usunięcie modułu Powitania i Pożegnania**:
  - Usunięto kategorię i widok z menu bocznego zgodnie z dyspozycją użytkownika, zachowując czysty, minimalistyczny układ panelu.

---

### `v4.7.0` (05.09.2026)
- 🧹 **Oczyszczenie interfejsu i uproszczenie Dashboardu**:
  - Usunięto zbędną kategorię „Połączenie REST” z paska bocznego.
  - Usunięto z prawego górnego rogu widgety „Twoje serwery: X” oraz przycisk „Połącz z botem”.
  - Przycisk odświeżania na liście serwerów został uproszczony do czystego napisu **„Odśwież”**.
  - Usunięto banery profilu i statusu REST z Dashboardu — teraz pod nagłówkiem natychmiast wyświetla się czysta siatka serwerów.
- 🔗 **Przejście na routing URL dla funkcji (`panel.kitekbot.vercel.app/NazwaFunkcji`)**:
  - Pasek boczny przełącza teraz dedykowane ścieżki URL (np. `/PowitaniaIPozegnania`, `/dashboard`, `/download`).
- 🎨 **Kreator Powitania i Pożegnania (Embed v2 + Component v2 + Drag & Put)**:
  - Wdrożono pełny edytor Powitań i Pożegnań z generatorem Embed v2.
  - Dodano Components v2: interaktywne przyciski i Select Menu z niestandardowymi grafikami i stylami.
  - System Drag & Put (przeciągnij i upuść) umożliwiający intuicyjną zmianę kolejności pól oraz komponentów.

---

### `v4.6.0` (05.09.2026)
- 📄 **Dodano oficjalny plik `README.md`**:
  - Prezentacja bieżącej wersji strony oraz bota Discord (`v4.6.0`).
  - Ustanowienie oficjalnej zasady podbijania wersji przy każdej zmianie i aktualizacji strony.
  - Kompletny wykaz wszystkich dotychczasowych aktualizacji i zmian.
- 🔄 **Pełna synchronizacja numeracji**:
  - Zaktualizowano wersję w `README.md`, `package.json` bota, widoku Pobierz Pliki oraz w pasku bocznym Dashboardu.

---

### `v4.5.0` (05.09.2026)
- 🖥️ **Naprawa wyświetlania w oknie Preview (Podgląd)**:
  - Usunięto middleware Express, które przechwytywało żądania do strony głównej i zwracało surowy JSON zamiast widoku aplikacji.
  - Przywrócono natychmiastowe serwowanie interfejsu React / Vite.
  - Zapewniono 100% płynne działanie strony głównej, logowania i panelu serwerów bezpośrednio w oknie podglądu.

---

### `v4.4.0` (05.09.2026)
- 👤 **Eliminacja logowania na obce konta**:
  - Usunięto sztywne podstawianie konta „Właściciel Bota”.
  - Dodano możliwość bezpośredniego logowania własnym nickiem lub ID z Discorda bez konieczności przechodzenia przez OAuth.
  - Wprowadzono parametr `prompt=consent` w autoryzacji Discord, wymuszający wyświetlenie tożsamości użytkownika.
  - Dodano widoczny baner aktywnego profilu w Dashboardzie z przyciskiem szybkiej zmiany konta / wylogowania.

---

### `v4.3.0` (05.09.2026)
- 🌉 **Wdrożenie Mostka HTML/JS `/auth/callback`**:
  - Usunięto błąd *„Brak kodu autoryzacji”* przy powrocie z Discorda.
  - Płynne odczytywanie tokenu dostępu użytkownika z fragmentu adresu URL (`#access_token=...`).
  - Błyskawiczna komunikacja między oknem logowania a panelem głównym (w 300 ms).

---

### `v4.2.0` (05.09.2026)
- 🔑 **Implicit Grant (response_type=token)**:
  - Przejście na logowanie typu Implicit Grant eliminujące błędy `invalid_client` związane z Client Secret.
  - Pobieranie rzeczywistych serwerów użytkownika bezpośrednio z oficjalnego API Discord (`/users/@me/guilds`).

---

### `v4.1.0` (05.09.2026)
- ⚡ **Awaryjne procedury logowania**:
  - Zabezpieczenie przed przerwaniem sesji w przypadku braku odpowiedzi API zewnętrznego.
  - Endpointy `/api/auth/instant-login` oraz obsługa sesji w ciasteczkach.

---

### `v4.0.0` (05.09.2026)
- 📦 **Odchudzenie architektury**:
  - Usunięcie zależności od zewnętrznych baz danych (Upstash Redis).
  - Przeniesienie stanu do pamięci operacyjnej RAM z zapisem do lokalnych plików JSON.

---

### Wersje wcześniejsze (`v1.0.0` – `v3.9.0`)
- **v3.9.0**: Zunifikowany handler API Vercel (`api/index.js`).
- **v3.8.0**: Optymalizacja bundlingu esbuild dla środowiska Serverless.
- **v3.0.0 – v3.7.0**: Dwukierunkowa synchronizacja stanu bota w czasie rzeczywistym (wykrywanie obecności na serwerze i przycisk *Manage*).
- **v2.0.0**: Wdrożenie panelu konfiguracji serwerów (modal ustawień bota, prefiksy, kanały logów).
- **v1.0.0**: Początkowe wydanie KitekBot z podstawowym interfejsem graficznym i autoryzacją.

---

## 🛠️ Uruchomienie i Instalacja

### Panel Dashboard (Strona WWW)
```bash
# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego (port 3000)
npm run dev

# Budowanie wersji produkcyjnej
npm run build
```

### Bot Discord (kitek-bot)
1. Przejdź do zakładki **Pobierz Pliki** w panelu strony.
2. Pobierz gotowe archiwum `kitek-bot.zip`.
3. Wypakuj pliki i w pliku `.env` wpisz swój token bota:
   ```env
   DISCORD_TOKEN=TWOJ_TOKEN_Z_DISCORD_DEVELOPER_PORTAL
   PORT=3001
   ```
4. Uruchom bota:
   ```bash
   npm install
   npm start
   ```

---

## 🛡️ Zasady Bezpieczeństwa
- Nigdy nie udostępniaj publicznie pliku `.env` z tokenem bota.
- Klucze API i tokeny autoryzacyjne przetwarzane są po stronie serwerowej i nie wyciekają do przeglądarki klienta.
