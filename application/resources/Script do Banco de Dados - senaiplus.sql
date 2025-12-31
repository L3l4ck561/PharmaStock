DROP DATABASE if EXISTS unesp_db;
CREATE DATABASE if NOT EXISTS unesp_db;
USE unesp_db;

DROP TABLE if EXISTS users;
CREATE TABLE if NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE if EXISTS pharma;
CREATE TABLE if NOT EXISTS pharma (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cor VARCHAR(50),
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(100),
    quantAlert INT NOT NULL,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE if EXISTS stock;
CREATE TABLE if NOT EXISTS stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pharma INT NOT NULL,
    quant INT NOT NULL,
    lote VARCHAR(100),
    unid VARCHAR(50),
    fornecedor VARCHAR(150),
    validade DATE,
    obs TEXT,
    
    usados INT DEFAULT 0,
    vencidos INT DEFAULT 0,
    
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_stock_pharma
        FOREIGN KEY (id_pharma) REFERENCES pharma(id)
);

