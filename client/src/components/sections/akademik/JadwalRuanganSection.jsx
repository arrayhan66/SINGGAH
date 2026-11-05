import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  DoorOpen,
  MapPin,
  Users,
  X,
} from "lucide-react"
import AkademikNav from "../../akademik/AkademikNav"
import {
  STATUS_DISETUJUI,
  STATUS_DITOLAK,
  STATUS_MENUNGGU,
  jadwalMingguan,
  jamOperasional,
  ruanganList,
} from "../../../data/akademik/ruangan"

const STORAGE_KEY = "singgah-jadwal-ruangan-requests"
const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
const TYPE_FILTERS = ["Semua", "Ruang Kelas", "Laboratorium"]

function pad(value) {
  return String(value).padStart(2, "0")
}

function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseISODate(value) {
  return new Date(`${value}T00:00:00`)
}

function startOfWeek(date) {
  const copy = new Date(date)
  const day = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - day)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(date, amount) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + amount)
  return copy
}

function dayIndex(date) {
  return (date.getDay() + 6) % 7
}

function toMinutes(time) {
  const [hour, minute] = time.split(":").map(Number)
  return hour * 60 + minute
}

function toTime(minutes) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

function formatTimeRange(start, end) {
  return `${start.replace(":", ".")}–${end.replace(":", ".")}`
}

function formatDateLong(date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function overlaps(startA, endA, startB, endB) {
  return toMinutes(startA) < toMinutes(endB) && toMinutes(startB) < toMinutes(endA)
}

function loadRequests() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function statusClass(status) {
  if (status === STATUS_DISETUJUI) return "is-approved"
  if (status === STATUS_DITOLAK) return "is-rejected"
  return "is-pending"
}

export default function JadwalRuanganSection() {
  const navigate = useNavigate()
  const today = useMemo(() => new Date(), [])
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [selectedDay, setSelectedDay] = useState(() => dayIndex(new Date()))
  const [typeFilter, setTypeFilter] = useState("Semua")
  const [requests, setRequests] = useState(loadRequests)
  const [form, setForm] = useState({
    roomId: ruanganList[0].id,
    name: "",
    purpose: "",
    start: "08:00",
    duration: "120",
  })
  const [feedback, setFeedback] = useState(null)

  const selectedDate = addDays(weekStart, selectedDay)
  const selectedISO = toISODate(selectedDate)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
    } catch {
      setFeedback({
        type: "error",
        message: "Pengajuan tidak dapat disimpan di peramban ini.",
      })
    }
  }, [requests])

  const filteredRooms = ruanganList.filter(
    (room) => typeFilter === "Semua" || room.type === typeFilter,
  )

  const weeklyForDate = jadwalMingguan.filter(
    (entry) => entry.day === dayIndex(selectedDate),
  )

  const requestsForDate = requests.filter(
    (request) =>
      request.date === selectedISO && request.status !== STATUS_DITOLAK,
  )

  const dayEntries = useMemo(() => {
    const weekly = weeklyForDate.map((entry) => ({
      ...entry,
      date: selectedISO,
      source: "jadwal",
    }))
    const booked = requestsForDate.map((request) => ({
      id: request.id,
      roomId: request.roomId,
      start: request.start,
      end: request.end,
      title: request.purpose,
      owner: request.name,
      kind: "Pemesanan",
      status: request.status,
      source: "request",
      date: request.date,
    }))
    return [...weekly, ...booked].sort(
      (a, b) => toMinutes(a.start) - toMinutes(b.start),
    )
  }, [selectedISO, requestsForDate, weeklyForDate])

  const entriesForRoom = (roomId) =>
    dayEntries.filter((entry) => entry.roomId === roomId)

  const conflicts = ({ roomId, date, start, end }) => {
    const targetDay = dayIndex(parseISODate(date))
    const weekly = jadwalMingguan.filter(
      (entry) =>
        entry.roomId === roomId &&
        entry.day === targetDay &&
        overlaps(start, end, entry.start, entry.end),
    )
    const oneOff = requests.filter(
      (request) =>
        request.roomId === roomId &&
        request.date === date &&
        request.status !== STATUS_DITOLAK &&
        overlaps(start, end, request.start, request.end),
    )
    return weekly.length + oneOff.length > 0
  }

  const weekDays = Array.from({ length: 7 }, (_, index) => ({
    date: addDays(weekStart, index),
    index,
    name: DAY_NAMES[index],
  }))

  const handleDateChange = (value) => {
    if (!value) return
    const date = parseISODate(value)
    if (Number.isNaN(date.getTime())) return
    setWeekStart(startOfWeek(date))
    setSelectedDay(dayIndex(date))
  }

  const selectRoomForBooking = (roomId) => {
    setForm((prev) => ({ ...prev, roomId }))
    setFeedback(null)
    document
      .getElementById("ak-booking-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const duration = Number(form.duration)
    const startMinutes = toMinutes(form.start)
    const end = toTime(startMinutes + duration)
    const room = ruanganList.find((item) => item.id === form.roomId)

    if (!form.name.trim() || !form.purpose.trim()) {
      setFeedback({
        type: "error",
        message: "Nama pemohon dan tujuan penggunaan wajib diisi.",
      })
      return
    }

    if (startMinutes + duration > toMinutes("17:00")) {
      setFeedback({
        type: "error",
        message: "Durasi melewati jam operasional (17.00 WITA).",
      })
      return
    }

    if (conflicts({ roomId: form.roomId, date: selectedISO, start: form.start, end })) {
      setFeedback({
        type: "error",
        message: "Jadwal bentrok dengan agenda lain di ruangan ini.",
      })
      return
    }

    const request = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `req-${Date.now()}`,
      roomId: form.roomId,
      roomName: room?.name || "Ruangan",
      date: selectedISO,
      start: form.start,
      end,
      duration,
      name: form.name.trim(),
      purpose: form.purpose.trim(),
      status: STATUS_MENUNGGU,
      createdAt: new Date().toISOString(),
    }

    setRequests((prev) => [request, ...prev])
    setForm((prev) => ({ ...prev, name: "", purpose: "" }))
    setFeedback({
      type: "success",
      message: `Pengajuan ${room?.name} terkirim dan menunggu persetujuan petugas.`,
    })
  }

  const cancelRequest = (id) => {
    setRequests((prev) => prev.filter((request) => request.id !== id))
    setFeedback({
      type: "success",
      message: "Pengajuan dibatalkan dan dihapus dari daftar.",
    })
  }

  return (
    <section className="ak-section ak-jadwal-page">
      <div className="ak-section__grain" aria-hidden="true" />

      <div className="ak-container">
        <header className="ak-hero">
          <div>
            <div className="ak-eyebrow">
              <span>Lingkungan Akademik</span>
              <span className="ak-eyebrow__slash">/</span>
              <span>Jadwal Ruangan</span>
            </div>
            <h1 className="ak-display">
              Cek ruang yang <em>kosong</em>,
              <br />
              ajukan tanpa bentrok.
            </h1>
            <p className="ak-hero__lead">
              Lihat ketersediaan ruang kelas dan laboratorium Jurusan Teknik
              Elektro, lalu ajukan pemesanan untuk kegiatan akademik. Setiap
              pengajuan diperiksa petugas sebelum disetujui.
            </p>
          </div>

          <div className="ak-hero__aside">
            <span className="ak-hero__stamp">
              <CalendarDays size={18} />
              Jadwal & pemesanan
            </span>
            <div className="ak-hero__stats">
              <div>
                <strong>{String(ruanganList.length).padStart(2, "0")}</strong>
                <span>ruang</span>
              </div>
              <div>
                <strong>10</strong>
                <span>jam layanan</span>
              </div>
              <div>
                <strong>03</strong>
                <span>status pengajuan</span>
              </div>
            </div>
          </div>
        </header>

        <AkademikNav />

        <div className="ak-week">
          <div className="ak-week__nav">
            <button
              type="button"
              onClick={() => setWeekStart((prev) => addDays(prev, -7))}
              aria-label="Minggu sebelumnya"
            >
              <ArrowLeft size={17} />
            </button>
            <div>
              <span className="ak-kicker">Pekan berjalan</span>
              <strong>
                {new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "long",
                }).format(weekStart)}{" "}
                –{" "}
                {new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(addDays(weekStart, 6))}
              </strong>
            </div>
            <button
              type="button"
              onClick={() => setWeekStart((prev) => addDays(prev, 7))}
              aria-label="Minggu berikutnya"
            >
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="ak-week__days">
            {weekDays.map((day) => {
              const isToday = toISODate(day.date) === toISODate(today)
              return (
                <button
                  key={day.name}
                  type="button"
                  onClick={() => setSelectedDay(day.index)}
                  className={`ak-day ${selectedDay === day.index ? "is-active" : ""} ${
                    isToday ? "is-today" : ""
                  }`}
                  aria-pressed={selectedDay === day.index}
                >
                  <span>{day.name.slice(0, 3)}</span>
                  <strong>{day.date.getDate()}</strong>
                  {isToday && <small>hari ini</small>}
                </button>
              )
            })}
          </div>

          <div className="ak-week__toolbar">
            <div className="ak-filter">
              {TYPE_FILTERS.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={typeFilter === type ? "is-active" : ""}
                >
                  {type}
                </button>
              ))}
            </div>
            <label className="ak-date-field">
              <CalendarDays size={15} />
              <span>Tanggal</span>
              <input
                type="date"
                value={selectedISO}
                onChange={(event) => handleDateChange(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="ak-room-grid">
          {filteredRooms.map((room) => {
            const entries = entriesForRoom(room.id)
            return (
              <article key={room.id} className="ak-room-card">
                <div className="ak-room-card__media">
                  <img src={room.panorama} alt={`Panorama ${room.name}`} loading="lazy" />
                  <span className="ak-room-card__badge">360°</span>
                  <span className="ak-room-card__type">{room.type}</span>
                </div>
                <div className="ak-room-card__body">
                  <div className="ak-room-card__head">
                    <div>
                      <h2>{room.name}</h2>
                      <span className="ak-room-card__meta">
                        <MapPin size={13} /> {room.floor}
                        <Users size={13} /> {room.capacity} orang
                      </span>
                    </div>
                    <span className="ak-room-card__slot">
                      {entries.length === 0
                        ? "Kosong"
                        : `${entries.length} agenda`}
                    </span>
                  </div>

                  <ul className="ak-chip-list ak-chip-list--small">
                    {room.facilities.slice(0, 3).map((facility) => (
                      <li key={facility}>{facility}</li>
                    ))}
                  </ul>

                  <div className="ak-room-card__timeline" aria-hidden="true">
                    <div className="ak-room-card__lane">
                      {entries.map((entry) => {
                        const left =
                          ((toMinutes(entry.start) - toMinutes("07:00")) / 600) *
                          100
                        const width =
                          ((toMinutes(entry.end) - toMinutes(entry.start)) /
                            600) *
                          100
                        return (
                          <span
                            key={entry.id}
                            className={`ak-room-card__block ${
                              entry.source === "request" ? "is-request" : ""
                            }`}
                            style={{
                              left: `${Math.max(0, left)}%`,
                              width: `${Math.min(100 - left, width)}%`,
                            }}
                            title={`${entry.start}–${entry.end} ${entry.title}`}
                          />
                        )
                      })}
                    </div>
                    <div className="ak-room-card__axis">
                      <span>07</span>
                      <span>12</span>
                      <span>17</span>
                    </div>
                  </div>

                  <div className="ak-room-card__actions">
                    <button
                      type="button"
                      className="ak-btn ak-btn--ghost"
                      onClick={() =>
                        navigate(`/akademik/tur-virtual?scene=${room.sceneId}`)
                      }
                    >
                      <DoorOpen size={15} />
                      Lihat 360°
                    </button>
                    <button
                      type="button"
                      className="ak-btn ak-btn--ink"
                      onClick={() => selectRoomForBooking(room.id)}
                    >
                      Pesan ruang
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="ak-jadwal-grid">
          <div className="ak-agenda">
            <div className="ak-agenda__head">
              <div>
                <span className="ak-kicker">Agenda ruangan</span>
                <h2>{formatDateLong(selectedDate)}</h2>
              </div>
              <span className="ak-agenda__count">
                {dayEntries.length} agenda
              </span>
            </div>

            {dayEntries.length > 0 ? (
              <ol className="ak-agenda__list">
                {dayEntries.map((entry) => {
                  const room = ruanganList.find((item) => item.id === entry.roomId)
                  return (
                    <li key={entry.id}>
                      <span className="ak-agenda__time">
                        <strong>{entry.start}</strong>
                        <span>{entry.end}</span>
                      </span>
                      <span className="ak-agenda__line" aria-hidden="true" />
                      <div className="ak-agenda__body">
                        <h3>{entry.title}</h3>
                        <p>
                          {entry.owner} · {room?.name}
                        </p>
                      </div>
                      <span
                        className={`ak-tag ${
                          entry.source === "request"
                            ? statusClass(entry.status)
                            : entry.kind === "Praktikum"
                              ? "is-lab"
                              : "is-class"
                        }`}
                      >
                        {entry.source === "request" ? entry.status : entry.kind}
                      </span>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <div className="ak-agenda__empty">
                <Clock3 size={24} />
                <h3>Belum ada agenda</h3>
                <p>
                  Seluruh ruang pada tanggal ini belum memiliki jadwal tetap.
                  Waktu yang kosong dapat diajukan melalui formulir di samping.
                </p>
              </div>
            )}

            <div className="ak-legend">
              <span>
                <i className="is-class" /> Kuliah
              </span>
              <span>
                <i className="is-lab" /> Praktikum
              </span>
              <span>
                <i className="is-pending" /> Menunggu
              </span>
              <span>
                <i className="is-approved" /> Disetujui
              </span>
              <span>
                <i className="is-rejected" /> Ditolak
              </span>
            </div>
          </div>

          <aside className="ak-booking" id="ak-booking-panel">
            <div className="ak-booking__head">
              <span className="ak-kicker">Formulir pemesanan</span>
              <h2>Ajukan pemakaian ruang</h2>
              <p>
                Pilih ruangan, tentukan waktu, lalu jelaskan tujuan kegiatan.
                Petugas jurusan akan meninjau pengajuan.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="ak-form">
              <label>
                <span>Ruangan</span>
                <select
                  value={form.roomId}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, roomId: event.target.value }))
                  }
                >
                  {ruanganList.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} · {room.capacity} orang
                    </option>
                  ))}
                </select>
              </label>

              <div className="ak-form__row">
                <label>
                  <span>Tanggal</span>
                  <input
                    type="date"
                    value={selectedISO}
                    onChange={(event) => handleDateChange(event.target.value)}
                  />
                </label>
                <label>
                  <span>Mulai</span>
                  <select
                    value={form.start}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, start: event.target.value }))
                    }
                  >
                    {jamOperasional.slice(0, -1).map((time) => (
                      <option key={time} value={time}>
                        {time.replace(":", ".")} WITA
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span>Durasi</span>
                <select
                  value={form.duration}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      duration: event.target.value,
                    }))
                  }
                >
                  <option value="60">1 jam</option>
                  <option value="90">1,5 jam</option>
                  <option value="120">2 jam</option>
                  <option value="180">3 jam</option>
                </select>
              </label>

              <label>
                <span>Nama pemohon</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Nama lengkap atau organisasi"
                />
              </label>

              <label>
                <span>Tujuan penggunaan</span>
                <textarea
                  rows={3}
                  value={form.purpose}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, purpose: event.target.value }))
                  }
                  placeholder="Contoh: rapat koordinasi tugas akhir"
                />
              </label>

              {feedback && (
                <div className={`ak-feedback ${feedback.type}`} role="status">
                  {feedback.type === "success" ? (
                    <Check size={16} />
                  ) : (
                    <X size={16} />
                  )}
                  <p>{feedback.message}</p>
                </div>
              )}

              <button type="submit" className="ak-btn ak-btn--ink ak-btn--full">
                Kirim pengajuan
                <ArrowUpRight size={16} />
              </button>
            </form>

            <div className="ak-booking__statuses">
              <span className="ak-kicker">Arti status</span>
              <ul>
                <li>
                  <i className={statusClass(STATUS_MENUNGGU)} />
                  Menunggu persetujuan
                </li>
                <li>
                  <i className={statusClass(STATUS_DISETUJUI)} />
                  Disetujui petugas
                </li>
                <li>
                  <i className={statusClass(STATUS_DITOLAK)} />
                  Ditolak / perlu revisi
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <div className="ak-requests">
          <div className="ak-requests__head">
            <div>
              <span className="ak-kicker">Pengajuan terbaru</span>
              <h2>Status pemesanan</h2>
            </div>
            <span className="ak-requests__count">{requests.length} pengajuan</span>
          </div>

          {requests.length > 0 ? (
            <ul className="ak-requests__list">
              {requests.map((request) => (
                <li key={request.id}>
                  <div className="ak-requests__main">
                    <span className={`ak-tag ${statusClass(request.status)}`}>
                      {request.status}
                    </span>
                    <h3>{request.purpose}</h3>
                    <p>
                      {request.roomName} · {request.date} ·{" "}
                      {formatTimeRange(request.start, request.end)}
                    </p>
                  </div>
                  <div className="ak-requests__side">
                    <span>{request.name}</span>
                    {request.status === STATUS_MENUNGGU && (
                      <button
                        type="button"
                        onClick={() => cancelRequest(request.id)}
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="ak-requests__empty">
              <CalendarDays size={22} />
              <p>
                Belum ada pengajuan. Formulir di atas dapat langsung digunakan
                untuk mengajukan pemakaian ruang.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
