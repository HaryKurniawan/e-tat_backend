import { PerkaraDetails } from './types';

/**
 * Format tanggal Indonesia formal dengan waktu
 */
export const formatTglIndo = (d?: Date | string | null): string => {
  if (!d) return '-';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
};

/**
 * Format tanggal lahir / tanpa jam
 */
export const formatTglHanya = (d?: Date | string | null): string => {
  if (!d) return '-';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Render Tabel Barang Bukti Format Formal
 */
export const renderBarangBuktiTable = (list?: PerkaraDetails['barangBuktiList']): string => {
  if (!list || list.length === 0) {
    return '<tr><td colspan="5" style="padding: 10px; text-align: center; color: #64748b; font-style: italic; border: 1px solid #cbd5e1;">Tidak ada data barang bukti tercatat.</td></tr>';
  }

  return list
    .map(
      (bb, index) => `
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #cbd5e1; text-align: center; color: #475569;">${index + 1}</td>
      <td style="padding: 7px 10px; border: 1px solid #cbd5e1; font-weight: 500; color: #0f172a;">${bb.jenisZat}</td>
      <td style="padding: 7px 10px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">${bb.beratBersihGram} gram</td>
      <td style="padding: 7px 10px; border: 1px solid #cbd5e1; text-align: right; color: #475569;">${bb.beratKotorGram ? bb.beratKotorGram + ' gram' : '-'}</td>
      <td style="padding: 7px 10px; border: 1px solid #cbd5e1; text-align: center;">
        <span style="display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: 600; border-radius: 3px; background-color: ${
          bb.statusUjiLab === 'positif' ? '#fef2f2; color: #991b1b; border: 1px solid #fecaca;' : '#f1f5f9; color: #475569;'
        }">
          ${bb.statusUjiLab ? bb.statusUjiLab.toUpperCase() : 'BELUM UJI LAB'}
        </span>
      </td>
    </tr>
  `
    )
    .join('');
};
