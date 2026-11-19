import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendCreated } from '../../../utils/response.util';
import { generateTrackingNumber, generateNomorPermohonan } from '../../../utils/nomor.util';
import { createPermohonanSchema } from '../permohonan.schema';
import { permohonanFullInclude } from '../permohonan.helper';
import { logAudit } from '../../../utils/audit.util';
import { sendNotifikasiPermohonanBaruEmail } from '../../../services/email.service';

const safeDate = (val?: string | null): Date | undefined => {
  if (!val || typeof val !== 'string' || val.trim() === '') return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
};

/**
 * POST /api/permohonan
 * Pengaju: Buat permohonan baru (langsung berstatus SUBMITTED masuk ke antrean verifikasi)
 */
export const createPermohonan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = createPermohonanSchema.parse(req.body);
    const trackingNumber = generateTrackingNumber();
    const nomorPermohonan = await generateNomorPermohonan();

    const { barangBuktiList, ...perkaraFields } = input.perkara;

    const data = await prisma.permohonanAsesmen.create({
      data: {
        trackingNumber,
        nomorPermohonan,
        pengajuId: req.user!.id,
        instansiPengaju: req.user!.agency || req.user!.name,
        applicationStatus: 'SUBMITTED',
        medicalStatus: 'NOT_STARTED',
        legalStatus: 'NOT_STARTED',
        deliveryStatus: 'NOT_ISSUED',
        followupStatus: 'NOT_APPLICABLE_YET',
        jenisPengajuan: input.jenisPengajuan,
        metodePelaksanaan: input.metodePelaksanaan,
        satuanKerjaTujuan: input.satuanKerjaTujuan,
        terperiksa: {
          create: {
            namaLengkap: input.terperiksa.namaLengkap,
            alias: input.terperiksa.alias || undefined,
            nik: input.terperiksa.nik || undefined,
            isNikVerified: input.terperiksa.isNikVerified,
            statusIdentitasKhusus: input.terperiksa.statusIdentitasKhusus || undefined,
            tempatLahir: input.terperiksa.tempatLahir,
            tanggalLahir: new Date(input.terperiksa.tanggalLahir),
            usia: input.terperiksa.usia,
            jenisKelamin: input.terperiksa.jenisKelamin,
            pekerjaan: input.terperiksa.pekerjaan || undefined,
            alamatKtp: input.terperiksa.alamatKtp,
            alamatDomisili: input.terperiksa.alamatDomisili || undefined,
            namaWaliPendamping: input.terperiksa.namaWaliPendamping || undefined,
            kontakWali: input.terperiksa.kontakWali || undefined,
          },
        },
        perkara: {
          create: {
            nomorLaporanPolisi: perkaraFields.nomorLaporanPolisi,
            tanggalLp: new Date(perkaraFields.tanggalLp),
            instansiPenyidik: perkaraFields.instansiPenyidik,
            namaPenyidik: perkaraFields.namaPenyidik,
            nomorHpPenyidik: perkaraFields.nomorHpPenyidik,
            pasalDipersangkakan: perkaraFields.pasalDipersangkakan,
            tempatKejadianPerkara: perkaraFields.tempatKejadianPerkara,
            tanggalWaktuPenangkapan: safeDate(perkaraFields.tanggalWaktuPenangkapan),
            kronologiSingkat: perkaraFields.kronologiSingkat,
            barangBuktiList: {
              create: barangBuktiList.map((bb) => ({
                jenisZat: bb.jenisZat,
                beratKotorGram: bb.beratKotorGram ?? undefined,
                beratBersihGram: bb.beratBersihGram,
                statusUjiLab: bb.statusUjiLab,
                nomorSuratLab: bb.nomorSuratLab || undefined,
                tanggalSuratLab: safeDate(bb.tanggalSuratLab),
                keterangan: bb.keterangan || undefined,
                fotoBarangBuktiUrl: bb.fotoBarangBuktiUrl || undefined,
                fotoUjiLabUrl: bb.fotoUjiLabUrl || undefined,
              })),
            },
          },
        },
        dokumenList: input.dokumenList && input.dokumenList.length > 0
          ? {
              create: input.dokumenList.map((doc) => ({
                nama: doc.nama,
                kode: doc.kode || undefined,
                wajib: doc.wajib,
                keterangan: doc.keterangan || undefined,
                fileUrl: doc.fileUrl || undefined,
                fileName: doc.fileName || undefined,
                fileSize: doc.fileSize || undefined,
                statusVerifikasi: doc.statusVerifikasi || (doc.fileUrl ? 'sesuai' : 'belum_diunggah'),
                uploadedAt: doc.fileUrl ? new Date() : undefined,
                catatanKoreksi: doc.catatanKoreksi || undefined,
                versi: doc.versi || 1,
              })),
            }
          : undefined,
      },
      include: permohonanFullInclude,
    });

    await logAudit({
      actorId: req.user!.id,
      actorNama: req.user!.name,
      actorPeran: req.user!.role,
      permohonanId: data.id,
      aksi: 'SUBMIT_PERMOHONAN',
      rincian: `Permohonan ${nomorPermohonan} diajukan untuk verifikasi (${input.terperiksa.namaLengkap})`,
    });

    // Kirim notifikasi email ke Admin / Sekretariat TAT
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN', isActive: true },
    });

    if (adminUser?.email) {
      sendNotifikasiPermohonanBaruEmail({
        adminEmail: adminUser.email,
        nomorPermohonan,
        trackingNumber: data.trackingNumber,
        namaPemohon: req.user!.name,
        instansiPemohon: req.user!.agency || 'Penyidik POLRI',
        terperiksaNama: input.terperiksa.namaLengkap,
        nomorLp: perkaraFields.nomorLaporanPolisi,
      }).catch((err) => {
        console.error('❌ Gagal mengirim notifikasi email permohonan baru ke Admin:', err);
      });
    }

    sendCreated(res, data, 'Permohonan berhasil dibuat dan diajukan');
  } catch (err) {
    next(err);
  }
};
