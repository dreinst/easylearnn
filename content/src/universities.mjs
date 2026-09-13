// Modul kampus luar negeri sebagai acuan pembanding. Judul modul persis seperti di halaman resmi (diverifikasi 13 Sep 2026).
// [nama, program, url, katalog/entri yang dirujuk saat verifikasi September 2026]
const P = {
  napier_ba: ["Edinburgh Napier University", "BA (Hons) International Festival & Event Management", "https://www.napier.ac.uk/courses/ba-hons-international-festival--event-management-undergraduate-fulltime", "halaman program 2026, modul indikatif"],
  napier_msc: ["Edinburgh Napier University", "MSc International Festival & Event Management", "https://www.napier.ac.uk/courses/msc-international-festival-,-a-,-event-management-postgraduate-fulltime", "halaman program 2026"],
  ehl: ["EHL Hospitality Business School (Swiss)", "BSc International Hospitality Management", "https://www.ehl.edu/en/study/bachelor-degree-in-hospitality", "Course Catalogue 2025/2026"],
  lesroches_msc: ["Les Roches (Swiss)", "MSc International Hospitality Management", "https://lesroches.edu/programs/masters-degrees/master-of-science-in-hospitality-management/", "halaman program 2026"],
  psu: ["Penn State University (AS)", "Hospitality Management (HM) dan RPTM, Meeting and Event Management Certificate", "https://bulletins.psu.edu/university-course-descriptions/undergraduate/hm/", "University Bulletin 2026"],
  ucf: ["UCF Rosen College (AS)", "BS Event Management", "https://www.ucf.edu/degree/event-management-bs/", "halaman program 2026"],
  dmu: ["De Montfort University (Inggris)", "BA (Hons) Arts and Festivals Management", "https://www.dmu.ac.uk/study/courses/undergraduate-courses/arts-and-festivals-management-ba-degree/arts-and-festivals-management-ba-degree.aspx", "kurikulum terpublikasi, program ditutup untuk entri 2026"],
  ulster: ["Ulster University (Irlandia Utara)", "BSc (Hons) Event Management", "https://www.ulster.ac.uk/courses/202627/event-management-41258", "entri 2026/27"],
  surrey: ["University of Surrey (Inggris)", "BSc (Hons) International Event Management", "https://www.surrey.ac.uk/undergraduate/international-event-management", "entri 2027"],
  tio: ["Tio Business School (Belanda)", "Bachelor International Tourism Management, tema Event Management", "https://www.tio.nl/en/international_tourism_management/study-programme/", "halaman program 2026"],
};

export function uni(key, module) {
  const p = P[key];
  if (!p) throw new Error(`Kampus tidak dikenal: ${key}`);
  return { institution: p[0], programme: p[1], module, url: p[2], catalogue: p[3] };
}

/** Sumber jenis university: halaman program resmi. */
export function uniSource(key, description) {
  const p = P[key];
  return { title: `${p[0]}: ${p[1]}`, description, url: p[2], kind: "university", publisher: p[0], year: p[3], accreditation: "universitas terakreditasi" };
}
