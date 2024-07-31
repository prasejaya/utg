// models/mahasiswaSim.js

const connectToDatabase = require('../config/db');
const pgp = require('pg-promise')(); // Inisialisasi pg-promise

class MahasiswaSim {
    constructor() {
        this.db = null; // Instance pg-promise untuk koneksi database
        this._schema = 'akademik';
        this._table = 'ms_mahasiswa';
        this._key = 'nim';
    }

    async connect() {
        try {
            this.db = await connectToDatabase(); 
            if (!this.db) {
                throw new Error('Database connection not available.');
            }
        } catch (err) {
            console.error('Error connecting to database:', err);
            throw err; 
        }
    }
  
    async getListMahasiswa(a_filter = {}) {
        try {
            await this.connect(); 
    
            const periode = '20241';
            const tahun = periode.substring(0, 4);
    
            let sql = `
                SELECT nama, m.nim, sex, kodeagama, m.kodeunit, m.statusmhs,
                    SUBSTRING(periodemasuk, 1, 4) AS angkatan, ipk, namastatus, m.alamat, m.nisn,  m.sex, m.tmplahir, m.tgllahir, m.kodeagama, m.nik,
                    m.kodenegara,m.alamat, m.dusun, m.rt, m.rw, m.kelurahan, m.kodewilayah,
                    m.kodepos,m.telp, m.hp, m.email, m.namaayah, m.kodepekerjaanayah, m.kodepekerjaanibu, kodependidikanayah,
                    kodependidikanibu, kodependapatanayah, kodependapatanibu,m.skslulus,m.nik, p.epskodeprodi,p.nama_program_studi,
                    kelurahan, kecamatan, dusun, tf.deskripsi,m1.status_sync,   CASE WHEN COALESCE(NULLIF(m.isbeasiswa::NUMERIC, 0), 0) = 0 THEN 'Mandiri' ELSE 'Beasiswa Penuh' END AS beasiswa
                FROM akademik.ms_mahasiswa m 
                LEFT JOIN akademik.lv_statusmhs s on s.statusmhs = m.statusmhs
                LEFT JOIN akademik.ak_prodi p on p.kodeunit = m.kodeunit 
                LEFT JOIN integrator.map_mahasiswalengkap m1 on m1.nim = m.nim
                LEFT JOIN ( SELECT nim,periode FROM akademik.ak_perwalian ORDER BY periode DESC LIMIT 1) per ON per.nim = m.nim
                LEFT JOIN
                    h2h.ke_tagihan h ON h.nim = m.nim AND h.periode = per.periode
                LEFT JOIN ( SELECT nim, periode_transfer, deskripsi from integrator.log_transfer
                order by id_log_transfer desc limit 1
                ) tf on tf.nim = m.nim
                WHERE (1=1)  and periodemasuk= '20231'
                AND m.statusmhs in ('A','N','X') 
            `;
    
            // Filter
            const filter = []; // Pindahkan deklarasi values ke luar blok if
            if (a_filter['angkatan']) {
                sql += ` AND m.periodemasuk = $1`;
                filter.push(a_filter['angkatan']);
            }
            if (a_filter['kodeunit']) {
                sql += ` AND p.epskodeprodi = $${values.length + 1}`;
                filter.push(a_filter['kodeunit']);
            }
            if (Object.keys(a_filter).length === 0) {
                sql += ` AND SUBSTRING(m.periodemasuk, 1, 4) = $${values.length + 1}`;
                filter.push(tahun);
            }
    
            const values = []; // Declare values outside the if blocks
    
            // ... (Your existing filter logic)
    
            sql += " GROUP BY nama,m.nim,sex,kodeagama,m.kodeunit,m.statusmhs,periodemasuk,ipk, namastatus, m.alamat, m.nisn,  m.sex, m.tmplahir, m.tgllahir, m.kodeagama, m.nik,m.kodenegara,m.alamat, m.dusun, m.rt, m.rw, m.kelurahan, m.kodewilayah,m.kodepos,m.telp, m.hp, m.email, m.namaayah, m.kodepekerjaanayah, m.kodepekerjaanibu, kodependidikanayah,kodependidikanibu, kodependapatanayah, kodependapatanibu,p.epskodeprodi,p.nama_program_studi,kelurahan, kecamatan, dusun, tf.deskripsi,m1.status_sync,isbeasiswa ";
            sql += " ORDER BY periodemasuk DESC";
    
            // Use pool.query instead of this.db.any
            const mahasiswa = await this.pool.query(sql, values); 
    
            // Fetch biaya masuk (using pool.query)
            const biayaMasukPromises = mahasiswa.rows.map(async (mhs) => {
                const biayaSql = `SELECT SUM(nominaltagihan) AS biaya_masuk
                    FROM h2h.ke_tagihan
                    WHERE nim = $1 AND periode = (SELECT MAX(periode) FROM akademik.ak_perwalian WHERE nim = $1)`; // (Your existing biayaSql query)
                const biayaResult = await this.pool.query(biayaSql, [mhs.nim]);
                return biayaResult.rows[0]?.biaya_masuk || 0; 
            });
    
            const biayaMasuk = await Promise.all(biayaMasukPromises);
    
            // Add biaya masuk to data
            for (let i = 0; i < mahasiswa.rows.length; i++) {
                mahasiswa.rows[i].biaya_masuk = biayaMasuk[i];
            }
    
            return mahasiswa.rows;

        } catch (error) {
            console.error('Error dalam getListMahasiswa:', error);
            throw error;
        }
        
    }
    

    // ... (Fungsi getListMahasiswaLulus, dll.)
}

module.exports = MahasiswaSim;
