# Proje Geliştirme Yol Haritası

Bu döküman, mevcut şablonu kullanarak yeni özellikler geliştirme ve harici uygulamaları entegre etme süreçleri için bir rehber niteliğindedir.

## 1. Projeyi Şablon Olarak Kurma

1.  **Projeyi Klonlayın**: Mevcut projeyi bilgisayarınıza klonlayın ve yeni projeniz için adını değiştirin.
    ```bash
    git clone <repository-url> yeni-projem
    cd yeni-projem
    ```
2.  **Git Geçmişini Temizleyin**: Şablonun git geçmişini temizleyip kendi projeniz için yeni bir başlangıç yapın.
    ```bash
    rm -rf .git
    git init
    git add .
    git commit -m "Initial commit from template"
    ```
3.  **Bağımlılıkları Yükleyin**: Hem `api` hem de `web` klasörleri için bağımlılıkları yükleyin.
    ```bash
    # API için
    cd api && npm install
    # Frontend için
    cd ../web && npm install
    ```
4.  **Ortam Değişkenlerini Ayarlayın**:
    *   `api` klasöründe bir `.env` dosyası oluşturun ve veritabanı, JWT anahtarları gibi bilgileri girin.
    *   `web` klasöründe bir `.env.local` dosyası oluşturun ve `NEXT_PUBLIC_API_BASE_URL` değişkenini ayarlayın.

## 2. Şablon İçine Yeni Bir Modül Ekleme (Örnek: Ürünler Modülü)

### Backend (`api`)

1.  **Route Oluşturma**: `api/src/routes/` altında yeni bir route dosyası (`products.ts`) oluşturun.
2.  **Endpoint Tanımlama**: Ürünler için API endpoint'lerini (GET, POST, vb.) tanımlayın ve yetkilendirme için `authenticateJWT`, `checkRole` middleware'lerini kullanın.
3.  **Route'u Entegre Etme**: Oluşturduğunuz route'u `api/src/index.ts` dosyasına import edip Express uygulamasına tanıtın.
4.  **Veritabanı**: PostgreSQL veritabanınıza yeni `products` tablosunu ekleyin.

### Frontend (`web`)

1.  **Sayfa Oluşturma**: `web/src/app/(dashboard)/` altında yeni bir sayfa oluşturun (örn: `products/page.tsx`).
2.  **Bileşen Geliştirme**: Sayfada kullanılacak yeniden kullanılabilir UI bileşenlerini `web/src/components/` altında oluşturun.
3.  **API İsteği**: Sayfa içerisinden, oluşturduğunuz backend API'sine `axios` veya `fetch` ile istek atın.
4.  **Navigasyon**: Yeni sayfayı `web/src/components/layout/Sidebar.tsx` içindeki menüye ekleyerek erişilebilir yapın.

## 3. Mevcut Harici Bir Uygulamayı (Örn: Python/Frontend) Entegre Etme

Bu mimari, yönetim panelini merkezi bir kimlik doğrulama (Authentication) ve yetkilendirme (Authorization) noktası olarak kullanır.

### Mimari Anlayışı

*   Yönetim paneli ve harici uygulamanız (Python projesi) iki ayrı servis olarak çalışmaya devam eder.
*   Kullanıcılar her zaman yönetim paneli üzerinden giriş yapar ve bir **JWT (JSON Web Token)** alır.
*   Yönetim paneli, kullanıcıyı harici uygulamaya yönlendirirken bu JWT'yi de güvenli bir şekilde iletir.
*   Harici uygulamanızın backend'i (Python), gelen isteklerdeki bu JWT'yi, yönetim panelinin kullandığı aynı gizli anahtar (`JWT_SECRET`) ile doğrular.

### Yapılacaklar (Yönetim Paneli)

1.  **Veritabanı Güncellemesi**: `applications` tablosuna, uygulamanın çalışacağı adresi (URL) tutacak bir `url` sütunu ekleyin.
    ```sql
    ALTER TABLE applications ADD COLUMN url TEXT;
    ```
2.  **Uygulama Ekleme**: Superadmin arayüzünden yeni Python uygulamanızı `applications` tablosuna ekleyin ve `url` alanını doldurun (örn: `http://localhost:8000`).
3.  **Frontend Yönlendirmesi**: Kullanıcı uygulama linkine tıkladığında, onu uygulamanın `url`'ine yönlendirirken JWT'yi de URL'e bir sorgu parametresi olarak ekleyin.
    ```jsx
    // Örnek bir yönlendirme linki oluşturma
    const appUrl = new URL(app.url);
    appUrl.searchParams.set('token', token);
    // <a href={appUrl.toString()}>Uygulamaya Git</a>
    ```

### Yapılacaklar (Harici Python Uygulaması)

1.  **Backend (Python)**:
    *   Yönetim paneli ile **aynı `JWT_SECRET`**'ı ortam değişkeni olarak ayarlayın.
    *   Gelen isteklerde `Authorization: Bearer <token>` başlığını veya URL'deki `token` parametresini doğrulayan bir middleware (veya decorator) yazın.
2.  **Frontend (Harici Uygulamanın Arayüzü)**:
    *   Sayfa ilk yüklendiğinde URL'deki `token` parametresini okuyun.
    *   Token'ı `localStorage`'a kaydedin.
    *   Gelecekteki tüm API isteklerinde bu token'ı `Authorization` başlığına ekleyin.
    *   Güvenlik için URL'den token'ı `window.history.replaceState` ile temizleyin.