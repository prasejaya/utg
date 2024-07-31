const QuerySiakad = require('./querysiakad');
const MahasiswaMap = require('../models/mahasiswaMap');

class MahasiswaSim extends QuerySiakad {
    async getListMahasiswa({ angkatan, semester }) {
        const periodemasuk = `${angkatan}${semester}`;
        
        try {
            await this.connect();
    
            const sql = `
                SELECT 
                    nama, m.nim, sex, kodeagama, m.kodeunit, m.statusmhs,
                    substring(periodemasuk,1,4) as angkatan, ipk, namastatus, 
                    m.alamat, m.nisn, m.sex, m.tmplahir, m.tgllahir, m.kodeagama, m.nik,
                    m.kodenegara, m.alamat, m.dusun, m.rt, m.rw, m.kelurahan, m.kodewilayah,
                    m.kodepos, m.telp, m.hp, m.email, m.namaayah, m.kodepekerjaanayah, 
                    m.kodepekerjaanibu, kodependidikanayah, kodependidikanibu, kodependapatanayah, 
                    kodependapatanibu, m.skslulus, m.nik, p.epskodeprodi, p.nama_program_studi,
                    kelurahan, kecamatan, dusun, tf.deskripsi, m1.status_sync,  
                    CASE WHEN COALESCE(NULLIF(m.isbeasiswa::NUMERIC, 0), 0) = 0 THEN 'Mandiri' ELSE 'Beasiswa Penuh' END AS beasiswa,
                    SUM(nominaltagihan) AS biaya_masuk
                FROM akademik.ms_mahasiswa m 
                LEFT JOIN akademik.lv_statusmhs s ON s.statusmhs = m.statusmhs
                LEFT JOIN akademik.ak_prodi p ON p.kodeunit = m.kodeunit 
                LEFT JOIN integrator.map_mahasiswalengkap m1 ON m1.nim = m.nim
                LEFT JOIN (
                    SELECT nim, periode 
                    FROM akademik.ak_perwalian 
                    ORDER BY periode DESC 
                    LIMIT 1
                ) per ON per.nim = m.nim
                LEFT JOIN h2h.ke_tagihan h ON h.nim = m.nim AND h.periode = per.periode
                LEFT JOIN (
                    SELECT nim, periode_transfer, deskripsi 
                    FROM integrator.log_transfer
                    ORDER BY id_log_transfer DESC 
                    LIMIT 1
                ) tf ON tf.nim = m.nim
                WHERE periodemasuk = $1
                AND m.statusmhs IN ('A','N','X')
                GROUP BY 
                    nama, m.nim, sex, kodeagama, m.kodeunit, m.statusmhs, periodemasuk, ipk, 
                    namastatus, m.alamat, m.nisn, m.sex, m.tmplahir, m.tgllahir, m.kodeagama, 
                    m.nik, m.kodenegara, m.alamat, m.dusun, m.rt, m.rw, m.kelurahan, m.kodewilayah,
                    m.kodepos, m.telp, m.hp, m.email, m.namaayah, m.kodepekerjaanayah, m.kodepekerjaanibu, 
                    kodependidikanayah, kodependidikanibu, kodependapatanayah, kodependapatanibu,
                    p.epskodeprodi, p.nama_program_studi, kelurahan, kecamatan, dusun, tf.deskripsi,
                    m1.status_sync, isbeasiswa
            `;
    
            this.set_sql(sql);
            const result = await this.execute([periodemasuk], 'fetchAll');
            return result;
        } catch (error) {
            console.error('Error fetching mahasiswa data:', error);
            return []; // Return empty array instead of throwing error
        } finally {
            if (this.pool) {
                await this.pool.end();
            }
        }
    }
}

const mahasiswaController = {
    async showMahasiswa(req, res) {
        const modelSim = new MahasiswaSim();
        //const modelMap = new MahasiswaMap();
        const angkatan = req.query.angkatan || '2023';
        const semester = req.query.semester || '1';

        try {
            const mahasiswa = await modelSim.getListMahasiswa({ angkatan, semester });
            //const logTransaksi = await modelMap.getList();

            /* Mengubah logTransaksi menjadi array of object
            const logTransaksiFormatted = logTransaksi.map(log => ({
                username: log.username,
                tipe: log.tipe,
                data_id: log.data_id,
                key: log.key,
                value: log.value,
                waktu: log.waktu
            }));*/
            
            res.render('mahasiswa', { mahasiswa, angkatan, semester, logTransaksi: logTransaksiFormatted });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).render('error', { error: 'Terjadi kesalahan saat mengambil data.' }); 
        }
    }
};

module.exports = { MahasiswaSim, mahasiswaController };