-- ==========================================================
-- FitCheck Database Schema
-- Run this script in your Cloud MySQL database to set up tables
-- ==========================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) DEFAULT NULL,
  `weekly_goal_minutes` INT DEFAULT 150,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `workouts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT DEFAULT NULL,
  `exercise_type` VARCHAR(50) NOT NULL,
  `duration_minutes` INT NOT NULL,
  `date_logged` DATE NOT NULL,
  `intensity` VARCHAR(20) DEFAULT 'medium',
  `notes` TEXT,
  PRIMARY KEY (`id`),
  KEY `fk_user_workout` (`user_id`),
  CONSTRAINT `fk_user_workout` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
