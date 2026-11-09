import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "../../services/api";
import { cloudinarySrc, isBrokenImage } from "../../utils/imageUrl";
import "./KategoriPopuler.css";

const CLICK_THRESHOLD_PX = 8;

const HEADING_LIKES = "Kategori yang paling banyak disukai";
const HEADING_VIEWS = "Kategori yang paling sering dilihat";
const HEADING_COUNT = "Kategori dengan karya terbanyak";

function coverOf(project) {
  if (project?.thumbnail) return project.thumbnail;
  if (project?.image) return project.image;
  const first = Array.isArray(project?.images) ? project.images[0] : null;
  return first?.image_url || first || "";
}

function workTime(project) {
  const raw = project?.createdAt || project?.created_at;
  if (!raw) return 0;
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? time : 0;
}

function buildCategoryData(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return { items: [], heading: HEADING_LIKES };
  }

  const hasNumberField = (field) =>
    projects.some((project) => typeof project?.[field] === "number");

  let metric = "count";
  if (hasNumberField("likesCount")) metric = "likes";
  else if (hasNumberField("bookmarksCount")) metric = "bookmarks";
  else if (hasNumberField("viewsCount")) metric = "views";

  const valueOf = (project) => {
    if (metric === "likes") return Number(project?.likesCount) || 0;
    if (metric === "bookmarks") return Number(project?.bookmarksCount) || 0;
    if (metric === "views") return Number(project?.viewsCount) || 0;
    return 1;
  };

  const groups = new Map();

  for (const project of projects) {
    const category = project?.Category;
    if (!category?.slug || !category?.name) continue;
    if (category.is_active === false) continue;

    let group = groups.get(category.slug);
    if (!group) {
      group = {
        slug: category.slug,
        name: category.name,
        description: "",
        works: [],
      };
      groups.set(category.slug, group);
    }

    if (!group.description && typeof category.description === "string") {
      const text = category.description.trim();
      if (text) group.description = text;
    }

    group.works.push(project);
  }

  const items = [];

  for (const group of groups.values()) {
    if (group.works.length === 0) continue;

    let score = 0;
    let cover = "";
    let coverMetric = -1;
    let coverTime = -1;

    for (const work of group.works) {
      const value = valueOf(work);
      const time = workTime(work);
      score += value;

      if (value > coverMetric || (value === coverMetric && time > coverTime)) {
        coverMetric = value;
        coverTime = time;
        const rawCover = coverOf(work);
        cover =
          rawCover && !isBrokenImage(rawCover)
            ? cloudinarySrc(rawCover, { w: 900, q: 82 }) || rawCover
            : "";
      }
    }

    items.push({
      key: group.slug,
      slug: group.slug,
      name: group.name,
      desc: group.description,
      img: cover,
      score,
    });
  }

  items.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name, "id");
  });

  const heading =
    metric === "views"
      ? HEADING_VIEWS
      : metric === "count"
        ? HEADING_COUNT
        : HEADING_LIKES;

  return { items: items.slice(0, 8), heading };
}

export default function KategoriPopuler() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const trackRef = useRef(null);
  const startXRef = useRef(null);
  const startScrollRef = useRef(0);
  const draggingRef = useRef(false);
  const suppressClickRef = useRef(false);

  const { items, heading } = useMemo(
    () => buildCategoryData(projects),
    [projects],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(false);

      try {
        const res = await api.get("/projects", {
          params: { status: "published", limit: 100 },
        });
        const data = res.data?.data?.items || res.data?.data || [];

        if (cancelled) return;
        setProjects(Array.isArray(data) ? data : []);
      } catch {
        if (cancelled) return;
        setProjects([]);
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const endDrag = useCallback((event) => {
    const track = trackRef.current;

    if (draggingRef.current && track) {
      if (event && event.pointerId !== undefined) {
        try {
          track.releasePointerCapture(event.pointerId);
        } catch {
          // pointer capture bisa gagal pada perangkat tertentu
        }
      }
      track.classList.remove("is-drag");
      suppressClickRef.current = true;
    }

    startXRef.current = null;
    draggingRef.current = false;
  }, []);

  useEffect(() => {
    const onWindowBlur = () => endDrag();
    window.addEventListener("blur", onWindowBlur);
    return () => window.removeEventListener("blur", onWindowBlur);
  }, [endDrag]);

  const handlePointerDown = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    startXRef.current = event.clientX;
    startScrollRef.current = trackRef.current ? trackRef.current.scrollLeft : 0;
    draggingRef.current = false;
  };

  const handlePointerMove = (event) => {
    if (startXRef.current === null) return;

    const track = trackRef.current;
    if (!track) return;

    const dx = event.clientX - startXRef.current;

    if (!draggingRef.current && Math.abs(dx) > CLICK_THRESHOLD_PX) {
      draggingRef.current = true;
      try {
        track.setPointerCapture(event.pointerId);
      } catch {
        // pointer capture bisa gagal pada perangkat tertentu
      }
      track.classList.add("is-drag");
    }

    if (draggingRef.current) {
      if ((event.buttons & 1) === 0) {
        endDrag(event);
        return;
      }
      track.scrollLeft = startScrollRef.current - dx;
    }
  };

  const handleClickCapture = (event) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  const handleDragStart = (event) => {
    event.preventDefault();
  };

  if (error) return null;
  if (!loading && items.length === 0) return null;

  return (
    <section className="kp" aria-labelledby="kp-title">
      <div className="kp-wrap">
        <div className="kp-head">
          <h2 id="kp-title" className="kp-title">
            {heading}
          </h2>
          <p className="kp-desc">
            Geser untuk melihat kategori lainnya dan klik untuk membuka
            karyanya.
          </p>
        </div>
        <div
          className="kp-track"
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onClickCapture={handleClickCapture}
          onDragStart={handleDragStart}
        >
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <div
                  className="kp-card"
                  aria-hidden="true"
                  key={`kp-placeholder-${index}`}
                />
              ))
            : items.map((category) => (
                <Link
                  className="kp-card"
                  to={`/karya/${category.slug}`}
                  aria-label={category.name}
                  key={category.key}
                  draggable={false}
                  onDragStart={handleDragStart}
                >
                  {category.img ? (
                    <img
                      className="kp-img"
                      src={category.img}
                      alt=""
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <span className="kp-text">
                    <span className="kp-name">{category.name}</span>
                    {category.desc ? (
                      <span className="kp-sub">{category.desc}</span>
                    ) : null}
                  </span>
                  <ArrowRight
                    className="kp-arrow"
                    size={16}
                    aria-hidden="true"
                  />
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
