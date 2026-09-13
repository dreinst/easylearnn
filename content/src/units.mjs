// Unit kompetensi AQF dari SIT50322 Diploma of Event Management (Release 2, training.gov.au).
// Diverifikasi dari PDF resmi tiap unit pada 13 Sep 2026.
const UNIT_PAGE = (code) => `https://training.gov.au/training/details/${code}`;
const UNIT_PDF = (code) => `https://training.gov.au/assets/${code.slice(0, 3)}/${code}_R1.pdf`;

const RAW = [
  ["SITEEVT020", "Source and use information on the events industry", true, "Mengakses dan menafsirkan informasi terkini tentang industri event (struktur industri, teknologi, hukum, dan etika) untuk meningkatkan kualitas koordinasi event."],
  ["SITEEVT026", "Manage event production components", true, "Menganalisis kebutuhan produksi event lalu mengatur dan memantau berbagai layanan dan produk produksi dari penyedia spesialis."],
  ["SITEEVT028", "Manage on-site event operations", true, "Mengelola operasional di lokasi event, dari finalisasi rencana operasional, pengawasan set-up, pelaksanaan, dan pembongkaran, sampai evaluasi keberhasilan operasional event."],
  ["SITXCCS015", "Enhance customer service experiences", true, "Memberikan layanan pelanggan yang profesional dan personal, termasuk memahami preferensi pelanggan, membangun hubungan, menangani situasi sulit, dan menyelesaikan keluhan."],
  ["SITXFIN009", "Manage finances within a budget", true, "Mengelola keuangan dalam anggaran yang sudah ditetapkan: menafsirkan kebutuhan anggaran, mengalokasikan sumber daya, memantau pendapatan dan pengeluaran aktual, serta melaporkan penyimpangan."],
  ["SITXHRM009", "Lead and manage people", true, "Memimpin dan mengelola orang secara individu maupun tim, memberi teladan, dan mengelola kinerja lewat kepemimpinan yang efektif."],
  ["SITXHRM010", "Recruit, select and induct staff", true, "Mengoordinasikan rekrutmen, seleksi, dan induksi staf baru sesuai kebijakan SDM yang berlaku, termasuk menyusun kriteria seleksi dan program induksi."],
  ["SITXMGT005", "Establish and conduct business relationships", true, "Membangun dan mengelola hubungan bisnis yang positif, termasuk negosiasi formal dan membuat perjanjian bisnis-ke-bisnis yang bernilai komersial."],
  ["SITXMGT006", "Manage projects", true, "Menyusun rencana proyek, melaksanakan kegiatan proyek, memantau kemajuan agar tujuan tercapai, dan mengevaluasi seluruh aspek proyek."],
  ["SITXMPR011", "Plan and implement sales activities", true, "Merencanakan dan melaksanakan kegiatan penjualan: menganalisis kebutuhan pasar dan pelanggan, menargetkan pelanggan lama dan baru, melakukan kunjungan penjualan, serta menyusun laporan penjualan."],
  ["SITXMPR012", "Coordinate marketing activities", true, "Merencanakan dan mengoordinasikan berbagai kegiatan pemasaran dan promosi di tingkat operasional dalam kerangka strategi pemasaran yang sudah ada."],
  ["SITXMPR016", "Prepare and present proposals", true, "Menyiapkan dan mempresentasikan tender, proposal, atau penawaran dengan menganalisis kebutuhan klien dan kemampuan organisasi untuk memenuhinya."],
  ["SITXWHS006", "Identify hazards, assess and control safety risks", true, "Mengidentifikasi bahaya, menilai risiko keselamatan kerja, mengambil langkah untuk menghilangkan atau meminimalkan risiko, dan mendokumentasikan seluruh prosesnya."],
  ["SITEEVT021", "Administer event registrations", false, "Memproses pendaftaran peserta event sampai selesai, menyiapkan materi registrasi, serta menyiapkan dan menjalankan registrasi di lokasi event."],
  ["SITEEVT025", "Select event venues and sites", false, "Mencari dan memilih venue atau lokasi event: menganalisis rencana event untuk menentukan kebutuhan, menyusun spesifikasi seleksi, lalu menilai, memilih, dan mengontrak venue."],
  ["SITEEVT027", "Organise event infrastructure", false, "Mengatur infrastruktur dan fasilitas event ketika venue atau lokasi belum menyediakannya."],
  ["SITEEVT034", "Develop crowd management plans", false, "Menyusun rencana dan prosedur untuk mengatur masuk, penempatan, dan pembubaran kerumunan demi keselamatan dan keamanan personel serta peserta."],
  ["SITXGLC002", "Identify and manage legal risks and comply with law", false, "Mengidentifikasi dan mengelola risiko hukum serta mematuhi peraturan yang berlaku pada operasional bisnis, termasuk mengakses dan menafsirkan informasi regulasi."],
  ["SITXWHS007", "Implement and monitor work health and safety practices", false, "Menerapkan dan memantau praktik kesehatan, keselamatan, dan keamanan kerja yang ditetapkan manajemen, termasuk konsultasi, penilaian risiko, pelatihan WHS, dan pencatatan."],
  ["SITXFIN010", "Prepare and monitor budgets", false, "Menganalisis informasi keuangan dan bisnis untuk menyusun dan memantau anggaran, termasuk merancang dan menegosiasikan anggaran serta mengidentifikasi penyimpangan."],
  ["SITXHRM011", "Manage volunteers", false, "Mengelola tenaga sukarelawan agar tetap bertahan, termasuk menentukan kebutuhan sukarelawan serta mengoordinasikan rekrutmen dan pelatihannya."],
  ["SITXHRM012", "Monitor staff performance", false, "Memantau kinerja staf dalam kerangka sistem manajemen kinerja yang ada, termasuk penilaian kinerja terstruktur dan sesi konseling formal."],
  ["SITXCOM010", "Manage conflict", false, "Menyelesaikan keluhan dan perselisihan yang kompleks atau tereskalasi dengan pelanggan dan rekan kerja memakai teknik resolusi konflik dan komunikasi yang efektif."],
  ["SITXMPR015", "Obtain and manage sponsorship", false, "Mendapatkan dan mengelola sponsor untuk kegiatan bisnis, produk, layanan, atau event, termasuk menentukan kebutuhan sponsor, bernegosiasi dengan calon sponsor, dan mengelola perjanjian sponsor."],
  ["BSBCMM411", "Make presentations", false, "Menyiapkan, menyampaikan, dan meninjau presentasi untuk audiens sasaran dengan berbagai tujuan seperti pemasaran, pelatihan, dan promosi."],
  ["BSBWRT411", "Write complex documents", false, "Merencanakan, menyusun draf, dan memfinalkan dokumen kompleks yang memerlukan tinjauan dan analisis berbagai sumber informasi."],
  ["BSBSUS411", "Implement and monitor environmentally sustainable work practices", false, "Menganalisis dan menerapkan perbaikan keberlanjutan lingkungan pada praktik kerja serta memantau efektivitasnya."],
  ["BSBOPS502", "Manage business operational plans", false, "Menyusun dan memantau pelaksanaan rencana operasional untuk mendukung praktik kerja yang efisien serta produktivitas dan profitabilitas organisasi."],
  ["BSBESB401", "Research and develop business plans", false, "Meneliti dan menyusun rencana bisnis untuk mencapai tujuan dan sasaran bisnis, baik untuk usaha mandiri maupun usaha baru di dalam organisasi yang lebih besar."],
  ["BSBFIN401", "Report on financial activity", false, "Menyusun laporan keuangan sesuai ketentuan pelaporan resmi, termasuk mengumpulkan dan menganalisis data keuangan."],
];

export const UNITS = Object.fromEntries(
  RAW.map(([code, name, core, summary]) => [code, { unit_code: code, unit_name: name, is_core: core, url: UNIT_PAGE(code), pdf: UNIT_PDF(code), summary }]),
);

export function unit(code) {
  const u = UNITS[code];
  if (!u) throw new Error(`Unit tidak dikenal: ${code}`);
  return { unit_code: u.unit_code, unit_name: u.unit_name, is_core: u.is_core, url: u.url };
}

/** Sumber jenis aqf_unit: PDF resmi unit (bisa dibuka langsung). */
export function unitSource(code) {
  const u = UNITS[code];
  if (!u) throw new Error(`Unit tidak dikenal: ${code}`);
  return {
    title: `${u.unit_code} ${u.unit_name} (PDF resmi training.gov.au)`,
    description: u.summary,
    url: u.pdf,
    kind: "aqf_unit",
    publisher: "training.gov.au, Pemerintah Australia (SIT50322 Release 2)",
    year: "2022",
    accreditation: "badan pemerintah",
  };
}
