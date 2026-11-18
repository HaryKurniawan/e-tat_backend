import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../../../config/database';
import { env } from '../../../config/env';
import { sendSuccess, sendUnauthorized, sendError } from '../../../utils/response.util';
import { generateTokens } from '../auth.helper';
import { logAudit } from '../../../utils/audit.util';
import { z } from 'zod';

const googleAuthSchema = z.object({
  credential: z.string().optional(),
  accessToken: z.string().optional(),
}).refine(data => Boolean(data.credential || data.accessToken), {
  message: 'Google credential atau accessToken wajib disertakan',
});

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID || '89640463303-v04joskaeksi6no0o0llghj8dvv6ampo.apps.googleusercontent.com');

/**
 * POST /api/auth/google
 * Login menggunakan Google Identity Services (GIS)
 * Aturan: Hanya akun yang SUDAH TERVERIFIKASI / DISETUJUI ADMIN di database yang dapat login.
 * Sistem TIDAK melakukan auto-create akun baru.
 */
export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { credential, accessToken } = googleAuthSchema.parse(req.body);

    // 1. Verifikasi Google ID Token atau Access Token
    let googleEmail: string | undefined;
    let googleName: string | undefined;

    try {
      if (credential) {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: env.GOOGLE_CLIENT_ID || '89640463303-v04joskaeksi6no0o0llghj8dvv6ampo.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          sendUnauthorized(res, 'Token autentikasi Google tidak valid atau email tidak terbaca');
          return;
        }
        googleEmail = payload.email.toLowerCase().trim();
        googleName = payload.name;
      } else if (accessToken) {
        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!userinfoRes.ok) {
          sendUnauthorized(res, 'Akses token Google tidak valid atau telah kedaluwarsa');
          return;
        }
        const userinfo = (await userinfoRes.json()) as any;
        if (!userinfo.email) {
          sendUnauthorized(res, 'Email tidak ditemukan dari akun Google');
          return;
        }
        googleEmail = userinfo.email.toLowerCase().trim();
        googleName = userinfo.name;
      }
    } catch (verifyErr: any) {
      console.error('✘ Google Token Verification Error:', verifyErr?.message || verifyErr);
      sendUnauthorized(res, 'Gagal memverifikasi akun Google: ' + (verifyErr?.message || 'Token tidak valid'));
      return;
    }

    // 2. Cek apakah user ada di tabel User (akun resmi yang sudah diverifikasi admin)
    const user = await prisma.user.findUnique({
      where: { email: googleEmail },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        isActive: true,
        nip: true,
        agency: true,
        position: true,
        phone: true,
      },
    });

    // 3. JIKA USER TIDAK ADA: JANGAN AUTO-CREATE! Berikan pesan spesifik status pendaftarannya
    if (!user) {
      // Cek apakah ada di tabel registrasi pengguna untuk memberikan keterangan yang akurat
      const registrasi = await prisma.registrasiPengguna.findFirst({
        where: { email: googleEmail },
        orderBy: { createdAt: 'desc' },
      });

      if (registrasi) {
        if (registrasi.status === 'pending') {
          sendUnauthorized(
            res,
            `Akun Google Anda (${googleEmail}) sudah diajukan namun MASIH MENUNGGU VERIFIKASI / PERSETUJUAN oleh Admin Sekretariat TAT. Silakan tunggu hingga akun disetujui.`
          );
          return;
        }

        if (registrasi.status === 'rejected') {
          sendUnauthorized(
            res,
            `Pendaftaran akun Anda (${googleEmail}) DITOLAK oleh Admin. Catatan: "${registrasi.catatanAdmin || 'Berkas persyaratan belum memenuhi syarat.'}". Silakan ajukan registrasi ulang.`
          );
          return;
        }
      }

      // Jika belum pernah mendaftar sama sekali
      sendUnauthorized(
        res,
        `Akun Google (${googleEmail}) belum terdaftar sebagai personel resmi Tim Asesmen Terpadu (TAT). Silakan mendaftar terlebih dahulu melalui menu Registrasi Akun.`
      );
      return;
    }

    // 4. JIKA USER ADA TAPI DINONAKTIFKAN
    if (!user.isActive) {
      sendUnauthorized(
        res,
        `Akun dinas Anda (${googleEmail}) sedang dinonaktifkan oleh Administrator. Hubungi Sekretariat TAT untuk pengaktifan kembali.`
      );
      return;
    }

    // 5. Generate JWT tokens dan login
    const tokens = generateTokens(user);

    await logAudit({
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'LOGIN_GOOGLE',
      rincian: `Login berhasil menggunakan akun Google (${googleEmail}) dari IP ${req.ip}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          nip: user.nip,
          agency: user.agency,
          position: user.position,
          phone: user.phone,
        },
        ...tokens,
      },
      'Login dengan Google berhasil'
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const msg = (err as any).issues?.[0]?.message || (err as any).errors?.[0]?.message || 'Input credential tidak valid';
      sendError(res, msg, 400);
      return;
    }
    next(err);
  }
};
