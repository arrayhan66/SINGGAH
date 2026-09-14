import atomicImg from "../../assets/images/coverbuku/ATMOICHABITS.webp"
import cppImg from "../../assets/images/coverbuku/buku pemrograman c++.webp"
import eragonImg from "../../assets/images/coverbuku/Christopher-Paolini-Eragon.webp"
import bintangImg from "../../assets/images/coverbuku/cover-novel-bintang-karya-tere-liye.webp"
import dasarImg from "../../assets/images/coverbuku/dasar-dasarpemrograman.webp"
import demonImg from "../../assets/images/coverbuku/demoninthewood.webp"
import einsteinImg from "../../assets/images/coverbuku/einsteinwalterisaacson.webp"
import terasImg from "../../assets/images/coverbuku/filosofi teras.webp"
import gusImg from "../../assets/images/coverbuku/gustirabykatakokoh.webp"
import attaImg from "../../assets/images/coverbuku/mohammadattauntuknegeriku.webp"
import aiImg from "../../assets/images/coverbuku/pemrograman berbasis kecerdansan buatan.webp"
import sherlockImg from "../../assets/images/coverbuku/sherlock holmes.webp"
import akuImg from "../../assets/images/coverbuku/aku.webp"
import pythonImg from "../../assets/images/coverbuku/bukupython.webp"
import gadisjalananImg from "../../assets/images/coverbuku/gadisjalanan.webp"
import gahziImg from "../../assets/images/coverbuku/gahzi.webp"
import tanahjawaImg from "../../assets/images/coverbuku/kisah tanah jawa.webp"
import khilafahImg from "../../assets/images/coverbuku/knhilafah.webp"
import laskarImg from "../../assets/images/coverbuku/laskar-pelangi.webp"
import makanyamikirImg from "../../assets/images/coverbuku/makanyamikir.webp"
import anandaImg from "../../assets/images/coverbuku/saat ananda bertanya islam.webp"
import samuelImg from "../../assets/images/coverbuku/samuel.webp"
import stephenkingImg from "../../assets/images/coverbuku/stephenking.webp"
import putusinImg from "../../assets/images/coverbuku/udahputusin aja.webp"

export const BOOK_COVER_FILES = {
  aku: akuImg,
  ATMOICHABITS: atomicImg,
  atmoichabits: atomicImg,
  atomic: atomicImg,
  "buku pemrograman c++": cppImg,
  cpp: cppImg,
  bukupython: pythonImg,
  python: pythonImg,
  "Christopher-Paolini-Eragon": eragonImg,
  eragon: eragonImg,
  "cover-novel-bintang-karya-tere-liye": bintangImg,
  bintang: bintangImg,
  "dasar-dasarpemrograman": dasarImg,
  dasar: dasarImg,
  golang: dasarImg,
  demoninthewood: demonImg,
  demon: demonImg,
  einsteinwalterisaacson: einsteinImg,
  einstein: einsteinImg,
  "filosofi teras": terasImg,
  teras: terasImg,
  gadisjalanan: gadisjalananImg,
  gahzi: gahziImg,
  gustirabykatakokoh: gusImg,
  gus: gusImg,
  "kisah tanah jawa": tanahjawaImg,
  tanahjawa: tanahjawaImg,
  knhilafah: khilafahImg,
  khilafah: khilafahImg,
  "laskar-pelangi": laskarImg,
  laskar: laskarImg,
  makanyamikir: makanyamikirImg,
  mohammadattauntuknegeriku: attaImg,
  atta: attaImg,
  "pemrograman berbasis kecerdansan buatan": aiImg,
  fullstack: aiImg,
  ai: aiImg,
  "saat ananda bertanya islam": anandaImg,
  ananda: anandaImg,
  samuel: samuelImg,
  "sherlock holmes": sherlockImg,
  sherlock: sherlockImg,
  stephenking: stephenkingImg,
  "udahputusin aja": putusinImg,
  putusin: putusinImg,
}

export const PRIMARY_BOOK_KEYS = [
  "aku",
  "ATMOICHABITS",
  "buku pemrograman c++",
  "bukupython",
  "Christopher-Paolini-Eragon",
  "cover-novel-bintang-karya-tere-liye",
  "dasar-dasarpemrograman",
  "demoninthewood",
  "einsteinwalterisaacson",
  "filosofi teras",
  "gadisjalanan",
  "gahzi",
  "gustirabykatakokoh",
  "kisah tanah jawa",
  "knhilafah",
  "laskar-pelangi",
  "makanyamikir",
  "mohammadattauntuknegeriku",
  "pemrograman berbasis kecerdansan buatan",
  "saat ananda bertanya islam",
  "samuel",
  "sherlock holmes",
  "stephenking",
  "udahputusin aja",
]

export const DEFAULT_COVER_KEY = "atomic"

export function getRandomUniqueBookKeys(count = 2, excludeKeys = []) {
  const available = PRIMARY_BOOK_KEYS.filter((k) => !excludeKeys.includes(k))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
