-- ============================================================
-- SINGGAH - Struktur Database (SQL, tanpa data)
-- Dibuat otomatis dari model Sequelize di server/models/*.js
-- Cocok untuk MySQL & TiDB Cloud
-- ============================================================

CREATE DATABASE IF NOT EXISTS singgah_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;

USE singgah_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE users (
  id               INT           NOT NULL AUTO_INCREMENT,
  name             VARCHAR(100)  NOT NULL,
  username         VARCHAR(50)   NOT NULL,
  email            VARCHAR(150)  NOT NULL,
  pending_email    VARCHAR(150)  NULL DEFAULT NULL,
  google_id        VARCHAR(64)   NULL DEFAULT NULL,
  password         VARCHAR(255)  NOT NULL,
  avatar           VARCHAR(255)  NULL,
  identitas_photo  VARCHAR(255)  NULL,
  nim_nip          VARCHAR(50)   NULL,
  role             ENUM('admin','user') NOT NULL DEFAULT 'user',
  tipe             ENUM('admin','mahasiswa','dosen','umum') NOT NULL DEFAULT 'umum',
  pending_tipe     ENUM('mahasiswa','dosen') NULL DEFAULT NULL,
  rejection_reason VARCHAR(255)  NULL DEFAULT NULL,
  status           ENUM('active','inactive') NOT NULL DEFAULT 'active',
  is_verified      BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at       DATETIME      NOT NULL,
  updated_at       DATETIME      NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_google_id (google_id),
  KEY idx_users_status (status),
  KEY idx_users_pending_email (pending_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- CATEGORIES (tanpa timestamp)
-- ------------------------------------------------------------
CREATE TABLE categories (
  id          INT           NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)  NOT NULL,
  slug        VARCHAR(100)  NOT NULL,
  description TEXT          NULL,
  icon        VARCHAR(50)   NULL COMMENT 'Kunci ikon lucide yang dipakai frontend (globe, smartphone, cpu, dll)',
  color       VARCHAR(20)   NULL COMMENT 'Warna aksen kategori (hex), dipakai hall 3D',
  sort_order  INT           NOT NULL DEFAULT 0 COMMENT 'Urutan tampil kategori di hall 3D',
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE COMMENT 'Menentukan ruangan kategori ditampilkan di hall 3D atau tidak',
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- PROJECTS
-- ------------------------------------------------------------
CREATE TABLE projects (
  id                   INT NOT NULL AUTO_INCREMENT,
  user_id              INT NOT NULL,
  category_id          INT NOT NULL,
  title                VARCHAR(200) NOT NULL,
  slug                 VARCHAR(220) NOT NULL,
  thumbnail            VARCHAR(255) NOT NULL,
  description          TEXT NOT NULL,
  year                 INT NOT NULL,
  status               ENUM('pending','published','rejected') NOT NULL DEFAULT 'pending',
  rejection_reason     VARCHAR(255) NULL DEFAULT NULL,
  approve_note         VARCHAR(255) NULL DEFAULT NULL,
  author_tipe          ENUM('mahasiswa','dosen') NULL DEFAULT NULL,
  featured_slot        TINYINT UNSIGNED NULL DEFAULT NULL,
  is_shown_in_slideshow BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           DATETIME NOT NULL,
  updated_at           DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_projects_slug (slug),
  KEY idx_projects_user_id (user_id),
  KEY idx_projects_category_id (category_id),
  KEY idx_projects_status (status),
  CONSTRAINT fk_projects_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_projects_category
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- PROJECT_CHILDREN (gambar, anggota, dokumen, teknologi, video, tautan)
-- ------------------------------------------------------------
CREATE TABLE project_images (
  id         INT NOT NULL AUTO_INCREMENT,
  project_id INT NOT NULL,
  image_url  VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_project_images_project_id (project_id),
  CONSTRAINT fk_project_images_project
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE project_members (
  id         INT NOT NULL AUTO_INCREMENT,
  project_id INT NOT NULL,
  name       VARCHAR(100) NOT NULL,
  role       VARCHAR(100) NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_project_members_project_id (project_id),
  CONSTRAINT fk_project_members_project
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE project_documents (
  id         INT NOT NULL AUTO_INCREMENT,
  project_id INT NOT NULL,
  name       VARCHAR(200) NOT NULL,
  file_url   VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_project_documents_project_id (project_id),
  CONSTRAINT fk_project_documents_project
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE project_technologies (
  id         INT NOT NULL AUTO_INCREMENT,
  project_id INT NOT NULL,
  name       VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_project_technologies_project_id (project_id),
  CONSTRAINT fk_project_technologies_project
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE project_videos (
  id         INT NOT NULL AUTO_INCREMENT,
  project_id INT NOT NULL,
  video_url  VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_project_videos_project_id (project_id),
  CONSTRAINT fk_project_videos_project
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE project_links (
  id         INT NOT NULL AUTO_INCREMENT,
  project_id INT NOT NULL,
  label      VARCHAR(100) NOT NULL,
  url        VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_project_links_project_id (project_id),
  CONSTRAINT fk_project_links_project
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- PROJECT_LIKES (unique user + project)
-- ------------------------------------------------------------
CREATE TABLE project_likes (
  id         INT NOT NULL AUTO_INCREMENT,
  user_id    INT NOT NULL,
  project_id INT NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_project_likes_user_project (user_id, project_id),
  KEY idx_project_likes_project_id (project_id),
  CONSTRAINT fk_project_likes_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_project_likes_project
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- PROJECT_VIEWS
-- ------------------------------------------------------------
CREATE TABLE project_views (
  id         INT NOT NULL AUTO_INCREMENT,
  project_id INT NOT NULL,
  user_id    INT NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_project_views_project_id (project_id),
  KEY idx_project_views_user_id (user_id),
  CONSTRAINT fk_project_views_project
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_project_views_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- BOOKMARKS (unique user + project)
-- ------------------------------------------------------------
CREATE TABLE bookmarks (
  id         INT NOT NULL AUTO_INCREMENT,
  user_id    INT NOT NULL,
  project_id INT NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bookmarks_user_project (user_id, project_id),
  KEY idx_bookmarks_project_id (project_id),
  CONSTRAINT fk_bookmarks_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_bookmarks_project
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- COMMENTS & COMMENT_REPLIES
-- ------------------------------------------------------------
CREATE TABLE comments (
  id         INT NOT NULL AUTO_INCREMENT,
  user_id    INT NOT NULL,
  project_id INT NOT NULL,
  text       TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_comments_project_id (project_id),
  KEY idx_comments_user_id (user_id),
  KEY idx_comments_project_created (project_id, created_at),
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_project
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE comment_replies (
  id         INT NOT NULL AUTO_INCREMENT,
  user_id    INT NOT NULL,
  comment_id INT NOT NULL,
  text       TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_comment_replies_comment_id (comment_id),
  KEY idx_comment_replies_user_id (user_id),
  CONSTRAINT fk_comment_replies_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_replies_comment
    FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- NEWS
-- ------------------------------------------------------------
CREATE TABLE news (
  id             INT NOT NULL AUTO_INCREMENT,
  author_id      INT NOT NULL,
  title          VARCHAR(200) NOT NULL,
  slug           VARCHAR(220) NOT NULL,
  headline_image VARCHAR(255) NOT NULL,
  winner         VARCHAR(200) NULL,
  date           VARCHAR(100) NULL,
  source         VARCHAR(200) NULL,
  summary        TEXT NULL,
  tags           TEXT NULL,
  gallery        TEXT NULL,
  content        LONGTEXT NOT NULL,
  contentHTML    LONGTEXT NULL,
  status         ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at   DATETIME NULL,
  created_at     DATETIME NOT NULL,
  updated_at     DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_news_slug (slug),
  KEY idx_news_status (status),
  KEY idx_news_published_at (published_at),
  CONSTRAINT fk_news_author
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- VERIFICATION_CODES & PASSWORD_RESETS
-- ------------------------------------------------------------
CREATE TABLE verification_codes (
  id         INT NOT NULL AUTO_INCREMENT,
  user_id    INT NOT NULL,
  code       VARCHAR(10) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_verification_codes_user_id (user_id),
  KEY idx_verification_codes_code (code),
  CONSTRAINT fk_verification_codes_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE password_resets (
  id         INT NOT NULL AUTO_INCREMENT,
  user_id    INT NOT NULL,
  code       VARCHAR(10) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_password_resets_user_id (user_id),
  KEY idx_password_resets_code (code),
  CONSTRAINT fk_password_resets_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------------------
CREATE TABLE notifications (
  id             INT NOT NULL AUTO_INCREMENT,
  user_id        INT NOT NULL,
  type           ENUM('like','comment','project_approved','project_rejected',
                       'new_project','project_updated','project_deleted',
                       'announcement','user_registered','tipe_approved',
                       'tipe_rejected') NOT NULL,
  title          VARCHAR(150) NOT NULL,
  message        VARCHAR(255) NOT NULL,
  reference_type ENUM('project','comment','news','user') NULL,
  reference_id   INT NULL,
  is_read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_notifications_user_created (user_id, created_at),
  KEY idx_notifications_user_read (user_id, is_read),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- SETTINGS
-- ------------------------------------------------------------
CREATE TABLE settings (
  id         INT NOT NULL AUTO_INCREMENT,
  key        VARCHAR(50) NOT NULL,
  value      TEXT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_settings_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- ACTIVITY_LOGS (user_id SET NULL)
-- ------------------------------------------------------------
CREATE TABLE activity_logs (
  id          INT NOT NULL AUTO_INCREMENT,
  user_id     INT NULL,
  action      VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NULL,
  target_id   INT NULL,
  description VARCHAR(255) NULL,
  created_at  DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_activity_logs_user_id (user_id),
  KEY idx_activity_logs_action (action),
  KEY idx_activity_logs_target (target_type, target_id),
  CONSTRAINT fk_activity_logs_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- MEDIA_USAGE (primary key public_id Cloudinary)
-- ------------------------------------------------------------
CREATE TABLE media_usage (
  public_id  VARCHAR(300) NOT NULL,
  downloads  INT NOT NULL DEFAULT 0,
  views      INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (public_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- SITE_VISITS (unique per IP per hari)
-- ------------------------------------------------------------
CREATE TABLE site_visits (
  id         INT NOT NULL AUTO_INCREMENT,
  ip_address VARCHAR(45) NOT NULL,
  visit_date DATE NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_site_visits_ip_date (ip_address, visit_date),
  KEY idx_site_visits_visit_date (visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;