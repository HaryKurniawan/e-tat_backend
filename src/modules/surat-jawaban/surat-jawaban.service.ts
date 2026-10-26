import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import prisma from '../../config/database';
import { sendSuratJawabanEmail } from '../../services/email.service';

const INSTANSI_BNNP = 'Kalimantan Timur';
const KOTA_TAT = 'Samarinda';
const KETUA_NIP = '79080512';
const KETUA_JABATAN = 'Sekretariat Tim Asesmen Terpadu (TAT)';

const LOGO_CANDIDATES = [
  path.join(process.cwd(), 'assets', 'bnn.png'),
  path.join(__dirname, '..', '..', '..', 'assets', 'bnn.png'),
];

const fmtTanggal = (d?: Date | string | null): string => {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const suratJawabanInclude = {
  pengaju: { select: { id: true, name: true, email: true } },
  terperiksa: true,
  perkara: true,
  timAsesmen: true,
  sidangPleno: true,
} as const;

/**
 * Surat jawaban hanya tersedia setelah berkas lolos verifikasi dan tim ditugaskan
 * (tahap Asesmen Medis / Step 4).
 */
export const isSuratJawabanAvailable = (permohonan: { timAsesmen: unknown | null }): boolean =>
  Boolean(permohonan.timAsesmen);

export type SuratJawabanPermohonan = NonNullable<Awaited<ReturnType<typeof loadPermohonan>>>;

export const loadPermohonan = (id: string) =>
  prisma.permohonanAsesmen.findUnique({ where: { id }, include: suratJawabanInclude });

/**
 * Nomor & tanggal surat dibuat SEKALI lalu disimpan, sehingga PDF, email, dan
 * cetak ulang selalu memuat nomor yang sama.
 */
export const ensureSuratJawabanMeta = async (permohonan: SuratJawabanPermohonan) => {
  if (permohonan.suratJawabanNomor && permohonan.suratJawabanTanggal) {
    return { nomor: permohonan.suratJawabanNomor, tanggal: permohonan.suratJawabanTanggal };
  }
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const urutan =
    (await prisma.permohonanAsesmen.count({
      where: { suratJawabanNomor: { not: null }, suratJawabanTanggal: { gte: startOfYear } },
    })) + 1;
  const nomor = `B/${String(urutan).padStart(3, '0')}/${now.getMonth() + 1}/${now.getFullYear()}/TAT`;
  const saved = await prisma.permohonanAsesmen.update({
    where: { id: permohonan.id },
    data: { suratJawabanNomor: nomor, suratJawabanTanggal: now },
    select: { suratJawabanNomor: true, suratJawabanTanggal: true },
  });
  return { nomor: saved.suratJawabanNomor!, tanggal: saved.suratJawabanTanggal! };
};

type RichPart = string | { b: string };

/** Menulis paragraf dengan potongan teks tebal (setara <strong> pada tampilan lama). */
const rich = (doc: PDFKit.PDFDocument, parts: RichPart[], opts: PDFKit.Mixins.TextOptions = {}) => {
  parts.forEach((part, i) => {
    const isBold = typeof part !== 'string';
    doc.font(isBold ? 'Times-Bold' : 'Times-Roman');
    doc.text(isBold ? part.b : part, { ...opts, continued: i < parts.length - 1 });
  });
  doc.font('Times-Roman');
};

const row = (doc: PDFKit.PDFDocument, label: string, value: RichPart[], x: number, labelW: number, width: number) => {
  const y = doc.y;
  doc.font('Times-Roman').text(label, x, y, { width: labelW });
  doc.text(':', x + labelW, y, { width: 14, align: 'center' });
  doc.text('', x + labelW + 18, y);
  rich(doc, value, { width: width - labelW - 18 });
};

/** Membuat PDF Surat Jawaban (status diterima) – tata letak mengikuti modal sebelumnya. */
export const buildSuratJawabanPdf = (
  permohonan: SuratJawabanPermohonan,
  meta: { nomor: string; tanggal: Date }
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 51, bottom: 57, left: 62, right: 62 },
      info: {
        Title: `Surat Jawaban ${meta.nomor}`,
        Author: 'Sekretariat Tim Asesmen Terpadu (e-TAT)',
        Subject: 'Surat Jawaban Penerimaan Permohonan Asesmen Terpadu',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const p = permohonan;
    const pk = p.perkara;
    const tr = p.terperiksa;
    const left = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const right = left + width;

    const instansiPenyidik = pk?.instansiPenyidik || 'Satuan Reserse Narkoba';
    const namaPenyidik = pk?.namaPenyidik || p.pengaju?.name || 'Kepala Satuan Reserse Narkoba';
    const nomorSuratPenyidik = pk?.nomorLaporanPolisi || p.nomorPermohonan;
    const namaTersangka = tr?.namaLengkap || 'Tersangka';
    const nikTersangka = tr?.nik || '-';
    const pasal = pk?.pasalDipersangkakan || 'Pasal 127 ayat (1) huruf a UU RI No. 35 Tahun 2009';
    const ketuaNama = (p.sidangPleno?.pimpinanPleno || p.timAsesmen?.sekretariatNama || 'Sekretariat TAT')
      .replace(/\[TEST\]\s*/gi, '')
      .trim();

    // ---------- KOP SURAT ----------
    const kopTop = doc.y;
    const logoPath = LOGO_CANDIDATES.find((f) => fs.existsSync(f));
    if (logoPath) {
      doc.image(logoPath, left, kopTop, { fit: [62, 62] });
    }
    doc.font('Times-Bold').fontSize(13).text('BADAN NARKOTIKA NASIONAL REPUBLIK INDONESIA', left + 66, kopTop + 2, {
      width: width - 66 - 20,
      align: 'center',
    });
    doc.fontSize(10.5).text('(NATIONAL NARCOTICS BOARD REPUBLIC OF INDONESIA)', { width: width - 66 - 20, align: 'center' });
    doc.font('Times-Roman').fontSize(8).text(
      'Jl. MT. Haryono No. 11 Cawang Jakarta Timur\n' +
        'Telepon : (62-21) 80871566, 80871567\n' +
        'Faksimili : (62-21) 80885225, 80871591, 80871592, 80871593\n' +
        'e-mail : info@bnn.go.id    website : www.bnn.go.id',
      { width: width - 66 - 20, align: 'center' }
    );
    const kopBottom = Math.max(doc.y, kopTop + 66) + 4;
    doc.lineWidth(2.2).moveTo(left, kopBottom).lineTo(right, kopBottom).stroke('#000000');
    doc.lineWidth(0.7).moveTo(left, kopBottom + 3).lineTo(right, kopBottom + 3).stroke('#000000');
    doc.x = left;
    doc.y = kopBottom + 16;

    // ---------- NOMOR / LAMPIRAN / PERIHAL ----------
    doc.fontSize(11.5);
    row(doc, 'Nomor', [{ b: meta.nomor }], left, 100, width);
    doc.moveDown(0.2);
    row(doc, 'Lampiran', ['1 (satu) berkas'], left, 100, width);
    doc.moveDown(0.2);
    row(doc, 'Hal / Perihal', [{ b: 'Jawaban Penerimaan Permohonan Asesmen Terpadu (TAT)' }], left, 100, width);

    // ---------- KOTA & TANGGAL ----------
    doc.moveDown(0.8);
    doc.font('Times-Roman').text(`${KOTA_TAT}, ${fmtTanggal(meta.tanggal)}`, left, doc.y, { width, align: 'right' });

    // ---------- KEPADA ----------
    doc.moveDown(0.8);
    const kepY = doc.y;
    doc.text('Kepada Yth.', left, kepY, { width: 100 });
    doc.text(':', left + 100, kepY, { width: 14, align: 'center' });
    doc.x = left + 118;
    doc.y = kepY;
    doc.font('Times-Bold').text(`Kepala ${instansiPenyidik}`, left + 118, kepY, { width: width - 118 });
    doc.font('Times-Roman').text(`u.p. ${namaPenyidik}`, left + 118, doc.y, { width: width - 118 });
    doc.text('di —', left + 118, doc.y, { width: width - 118 });
    doc.font('Times-Bold').text('Tempat', left + 118, doc.y, { width: width - 118 });
    doc.font('Times-Roman');

    // ---------- PEMBUKA ----------
    doc.moveDown(1);
    rich(
      doc,
      [
        'Menindaklanjuti surat Saudara Nomor: ',
        { b: nomorSuratPenyidik },
        ' tanggal ',
        { b: fmtTanggal(pk?.tanggalLp || p.tanggalPengajuan) },
        ' perihal Permohonan Asesmen Terpadu atas nama tersangka ',
        { b: namaTersangka },
        ` (NIK: ${nikTersangka}) yang disangka melanggar `,
        { b: pasal },
        ', bersama ini kami sampaikan hal-hal sebagai berikut:',
      ],
      { width, align: 'justify', lineGap: 2 }
    );
    doc.moveDown(0.6);

    // ---------- ISI (4 butir) ----------
    const butir: RichPart[][] = [
      [
        'Setelah dilakukan pemeriksaan terhadap kelengkapan dan keabsahan berkas permohonan yang Saudara ajukan, Tim Sekretariat Asesmen Terpadu (TAT) ',
        { b: `BNNP ${INSTANSI_BNNP}` },
        ' menyatakan bahwa berkas persyaratan formil telah ',
        { b: 'lengkap dan memenuhi syarat' },
        ' sebagaimana diatur dalam Peraturan Bersama 7 Kementerian/Lembaga Tahun 2014 tentang Penanganan Pecandu Narkotika dan Korban Penyalahgunaan Narkotika ke dalam Lembaga Rehabilitasi.',
      ],
      [
        'Dengan demikian, permohonan asesmen terpadu atas nama tersangka ',
        { b: namaTersangka },
        ' tersebut ',
        { b: 'diterima' },
        ' dan akan diproses lebih lanjut oleh Tim Asesmen Terpadu (TAT) yang terdiri dari Tim Medis dan Tim Hukum lintas instansi.',
      ],
      [
        'Jadwal pemeriksaan tersangka dan pelaksanaan sidang pleno TAT akan dikoordinasikan lebih lanjut dan akan disampaikan melalui surat pemberitahuan resmi berikutnya.',
      ],
      [
        'Selama proses asesmen berlangsung, tersangka tetap menjadi tanggung jawab instansi pemohon dan harus siap dihadirkan sesuai jadwal yang telah ditetapkan.',
      ],
    ];
    butir.forEach((parts, i) => {
      const y = doc.y;
      doc.font('Times-Roman').text(`${i + 1}.`, left + 4, y, { width: 20 });
      doc.x = left + 26;
      doc.y = y;
      rich(doc, parts, { width: width - 26, align: 'justify', lineGap: 2 });
      doc.x = left;
      doc.moveDown(0.5);
    });

    doc.moveDown(0.3);
    doc.font('Times-Roman').text(
      'Demikian surat jawaban ini kami sampaikan untuk dapat dipergunakan sebagaimana mestinya. Atas perhatian dan kerja sama Saudara, kami ucapkan terima kasih.',
      left,
      doc.y,
      { width, align: 'justify', lineGap: 2 }
    );

    // ---------- TANDA TANGAN ----------
    if (doc.y > doc.page.height - 260) doc.addPage();
    doc.moveDown(1.5);
    const ttdW = width * 0.42;
    const ttdX = right - ttdW;
    doc.font('Times-Roman').text(`${KETUA_JABATAN},`, ttdX, doc.y, { width: ttdW, align: 'center' });
    doc.font('Times-Bold').text(`BNNP ${INSTANSI_BNNP}`, ttdX, doc.y, { width: ttdW, align: 'center' });
    doc.moveDown(4.2);
    doc.font('Times-Bold').text(ketuaNama, ttdX, doc.y, { width: ttdW, align: 'center', underline: true });
    doc.font('Courier').fontSize(10).text(`NIP. ${KETUA_NIP}`, ttdX, doc.y, { width: ttdW, align: 'center' });

    // ---------- TEMBUSAN ----------
    doc.fontSize(10.5).font('Times-Roman');
    doc.moveDown(1.5);
    doc.lineWidth(0.5).moveTo(left, doc.y).lineTo(right, doc.y).stroke('#888888');
    doc.moveDown(0.5);
    doc.font('Times-Bold').text('Tembusan:', left, doc.y, { width });
    doc.font('Times-Roman');
    [
      `Kepala BNNP ${INSTANSI_BNNP} (sebagai laporan);`,
      `Ketua Tim Asesmen Terpadu BNNP ${INSTANSI_BNNP};`,
      'Arsip.',
    ].forEach((t, i) => doc.text(`${i + 1}. ${t}`, left + 8, doc.y, { width: width - 8 }));

    doc.moveDown(1);
    doc.fontSize(8).fillColor('#555555').text(
      `Ref. Permohonan e-TAT: ${p.nomorPermohonan}  |  Sistem Informasi e-TAT SIAP PULIH — BNNP ${INSTANSI_BNNP}`,
      left,
      doc.y,
      { width, align: 'center' }
    );

    doc.end();
  });

export const suratJawabanFilename = (nomor: string): string =>
  `SURAT-JAWABAN-${nomor.replace(/[\\/]/g, '_')}.pdf`;

/**
 * Membuat (jika perlu) nomor surat + PDF lalu mengirimnya ke email pengaju.
 * Tanpa `force`, pengiriman dilewati bila surat sudah pernah terkirim.
 */
export const kirimSuratJawabanKePengaju = async (
  permohonanId: string,
  options: { force?: boolean } = {}
): Promise<{ sent: boolean; skipped?: boolean; reason?: string; email?: string }> => {
  const permohonan = await loadPermohonan(permohonanId);
  if (!permohonan) return { sent: false, reason: 'Permohonan tidak ditemukan' };
  if (!isSuratJawabanAvailable(permohonan)) {
    return { sent: false, reason: 'Surat jawaban baru tersedia setelah tim asesmen ditugaskan' };
  }
  if (permohonan.suratJawabanDikirimAt && !options.force) {
    return { sent: false, skipped: true, reason: 'Surat jawaban sudah pernah dikirim' };
  }
  const to = permohonan.pengaju?.email;
  if (!to) return { sent: false, reason: 'Email pengaju tidak tersedia' };

  const meta = await ensureSuratJawabanMeta(permohonan);
  const pdf = await buildSuratJawabanPdf(permohonan, meta);

  const result = await sendSuratJawabanEmail({
    to,
    namaPengaju: permohonan.pengaju?.name || 'Penyidik Pengaju',
    nomorPermohonan: permohonan.nomorPermohonan,
    trackingNumber: permohonan.trackingNumber,
    nomorSurat: meta.nomor,
    tanggalSurat: fmtTanggal(meta.tanggal),
    namaTersangka: permohonan.terperiksa?.namaLengkap || '-',
    jadwalMedis: permohonan.timAsesmen?.jadwalPemeriksaanMedis ?? null,
    jadwalPleno: permohonan.timAsesmen?.jadwalPleno ?? null,
    lokasiPemeriksaan: permohonan.timAsesmen?.lokasiPemeriksaan ?? null,
    pdf,
    filename: suratJawabanFilename(meta.nomor),
  });

  if (!result.success) return { sent: false, reason: result.error || 'Gagal mengirim email', email: to };

  await prisma.permohonanAsesmen.update({
    where: { id: permohonan.id },
    data: { suratJawabanDikirimAt: new Date(), suratJawabanEmailTo: to },
  });
  return { sent: true, email: to };
};
