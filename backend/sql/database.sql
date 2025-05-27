USE scoring_system;

-- Drop existing tables
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS audit_trail;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS judges;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS roles;

-- Create roles table
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create judges table with enhanced fields
CREATE TABLE judges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Create categories table with timestamps
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    weight INT DEFAULT 1,
    max_points INT DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Create participants table with enhanced fields
CREATE TABLE participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    registration_number VARCHAR(50) UNIQUE,
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_registration (registration_number)
);

-- Create scores table with enhanced tracking
CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judge_id INT NOT NULL,
    participant_id INT NOT NULL,
    category_id INT NOT NULL,
    points INT NOT NULL CHECK (points BETWEEN 1 AND 100),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (judge_id) REFERENCES judges(id),
    FOREIGN KEY (participant_id) REFERENCES participants(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE KEY unique_score (judge_id, participant_id, category_id),
    INDEX idx_participant_scores (participant_id, category_id),
    INDEX idx_judge_scores (judge_id, created_at)
);

-- Create tokens table for authentication
CREATE TABLE tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judge_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (judge_id) REFERENCES judges(id),
    UNIQUE KEY unique_token (token),
    INDEX idx_expires (expires_at)
);

-- Create audit trail table
CREATE TABLE audit_trail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action VARCHAR(10) NOT NULL,
    changed_by INT,
    changes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit (table_name, record_id)
);

-- Insert sample data
INSERT INTO roles (name, description) VALUES
('admin', 'System administrator'),
('judge', 'Competition judge'),
('guest', 'Read-only access');

-- Insert sample judges with proper roles
INSERT INTO judges (username, display_name, email, password_hash, role_id) VALUES
('admin1', 'System Admin', 'admin@example.com', SHA2('admin123', 256), 1),
('judge1', 'Judge Dennis', 'dennis@example.com', SHA2('password123', 256), 2),
('judge2', 'Judge Mwende', 'mwende@example.com', SHA2('password123', 256), 2),
('judge3', 'Judge Doe', 'doe@example.com', SHA2('password123', 256), 2);

-- Insert categories
INSERT INTO categories (name, description, weight) VALUES
('Technical Skills', 'Assessment of technical implementation and problem-solving', 2),
('Innovation', 'Creativity and uniqueness of the solution', 1),
('Presentation', 'Quality of presentation and communication', 1),
('Impact', 'Potential impact and practicality of the solution', 2);

-- Insert participants with more details
INSERT INTO participants (name, email, registration_number, bio) VALUES
('John Smith', 'john@example.com', 'PART001', 'Senior Software Engineer with 5 years experience'),
('Jane Doe', 'jane@example.com', 'PART002', 'UI/UX Designer specializing in mobile applications'),
('Bob Wilson', 'bob@example.com', 'PART003', 'Full-stack developer and tech entrepreneur'),
('Alice Brown', 'alice@example.com', 'PART004', 'Data scientist with focus on AI/ML'),
('Charlie Davis', 'charlie@example.com', 'PART005', 'DevOps engineer and cloud architect');
('Sarah Chen', 'sarah@example.com', 'PART006', 'Backend developer specializing in distributed systems'),
('Mohammed Ahmed', 'mohammed@example.com', 'PART007', 'Mobile app developer with expertise in React Native'),
('Elena Rodriguez', 'elena@example.com', 'PART008', 'System architect with focus on scalable solutions'),
('David Kim', 'david@example.com', 'PART009', 'Security specialist and penetration tester'),
('Priya Patel', 'priya@example.com', 'PART010', 'Frontend developer with 3 years of Vue.js experience');

-- Insert comprehensive sample scores
INSERT INTO scores (judge_id, participant_id, category_id, points, comments) VALUES
(2, 1, 1, 85, 'Excellent technical implementation with solid architecture'),
(2, 1, 2, 90, 'Very innovative approach to problem solving'),
(2, 1, 3, 88, 'Clear presentation with good technical depth'),
(2, 1, 4, 87, 'Strong potential for real-world application'),
(3, 1, 1, 82, 'Good technical skills demonstrated'),
(3, 1, 2, 85, 'Creative solution with unique perspective'),
(3, 1, 3, 80, 'Well presented but could improve on timing'),
(3, 1, 4, 83, 'Practical solution with good market potential');