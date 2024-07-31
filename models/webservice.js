const Pengaturan = require('../models/pengaturan'); // Assuming you have Pengaturan model
const curl = require('curl'); // Install library curl jika belum terinstall

class Webservice {
    constructor() {
        this.pengaturan = new Pengaturan();
    }

    async initialize() {
        const host = await this.pengaturan.getHost();
        const user = await this.pengaturan.getUser();
        const password = await this.pengaturan.getPassword();

        this.url = host + "/ws/live2.php?wsdl";
        this.user = user;
        this.password = password;
    }

    async run(data, type = 'json') {
        await this.initialize(); // Memastikan inisialisasi selesai sebelum melakukan request
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': type === 'xml' ? 'application/xml' : 'application/json',
            },
        };

        if (data) {
            options.data = type === 'xml' ? this.stringXML(data) : JSON.stringify(data);
        }

        return new Promise((resolve, reject) => {
            curl.post(this.url, options, (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(body);
                }
            });
        });
    }

    stringXML(data) {
        // ... (Implementasi fungsi untuk mengubah data menjadi XML) ...
        // You can use a library like 'xmlbuilder' for this
    }

    async updateData(aData, id) {
        const params = [];
        const setClauses = [];
        for (const [key, value] of Object.entries(aData)) {
            if (key !== 'act') {
                setClauses.push(`${key} = $${params.length + 1}`);
                params.push(value);
            }
        }
        params.push( /* ID pengguna dari sesi */); 
        params.push(new Date().toISOString());
        params.push( /* IP address pengguna */ ); 
    
        const sql = `
            UPDATE ${this._schema}.${this._table} 
            SET ${setClauses.join(', ')}, 
                _log_updated = $${params.length - 2}, 
                _log_time_updated = $${params.length - 1}, 
                _log_ip_updated = $${params.length}
            WHERE ${this._key} = $${params.length + 1}
        `;
        params.push(id); // Add the ID to the parameters
    
        return this.executeTrans(params);
    }
    
    async deleteData(id) {
        const params = [
            /* ID pengguna dari sesi */, 
            new Date().toISOString(),
            /* IP address pengguna */, 
            1
        ];
    
        const sql = `
            UPDATE ${this._schema}.${this._table}
            SET _log_deleted = $1, _log_time_deleted = $2, _log_ip_deleted = $3, _log_delete = $4
            WHERE ${this._key} = $5
        `;
        params.push(id); // Add the ID to the parameters
    
        return this.executeTrans(params);
    }

    getKeyValue(key, valueKey, arrayList) {
        const list = arrayList;
        const a_data = {};
        list.forEach(row => {
            a_data[row[key]] = `${row[key]} - ${row[valueKey]}`;
        });
        return a_data;
    }

    getKeyValueMatkul(key, valueKey, arrayList) {
        const list = arrayList;
        const a_data = {};
        list.forEach(row => {
            a_data[row[key]] = `${row['kode_mata_kuliah']} - ${row[valueKey]}`;
        });
        return a_data;
    }
    
    getKeyValueDosen(key, valueKey, arrayList) {
        const list = arrayList;
        const a_data = {};
        list.forEach(row => {
            a_data[row[key]] = `${row['nidn']} - ${row[valueKey]}`;
        });
        return a_data;
    }
    
    async getToken() {
        const act = "GetToken";
        const data = {
            act,
            username: this.user,
            password: this.password,
        };
    
        try {
            let result_token = await this.run(data); // Menggunakan await untuk menunggu promise dari run()
    
            // Parse hasil JSON (mungkin perlu penyesuaian)
            let token_decode = JSON.parse(result_token); 
    
            if (token_decode['error_code'] > 0) {
                // Implementasi error handling (rekursif, jika perlu)
                return await this.getToken(); 
            } else {
                return token_decode['data']['token'];
            }
        } catch (error) {
            console.error("Error getting token:", error);
            // Implementasi error handling yang sesuai
            throw error; 
        }
    }
    
    async execute(a_data) {
        const token = await this.getToken();
        const a_token = { token };
        const data = { ...a_data, ...a_token }; // Gabungkan objek menggunakan spread syntax
    
        try {
            let result_string = await this.run(data); // Menggunakan await untuk menunggu promise dari run()
            return JSON.parse(result_string); // Parse hasil JSON
        } catch (error) {
            console.error("Error executing:", error);
            // Implementasi error handling yang sesuai
            throw error;
        }
    }
   
}

module.exports = Webservice;