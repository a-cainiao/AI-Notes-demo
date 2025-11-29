-- 使用notes数据库
USE notes;

-- 1. 为notes表添加category_id列
ALTER TABLE notes ADD COLUMN category_id VARCHAR(36) NULL AFTER content;

-- 2. 创建笔记标签关联表
CREATE TABLE IF NOT EXISTS note_tags (
    note_id VARCHAR(50) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (note_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_category (user_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 添加外键约束
ALTER TABLE notes ADD CONSTRAINT fk_notes_category_id FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE note_tags ADD CONSTRAINT fk_note_tags_note_id FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE;
ALTER TABLE note_tags ADD CONSTRAINT fk_note_tags_tag_id FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE;