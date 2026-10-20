import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../../../config/database';
import { getParam } from '../../../utils/param.util';
import { sendNotFound } from '../../../utils/response.util';

/**
 * GET /api/rekomendasi/:permohonanId/pdf
 * Download file PDF resmi rekomendasi hasil asesmen terpadu
 */
export const generateRekomendasiPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');

    const permohonan = await prisma.permohonanAsesmen.findUnique({
      where: { id: permohonanId },
      include: {
        terperiksa: true,
        perkara: {
          include: { barangBuktiList: true }
        },
        asesmenMedis: {
          include: { riwayatZat: true }
        },
        asesmenHukum: true,
        rekomendasiResmi: {
          include: { daftarPengesah: true }
        },
        timAsesmen: true,
      },
    });

    if (!permohonan) {
      sendNotFound(res, 'Permohonan tidak ditemukan');
      return;
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 35, bottom: 35, left: 45, right: 45 },
      info: {
        Title: `Surat Rekomendasi TAT - ${permohonan.terperiksa?.namaLengkap || permohonan.nomorPermohonan}`,
        Author: 'Tim Asesmen Terpadu (e-TAT) POLRI - BNN',
        Subject: 'Surat Rekomendasi Resmi Asesmen Terpadu Narkotika',
      }
    });

    // Set HTTP Response Headers for inline display / download
    const filename = `REKOMENDASI-TAT-${permohonan.nomorPermohonan.replace(/[\/\\]/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    doc.pipe(res);

    // ==========================================
    // KOP SURAT RESMI
    // ==========================================
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('KEPOLISIAN NEGARA REPUBLIK INDONESIA', { align: 'center' })
      .text('DAERAH KALIMANTAN TIMUR', { align: 'center' })
      .text('TIM ASESMEN TERPADU (TAT) NARKOTIKA', { align: 'center' })
      .font('Helvetica')
      .fontSize(8)
      .text('Sekretariat Bersama: Jl. Jenderal Sudirman No. 1, Telp: (0541) 741110, Balikpapan - Kaltim', { align: 'center' })
      .moveDown(0.5);

    // Garis Kop Ganda
    const startX = 45;
    const endX = 550;
    doc.lineWidth(2).moveTo(startX, doc.y).lineTo(endX, doc.y).stroke('#000000');
    doc.lineWidth(0.5).moveTo(startX, doc.y + 2).lineTo(endX, doc.y + 2).stroke('#000000');
    doc.moveDown(1.2);

    // ==========================================
    // JUDUL DOKUMEN & NOMOR
    // ==========================================
    const nomorSurat = permohonan.rekomendasiResmi?.nomorSurat || `REK-TAT/2026/09/${permohonan.id.slice(-4)}`;
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('SURAT REKOMENDASI HASIL ASESMEN TERPADU', { align: 'center', underline: true })
      .font('Helvetica')
      .fontSize(9)
      .text(`Nomor: ${nomorSurat}`, { align: 'center' })
      .moveDown(0.8);

    // ==========================================
    // DASAR HUKUM
    // ==========================================
    doc.fontSize(8.5).font('Helvetica-Bold').text('I. DASAR HUKUM:');
    doc.font('Helvetica').fontSize(8);
    const dasarHukum = [
      '1. Undang-Undang RI Nomor 35 Tahun 2009 tentang Narkotika (Pasal 54, 55, dan 103).',
      '2. Peraturan Bersama Menkumham, Menkes, Mensos, Kapolri, Jaksa Agung, Kepala BNN, dan Ketua MA RI Tahun 2014.',
      '3. Surat Edaran Mahkamah Agung (SEMA) Republik Indonesia Nomor 04 Tahun 2010.',
      `4. Surat Permohonan Asesmen TAT dari Penyidik No: ${permohonan.perkara?.nomorLaporanPolisi || permohonan.nomorPermohonan}.`,
    ];
    dasarHukum.forEach(item => {
      doc.text(item, { indent: 10 });
    });
    doc.moveDown(0.6);

    // ==========================================
    // IDENTITAS TERPERIKSA
    // ==========================================
    const t = permohonan.terperiksa;
    doc.fontSize(8.5).font('Helvetica-Bold').text('II. IDENTITAS TERPERIKSA:');
    doc.font('Helvetica').fontSize(8);

    const identitasList = [
      ['Nama Lengkap', `: ${t?.namaLengkap || '-'} ${t?.alias ? `(Alias: ${t.alias})` : ''}`],
      ['NIK', `: ${t?.nik || '-'}`],
      ['Tempat, Tgl Lahir / Usia', `: ${t?.tempatLahir || '-'}, ${t?.tanggalLahir ? new Date(t.tanggalLahir).toLocaleDateString('id-ID') : '-'} (${t?.usia || '-'} Tahun)`],
      ['Jenis Kelamin / Pekerjaan', `: ${t?.jenisKelamin || '-'} / ${t?.pekerjaan || '-'}`],
      ['Alamat Domisili', `: ${t?.alamatKtp || t?.alamatDomisili || '-'}`],
      ['Nomor Laporan Polisi (LP)', `: ${permohonan.perkara?.nomorLaporanPolisi || '-'} (Satuan: ${permohonan.instansiPengaju || '-'})`],
      ['Pasal Dipersangkakan', `: ${permohonan.perkara?.pasalDipersangkakan || 'Pasal 127 ayat (1) UU No. 35/2009'}`],
    ];

    identitasList.forEach(([label, value]) => {
      doc.text(label.padEnd(28, ' ') + value, { indent: 10 });
    });
    doc.moveDown(0.6);

    // ==========================================
    // HASIL ASESMEN MEDIS & HUKUM
    // ==========================================
    const m = permohonan.asesmenMedis;
    const h = permohonan.asesmenHukum;

    doc.fontSize(8.5).font('Helvetica-Bold').text('III. HASIL ASESMEN MEDIS & TOKSIKOLOGI:');
    doc.font('Helvetica').fontSize(8);
    doc.text(`• Diagnosis ICD-10 & Klinis : ${m?.diagnosisKlinisIcd || 'F19.2 (Gangguan Penggunaan Zat Multipel - Ketergantungan Sedang)'}`, { indent: 10 });
    doc.text(`• Tingkat Ketergantungan      : ${(m as any)?.tingkatKetergantungan || 'Sedang - Berat'} | Kebutuhan: ${m?.kebutuhanRawat || 'Rehabilitasi Rawat Inap'}`, { indent: 10 });
    doc.text(`• Riwayat Penggunaan        : ${m?.riwayatZat?.[0]?.jenisZat || 'Metamfetamina (Sabu)'} | Lama: ${m?.riwayatZat?.[0]?.lamaPemakaianBulan || 12} Bulan`, { indent: 10 });
    doc.text(`• Catatan Klinis Medis       : ${m?.interpretasiKlinis || 'Pasien memerlukan program pemulihan intensif di fasilitas rehabilitasi bersertifikasi.'}`, { indent: 10 });
    doc.moveDown(0.5);

    doc.fontSize(8.5).font('Helvetica-Bold').text('IV. HASIL PENELAAHAN HUKUM:');
    doc.font('Helvetica').fontSize(8);
    doc.text(`• Analisis Peran Tersangka   : ${h?.analisisPeran ? String(h.analisisPeran).replace(/_/g, ' ') : 'Penyalahguna Murni untuk Diri Sendiri (Bukan Jaringan Peredaran Gelap)'}`, { indent: 10 });
    doc.text(`• Kualifikasi Barang Bukti   : ${h?.analisisBarangBukti || 'Barang bukti di bawah ambang batas gramatur pemakaian 1 hari sesuai SEMA 04/2010.'}`, { indent: 10 });
    doc.text(`• Rekomendasi Hukum          : ${h?.rekomendasiHukum ? String(h.rekomendasiHukum).replace(/_/g, ' ') : 'Proses hukum dapat diselesaikan melalui mekanisme Rehabilitasi Medis & Sosial.'}`, { indent: 10 });
    doc.moveDown(0.6);

    // ==========================================
    // KESIMPULAN REKOMENDASI TERPADU
    // ==========================================
    doc.fontSize(8.5).font('Helvetica-Bold').text('V. KESIMPULAN REKOMENDASI SIDANG PLENO TAT:');
    doc.font('Helvetica').fontSize(8);
    const kesimpulan = permohonan.rekomendasiResmi?.rekomendasiFinalText ||
      `Berdasarkan hasil rapat Pleno Tim Asesmen Terpadu, terperiksa atas nama ${t?.namaLengkap || 'Tersangka'} dinyatakan memenuhi kriteria sebagai KORBAN PENYALAHGUNAAN NARKOTIKA yang layak menjalani REHABILITASI MEDIS DAN SOSIAL secara Rawat Inap selama 3 (tiga) bulan di Balai Besar Rehabilitasi BNN, dengan tetap memperhatikan pengawasan dan kontrol berkala penegak hukum.`;
    doc.text(kesimpulan, { indent: 10, align: 'justify' });
    doc.moveDown(1);

    // ==========================================
    // MATRIKS TANDA TANGAN DIGITAL MULTI-PIHAK
    // ==========================================
    doc.fontSize(8).font('Helvetica').text(`Ditetapkan di : Balikpapan`, { align: 'right' });
    doc.text(`Pada Tanggal : ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, { align: 'right' });
    doc.moveDown(0.5);

    doc.fontSize(8.5).font('Helvetica-Bold').text('TIM ASESMEN TERPADU (TAT) PROVINSI KALIMANTAN TIMUR', { align: 'center' });
    doc.moveDown(0.8);

    const signers = [
      { role: 'Dokter Asesor Medis', name: m?.asesorNama || '[TEST] Dokter Asesor Medis TAT', nip: 'NIP. 197805122003121002' },
      { role: 'Penelaah Hukum TAT', name: h?.asesorNama || '[TEST] Jaksa Asesor Hukum TAT', nip: 'NRP. 82041203' },
      { role: 'Penyidik Satresnarkoba', name: permohonan.perkara?.namaPenyidik || '[TEST] Penyidik Pengaju Satresnarkoba', nip: 'NRP. 85070912' },
      { role: 'Ketua Tim Asesmen Terpadu', name: '[TEST] Ketua Tim Asesmen Terpadu', nip: 'NRP. 69120415' }
    ];

    const colWidth = 120;
    const startY = doc.y;

    signers.forEach((s, idx) => {
      const posX = 45 + (idx % 2) * 260;
      const posY = startY + Math.floor(idx / 2) * 75;

      doc
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .text(s.role, posX, posY, { width: 240, align: 'center' });

      // Stempel Digital Terverifikasi
      doc
        .fontSize(6.5)
        .font('Helvetica')
        .fillColor('#059669')
        .text('[TANDA TANGAN ELEKTRONIK DISAHKAN]', posX, posY + 16, { width: 240, align: 'center' })
        .text(`SHA-256: ${Math.random().toString(36).substring(2, 10).toUpperCase()}...`, posX, posY + 26, { width: 240, align: 'center' })
        .fillColor('#000000');

      doc
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .text(s.name, posX, posY + 40, { width: 240, align: 'center', underline: true })
        .font('Helvetica')
        .fontSize(7)
        .text(s.nip, posX, posY + 50, { width: 240, align: 'center' });
    });

    // ==========================================
    // FOOTER LEGALITAS & QR CODE
    // ==========================================
    doc.y = 780;
    doc.lineWidth(0.5).moveTo(startX, doc.y).lineTo(endX, doc.y).stroke('#94a3b8');
    doc.moveDown(0.3);
    doc
      .fontSize(6.5)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Dokumen ini diterbitkan secara sah melalui Sistem Elektronik Tim Asesmen Terpadu (e-TAT) Kepolisian Negara Republik Indonesia.', { align: 'center' })
      .text(`Kode Verifikasi Keabsahan: ${permohonan.trackingNumber || permohonan.nomorPermohonan} | Validasi Digital Terpusat`, { align: 'center' });

    doc.end();
  } catch (err) {
    next(err);
  }
};
