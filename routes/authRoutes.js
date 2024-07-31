const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');   
const mapJenjangPendidikanController = require('../controller/mapJenjangPendidikanController'); // Sesuaikan path
const  mahasiswaController  = require('../controller/mahasiswaController');


router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin, (req, res) => {
    // Jika login berhasil, langsung redirect ke beranda
    res.redirect('/beranda');
});

// Rute untuk halaman beranda (GET)
router.get('/beranda', authController.getBeranda);
router.get('/mahasiswa', mahasiswaController.showMahasiswa);
//router.get('/mapjenjangp', mapJenjangPendidikanController.getListMap); 



module.exports = router;