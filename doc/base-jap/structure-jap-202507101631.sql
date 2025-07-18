-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: jap
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `dep_fr`
--

DROP TABLE IF EXISTS `dep_fr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dep_fr` (
  `dep_index` int NOT NULL AUTO_INCREMENT,
  `num_dep` varchar(10) DEFAULT NULL,
  `nom_dep` varchar(50) DEFAULT NULL,
  `nom_reg` varchar(50) DEFAULT NULL,
  `superficie` int DEFAULT NULL,
  `pop_dep` int DEFAULT NULL,
  `densite` int DEFAULT NULL,
  `nom_pref` varchar(50) DEFAULT NULL,
  `pop_pref` int NOT NULL,
  `sous_pref` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`dep_index`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gram_char`
--

DROP TABLE IF EXISTS `gram_char`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gram_char` (
  `gram_index` int NOT NULL AUTO_INCREMENT,
  `niveau` varchar(10) COLLATE utf8mb4_ja_0900_as_cs DEFAULT NULL,
  `titre` text COLLATE utf8mb4_ja_0900_as_cs,
  `nom` text COLLATE utf8mb4_ja_0900_as_cs,
  `description` text COLLATE utf8mb4_ja_0900_as_cs,
  `construction` text COLLATE utf8mb4_ja_0900_as_cs,
  `exemple` text COLLATE utf8mb4_ja_0900_as_cs,
  PRIMARY KEY (`gram_index`)
) ENGINE=InnoDB AUTO_INCREMENT=425 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_ja_0900_as_cs;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `kanji_char`
--

DROP TABLE IF EXISTS `kanji_char`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kanji_char` (
  `kanji_index` int NOT NULL AUTO_INCREMENT,
  `niveau` varchar(10) DEFAULT NULL,
  `kanji` varchar(40) DEFAULT NULL,
  `onyomi` varchar(40) DEFAULT NULL,
  `kunyomi` varchar(40) DEFAULT NULL,
  `francais` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`kanji_index`)
) ENGINE=MyISAM AUTO_INCREMENT=1975 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `quiz`
--

DROP TABLE IF EXISTS `quiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ANNEE` int DEFAULT NULL,
  `NIVEAU` varchar(2) COLLATE utf8mb4_ja_0900_as_cs DEFAULT NULL,
  `TEXTE` varchar(5000) COLLATE utf8mb4_ja_0900_as_cs DEFAULT NULL,
  `REP_OK` varchar(150) COLLATE utf8mb4_ja_0900_as_cs DEFAULT NULL,
  `QUESTION` varchar(150) COLLATE utf8mb4_ja_0900_as_cs DEFAULT NULL,
  `REP1` varchar(150) COLLATE utf8mb4_ja_0900_as_cs DEFAULT NULL,
  `REP2` varchar(150) COLLATE utf8mb4_ja_0900_as_cs DEFAULT NULL,
  `REP3` varchar(150) COLLATE utf8mb4_ja_0900_as_cs DEFAULT NULL,
  `REP4` varchar(150) COLLATE utf8mb4_ja_0900_as_cs DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=271 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_ja_0900_as_cs;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reg_fr`
--

DROP TABLE IF EXISTS `reg_fr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reg_fr` (
  `reg_index` int NOT NULL AUTO_INCREMENT,
  `reg_nom` varchar(100) COLLATE utf8mb4_ja_0900_as_cs DEFAULT NULL,
  `reg_cheflieu` varchar(300) COLLATE utf8mb4_ja_0900_as_cs DEFAULT NULL,
  `reg_dep` varchar(300) COLLATE utf8mb4_ja_0900_as_cs DEFAULT NULL,
  `reg_superficie` int DEFAULT NULL,
  `reg_population` int DEFAULT NULL,
  PRIMARY KEY (`reg_index`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_ja_0900_as_cs;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vocab_char`
--

DROP TABLE IF EXISTS `vocab_char`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vocab_char` (
  `voca_index` int NOT NULL AUTO_INCREMENT,
  `niveau` varchar(6) DEFAULT NULL,
  `kana` varchar(100) DEFAULT NULL,
  `kanji` varchar(40) DEFAULT NULL,
  `francais` text,
  PRIMARY KEY (`voca_index`)
) ENGINE=InnoDB AUTO_INCREMENT=27286 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-10 16:41:02
