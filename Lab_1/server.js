const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const HOST = 'localhost';
const PORT = 3000;
const FILE_PATH = './clients.json';

// Якщо файлу немає — створюємо порожній JSON
if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, '[]', 'utf-8');
}

// Обслуговування статичних файлів з папки public
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('/registration');
});

app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/adminpanel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Отримання списку всіх клієнтів
app.get('/clients', (req, res) => {
    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
        if (err) {
            console.error('Помилка читання файлу:', err);
            return res.status(500).json({ message: 'Помилка читання файлу' });
        }
        res.json(JSON.parse(data));
    });
});

// Збереження нового користувача
app.post('/saveuser', (req, res) => {
    const userInfo = req.body;
    console.log('Новий користувач:', userInfo);

    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
        if (err) {
            console.error('Помилка читання файлу:', err);
            return res.status(500).json({ message: 'Помилка читання файлу' });
        }

        let users = [];
        try {
            users = JSON.parse(data);
            if (!Array.isArray(users)) users = [];
        } catch (parseErr) {
            console.error('Помилка парсингу JSON:', parseErr);
            users = [];
        }

        users.push(userInfo);

        fs.writeFile(FILE_PATH, JSON.stringify(users, null, 4), (err) => {
            if (err) {
                console.error('Помилка запису у файл:', err);
                return res.status(500).json({ message: 'Помилка збереження даних' });
            }
            res.json({ message: 'Користувач успішно збережений!' });
        });
    });
});

// Редагування імені користувача
app.put('/edituser', (req, res) => {
    const { email, newName } = req.body;

    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
        if (err) {
            console.error('Помилка читання файлу:', err);
            return res.status(500).json({ message: 'Помилка читання файлу' });
        }

        let users = JSON.parse(data);
        let user = users.find(u => u.email === email);

        if (!user) {
            return res.status(404).json({ message: 'Користувач не знайдений' });
        }

        user.name = newName;

        fs.writeFile(FILE_PATH, JSON.stringify(users, null, 4), (err) => {
            if (err) {
                console.error('Помилка запису у файл:', err);
                return res.status(500).json({ message: 'Помилка збереження даних' });
            }
            res.json({ message: 'Ім’я успішно оновлено' });
        });
    });
});

// Видалення користувача
app.delete('/deleteuser', (req, res) => {
    const { email } = req.body;

    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
        if (err) {
            console.error('Помилка читання файлу:', err);
            return res.status(500).json({ message: 'Помилка читання файлу' });
        }

        let users = JSON.parse(data);
        const filteredUsers = users.filter(u => u.email !== email);

        if (users.length === filteredUsers.length) {
            return res.status(404).json({ message: 'Користувач не знайдений' });
        }

        fs.writeFile(FILE_PATH, JSON.stringify(filteredUsers, null, 4), (err) => {
            if (err) {
                console.error('Помилка запису у файл:', err);
                return res.status(500).json({ message: 'Помилка збереження даних' });
            }
            res.json({ message: 'Користувач успішно видалений' });
        });
    });
});

app.listen(PORT, HOST, () => {
    console.log(`Сервер працює на http://${HOST}:${PORT}`);
});
