import sqlite3, { Database } from "sqlite3";

const db = new Database('./test.sqlite', (err) => {
  if (err) return console.error('Falha ao tentar abrir a database:', err.message);
  console.log('Conectando a database SQLite.');

  db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
  )`, (err) => {
    if (err) return console.error('Falha na criação da tabela', err.message);
    console.log('Tabela criada/encontrada.');

    db.run(`INSERT INTO users (name, email) VALUES (?, ?)`,
      ['Alice', 'alice@example.com'],
      function (err) {
        if (err) return console.error('Falha ao tentar inserir', err.message);
        console.log(`Inserindo com usuario com ID: ${this.lastID}`);

        db.all(`SELECT * FROM users`, [], (err, rows) => {
          if (err) return console.error('Falha na querying data:', err.message);
          console.log('Users:', rows);

          db.close((err) => {
            if (err) console.error('Error closing database:', err.message);
            else console.log('Database connection closed.');
          });
        });
      });
  });
});