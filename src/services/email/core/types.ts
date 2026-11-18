export interface PerkaraDetails {
  nomorLaporanPolisi: string;
  tanggalLp?: Date | string | null;
  instansiPenyidik: string;
  namaPenyidik: string;
  nomorHpPenyidik: string;
  pasalDipersangkakan: string;
  tempatKejadianPerkara: string;
  kronologiSingkat?: string | null;
  barangBuktiList?: Array<{
    jenisZat: string;
    beratBersihGram: number;
    beratKotorGram?: number | null;
    statusUjiLab?: string;
  }>;
}

export interface TerperiksaDetails {
  namaLengkap: string;
  alias?: string | null;
  nik?: string | null;
  tempatLahir?: string | null;
  tanggalLahir?: Date | string | null;
  usia?: number | null;
  jenisKelamin?: string | null;
  pekerjaan?: string | null;
  alamatKtp?: string | null;
  alamatDomisili?: string | null;
}
