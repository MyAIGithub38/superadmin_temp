1. Genel Mimari

Teknolojiler:

Backend: Node.js (Express.js) veya Python (FastAPI/Django) veya NestJS) – modüler mimari

Veritabanı: PostgreSQL (uzaktan erişim, .env ile yapılandırma)

ORM: Prisma veya Sequelize

Kimlik Doğrulama: JWT + Refresh Token

Frontend: React (Next.js veya Vite) + TailwindCSS

Depolama: AWS S3 veya yerel dosya sistemi (avatar vb.)

Yetkilendirme: RBAC (Role-Based Access Control)

Roller:

SuperAdmin (uygulamaları ekleme, düzenleme, silme ve adminlere ve/veya kullanıcılara atayabilme yetkisine sahip) → tüm adminleri ve onların kullanıcılarını yönetir.

Admin → kendi kullanıcılarını ve uygulamalarını yönetir.

User → kendi bilgilerini ve uygulamalarını yönetir.

2. Veritabanı Şeması (PostgreSQL)

-- Tenants tablosu (her admin bir tenant gibi düşünülebilir)
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users tablosu
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- superadmin, admin, user
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications tablosu
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Application ilişkisi
CREATE TABLE user_applications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    application_id INT REFERENCES applications(id) ON DELETE CASCADE
);

3. Backend Modülleri

Auth Module:

/auth/register → user veya admin kaydı

/auth/login → JWT token döner

/auth/me → oturum açmış kullanıcı bilgisi

Tenant Module:

SuperAdmin → tenant (admin) CRUD

User Module:

Admin → kendi kullanıcılarını yönetir

User → kendi profilini günceller

Application Module:

SuperAdmin → tüm uygulamaları ekler, düzenler, siler ve adminlere/kullanıcılara atar

User → erişebildiği uygulamaları listeler

4. Yetkilendirme Mantığı (RBAC)

Middleware ile:

checkRole(['superadmin']) → sadece süperadmin erişir

checkRole(['admin', 'superadmin']) → admin ve üstü

checkRole(['user', 'admin', 'superadmin']) → tüm giriş yapmış kullanıcılar

5. Frontend Yapısı

Sol Menü (Sidebar):

Avatar + Kullanıcı Adı

Dashboard

Uygulamalar

Settings

Sayfalar:

Login / Register

Dashboard (Rol bazlı içerik)

Profil / Ayarlar (avatar yükleme, bilgileri güncelleme)

Uygulama Listesi / Yönetimi

Tema & Modülerlik:

components/ içinde ortak UI

pages/ veya features/ klasörleri ile modüler sayfa mantığı

6. Template Olarak Kullanım

Backend → src/modules klasöründe her özellik ayrı modül

Frontend → src/features klasöründe her sayfa/özellik ayrı paket

.env dosyası ile DB, JWT_SECRET, S3 bilgileri ayarlanır

Yeni proje → repo’yu klonla, .env değiştir, modülleri kullan

7. Güvenlik & Ek Özellikler

Şifreler bcrypt ile hashlenmeli

JWT refresh token ile otomatik yenilenmeli

PostgreSQL bağlantısı SSL destekli olmalı

Avatar yüklemelerinde dosya boyutu ve format kontrolü

Multi-tenant izolasyon: Admin kendi tenant verilerini görür, diğerlerini göremez