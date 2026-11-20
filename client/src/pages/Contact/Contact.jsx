import MainLayout from "../../layouts/MainLayout"

export default function Contact() {
  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-3xl px-6 py-16 text-slate-900 dark:text-white">
        <h1 className="text-3xl font-black sm:text-4xl">Kontak SINGGAH</h1>
        <p className="mt-4 leading-relaxed">
          Hubungi tim SINGGAH untuk pertanyaan tentang karya, berita, atau
          proses pengajuan karya mahasiswa ElektroPoliban.
        </p>
        <ul className="mt-8 space-y-3 leading-relaxed">
          <li>
            Email:{" "}
            <a className="text-cyan-600 underline dark:text-cyan-300" href="mailto:singgah.poliban@gmail.com">
              singgah.poliban@gmail.com
            </a>
          </li>
          <li>
            Telepon:{" "}
            <a className="text-cyan-600 underline dark:text-cyan-300" href="tel:+625113305052">
              +62 511 330 5052
            </a>
          </li>
          <li>
            Alamat: Jl. Brig Jend. Hasan Basri, Pangeran, Banjarmasin Utara,
            Kota Banjarmasin, Kalimantan Selatan 70124
          </li>
        </ul>
      </section>
    </MainLayout>
  )
}
