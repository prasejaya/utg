const { Client } = require('ssh2');
const { Pool } = require('pg');
const connectToDatabase = require('../config/db');

class QuerySiakad {
    constructor() {
        this.pool = null;
        this.server = null;
        this.schema = '';
        this.table = '';
        this.key = '';
        this.query = '';
        this.order = '';
        this.where = '';
        this.params = [];
    }
    async connect() {
        this.pool = await connectToDatabase(); // Tunggu koneksi melalui tunnel SSH
        if (!this.pool) {
            throw new Error('Database connection not available.');
        }
    }

    setSchema(schema) { this.schema = schema; }
    setTable(table) { this.table = table; }
    setKey(key) { this.key = key; }

    async execute(query, params = [], fetch = '') {
        try {
            const result = await this.db.any(query, params); // Gunakan db.any() untuk mengeksekusi query

            if (fetch === 'fetch') {
                return result[0]; 
            } else if (fetch === 'fetchAll') {
                return result;
            } else {
                return result; 
            }
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        } finally {
            if (this.pool) {
                this.pool.end().then(() => {
                    if (this.server) {
                        this.server.close();
                    }
                });
            }
        }
    }

    async getRow() {
        const sql = this.buildSelectQuery();
        const row = await this.execute(sql, this.params);
        return row[0]; // Ambil baris pertama
    }

    async getList() {
        const sql = this.buildSelectQuery();
        return await this.execute(sql, this.params);
    }

    buildSelectQuery() {
        let sql = `SELECT * FROM ${this.schema}.${this.table}`;
        if (this.where) sql += ` WHERE ${this.where}`;
        if (this.order) sql += ` ORDER BY ${this.order}`;
        return sql;
    }

    setSchema(schema) {
        this._schema = schema;
    }

    setTable(table) {
        this._table = table;
    }

    setKey(key) {
        this._key = key;
    }

    set_sql(sql) {
        this._sql = sql;
        this._order = '';
        this._where = '';
        this.params = [];
        return this._sql;
    }

    setOrder(id, by) {
        const dataOrder = Array.isArray(id) ? id.map(item => `${item.key} ${item.value}`).join(', ') : `${id} ${by}`;
        this._order = `ORDER BY ${dataOrder}`; // Direct assignment
        return this._order;
    }

    setWhere(data, prefix = 'AND', operator = '=') {
        this.params = [];
        this.where = '(1=1)'; // Initialize for easier concatenation

        for (const [key, value] of Object.entries(data)) {
            this.where += ` ${prefix} ${key} ${operator} $${this.params.length + 1}`;
            this.params.push(value);
        }
    }

    async execute(params = [], fetch = '') {
        await this.connect();
        try {
            const result = await this.pool.query(this._sql, params);
    
            this._sql = '';
            this._order = '';
            this._where = '';
            this.params = [];
    
            if (fetch === 'fetch') {
                return result.rows[0];
            } else if (fetch === 'fetchAll') {
                return result.rows;
            } else {
                return result; // Return the result object directly if no fetch option is specified
            }
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
    
    async getKeyValue(valueKey) {
        const list = await this.getList();
        const result = {};
        list.forEach(row => {
            result[row[this.key]] = row[valueKey];
        });
        return result;
    }
    
    
    async executeTrans(params = [], isInsert = false) {
        try {
            const result = await this.pool.query(this._sql, params);
            let message = '';
            let error = 0;
            let lastId = '';
    
            if (isInsert) {
                lastId = result.rows[0] ? result.rows[0][this.key] : null; // Mengambil ID dari hasil insert (jika ada)
            }
            
            if (result) {
                message = 'Transaksi Berhasil dilakukan';
            } 
    
            this._sql = '';
            this._order = '';
            this._where = '';
            this.params = []; 
    
            return { error_code: error, message_desc: message, last_id: lastId };
        } catch (error) {
            console.error('Database error:', error);
            return { error_code: 1, message_desc: 'Transaksi Gagal dilakukan' };
        }
    }

    async getRow() {
        if (!this._sql) {
            this._sql = `SELECT * FROM ${this._schema}.${this._table}`;
        }
    
        if (this._where) {
            this._sql += ` WHERE ${this._where}`;
        }
    
        if (this._order) {
            this._sql += this._order; 
        }
    
        // console.log(this._sql); // (Opsional) Untuk debugging
        return this.execute(this.params, 'fetch'); // Panggil execute dengan opsi 'fetch' untuk mengambil satu baris
    }
    
    async getList() {
        if (!this._sql) {
            this._sql = `SELECT * FROM ${this._schema}.${this._table}`;
        }
    
        if (this._where) {
            this._sql += ` WHERE ${this._where}`;
        }
    
        if (this._order) {
            this._sql += ` ORDER BY ${this._order}`;
        }
    
        // console.log(this._sql); // (Opsional) Untuk debugging
        return this.execute(this.params, 'fetchAll'); // Panggil execute dengan opsi 'fetchAll' untuk mengambil semua baris
    }

}

module.exports = QuerySiakad;
