# 🐾 KitekBot Dashboard & Discord Bot

> **Aktualna wersja:** `v4.7.0`  
> **Status:** Stabilna / Produkcyjna  
> **Ostatnia aktualizacja:** 05.09.2026

Oficjalna strona internetowa, panel zarządzania (Dashboard) oraz zintegrowany bot Discord — **KitekBot**.

---

## 📌 Zasada Wersjonowania i Aktualizacji (Versioning Policy)

> **Reguła projektu:**  
> **Każda zmiana, nowa funkcja lub poprawka na stronie internetowej lub w bocie ZAWSZE podbija wersję (np. `v4.6.0` ➔ `v4.7.0`) oraz jest automatycznie dokumentowana w pliku `README.md`, w historii zmian (Changelog w sekcji „Pobierz Pliki”) oraz w `package.json` bota.**

Dzięki temu użytkownik i administrator zawsze mają pewność, z której wersji korzystają i jakie zmiany zaszły w systemie.

---

## 🚀 Historia Wersji i Zmian (Changelog)

### 🌟 `v4.7.0` (Najnowsza — 05.09.2026)
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
