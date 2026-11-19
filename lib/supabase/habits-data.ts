export type HabitDetailItem = {
  slug: string
  num: string
  tag: string
  title: string
  shortDesc: string
  summary: string
  keyMetrics: {
    label: string
    value: string
  }[]
  articleParagraphs: {
    heading: string
    body: string
  }[]
  whatToDo: string[]
  howToDo: string[]
  tips: string[]
  accentGradient: string
  badgeBg: string
}

export const HABIT_GUIDES_DEFAULT: HabitDetailItem[] = [
  {
    slug: 'bangun-pagi',
    num: '01',
    tag: 'Disiplin Waktu',
    title: 'Bangun Pagi',
    shortDesc: 'Bangun tepat waktu sebelum pukul 05.30 untuk memulai hari dengan disiplin.',
    summary:
      'Kebiasaan bangun pagi sebelum pukul 05.30 WIB merupakan gerbang utama dalam membangun kedisiplinan diri, kejernihan berpikir, serta kesiapan fisik dan mental pelajar SMAN 5 Semarang sebelum mengikuti pembelajaran di sekolah.',
    keyMetrics: [
      { label: 'Target Waktu Bangun', value: '04.30 – 05.15 WIB' },
      { label: 'Durasi Persiapan Pagi', value: '60 – 90 Menit' },
      { label: 'Fokus Utama', value: 'Disiplin & Manajemen Waktu' },
    ],
    articleParagraphs: [
      {
        heading: '1. Landasan Ilmiah dan Biologis Bangun di Awal Waktu',
        body: 'Tubuh manusia bekerja mengikuti jam biologis alami yang disebut ritme sirkadian. Ketika seorang pelajar membiasakan diri bangun pagi sebelum matahari terbit dan segera mendapatkan paparan cahaya alami pagi hari, otak menghentikan produksi hormon melatonin (pemicu kantuk) dan meningkatkan hormon kortisol sehat serta serotonin. Kombinasi hormon ini membuat detak jantung stabil, pikiran terasa jernih, suasana hati lebih tenang, dan daya serap memori otak berada pada titik optimal saat menerima pelajaran jam pertama di kelas.',
      },
      {
        heading: '2. Dampak Nyata bagi Kesiapan Belajar di Sekolah',
        body: 'Sebagian besar keterlambatan siswa, kelupaan membawa tugas, hingga kebiasaan melewatkan sarapan berawal dari bangun tidur yang terlalu mepet dengan jam masuk sekolah. Dengan memiliki waktu luang sekitar satu jam lebih awal di pagi hari, kamu memiliki kendali penuh atas waktumu sendiri. Kamu dapat beribadah tanpa tergesa-gesa, menyiapkan buku pelajaran dengan teliti, menikmati sarapan bergizi, serta berangkat ke SMAN 5 Semarang dalam kondisi tenang dan percaya diri.',
      },
      {
        heading: '3. Membangun Mentalitas Disiplin Jangka Panjang',
        body: 'Keputusan untuk segera bangkit dari tempat tidur saat alarm berbunyi adalah kemenangan pertama atas rasa malas di hari itu. Dalam psikologi pembentukan kebiasaan, disiplin kecil yang berhasil dimenangkan pada pukul 05.00 pagi akan menciptakan efek berantai (domino effect) terhadap kedisiplinanmu sepanjang hari—mulai dari ketepatan mengumpulkan tugas, fokus saat berdiskusi, hingga kemampuan mengatur jadwal belajar mandiri di rumah.',
      },
    ],
    whatToDo: [
      'Segera bangkit dari kasur setelah terjaga, rapikan tempat tidur, dan buka jendela kamar agar udara segar serta cahaya pagi masuk.',
      'Minum 1–2 gelas air putih suhu ruang untuk menghidrasi ulang organ tubuh dan melancarkan peredaran darah setelah tidur malam.',
      'Laksanakan ibadah pagi sesuai keyakinan dengan khusyuk, dilanjutkan peregangan otot ringan selama 5–10 menit.',
      'Mandi pagi dengan air segar, kenakan seragam rapi, periksa kembali isi tas sekolah, lalu nikmati sarapan sehat sebelum berangkat.',
    ],
    howToDo: [
      'Tetapkan satu jam bangun yang sama setiap hari (misalnya pukul 04.45 WIB), termasuk saat hari libur agar jam biologis tubuh tidak kacau.',
      'Majukan jam bangun secara bertahap sebesar 15 menit setiap 3 hari jika sebelumnya kamu terbiasa bangun kesiangan.',
      'Letakkan alarm atau ponsel di meja yang berjarak minimal 2 meter dari tempat tidur sehingga kamu wajib berdiri untuk mematikannya.',
      'Segera basuh wajah dengan air dingin begitu bangun agar saraf motorik langsung aktif dan rasa kantuk hilang.',
    ],
    tips: [
      'Hindari menekan tombol tunda (snooze) pada alarm karena tidur singkat 5–10 menit di antara bunyi alarm justru memicu inersia tidur yang membuat kepala terasa pusing.',
      'Siapkan seragam, kaus kaki, sepatu, serta seluruh buku pelajaran sejak malam hari sebelum tidur agar pagi hari bebas dari kepanikan.',
      'Kunci utama bangun pagi yang segar adalah tidur malam tepat waktu sebelum pukul 22.00 WIB dengan durasi istirahat 7–8 jam.',
    ],
    accentGradient: 'from-amber-600 via-orange-600 to-amber-500',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    slug: 'beribadah',
    num: '02',
    tag: 'Spiritual',
    title: 'Beribadah',
    shortDesc: 'Taat menjalankan ibadah tepat waktu sesuai keyakinan serta berdoa.',
    summary:
      'Ketaatan menjalankan ibadah sesuai agama dan keyakinan masing-masing merupakan pilar spiritual yang membentuk integritas moral, ketenangan batin, serta rasa syukur dalam setiap langkah kehidupan pelajar.',
    keyMetrics: [
      { label: 'Waktu Pelaksanaan', value: 'Tepat di Awal Waktu' },
      { label: 'Kebiasaan Pendukung', value: 'Doa & Refleksi Harian' },
      { label: 'Nilai Karakter', value: 'Integritas & Toleransi' },
    ],
    articleParagraphs: [
      {
        heading: '1. Keseimbangan antara Kecerdasan Akademik dan Kekuatan Spiritual',
        body: 'Pendidikan karakter tidak hanya bertujuan mencetak pelajar yang unggul secara nilai akademik, tetapi juga pribadi yang memiliki kompas moral yang kokoh. Ibadah yang dijalankan dengan kesadaran penuh melatih kejujuran batin, kerendahan hati, dan tanggung jawab bahwa setiap perbuatan baik maupun buruk selalu memiliki nilai pertanggungjawaban di hadapan Tuhan Yang Maha Esa.',
      },
      {
        heading: '2. Ibadah sebagai Ruang Ketenangan di Tengah Tekanan Belajar',
        body: 'Kesibukan belajar, ujian sekolah, persiapan seleksi perguruan tinggi, maupun dinamika pergaulan remaja kerap menimbulkan tekanan mental. Meluangkan waktu sejenak untuk beribadah dan berdoa menjadi momen jeda yang menenangkan pikiran, menumbuhkan rasa syukur atas nikmat kesehatan, serta memperkuat optimisme ketika menghadapi kesulitan belajar.',
      },
      {
        heading: '3. Wujud Nyata Ibadah dalam Sikap Sosial di Sekolah',
        body: 'Kualitas ibadah seseorang tercermin langsung pada akhlaknya terhadap sesama manusia. Di lingkungan SMAN 5 Semarang yang majemuk, pelajar yang taat beribadah akan senantiasa menjaga tutur kata yang santun kepada guru dan orang tua, bersikap jujur saat ujian, menghormati teman yang berbeda keyakinan saat beribadah, serta ringan tangan menolong teman yang membutuhkan.',
      },
    ],
    whatToDo: [
      'Menjalankan ibadah wajib tepat waktu di awal waktu, baik saat berada di rumah maupun ketika jam istirahat di sekolah.',
      'Membiasakan berdoa dengan sungguh-sungguh sebelum memulai pelajaran, sebelum makan, dan sebelum bepergian.',
      'Menyisihkan waktu 5–10 menit setiap hari untuk membaca kitab suci atau melakukan perenungan nilai kebaikan.',
      'Menerapkan nilai kejujuran, kesantunan, dan saling menghargai antarumat beragama dalam pergaulan sehari-hari.',
    ],
    howToDo: [
      'Jadikan jadwal ibadah sebagai prioritas utama saat menyusun jadwal harian, bukan sekadar sisa waktu setelah bermain atau belajar.',
      'Manfaatkan fasilitas tempat ibadah di sekolah dengan tertib, bersih, dan penuh kekhusyukan.',
      'Aktif mengikuti kegiatan pembinaan rohani atau ekstrakurikuler keagamaan yang diselenggarakan di sekolah.',
      'Biasakan melakukan evaluasi diri sebelum tidur mengenai kebaikan apa yang sudah dilakukan dan sikap apa yang perlu diperbaiki esok hari.',
    ],
    tips: [
      'Aktifkan pengingat waktu ibadah pada ponsel atau jam tangan agar tidak terlewat saat sedang asyik berdiskusi maupun belajar.',
      'Ajak teman dekat untuk saling mengingatkan dan beribadah bersama saat jam istirahat di sekolah.',
      'Awali pagi dengan mengucap syukur sehingga pikiran lebih positif dan lapang dalam menerima ilmu.',
    ],
    accentGradient: 'from-emerald-700 via-teal-600 to-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    slug: 'berolahraga',
    num: '03',
    tag: 'Kebugaran',
    title: 'Berolahraga',
    shortDesc: 'Menjaga kesehatan jasmani secara teratur minimal 3 kali dalam seminggu.',
    summary:
      'Aktivitas fisik dan olahraga yang dilakukan secara teratur minimal 3 kali seminggu menjaga kebugaran jantung dan otot, meningkatkan suplai oksigen ke otak, serta memperkuat daya tahan tubuh pelajar.',
    keyMetrics: [
      { label: 'Frekuensi Ideal', value: 'Minimal 3–4x / Minggu' },
      { label: 'Durasi Per Sesi', value: '30 – 45 Menit' },
      { label: 'Manfaat Utama', value: 'Stamina & Fokus Otak' },
    ],
    articleParagraphs: [
      {
        heading: '1. Bagaimana Olahraga Meningkatkan Kemampuan Berpikir Otak?',
        body: 'Banyak pelajar mengira olahraga hanya bermanfaat untuk membentuk otot fisik, padahal penelitian neurosains membuktikan bahwa olahraga aerobik secara langsung merangsang produksi protein BDNF (Brain-Derived Neurotrophic Factor). Protein ini berfungsi memperkuat sel-sel saraf otak, mempercepat daya tangkap saat memahami materi pelajaran yang kompleks, serta meningkatkan konsentrasi belajar.',
      },
      {
        heading: '2. Melawan Risiko Gaya Hidup Kurang Gerak (Sedentari)',
        body: 'Aktivitas duduk di bangku kelas selama berjam-jam yang dilanjutkan menatap layar gawai di rumah membuat otot tubuh kaku, metabolisme melambat, dan tubuh mudah lelah. Dengan berolahraga secara teratur minimal 30 menit sebanyak tiga kali dalam seminggu, sirkulasi darah menjadi lancar, kualitas tidur malam meningkat, dan sistem kekebalan tubuh lebih tangguh melawan penyakit.',
      },
      {
        heading: '3. Membangun Ketangguhan Mental dan Sportivitas',
        body: 'Berolahraga melatih ketekunan untuk melampaui batas rasa lelah secara bertahap. Baik melalui olahraga individu seperti lari pagi, renang, dan bersepeda maupun olahraga beregu seperti basket, futsal, dan bulu tangkis, siswa belajar arti kerja sama tim, komunikasi efektif, serta sikap sportif dalam menerima kemenangan maupun kekalahan.',
      },
    ],
    whatToDo: [
      'Melakukan gerakan pemanasan dinamis selama 5–7 menit sebelum olahraga untuk melenturkan sendi dan mencegah cedera otot.',
      'Melakukan aktivitas fisik intensitas sedang hingga tinggi (jogging, senam, bersepeda, renang, atau permainan bola) selama 30–45 menit.',
      'Melakukan pendinginan (cooling down) dan peregangan statis selama 5 menit setelah selesai berolahraga.',
      'Mencukupi kebutuhan air mineral sebelum, selama, dan sesudah beraktivitas fisik agar tubuh tidak mengalami dehidrasi.',
    ],
    howToDo: [
      'Tentukan jadwal olahraga tetap di kalender mingguanmu, misalnya setiap Selasa sore, Kamis sore, dan Minggu pagi.',
      'Ikuti pelajaran Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK) serta ekstrakurikuler olahraga dengan sungguh-sungguh.',
      'Sisipkan aktivitas gerak ringan di sela belajar, seperti berjalan kaki, naik turun tangga, atau peregangan setiap 1 jam duduk.',
      'Tingkatkan intensitas dan durasi latihan secara bertahap sesuai kemampuan fisik masing-masing.',
    ],
    tips: [
      'Pilih cabang olahraga atau aktivitas fisik yang benar-benar kamu nikmati agar terasa seperti hiburan yang menyegarkan, bukan kewajiban berat.',
      'Ajak teman sekelas atau anggota keluarga berolahraga bersama supaya lebih bersemangat dan konsisten.',
      'Gunakan pakaian olahraga yang menyerap keringat serta sepatu olahraga yang sesuai dengan jenis aktivitasmu.',
    ],
    accentGradient: 'from-sky-700 via-blue-600 to-cyan-500',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
  },
  {
    slug: 'makan-sehat-bergizi',
    num: '04',
    tag: 'Nutrisi',
    title: 'Makan Sehat & Bergizi',
    shortDesc: 'Mengonsumsi makanan bernutrisi seimbang (buah, sayur, protein).',
    summary:
      'Pola makan sehat dengan gizi seimbang menyediakan energi stabil, vitamin, mineral, dan protein esensial yang sangat dibutuhkan remaja dalam masa pertumbuhan optimal dan aktivitas belajar intensif.',
    keyMetrics: [
      { label: 'Pola Makan Harian', value: '3x Utama + Camilan Sehat' },
      { label: 'Hidrasi Harian', value: 'Minimal 8 Gelas Air Putih' },
      { label: 'Pedoman Porsi', value: 'Isi Piringku Seimbang' },
    ],
    articleParagraphs: [
      {
        heading: '1. Nutrisi sebagai Sumber Energi Utama Kinerja Otak',
        body: 'Otak remaja mengonsumsi sekitar 20 persen dari total energi harian tubuh untuk berpikir, menganalisis, dan menyimpan memori. Ketika seorang siswa berangkat ke sekolah tanpa sarapan atau hanya mengonsumsi makanan tinggi gula, kadar glukosa darah akan naik cepat lalu turun drastis dalam waktu singkat. Akibatnya, tubuh terasa gemetar, mengantuk, dan sulit berkonsentrasi pada jam pelajaran pagi.',
      },
      {
        heading: '2. Memahami Konsep Gizi Seimbang "Isi Piringku"',
        body: 'Makanan bergizi tidak harus mewah, melainkan lengkap komposisinya sesuai pedoman Kementerian Kesehatan. Dalam satu piring makan, setengah bagian diisi oleh sayuran beragam warna dan buah-buahan segar yang kaya serat, vitamin, serta antioksidan; sementara setengah bagian lainnya diisi oleh makanan pokok sumber karbohidrat kompleks serta lauk-pauk berprotein tinggi seperti telur, ikan, ayam, tempe, tahu, atau kacang-kacangan.',
      },
      {
        heading: '3. Membatasi Gula, Garam, Lemak Berlebih, dan Makanan Instan',
        body: 'Kebiasaan mengonsumsi minuman kemasan berpemanis tinggi, gorengan berlebihan, dan makanan ultra-proses setiap hari dapat memicu kelelahan kronis serta gangguan kesehatan metabolik sejak usia muda. Membiasakan membawa bekal masakan rumah dan botol air minum sendiri dari rumah merupakan langkah cerdas dan hemat untuk menjaga kualitas asupan gizi harian.',
      },
    ],
    whatToDo: [
      'Selalu menyempatkan sarapan bergizi sebelum berangkat ke sekolah (misalnya nasi/roti gandum, telur/lauk protein, dan sayur/buah).',
      'Mengonsumsi makanan utama 3 kali sehari dengan komposisi seimbang antara karbohidrat, protein hewani/nabati, sayur, dan buah.',
      'Minum air putih minimal 8 gelas (sekitar 2 liter) per hari dan membawa botol minum (tumbler) sendiri ke sekolah.',
      'Mengganti jajanan tinggi gula dan pengawet dengan camilan sehat seperti buah segar, kacang rebus, atau yogurt.',
    ],
    howToDo: [
      'Biasakan membawa bekal makan siang sehat dari rumah untuk dikonsumsi saat jam istirahat di sekolah.',
      'Perbanyak variasi warna sayuran dan buah setiap hari agar tubuh memperoleh spektrum vitamin dan mineral yang lengkap.',
      'Makan secara perlahan dan teratur sesuai jam makan tanpa terburu-buru agar sistem pencernaan bekerja optimal.',
      'Selalu periksa tanggal kedaluwarsa serta tabel informasi nilai gizi (kadar gula dan natrium) pada kemasan makanan/minuman.',
    ],
    tips: [
      'Siapkan buah potong siap santap seperti pisang, pepaya, apel, atau jeruk di rumah agar mudah diambil saat lapar.',
      'Kurangi konsumsi minuman bersoda, teh kemasan manis, dan minuman berenergi secara bertahap dengan menggantinya menggunakan air mineral.',
      'Jangan pernah melewatkan sarapan meskipun jadwal pagi padat; siapkan menu sarapan praktis seperti roti isi telur dan susu.',
    ],
    accentGradient: 'from-rose-700 via-pink-600 to-rose-500',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
  },
  {
    slug: 'gemar-membaca',
    num: '05',
    tag: 'Literasi',
    title: 'Gemar Membaca',
    shortDesc: 'Membaca buku literasi minimal 15–30 menit setiap hari untuk wawasan luas.',
    summary:
      'Budaya gemar membaca setiap hari melatih ketajaman berpikir kritis, memperkaya kosakata, memperluas wawasan lintas bidang ilmu, serta membentuk kepekaan empati pelajar.',
    keyMetrics: [
      { label: 'Durasi Harian', value: '15 – 30 Menit / Hari' },
      { label: 'Target Bulanan', value: '1 – 2 Buku Selesai' },
      { label: 'Kompetensi Utama', value: 'Nalar Kritis & Komunikasi' },
    ],
    articleParagraphs: [
      {
        heading: '1. Mengapa Membaca Mendalam Sangat Dibutuhkan di Era Digital?',
        body: 'Di era media sosial saat ini, otak kita terbiasa menerima potongan informasi singkat berdurasi beberapa detik saja. Jika tidak diimbangi dengan membaca buku secara utuh, kemampuan fokus jangka panjang (deep focus) dan nalar analitis akan melemah. Membaca buku melatih otak untuk merangkai alur logika yang panjang, memahami sebab-akibat secara mendalam, serta menyaring informasi secara kritis agar tidak mudah terpengaruh hoaks.',
      },
      {
        heading: '2. Kekuatan Konsistensi 20 Menit Setiap Hari',
        body: 'Banyak orang gagal membangun kebiasaan membaca karena langsung menargetkan membaca ratusan halaman dalam satu waktu. Padahal, membaca dengan kecepatan rata-rata selama 20 menit setiap hari setara dengan sekitar 10 hingga 15 halaman per hari. Dalam satu bulan kamu sudah menamatkan 300 hingga 450 halaman, atau sekitar 12 hingga 15 buku berkualitas dalam satu tahun tanpa terasa berat.',
      },
      {
        heading: '3. Memperkaya Kosakata, Kemampuan Menulis, dan Empati',
        body: 'Setiap buku membuka jendela pengalaman baru yang melampaui ruang dan waktu. Membaca biografi tokoh mengajarkan ketangguhan menghadapi kegagalan, membaca buku sains memperluas rasa ingin tahu, sementara membaca karya sastra melatih empati untuk memahami perasaan dan sudut pandang orang lain. Kekayaan kosakata dari membaca juga sangat membantu saat menyusun esai, karya tulis ilmiah, maupun presentasi di kelas.',
      },
    ],
    whatToDo: [
      'Membaca buku non-pelajaran atau buku pengayaan (sains populer, biografi, sejarah, sastra, atau pengembangan diri) minimal 15–30 menit setiap hari.',
      'Menuliskan ringkasan singkat, poin gagasan utama, atau kosakata baru yang ditemukan dalam buku catatan literasi.',
      'Mendiskusikan isi buku atau artikel edukatif yang menarik bersama teman sebaya maupun guru di sekolah.',
      'Memanfaatkan fasilitas Perpustakaan SMAN 5 Semarang atau aplikasi perpustakaan digital resmi secara aktif.',
    ],
    howToDo: [
      'Tetapkan satu waktu khusus membaca setiap hari, misalnya 20 menit sebelum tidur malam sebagai pengganti menatap layar gawai.',
      'Selalu simpan satu buku bacaan di dalam tas sekolah agar dapat dibaca saat waktu luang atau jam istirahat.',
      'Gunakan teknik penanda (bookmark) dan stabilo/catatan tempel untuk menandai bagian penting yang ingin diingat.',
      'Ikuti kegiatan pojok baca kelas atau kelompok diskusi literasi di sekolah.',
    ],
    tips: [
      'Mulailah membaca dari topik atau genre yang paling menarik perhatianmu agar tumbuh rasa penasaran untuk terus membalik halaman.',
      'Terapkan aturan sederhana "minimal 10 halaman per hari" agar kebiasaan membaca tetap terjaga meski jadwal sedang padat.',
      'Buat daftar target buku yang ingin dibaca setiap semester dan beri apresiasi diri setiap kali berhasil menamatkan satu buku.',
    ],
    accentGradient: 'from-indigo-700 via-violet-600 to-indigo-500',
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  },
  {
    slug: 'membantu-orang-tua',
    num: '06',
    tag: 'Sosial & Bakti',
    title: 'Membantu Orang Tua',
    shortDesc: 'Membantu pekerjaan rumah, peduli lingkungan, dan bergotong royong.',
    summary:
      'Berbakti kepada orang tua dan aktif bermasyarakat melatih kepekaan sosial, kemandirian hidup, rasa tanggung jawab, serta semangat gotong royong di rumah maupun lingkungan sekolah.',
    keyMetrics: [
      { label: 'Lingkup Praktik', value: 'Keluarga, Sekolah & Masyarakat' },
      { label: 'Sikap Utama', value: 'Inisiatif & Gotong Royong' },
      { label: 'Nilai Karakter', value: 'Bakti, Empati & Tanggung Jawab' },
    ],
    articleParagraphs: [
      {
        heading: '1. Keluarga sebagai Sekolah Pertama Pembentukan Empati',
        body: 'Sebelum seseorang mampu berkontribusi besar bagi bangsa dan masyarakat, karakter kepeduliannya diuji terlebih dahulu di dalam rumah sendiri. Membantu orang tua menyelesaikan pekerjaan rumah tangga—seperti merapikan ruang bersama, mencuci peralatan makan, atau menjaga adik—merupakan wujud nyata rasa syukur dan hormat atas kerja keras orang tua sekaligus bekal keterampilan kemandirian hidup.',
      },
      {
        heading: '2. Menumbuhkan Kepekaan Sosial dan Budaya Gotong Royong',
        body: 'Kebiasaan bermasyarakat mengajarkan bahwa manusia tidak dapat hidup sendiri. Di lingkungan SMAN 5 Semarang, semangat bermasyarakat diwujudkan melalui kepedulian menjaga kebersihan kelas, menghargai seluruh warga sekolah tanpa membeda-bedakan latar belakang, serta sigap mengulurkan bantuan ketika teman atau lingkungan sekitar tertimpa musibah.',
      },
      {
        heading: '3. Komunikasi Santun dan Keharmonisan Keluarga',
        body: 'Berbakti kepada orang tua juga tercermin dari cara berkomunikasi sehari-hari. Membiasakan berpamitan dengan santun sebelum berangkat ke sekolah, memberi kabar jika ada kegiatan tambahan di luar jam pelajaran, serta meluangkan waktu untuk mengobrol hangat bersama keluarga akan menjaga kepercayaan dan ketenangan batin dalam menuntut ilmu.',
      },
    ],
    whatToDo: [
      'Membantu pekerjaan rumah tangga harian secara rutin seperti menyapu, merapikan meja makan, mencuci piring, atau merawat tanaman.',
      'Berpamitan dengan santun kepada orang tua sebelum berangkat ke sekolah dan memberi kabar tepat waktu saat pulang.',
      'Menjaga kebersihan lingkungan kelas dan sekolah, membuang sampah pada tempatnya, serta melaksanakan piket kelas dengan penuh tanggung jawab.',
      'Aktif berpartisipasi dalam kegiatan kerja bakti lingkungan, bakti sosial sekolah, maupun kegiatan kemasyarakatan di sekitar rumah.',
    ],
    howToDo: [
      'Ambil inisiatif langsung membantu pekerjaan rumah yang terlihat tanpa harus menunggu disuruh atau diingatkan oleh orang tua.',
      'Luangkan waktu setiap hari untuk duduk bersama keluarga tanpa gawai guna mendengarkan cerita dan nasihat orang tua.',
      'Biasakan mengucapkan tiga kata kunci kesantunan: "Tolong" saat meminta bantuan, "Terima kasih" setelah dibantu, dan "Maaf" saat berbuat keliru.',
      'Bekerja sama dengan teman sekelas dalam menjaga kenyamanan ruang belajar bersama.',
    ],
    tips: [
      'Buat pembagian tugas rumah tangga sederhana bersama anggota keluarga agar pekerjaan rumah terasa ringan dan adil.',
      'Simpan ponsel saat sedang diajak berbicara oleh orang tua atau guru sebagai bentuk penghormatan penuh.',
      'Jaga nama baik keluarga dan sekolah dengan senantiasa bersikap jujur, sopan, dan peduli terhadap sesama.',
    ],
    accentGradient: 'from-orange-700 via-amber-600 to-orange-500',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  {
    slug: 'istirahat-cukup',
    num: '07',
    tag: 'Pemulihan',
    title: 'Istirahat Cukup',
    shortDesc: 'Tidur malam sebelum pukul 22.00 dan bebas gadget demi pemulihan energi.',
    summary:
      'Tidur malam yang cukup dan berkualitas sebelum pukul 22.00 WIB memungkinkan otak mengonsolidasikan memori pelajaran, memulihkan sel-sel tubuh, serta menjaga kestabilan emosi remaja.',
    keyMetrics: [
      { label: 'Batas Jam Tidur', value: 'Sebelum Pukul 22.00 WIB' },
      { label: 'Durasi Ideal Remaja', value: '7 – 8 Jam / Malam' },
      { label: 'Aturan Gawai', value: 'Bebas Layar 30 Menit Sebelum Tidur' },
    ],
    articleParagraphs: [
      {
        heading: '1. Proses Pemulihan Otak dan Memori Selama Tidur Malam',
        body: 'Tidur bukanlah waktu yang terbuang sia-sia, melainkan fase biologis aktif di mana tubuh melakukan perbaikan jaringan otot, menyeimbangkan hormon pertumbuhan remaja, dan membersihkan racun sisa metabolisme di otak. Pada fase tidur nyenyak (deep sleep dan REM), otak menyusun ulang seluruh informasi pelajaran yang diterima sepanjang hari di sekolah menjadi ingatan jangka panjang yang siap dipanggil kembali saat ujian.',
      },
      {
        heading: '2. Bahaya Begadang dan Paparan Cahaya Biru Gawai',
        body: 'Kebiasaan menunda waktu tidur demi bermain gim atau menggulir media sosial hingga larut malam memberikan dampak ganda yang merugikan. Cahaya biru (blue light) dari layar ponsel menipu otak agar mengira hari masih siang sehingga hormon kantuk (melatonin) terhambat. Akibatnya, durasi tidur berkurang, tubuh terasa lemas, emosi mudah meledak, dan daya konsentrasi di kelas menurun drastis.',
      },
      {
        heading: '3. Manajemen Tugas agar Bebas dari Kebiasaan Begadang',
        body: 'Sebagian besar alasan siswa begadang adalah menumpuk pekerjaan rumah hingga larut malam. Dengan menerapkan disiplin mengerjakan tugas sekolah pada sore atau awal malam hari (pukul 19.00 – 21.00 WIB), kamu dapat menutup buku tepat waktu, menenangkan pikiran, dan tidur nyenyak sebelum pukul 22.00 WIB untuk bangun segar keesokan paginya.',
      },
    ],
    whatToDo: [
      'Menghentikan seluruh aktivitas layar digital (ponsel, laptop, televisi, dan gim) minimal 30 menit sebelum jam tidur.',
      'Berbaring tidur malam sebelum pukul 22.00 WIB agar terpenuhi durasi istirahat ideal remaja selama 7–8 jam.',
      'Membersihkan diri (mencuci wajah, tangan, dan kaki serta menggosok gigi) dan berdoa sebelum memejamkan mata.',
      'Menciptakan suasana kamar tidur yang bersih, rapi, sejuk, dan redup cahaya agar kualitas tidur lebih nyenyak.',
    ],
    howToDo: [
      'Selesaikan seluruh tugas sekolah dan persiapan perlengkapan esok hari paling lambat pukul 21.00 WIB.',
      'Aktifkan fitur Mode Tidur / Jangan Ganggu (Do Not Disturb) pada ponsel mulai pukul 21.30 WIB agar tidak terganggu notifikasi.',
      'Lakukan transisi relaksasi selama 15 menit sebelum tidur, seperti membaca buku fisik ringan atau mengatur pernapasan.',
      'Pertahankan jam tidur dan jam bangun yang konsisten setiap hari agar siklus tidur alami tubuh terbentuk kuat.',
    ],
    tips: [
      'Hindari mengonsumsi minuman berkafein (kopi, teh pekat, cokelat pekat, atau minuman berenergi) mulai sore hingga malam hari.',
      'Jika merasa sangat lelah di siang hari sepulang sekolah, cukup lakukan tidur singkat (power nap) maksimal 15–20 menit agar tidak mengganggu tidur malam.',
      'Jauhkan ponsel dari jangkauan kasur saat tidur agar tidak tergoda memeriksa layar ketika terbangun di tengah malam.',
    ],
    accentGradient: 'from-violet-700 via-purple-600 to-indigo-600',
    badgeBg: 'bg-violet-100 text-violet-900 border-violet-300',
  },
]