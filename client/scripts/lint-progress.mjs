#!/usr/bin/env node
// eslint . tanpa indikator progres让人觉得 "loading".
//
// ESLint tidak punya API streaming, jadi file diproses satu per satu lewat
// lintText() dan hasil<Message> dikumpulkan, lalu dicetak|format stylish
// di akhir agar output-nya sama persis dengan `eslint .`.
//
// Dipakai: npm run lint  ->  node scripts/lint-progress.mjs

import { ESLint } from "eslint"
import { readdir, readFile } from "node:fs/promises"
import { relative, resolve, sep } from "node:path"
import process from "node:process"

const ROOT = resolve(import.meta.dirname, "..")
const EXTENSIONS = new Set([".js", ".jsx"])
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "coverage", ".vite"])

const isTTY = process.stdout.isTTY === true

async function collectFiles(dir, found = []) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return found
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".") continue

    const full = resolve(dir, entry.name)

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      await collectFiles(full, found)
      continue
    }

    // .js/.jsx dan .mjs/.cjs ikut karena beberapa skrip di root memakai ekstensi itu.
    const dot = entry.name.lastIndexOf(".")
    if (dot === -1) continue

    const ext = entry.name.slice(dot)
    if (EXTENSIONS.has(ext) || ext === ".mjs" || ext === ".cjs") {
      found.push(full)
    }
  }

  return found
}

const bar = (done, total) => {
  const width = 24
  const ratio = total === 0 ? 1 : done / total
  const filled = Math.round(width * ratio)
  return "█".repeat(filled) + "░".repeat(width - filled)
}

function render(done, total, state, currentFile) {
  const pct = total === 0 ? 100 : Math.round((done / total) * 100)
  const line =
    `  ${bar(done, total)} ${String(pct).padStart(3)}%  ` +
    `${done}/${total}  ⚠ ${state.warnings}  ✖ ${state.errors}  ${currentFile}`

  if (isTTY) {
    process.stdout.write(`\r${line.padEnd(100).slice(0, 100)}`)
  }
}

const started = Date.now()
const files = await collectFiles(ROOT)

if (files.length === 0) {
  console.log("Tidak ada file .js/.jsx yang perlu di-lint.")
  process.exit(0)
}

const eslint = new ESLint({ cwd: ROOT })
const results = []
const state = { errors: 0, warnings: 0 }

for (const [index, file] of files.entries()) {
  const rel = relative(ROOT, file).split(sep).join("/")

  try {
    const source = await readFile(file, "utf8")
    const [result] = await eslint.lintText(source, { filePath: file })

    if (result) {
      results.push(result)
      state.errors += result.errorCount
      state.warnings += result.warningCount
    }
  } catch (err) {
    // Satu file bermasalah tidak boleh menghentikan seluruh lint.
    state.errors += 1
    results.push({
      filePath: file,
      messages: [
        {
          ruleId: null,
          severity: 2,
          message: `Gagal diproses: ${err.message}`,
          line: 0,
          column: 0,
        },
      ],
      errorCount: 1,
      warningCount: 0,
    })
  }

  render(index + 1, files.length, state, rel)
}

if (isTTY) process.stdout.write("\n")

// Hanya file yang benar-benar punya masalah, supaya output tidak dibanjiri
// nama file yang bersih.
const withMessages = results.filter((result) => result.messages.length > 0)

const formatter = await eslint.loadFormatter("stylish")
const output = await formatter.format(withMessages)

if (output) process.stdout.write(`${output}\n`)

const seconds = ((Date.now() - started) / 1000).toFixed(1)
console.log(
  `Selesai: ${files.length} file dalam ${seconds}s — ` +
    `${state.errors} error, ${state.warnings} warning`,
)

process.exit(state.errors > 0 ? 1 : 0)
