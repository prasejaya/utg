const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const authController = {
    getLogin: (req, res) => {
        res.render('login');
    },
    postLogin: async (req, res) => {
        const { username, password } = req.body;
        const user = await User.findByUsername(username);
        // ... (logika otentikasi dengan bcrypt)
    },
    getBeranda: (req, res) => {
        // Ambil data yang dibutuhkan (misalnya dari database)
        const dataMahasiswa = [/* ... data mahasiswa Anda ... */];
        const logTransaksi = [/* ... data log transaksi Anda ... */];
        const role = req.session.role || 'AA';
        const user = req.session.user || 'Admin'; 
        res.render('beranda', { 
            mahasiswa: dataMahasiswa, 
            logTransaksi: logTransaksi,
            role: role, 
            user: user
        });
    },
    // ... (register, logout, dll.)
};

module.exports = authController;