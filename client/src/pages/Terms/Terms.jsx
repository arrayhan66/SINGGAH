import MainLayout from "../../layouts/MainLayout"

export default function Terms() {
  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-3xl px-6 py-16 text-slate-900 dark:text-white">
        <h1 className="text-3xl font-black sm:text-4xl">
          Syarat dan Ketentuan
        </h1>
        <p className="mt-4 leading-relaxed">
          Dengan menggunakan SINGGAH, kamu menyetujui ketentuan berikut saat
          mengirim karya, membaca berita, atau memanfaatkan layanan situs.
        </p>
        <h2 className="mt-8 text-xl font-bold">Konten karya</h2>
        <p className="mt-2 leading-relaxed">
          Pengirim bertanggung jawab atas keaslian karya dan informasi yang
          dimasukkan. Tim SINGGAH dapat menolak atau menghapus konten yang
          melanggar hukum, menyesatkan, atau tidak sesuai dengan tujuan situs.
        </p>
        <h2 className="mt-8 text-xl font-bold">Penggunaan data</h2>
        <p className="mt-2 leading-relaxed">
          Data yang dikirim digunakan untuk mengelola akun, memproses karya, dan
          menjaga keamanan layanan. Informasi kontak publik hanya digunakan
          untuk keperluan resmi SINGGAH.
        </p>
        <h2 className="mt-8 text-xl font-bold">Kontak</h2>
        <p className="mt-2 leading-relaxed">
          Pertanyaan tentang ketentuan ini dapat dikirim ke{" "}
          <a className="text-cyan-600 underline dark:text-cyan-300" href="mailto:singgah.poliban@gmail.com">
            singgah.poliban@gmail.com
          </a>
          .
        </p>
      </section>
    </MainLayout>
  )
}
