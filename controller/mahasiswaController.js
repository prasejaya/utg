const MahasiswaSim = require('../models/mahasiswaSim');
const MahasiswaMap = require('../models/mahasiswaMap');

const mahasiswaController = {
    async showMahasiswa(req, res) {
        const modelSim = new MahasiswaSim();
        const modelMap = new MahasiswaMap();
        const angkatan = req.query.angkatan || '2023';
        const semester = req.query.semester || '1';

        try {
            const mahasiswa = await modelSim.getListMahasiswa({ angkatan, semester });
            const logTransaksi = await modelMap.getList();

            // Mengubah logTransaksi menjadi array of object
            const logTransaksiFormatted = logTransaksi.map(log => ({
                username: log.username,
                tipe: log.tipe,
                data_id: log.data_id,
                key: log.key,
                value: log.value,
                waktu: log.waktu
            }));
            
            res.render('mahasiswa', { mahasiswa, angkatan, semester, logTransaksi: logTransaksiFormatted });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).render('error', { error: 'Terjadi kesalahan saat mengambil data.' }); 
        }
    }
};

module.exports = mahasiswaController;