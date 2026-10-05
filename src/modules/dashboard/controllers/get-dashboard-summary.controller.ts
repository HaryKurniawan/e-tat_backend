import { Request, Response, NextFunction } from 'express';
import { ApplicationStatus, AssessmentStatus, DeliveryStatus, UserRole } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess } from '../../../utils/response.util';

/**
 * Mendapatkan ringkasan metrik dashboard sesuai role pengguna
 */
export const getDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    if (user.role === UserRole.ADMIN) {
      const [
        totalPermohonan,
        menungguVerifikasi,
        sedangAsesmen,
        rekomendasiTerbit,
        mendekatiSla,
        registrasiPending,
      ] = await Promise.all([
        prisma.permohonanAsesmen.count(),
        prisma.permohonanAsesmen.count({
          where: { applicationStatus: ApplicationStatus.SUBMITTED },
        }),
        prisma.permohonanAsesmen.count({
          where: { applicationStatus: ApplicationStatus.ASSESSMENT_ACTIVE },
        }),
        prisma.permohonanAsesmen.count({
          where: { deliveryStatus: DeliveryStatus.ISSUED_NOT_DELIVERED },
        }),
        prisma.permohonanAsesmen.count({
          where: { isMendekatiTenggat: true },
        }),
        prisma.registrasiPengguna.count({
          where: { status: 'pending' },
        }),
      ]);

      sendSuccess(
        res,
        {
          role: user.role,
          metrics: {
            totalPermohonan,
            menungguVerifikasi,
            sedangAsesmen,
            rekomendasiTerbit,
            mendekatiSla,
            registrasiPending,
          },
        },
        'Statistik dashboard admin berhasil diambil'
      );
      return;
    }

    if (user.role === UserRole.PENGAJU) {
      const [totalDiajukan, draft, inReview, inAssessment, completed, delivered] =
        await Promise.all([
          prisma.permohonanAsesmen.count({ where: { pengajuId: user.id } }),
          prisma.permohonanAsesmen.count({
            where: { pengajuId: user.id, applicationStatus: ApplicationStatus.DRAFT },
          }),
          prisma.permohonanAsesmen.count({
            where: {
              pengajuId: user.id,
              applicationStatus: {
                in: [ApplicationStatus.SUBMITTED, ApplicationStatus.ADMIN_REVIEW],
              },
            },
          }),
          prisma.permohonanAsesmen.count({
            where: { pengajuId: user.id, applicationStatus: ApplicationStatus.ASSESSMENT_ACTIVE },
          }),
          prisma.permohonanAsesmen.count({
            where: { pengajuId: user.id, applicationStatus: ApplicationStatus.RESULTS_ISSUED },
          }),
          prisma.permohonanAsesmen.count({
            where: { pengajuId: user.id, deliveryStatus: DeliveryStatus.DELIVERED },
          }),
        ]);

      sendSuccess(
        res,
        {
          role: user.role,
          metrics: {
            totalDiajukan,
            draft,
            inReview,
            inAssessment,
            completed,
            delivered,
          },
        },
        'Statistik dashboard pengaju berhasil diambil'
      );
      return;
    }

    if (user.role === UserRole.MEDIS) {
      const [tugasAsesmen, belumMulai, sedangDikerjakan, selesai] = await Promise.all([
        prisma.timAsesmen.count({ where: { asesorMedisId: user.id } }),
        prisma.permohonanAsesmen.count({
          where: {
            timAsesmen: { asesorMedisId: user.id },
            medicalStatus: AssessmentStatus.NOT_STARTED,
          },
        }),
        prisma.permohonanAsesmen.count({
          where: {
            timAsesmen: { asesorMedisId: user.id },
            medicalStatus: AssessmentStatus.DRAFT,
          },
        }),
        prisma.permohonanAsesmen.count({
          where: {
            timAsesmen: { asesorMedisId: user.id },
            medicalStatus: AssessmentStatus.FINAL,
          },
        }),
      ]);

      sendSuccess(
        res,
        {
          role: user.role,
          metrics: {
            tugasAsesmen,
            belumMulai,
            sedangDikerjakan,
            selesai,
          },
        },
        'Statistik dashboard tim medis berhasil diambil'
      );
      return;
    }

    if (user.role === UserRole.HUKUM) {
      const [tugasTelaah, belumMulai, sedangDikerjakan, selesai] = await Promise.all([
        prisma.timAsesmen.count({ where: { asesorHukumId: user.id } }),
        prisma.permohonanAsesmen.count({
          where: {
            timAsesmen: { asesorHukumId: user.id },
            legalStatus: AssessmentStatus.NOT_STARTED,
          },
        }),
        prisma.permohonanAsesmen.count({
          where: {
            timAsesmen: { asesorHukumId: user.id },
            legalStatus: AssessmentStatus.DRAFT,
          },
        }),
        prisma.permohonanAsesmen.count({
          where: {
            timAsesmen: { asesorHukumId: user.id },
            legalStatus: AssessmentStatus.FINAL,
          },
        }),
      ]);

      sendSuccess(
        res,
        {
          role: user.role,
          metrics: {
            tugasTelaah,
            belumMulai,
            sedangDikerjakan,
            selesai,
          },
        },
        'Statistik dashboard tim hukum berhasil diambil'
      );
      return;
    }

    sendSuccess(res, { role: user.role, metrics: {} }, 'Statistik dashboard');
  } catch (err) {
    next(err);
  }
};
