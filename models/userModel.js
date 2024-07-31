const pool = require('../config/database');

const User = {
    findByUsername: async (username) => {
        const result = await pool.query('SELECT * FROM efeeder.set_pengguna WHERE username = $1', [username]);
        return result.rows[0];
    },
    // Tambahkan metode lain sesuai kebutuhan (misalnya createUser)
};

module.exports = User;