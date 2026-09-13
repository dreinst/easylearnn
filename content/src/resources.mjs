// Sumber belajar gratis per topik. Setiap URL diverifikasi bisa dibuka (13 Sep 2026).
// Bentuk: { slug: [ { title, url, kind, description } ] }
export const RESOURCES = {
  fund: [
    { title: "EMBOK Model (Event Management Body of Knowledge)", url: "https://www.embok.org/index.php/embok-model", kind: "framework", description: "Penjelasan resmi kerangka EMBOK versi 3 (domain, fase, proses, nilai inti) sebagai peta pengetahuan dan keterampilan manajemen event." },
    { title: "Introduction to Tourism and Hospitality in BC, bab 6.1 Festivals and Events (BCcampus)", url: "https://opentextbc.ca/introtourism2e/chapter/festivals-and-events/", kind: "textbook", description: "Bab buku teks terbuka (CC BY) tentang definisi festival dan event, tipe event (mega, hallmark, special, festival, community) dan tugas pokok event planner." },
    { title: "Events Industry Council Industry Glossary", url: "https://insights.eventscouncil.org/Industry-glossary", kind: "guide", description: "Glosarium resmi EIC dengan sekitar 1.350 istilah industri event dan MICE, bisa ditelusuri tanpa login." },
  ],
  "pb-lead": [
    { title: "Leadership and followership (OpenLearn, The Open University)", url: "https://www.open.edu/openlearn/education-development/learning/leadership-and-followership/content-section-overview", kind: "course", description: "Kursus gratis 24 jam tentang gaya kepemimpinan, membangun tim, memotivasi staf dan mengelola perubahan, dengan badge digital gratis." },
    { title: "BUS208: Principles of Management (Saylor Academy)", url: "https://learn.saylor.org/course/bus208", kind: "course", description: "Kursus gratis tentang dasar manajemen: peran manajer, pengambilan keputusan, mengelola orang dan sumber daya, dengan sertifikat gratis." },
  ],
  "pb-speak": [
    { title: "Toastmasters International: Public Speaking Tips", url: "https://www.toastmasters.org/resources/public-speaking-tips", kind: "guide", description: "Panduan singkat Toastmasters untuk merencanakan, menulis dan membawakan pidato, termasuk mengatasi demam panggung dan memberi toast (cocok untuk MC)." },
    { title: "Talk the talk (OpenLearn, The Open University)", url: "https://www.open.edu/openlearn/education-development/talk-the-talk", kind: "course", description: "Kursus gratis 12 jam tentang presentasi lisan yang persuasif: pembukaan dan penutup, bahasa tubuh dan proyeksi suara, memakai contoh TED Talk." },
  ],
  "pb-english": [
    { title: "British Council LearnEnglish: Business English", url: "https://learnenglish.britishcouncil.org/business-english", kind: "course", description: "Materi gratis British Council untuk bahasa Inggris bisnis: Business magazine, Podcasts for professionals, dan seri English for emails, dengan latihan per level." },
    { title: "Effective communication in the workplace (OpenLearn, The Open University)", url: "https://www.open.edu/openlearn/money-business/effective-communication-the-workplace", kind: "course", description: "Kursus gratis 24 jam tentang komunikasi verbal, nonverbal dan tertulis di tempat kerja, mendengar aktif, dan komunikasi lintas budaya." },
  ],
  bizdev: [
    { title: "BUS633: Sales Management (Saylor Academy)", url: "https://learn.saylor.org/course/bus633", kind: "course", description: "Kursus gratis tentang seluruh proses penjualan: memahami kebutuhan pelanggan, consultative selling, follow-up, menjaga loyalitas, dan pemakaian CRM." },
    { title: "Inbound Sales Certification (HubSpot Academy)", url: "https://academy.hubspot.com/courses/inbound-sales", kind: "certification", description: "Sertifikasi gratis sekitar 3 jam (perlu akun gratis) tentang empat tahap penjualan inbound: identify, connect, explore, advise." },
    { title: "Understanding your customers (OpenLearn, The Open University)", url: "https://www.open.edu/openlearn/money-business/understanding-your-customers/content-section-0", kind: "course", description: "Kursus gratis 8 jam tentang perbedaan pemasaran konsumen dan B2B serta proses keputusan pembelian organisasi, berguna untuk klien korporat." },
  ],
  pm: [
    { title: "Project management: the start of the project journey (OpenLearn)", url: "https://www.open.edu/openlearn/money-business/leadership-management/project-management-the-start-the-project-journey/content-section-0", kind: "course", description: "Kursus gratis tentang apa itu proyek, studi kelayakan, siklus hidup proyek, dan peran project manager." },
    { title: "BUS402: Introduction to Project Management (Saylor Academy)", url: "https://learn.saylor.org/course/view.php?id=1147", kind: "course", description: "Kursus gratis yang mengikuti lima process group PMI (initiating sampai closing) dengan sertifikat gratis." },
    { title: "ESD.36 System Project Management (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/esd-36-system-project-management-fall-2012/", kind: "university", description: "Catatan kuliah MIT gratis tentang CPM, PERT, penjadwalan, pemantauan kemajuan dan Earned Value Management." },
  ],
  concept: [
    { title: "#EventCanvas (Event Design Collective)", url: "https://edco.global/eventcanvas/", kind: "framework", description: "Kanvas desain event (CC BY-NC-ND) yang bisa diunduh gratis, memandu 10 langkah merancang event dari stakeholder dan empathy map sampai prototipe." },
    { title: "Design thinking (OpenLearn, The Open University)", url: "https://www.open.edu/openlearn/science-maths-technology/design-innovation/design-thinking/", kind: "course", description: "Kursus gratis 10 jam untuk menstrukturkan kreativitas: prinsip desain, berpikir visual, dan cara menjelaskan keputusan desain." },
    { title: "Making creativity and innovation happen (OpenLearn)", url: "https://www.open.edu/openlearn/money-business/making-creativity-and-innovation-happen/content-section-0", kind: "course", description: "Kursus gratis 10 jam tentang kreativitas individu dan organisasi serta budaya yang mendukung ide baru." },
  ],
  proposal: [
    { title: "HSE Event safety: Getting started", url: "https://www.hse.gov.uk/event-safety/getting-started.htm", kind: "guide", description: "Panduan resmi HSE Inggris tentang langkah awal merencanakan event: struktur tanggung jawab, rencana keselamatan, memilih kontraktor, plus checklist perencanaan." },
    { title: "University of Exeter Event Toolkit: Planning an event", url: "https://www.exeter.ac.uk/departments/communication/communications/events/toolkit/planning-event/", kind: "university", description: "Toolkit universitas berisi tahapan perencanaan event dari tujuan, timeline sampai checklist yang bisa dipakai sebagai kerangka event plan." },
    { title: "Thurrock Council: Event Management Plan template", url: "https://www.thurrock.gov.uk/sites/default/files/assets/documents/event-management-plan-v01.pdf", kind: "guide", description: "Template EMP dari pemerintah daerah Inggris dengan catatan panduan tiap bagian, untuk event kecil sampai festival besar." },
  ],
  bizplan: [
    { title: "U.S. SBA: Write your business plan", url: "https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan", kind: "guide", description: "Panduan pemerintah AS tentang format business plan tradisional dan lean startup, sembilan bagian bakunya, plus contoh unduhan." },
    { title: "OpenStax Entrepreneurship, bab 11: Business Model and Plan", url: "https://openstax.org/books/entrepreneurship/pages/11-introduction", kind: "textbook", description: "Bab buku teks gratis tentang merancang model bisnis, analisis kelayakan, dan menyusun business plan yang berfokus pada pelanggan." },
    { title: "Starting your small business (OpenLearn)", url: "https://www.open.edu/openlearn/money-management/starting-your-small-business", kind: "course", description: "Kursus pengantar gratis tentang struktur usaha kecil, pemasaran, kewajiban legal dan finansial." },
  ],
  bud: [
    { title: "OpenStax Principles of Accounting Vol. 2, 7.1 Describe How and Why Managers Use Budgets", url: "https://openstax.org/books/principles-managerial-accounting/pages/7-1-describe-how-and-why-managers-use-budgets", kind: "textbook", description: "Awal bab budgeting buku teks gratis: anggaran operasional, anggaran kas, dan flexible budget untuk mengendalikan biaya." },
    { title: "Imperial College Union eActivities: Event Finances", url: "https://eactivities.union.ic.ac.uk/training/finance/events", kind: "university", description: "Materi pelatihan tentang anggaran event yang layak: estimasi peserta konservatif, break even, arus kas negatif sementara, dan persetujuan anggaran." },
    { title: "University of Exeter Event Toolkit: Budget and costing events", url: "https://www.exeter.ac.uk/departments/communication/communications/events/toolkit/budget-costing/", kind: "university", description: "Cara menyusun anggaran dan menghitung biaya event, termasuk template anggaran untuk beberapa jenis event." },
  ],
  team: [
    { title: "Working in groups and teams (OpenLearn)", url: "https://www.open.edu/openlearn/money-business/leadership-management/working-groups-and-teams/content-section-0", kind: "course", description: "Kursus gratis 8 jam tentang peran dalam tim, tahap perkembangan tim, mengelola konflik, dan mengevaluasi kinerja tim." },
    { title: "Working in the voluntary sector (OpenLearn)", url: "https://www.open.edu/openlearn/society-politics-law/sociology/working-the-voluntary-sector/content-section-overview", kind: "course", description: "Kursus gratis yang di minggu ke-2 khusus membahas merekrut, melatih, memotivasi, dan mempertahankan relawan." },
    { title: "HSE Event safety: roles at events", url: "https://www.hse.gov.uk/event-safety/roles.htm", kind: "guide", description: "Tanggung jawab tiap peran di event: organiser, kontraktor, pemilik venue, supervisor, pekerja, dan relawan. Berguna untuk briefing dan pembagian peran kru." },
  ],
  mkt: [
    { title: "Marketing communications in the digital age (OpenLearn)", url: "https://www.open.edu/openlearn/money-business/marketing/marketing-communications-the-digital-age/content-section-0", kind: "course", description: "Kursus gratis 12 jam tentang model komunikasi pemasaran, desain pesan, dan alat digital termasuk media sosial, email, dan online PR." },
    { title: "OpenStax Principles of Marketing", url: "https://openstax.org/books/principles-marketing/pages/1-1-marketing-and-the-marketing-process", kind: "textbook", description: "Buku teks pemasaran gratis yang bisa dibaca per bab, termasuk bab promosi dan bab tentang direct, online, social media, dan mobile marketing." },
    { title: "Sport New Zealand: Sport Sponsorship, Securing and Retaining Commercial Partners", url: "https://sportnz.org.nz/resources/commercial-sponsorship-and-partnership/", kind: "guide", description: "PDF gratis berisi enam langkah mengamankan dan mempertahankan sponsor, dari memahami brand sendiri sampai mengelola kemitraan (terbit 2012, kerangkanya masih dipakai)." },
  ],
  tech: [
    { title: "An Introduction to Technical Theatre (Tal Sanders, Open Textbook Library)", url: "https://open.umn.edu/opentextbooks/textbooks/an-introduction-to-technical-theatre", kind: "textbook", description: "Buku teks terbuka 15 modul tentang ruang panggung, peralatan, scenery, lighting, sound, stage management, dan etika kru, dengan penekanan keselamatan." },
    { title: "Technical Theatre Practicum (Boltz), 1.7 Stage Lighting (LibreTexts)", url: "https://human.libretexts.org/Bookshelves/Theater_Film_and_Storytelling/Technical_Theatre_Practicum_(Boltz)/01:_Chapters/1.07:_Stage_Lighting", kind: "textbook", description: "Bab singkat tentang dasar tata cahaya panggung; bab 1.9 di buku yang sama membahas dasar tata suara." },
    { title: "HSE Event safety: Temporary demountable structures", url: "https://www.hse.gov.uk/event-safety/temporary-demountable-structures.htm", kind: "guide", description: "Panduan keselamatan pemasangan dan pembongkaran struktur sementara (panggung, tower speaker, lighting)." },
  ],
  prodplan: [
    { title: "HSE Event safety: Managing an event", url: "https://www.hse.gov.uk/event-safety/managing-an-event.htm", kind: "guide", description: "Mengelola keselamatan selama build-up, load-in, breakdown, dan load-out: koordinasi kontraktor, briefing kru, pemantauan, dan debrief." },
    { title: "HSE Event safety: Transport", url: "https://www.hse.gov.uk/event-safety/transport.htm", kind: "guide", description: "Pengelolaan lalu lintas kendaraan dan pejalan kaki di lokasi event, termasuk pergerakan kendaraan produksi saat load in dan load out." },
    { title: "City of Seattle Special Events: Run of Show / Production Schedule Instructions", url: "https://www.seattle.gov/documents/departments/specialevents/addendums/add_a_runofshowinstructions.pdf", kind: "guide", description: "Instruksi resmi pemerintah kota tentang isi production schedule dan run of show yang wajib dilampirkan pada izin event." },
  ],
  venue: [
    { title: "HSE Event safety: Venue and site design", url: "https://www.hse.gov.uk/event-safety/venue-site-design.htm", kind: "guide", description: "Menilai kapasitas venue, akses kendaraan dan pejalan kaki, serta menyusun site plan (struktur, fasilitas, pagar, pintu masuk dan keluar)." },
    { title: "University of Exeter Event Toolkit: Booking facilities", url: "https://www.exeter.ac.uk/departments/communication/communications/events/toolkit/booking-facilities/", kind: "university", description: "Contoh alur memesan ruang dan peralatan audiovisual untuk event." },
    { title: "City of Sydney: Venue Hire Agreement (community venues)", url: "https://www.cityofsydney.nsw.gov.au/-/media/corporate/files/places-and-spaces/community-centres/conditions-of-hire/booking-confirmation-and-special-conditions-venues-unstaffed.pdf?download=true", kind: "guide", description: "Contoh nyata kontrak sewa venue dari pemerintah kota: syarat pemesanan, deposit, kewajiban penyewa, dan kondisi khusus." },
  ],
  reg: [
    { title: "STAR (Society of Ticket Agents and Retailers) Code of Practice", url: "https://www.star.org.uk/wp-content/uploads/STAR-Code-Of-Practice.pdf", kind: "standard", description: "Kode praktik industri tiket Inggris: transparansi harga, refund bila event batal, syarat tiket, penanganan komplain." },
    { title: "NSW Government: Toolkit for Accessible and Inclusive Events", url: "https://www.nsw.gov.au/sites/default/files/2023-07/Toolkit-for-Accessible-and-Inclusive-Events.pdf", kind: "guide", description: "Checklist dan contoh formulir registrasi aksesibilitas agar pendaftaran dan check-in inklusif." },
    { title: "University of Exeter Event Toolkit: Eventbrite, event marketing and publicity", url: "https://www.exeter.ac.uk/departments/communication/communications/events/toolkit/eventbriteeventmarketingandpublicity/", kind: "university", description: "Memakai Eventbrite untuk registrasi peserta dan menggabungkannya dengan promosi event." },
  ],
  risk: [
    { title: "ISO 31000:2018 Risk management, Guidelines (halaman resmi ISO)", url: "https://www.iso.org/standard/65694.html", kind: "standard", description: "Ringkasan resmi ISO (gratis, ada 'Read sample') tentang prinsip, kerangka, dan proses manajemen risiko; teks standar lengkap berbayar." },
    { title: "HSE: Managing risks and risk assessment at work", url: "https://www.hse.gov.uk/simple-health-safety/risk/index.htm", kind: "guide", description: "Langkah demi langkah menyusun risk assessment (identifikasi bahaya, nilai risiko, kendali) lengkap dengan template dan contoh." },
    { title: "HSE Event safety: Planning for incidents and emergencies", url: "https://www.hse.gov.uk/event-safety/incidents-and-emergencies.htm", kind: "guide", description: "Menyusun emergency plan event: evakuasi, show stop, koordinasi dengan polisi dan ambulans, uji table-top, dan rencana kontingensi." },
  ],
  bizdoc: [
    { title: "OpenStax Business Law I Essentials, bab 7: Contract Law", url: "https://openstax.org/books/business-law-i-essentials/pages/7-introduction", kind: "textbook", description: "Unsur kontrak yang sah, jenis kontrak, pelanggaran dan pemulihannya, dasar untuk memahami kontrak klien dan vendor." },
    { title: "CISA: Writing Guide for a Memorandum of Understanding (MOU)", url: "https://www.cisa.gov/sites/default/files/publications/Writing%20Guide%20for%20a%20Memorandum%20of%20Understanding%20(MOU).pdf", kind: "guide", description: "Panduan menulis MoU bagian per bagian (tujuan, ruang lingkup, definisi, kebijakan, prosedur, pengawasan) yang bisa diadaptasi untuk kerja sama vendor atau venue." },
    { title: "US EPA: Guidance for Preparing Standard Operating Procedures (SOPs)", url: "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf", kind: "guide", description: "Panduan menyusun SOP teknis maupun administratif: struktur dokumen, tingkat detail, pengendalian versi, dengan contoh." },
  ],
  prod: [
    { title: "CCSU Theatre: Stage Management and Assistant Stage Management Handbook (2023)", url: "https://www.ccsu.edu/sites/default/files/2024-06/SM%20and%20ASM%20Handbook.pdf", kind: "university", description: "Buku pegangan yang merunut kerja stage manager dari pra-produksi, rehearsal, calling cues, show run, sampai strike dan laporan pasca-show." },
    { title: "Technical Theatre Practicum (Boltz), 1.11 Production Reports (LibreTexts)", url: "https://human.libretexts.org/Bookshelves/Theater_Film_and_Storytelling/Technical_Theatre_Practicum_(Boltz)/01:_Chapters/1.11:_Production_Reports", kind: "textbook", description: "Laporan produksi (rehearsal dan performance report) sebagai bagian dari dokumen produksi." },
    { title: "Utah Shakespeare Festival: Stage Management, Lesson 2 (prompt book)", url: "https://www.bard.org/lesson-plans/stage-managementlesson-2/", kind: "guide", description: "Pelajaran gratis dengan video stage manager profesional tentang isi prompt book (kontak, laporan, props tracking, calling script)." },
  ],
  show: [
    { title: "Technical Theatre Practicum (Boltz), 1.12 Cueing Scripts (LibreTexts)", url: "https://human.libretexts.org/Bookshelves/Theater_Film_and_Storytelling/Technical_Theatre_Practicum_(Boltz)/01:_Chapters/1.12:_Cueing_Scripts", kind: "textbook", description: "Cara memanggil cue: warning, standby, go, penomoran cue lampu dan suara, paper tech, dan menandai naskah." },
    { title: "CCSU Theatre: Stage Management Handbook (bagian Calling Cues dan Show Run)", url: "https://www.ccsu.edu/sites/default/files/2024-06/SM%20and%20ASM%20Handbook.pdf", kind: "university", description: "Bagian Calling Cues, Pre-Performance Routine, dan Show Run menjelaskan prosedur show calling dan penanganan insiden saat pertunjukan." },
  ],
  crowd: [
    { title: "HSE Event safety: Crowd management", url: "https://www.hse.gov.uk/event-safety/crowd-management.htm", kind: "guide", description: "Struktur organisasi, penilaian risiko kerumunan, kendali fisik dan prosedural, pemantauan aktif, dan keselamatan area panggung." },
    { title: "UK Cabinet Office: Understanding Crowd Behaviours, Guidance and Lessons Identified", url: "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/62638/guidancelessons1_0.pdf", kind: "guide", description: "Panduan praktis perilaku kerumunan, simulasi, dan evakuasi darurat dari pemerintah Inggris." },
    { title: "Event Safety Alliance: The Event Safety Guide (PDF gratis)", url: "https://commerce.mt.gov/_shared/brand/Tourism-Grants/Docs/The_Event_Safety_Guide.pdf", kind: "guide", description: "Panduan 39 bab: emergency planning, crowd management, cuaca, komunikasi, rigging, staging. Salinan yang di-host pemerintah negara bagian Montana; halaman resmi ESA ada di eventsafetyalliance.org/standards-guidance-2." },
  ],
  eval: [
    { title: "eventIMPACTS (UK Sport, EventScotland, Welsh Government, Tourism NI)", url: "https://www.eventimpacts.com/", kind: "guide", description: "Toolkit evaluasi event: cara mengukur attendance, dampak ekonomi (ada kalkulator), sosial, lingkungan, dan media, plus contoh survei." },
    { title: "ISO 20121:2024 Event sustainability management systems (halaman resmi ISO)", url: "https://www.iso.org/standard/86389.html", kind: "standard", description: "Ringkasan resmi ISO edisi 2024 tentang sistem manajemen keberlanjutan event; teks standar berbayar." },
    { title: "Events Industry Council: Sustainable Event Standards", url: "https://insights.eventscouncil.org/Sustainability/Sustainability-Events-Standards", kind: "standard", description: "Ringkasan delapan standar EIC dengan kriteria dan level Bronze sampai Platinum yang bisa dijadikan KPI laporan pasca-event." },
  ],
  legal: [
    { title: "GOV.UK: The can-do guide to organising and running voluntary and community events", url: "https://www.gov.uk/government/publications/can-do-guide-for-organisers-of-voluntary-events/the-can-do-guide-to-organising-and-running-voluntary-and-community-events", kind: "guide", description: "Panduan ringkas tentang izin dan lisensi, keselamatan, keamanan pangan, asuransi public liability, dan penutupan jalan." },
    { title: "PRS for Music: Live music and events licence", url: "https://www.prsformusic.com/licences/live-performances", kind: "guide", description: "Penjelasan lembaga royalti Inggris tentang lisensi musik untuk festival, konser, dan event komunitas." },
    { title: "SELMI (LMK di bawah LMKN): Public Performance License", url: "https://selmi.or.id/en/music-licensing/public-performance-license/", kind: "guide", description: "Penjelasan lembaga manajemen kolektif Indonesia tentang lisensi pertunjukan publik musik untuk konser, konferensi, pameran, dan bazar." },
  ],
};
