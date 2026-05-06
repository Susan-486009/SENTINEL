-- Run this against your MySQL database before starting the server.
-- Database: lasustech_complaints

CREATE DATABASE IF NOT EXISTS lasustech_complaints
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lasustech_complaints;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150)                        NOT NULL,
  matric     VARCHAR(60)                         NOT NULL UNIQUE,
  email      VARCHAR(191)                        NOT NULL UNIQUE,
  password   VARCHAR(255)                        NOT NULL,
  role       ENUM('student','staff','admin')     NOT NULL DEFAULT 'student',
  created_at TIMESTAMP                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP                           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email  (email),
  INDEX idx_matric (matric)
) ENGINE=InnoDB;

-- Complaints
CREATE TABLE IF NOT EXISTS complaints (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference_id VARCHAR(20)                                               NULL UNIQUE,  -- CMP-YYYY-NNNNN
  user_id      INT UNSIGNED                                              NULL,         -- NULL = anonymous
  category     VARCHAR(80)                                          NOT NULL,
  title        VARCHAR(200)                                         NOT NULL,
  description  TEXT                                                 NOT NULL,
  anonymous    TINYINT(1)                                           NOT NULL DEFAULT 0,
  status       ENUM('pending','in_review','resolved','rejected')    NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMP                                            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP                                            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_complaint_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_reference (reference_id),
  INDEX idx_status    (status),
  INDEX idx_category  (category),
  INDEX idx_user      (user_id)
) ENGINE=InnoDB;

-- Evidence files attached to complaints
CREATE TABLE IF NOT EXISTS complaint_files (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  complaint_id   INT UNSIGNED                NOT NULL,
  filename       VARCHAR(255)                NOT NULL,   -- stored filename in compressed/
  original_name  VARCHAR(255)                NOT NULL,   -- original upload name
  mime_type      VARCHAR(100)                NOT NULL,
  size_bytes     INT UNSIGNED                    NULL,   -- compressed file size
  width          SMALLINT UNSIGNED               NULL,   -- image width (null for docs)
  height         SMALLINT UNSIGNED               NULL,   -- image height (null for docs)
  created_at     TIMESTAMP                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_file_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  INDEX idx_complaint (complaint_id)
) ENGINE=InnoDB;

-- Logs for rate limiting and suspicious behavior
CREATE TABLE IF NOT EXISTS suspicious_activities (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED                NOT NULL,
  activity_type VARCHAR(100)              NOT NULL, -- e.g., 'rate_limit_exceeded'
  details       TEXT                        NULL,     -- JSON context
  severity      ENUM('low', 'medium', 'high') DEFAULT 'low',
  created_at    TIMESTAMP                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_activity (user_id)
) ENGINE=InnoDB;
