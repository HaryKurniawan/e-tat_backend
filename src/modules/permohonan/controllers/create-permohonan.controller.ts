import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendCreated } from '../../../utils/response.util';
import { generateTrackingNumber } from '../../../utils/nomor.util';
import { createPermohonanSchema } from '../permohonan.schema';
import { permohonanFullInclude } from '../permohonan.helper';
import { logAudit } from '../../../utils/audit.util';

/**
 * POST /api/permohonan
 * Pengaju: Buat permohonan baru (status: DRAFT)
 */
export const createPermohonan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = createPermohonanSchema.parse(req.body);
    const trackingNumber = generateTrackingNumber();

    const data = await prisma.permohonanAsesmen.create({
      data: {
        trackingNumber,
        nomorPermohonan: `DRAFT-${trackingNumber}`,
        pengajuId: req.user!.id,
        instansiPengaju: req.user!.name,
        applicationStatus: 'DRAFT',
        medicalStatus: 'NOT_STARTED',
        legalStatus: 'NOT_STARTED',
        deliveryStatus: 'NOT_ISSUED',
        followupStatus: 'NOT_APPLICABLE_YET',
        jenisPengajuan: input.jenisPengajuan,
        metodePelaksanaan: input.metodePelaksanaan,
        satuanKerjaTujuan: input.satuanKerjaTujuan,
        terperiksa: {
          create: {
            ...input.terperiksa,
            tanggalLahir: new Date(input.terperiksa.tanggalLahir),
          },
        },
        perkara: {
          create: {
            ...input.perkara,
            tanggalLp: new Date(input.perkara.tanggalLp),
            tanggalWaktuPenangkapan: input.perkara.tanggalWaktuPenangkapan
              ? new Date(input.perkara.tanggalWaktuPenangkapan)
              : undefined,
            barangBuktiList: {
              create: input.perkara.barangBuktiList.map((bb) => ({
                ...bb,
                tanggalSuratLab: bb.tanggalSuratLab ? new Date(bb.tanggalSuratLab) : undefined,
              })),
            },
          },
        },
      },
      include: permohonanFullInclude,
    });

    await logAudit({
      actorId: req.user!.id,
      actorNama: req.user!.name,
      actorPeran: req.user!.role,
      permohonanId: data.id,
      aksi: 'BUAT_PERMOHONAN',
      rincian: `Membuat permohonan baru untuk ${input.terperiksa.namaLengkap}`,
    });

    sendCreated(res, data, 'Permohonan berhasil dibuat');
  } catch (err) {
    next(err);
  }
};
