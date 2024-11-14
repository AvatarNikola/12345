const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

// Главная страница
app.get("/", (req, res) => {
	res.send("Hello from Railway!");
});

// Эндпоинт для добавления данных
app.post("/items", async (req, res) => {
	const { name } = req.body;
	if (!name) {
		return res.status(400).send('Поле "name" обязательно');
	}

	try {
		const result = await pool.query("INSERT INTO items (name) VALUES ($1) RETURNING *", [name]);
		res.status(201).json(result.rows[0]);
	} catch (err) {
		console.error(err);
		res.status(500).send("Ошибка при добавлении элемента");
	}
});

// Эндпоинт для удаления данных
app.delete("/items/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const result = await pool.query("DELETE FROM items WHERE id = $1 RETURNING *", [id]);

		if (result.rowCount === 0) {
			return res.status(404).send("Элемент не найден");
		}

		res.status(200).json(result.rows[0]);
	} catch (err) {
		console.error(err);
		res.status(500).send("Ошибка при удалении элемента");
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
