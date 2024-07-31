const QuerySiakad = require('./querysiakad');
class JenjangPendidikanSim extends QuerySiakad {
    constructor() {
        super();
        this.schema = 'akademik';
        this.table = 'lv_pendidikan';
        this.key = 'kodependidikan';
    }

    // Tambahkan fungsi-fungsi lain sesuai kebutuhan Anda di sini
}

module.exports = JenjangPendidikanSim;