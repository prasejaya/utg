const pool = require('../config/database'); // Assuming you have a database connection pool

class Pengaturan {
    constructor() {
        this.schema = 'integrator'; // Nama skema database (jika ada)
        this.table = 'ms_setting'; 
        this.key = 'id_setting';
    }

    async getHost() {
        const result = await pool.query(`SELECT host FROM ${this.schema}.${this.table} WHERE ${this.key} = 1`);
        return result.rows[0]?.host; // Gunakan optional chaining untuk menghindari error jika tidak ada data
    }

    async getUser() {
        const result = await pool.query(`SELECT username FROM ${this.schema}.${this.table} WHERE ${this.key} = 1`);
        return result.rows[0]?.username; 
    }

    async getPassword() {
        const result = await pool.query(`SELECT password FROM ${this.schema}.${this.table} WHERE ${this.key} = 1`);
        return result.rows[0]?.password; 
    }
}

module.exports = Pengaturan;