const QuerySiakad = require('./querysiakad');

class MahasiswaSim extends QuerySiakad {
    constructor() {
        super();
        this._schema = 'integrator';
        this._table = 'map_mahasiswalengkap';
        this._key = 'nim';
    }

    async getAngkatan() {
        const sql = `
            SELECT DISTINCT SUBSTRING(id_periode, 1, 4) AS angkatan
            FROM ${this._schema}.${this._table}
            WHERE id_periode IS NOT NULL
            ORDER BY SUBSTRING(id_periode, 1, 4) DESC
        `;
    
        this.set_sql(sql);
        const data = await this.getList();
    
        const angkatan = {};
        data.forEach(row => {
            angkatan[row.angkatan] = row.angkatan;
        });
    
        return angkatan;
    }
    
    async maxAngkatan() {
        const sql = `SELECT MAX(id_periode) FROM ${this._schema}.${this._table}`;
        this.set_sql(sql);
        const data = await this.getRow();
        return data;
    }
    
    async getListMahasiswa(a_filter = {}) {
        const sessionData = { periode: '20231' }; // Contoh data sesi, sesuaikan dengan cara Anda mengambil data sesi di Node.js
        const tahun = sessionData.periode.substring(0, 4);
    
        let sql = `
            SELECT m.nim, m.id_registrasi_mahasiswa, m.nama_mahasiswa, m.id_mahasiswa, m.nama_jenis_daftar, m.id_periode_masuk,
                   COALESCE(m.nama_perguruan_tinggi, m.nama_perguruan_tinggi_asal) AS ptasal,
                   COALESCE(m.nama_program_studi, m.nama_program_studi_asal) AS prodiasal,
                   p.kode_program_studi AS kodeprodi, m.id_perguruan_tinggi AS kodept, m.biaya_masuk,
                   b.nisn, b.jenis_kelamin, b.tempat_lahir, b.tanggal_lahir, b.id_agama, b.nama_agama, b.nik,
                   b.npwp, b.id_negara, b.kewarganegaraan, b.jalan, b.dusun, b.rt, b.rw, b.kelurahan, b.kode_pos, b.id_wilayah,
                   b.nama_wilayah, b.id_jenis_tinggal, b.nama_jenis_tinggal, b.id_alat_transportasi, b.nama_alat_transportasi,
                   b.telepon, b.handphone, b.email, b.penerima_kps, b.nomor_kps, b.nik_ayah, b.nama_ayah, b.tanggal_lahir_ayah,
                   b.id_pendidikan_ayah, b.nama_pendidikan_ayah, b.id_pekerjaan_ayah, b.nama_pekerjaan_ayah, b.id_penghasilan_ayah, b.nama_penghasilan_ayah,
                   b.nik_ibu, b.nama_ibu_kandung, b.tanggal_lahir_ibu, b.id_pendidikan_ibu, b.nama_pendidikan_ibu, b.id_pekerjaan_ibu, b.nama_pekerjaan_ibu, b.id_penghasilan_ibu, b.nama_penghasilan_ibu,
                   b.nama_wali, b.tanggal_lahir_wali, b.id_pendidikan_wali
            FROM integrator.map_mahasiswalengkap m
            LEFT JOIN integrator.map_biodatamahasiswa b ON b.id_mahasiswa = m.id_mahasiswa
            LEFT JOIN integrator.map_prodi p ON p.id_prodi = m.id_prodi
            WHERE nama_jenis_daftar = 'Peserta didik baru' AND m.id_jenis_keluar IS NULL
        `;
    
        if (a_filter['angkatan']) {
            sql += ` AND m.id_periode_masuk = '${a_filter['angkatan']}'`;
        }
        if (a_filter['kodeunit']) {
            sql += ` AND p.kode_program_studi = '${a_filter['kodeunit']}'`;
        }
        if (Object.keys(a_filter).length === 0) {
            sql += ` AND SUBSTRING(m.id_periode_masuk, 1, 4) = '${tahun}'`;
        }
    
        sql += " ORDER BY id_periode_masuk DESC";
    
        this.set_sql(sql);
        return await this.getList();
    }
    
    
    async getListMahasiswaCuti(a_filter = {}) {
        const sessionData = { periode: '20231' }; // Contoh data sesi, sesuaikan dengan cara Anda mengambil data sesi di Node.js
        const tahun = sessionData.periode.substring(0, 4);
    
        let sql = `
            SELECT m.nama_mahasiswa, m.nim, nama_status_mahasiswa, nama_program_studi, ipk, 
                   SUBSTRING(id_periode, 1, 4) AS angkatan
            FROM integrator.map_mahasiswa m
            JOIN integrator.map_biodata_mahasiswa b ON b.id_mahasiswa = m.id_mahasiswa
            WHERE (1=1) 
        `;
    
        if (Object.keys(a_filter).length === 0) {
            sql += ` AND id_periode = '${sessionData.periode}'`;
        }
    
        // Filter (gunakan this.setWhere untuk menambahkan where clause dan parameter)
        for (const filter of Object.values(a_filter)) {
            if (filter.value) {
                const valueFilter = filter.value.join("','");
                sql += ` AND m.${filter.nama_mahasiswa} IN ('${valueFilter}')`;
            }
        }
    
        sql += " ORDER BY nim DESC";
    
        this.set_sql(sql);
        const a_data = await this.getList();
        return a_data;
    }

    async getListMahasiswaAktif(a_filter = {}) {
        const tahun = new Date().getFullYear();
        const tahunAwal = tahun - 8;
    
        let sql = `
            SELECT nama_mahasiswa, nim, sex, kodeagama, kodeunit, statusmhs, 
                   SUBSTRING(periodemasuk, 1, 4) AS angkatan, ipk
            FROM ${this._schema}.${this._table}
            WHERE (1=1) AND SUBSTRING(periodemasuk, 1, 4) > $1
            AND nama != ''
        `;
    
        this.params = [tahunAwal]; 
    
        // Filter (gunakan this.setWhere jika ada filter yang sesuai)
        for (const filter of Object.values(a_filter)) {
            if (filter.value) {
                const valueFilter = filter.value.join("','");
                sql += ` AND ${filter.nama_mahasiswa} IN ('${valueFilter}')`;
            }
        }
    
        sql += " ORDER BY nim DESC";
    
        this.set_sql(sql);
        const a_data = await this.getList();
        return a_data;
    }
    
    async getDetailMahasiswaKeluar(nim) {
        const sql = `
            SELECT m.nama, m.nim, m.kodeunit, SUBSTRING(periodemasuk, 1, 4) AS angkatan, namastatus, m.statusmhs, m.ipk,
                   y.*, tglskyudisium AS tanggal_keluar, idyudisium AS periode
            FROM ${this._schema}.${this._table} m
            LEFT JOIN integrator.map_statusmhs s ON s.statusmhs = m.statusmhs
            LEFT JOIN integrator.map_yudisium y ON y.nim = m.nim
            WHERE (1=1) AND m.nim = $1
        `;
        this.params = [nim]; // Reset dan tambahkan parameter nim
        this.set_sql(sql);
        const data = await this.getList(); 
        return data[0];
    }
    
    async getListPerwalian(a_filter = {}) {
        let sessionData = { periode: '20241' }; // Contoh data sesi, sesuaikan dengan cara Anda mengambil data sesi di Node.js
        const sql = `
            SELECT nim, nama_mahasiswa, angkatan, nama_program_studi AS prodi, nama_status_mahasiswa AS statusmhs,
                   ips, ipk, sks_semester, sks_total, biaya_kuliah_smt
            FROM integrator.map_perwalian p
            WHERE (1=1) 
        `;
    
        // Filter
        if (a_filter['angkatan']) {
            sql += ` AND p.id_semester = '${a_filter['angkatan']}'`;
        }
        if (a_filter['kodeunit']) {
            sql += ` AND p.id_prodi = '${a_filter['kodeunit']}'`;
        }
        if (Object.keys(a_filter).length === 0) {
            sql += ` AND p.id_semester = '${sessionData.periode}' AND id_prodi = '1'`;
        }
    
        this.set_sql(sql);
        return await this.getList();
    }

    
}

module.exports = MahasiswaSim;