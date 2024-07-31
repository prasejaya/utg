const JenjangPendidikanSim = require('../models/jenjangPendidikanSim');
const Webservice = require('../models/webservice');

const mapJenjangPendidikanController = {
    async getListMap(req, res) {
        try {
            const model = new JenjangPendidikanSim(); // Inisialisasi model
            const webservice = new Webservice();      // Inisialisasi webservice

            // Data dari SIM
            const dataSim = await model.getKeyValue('namapendidikan'); // Ganti fungsi sesuai model Anda

            // Data dari Feeder (melalui webservice)
            const rawDataFeeder = await webservice.execute({ act: 'GetJenjangPendidikan' }); // Sesuaikan dengan fungsi webservice Anda
            const dataFeeder = webservice.getKeyValue('id_jenjang_didik', 'nama_jenjang_didik', rawDataFeeder.data); // Sesuaikan

            // Data untuk tampilan (sesuaikan dengan kebutuhan Anda)
            const pagetitle = 'Mapping Jenjang Pendidikan';
            const list = [
                { kolom: 'kodependidikan', judul: 'Jenjang Pendidikan SIM', tipe: 'pilihan', data: dataSim },
                { kolom: 'id_jenjang_didik', judul: 'Jenjang Pendidikan Feeder', tipe: 'pilihan', data: dataFeeder },
            ];
            const input = [
                { nama: 'kodependidikan', label: 'Jenjang Pendidikan', validasi: 'required', data: dataSim },
                { nama: 'id_jenjang_didik', label: 'Jenjang Pendidikan', validasi: 'required', data: dataFeeder },
            ];

            // Handle session flash message (jika ada)
            const message = req.session.message || null;
            delete req.session.message;

            res.render('list_jenjang_pendidikan', { 
                pagetitle,
                list, 
                input,
                listdata: [], // Data tabel kosong untuk saat ini
                message // Kirim pesan ke view
            });
        } catch (error) {
            console.error('Error:', error);
            res.render('error', { error: 'Terjadi kesalahan saat mengambil data.' }); // Halaman error (buat view error.ejs)
        }
    },

    // ... (Tambahkan fungsi lain untuk menangani aksi tambah, edit, hapus, dll.)
};

module.exports = mapJenjangPendidikanController;