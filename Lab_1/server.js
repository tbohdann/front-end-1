const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;
const FILE_PATH = './clients.json';

app.use(express.json());
app.use(express.static('public')); // Для збереження фото

if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, '[]', 'utf-8');
}

// Налаштування завантаження фото
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });
app.get('/', (req, res) => {
    res.redirect('/registration');
});

app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/adminpanel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
// **Отримання клієнтів**
app.get('/clients', (req, res) => {
    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Помилка читання файлу' });

        try {
            const users = JSON.parse(data);
            res.json(users.map(({ name, email }) => ({ name, email }))); // Відправляємо лише ім'я та email
        } catch {
            res.status(500).json({ message: 'Помилка JSON' });
        }
    });
});

// **Додавання клієнта**
app.post('/saveuser', upload.single('photo'), (req, res) => {
    const { name, email } = req.body;
    
    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Помилка читання файлу' });

        let users = JSON.parse(data || '[]');
        users.push({ name, email });

        fs.writeFile(FILE_PATH, JSON.stringify(users, null, 4), (err) => {
            if (err) return res.status(500).json({ message: 'Помилка запису файлу' });
            res.json({ message: 'Користувач збережений!' });
        });
    });
});

// **Редагування клієнта**
app.put('/edituser', (req, res) => {
    const { email, newName } = req.body;

    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Помилка читання файлу' });

        let users = JSON.parse(data || '[]');
        const user = users.find(u => u.email === email);

        if (user) {
            user.name = newName;
            fs.writeFile(FILE_PATH, JSON.stringify(users, null, 4), (err) => {
                if (err) return res.status(500).json({ message: 'Помилка запису файлу' });
                res.json({ message: 'Користувач оновлений!' });
            });
        } else {
            res.status(404).json({ message: 'Користувача не знайдено' });
        }
    });
});

// **Видалення клієнта**
app.delete('/deleteuser', (req, res) => {
    const { email } = req.body;

    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Помилка читання файлу' });

        let users = JSON.parse(data || '[]');
        const newUsers = users.filter(u => u.email !== email);

        fs.writeFile(FILE_PATH, JSON.stringify(newUsers, null, 4), (err) => {
            if (err) return res.status(500).json({ message: 'Помилка запису файлу' });
            res.json({ message: 'Користувач видалений!' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:${PORT}`);
});
