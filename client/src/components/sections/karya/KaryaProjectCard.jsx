import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  User as UserIcon,
  Calendar,
  Heart,
  Eye,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import GlassCard from "../../ui/GlassCard";
import { useAuth } from "../../../context/AuthContext";
import { imageUrl } from "../../../utils/imageUrl";
import api from "../../../services/api";

function KaryaProjectCard({ project }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isLoggedIn = user !== null;

  const {
    id,
    slug,
    Category,
    title,
    description,
    thumbnail,
    images,
    User: authorUser,
    year,
    likesCount: initialLikes,
    viewsCount,
    commentsCount,
  } = project;

  const categorySlug = Category?.slug || "";
  const projectKey = slug || id;

  const [isLiked, setIsLiked] = useState(Boolean(project.liked));
  const [likesCount, setLikesCount] = useState(initialLikes || 0);
  const [isBookmarked, setIsBookmarked] = useState(Boolean(project.bookmarked));

  const firstAdditionalImage =
    Array.isArray(images) && images.length > 0
      ? images[0]?.image_url || images[0]
      : null;
  const coverImage = thumbnail || firstAdditionalImage;

  const authorLabel = authorUser?.name || "";

  function handleLike(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location } });
      return;
    }
    api.post(`/projects/${id}/like`)
      .then((res) => {
        const { liked, likesCount } = res.data.data || {};
        setIsLiked(Boolean(liked));
        if (typeof likesCount === "number") setLikesCount(likesCount);
      })
      .catch((err) => {
        console.error("Failed to update like:", err);
      });
  }

  function handleBookmark(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location } });
      return;
    }
    api.post(`/projects/${id}/bookmark`)
      .then((res) => {
        setIsBookmarked(Boolean(res.data.data?.bookmarked));
      })
      .catch((err) => {
        console.error("Failed to update bookmark:", err);
      });
  }

  return (
    <GlassCard
      hover
      className="group flex h-full flex-col overflow-hidden p-0 !cursor-default"
    >
      {/* Cover */}
      <div className="relative overflow-hidden">
        <img
          src={imageUrl(coverImage)}
          alt={title}
          className="h-40 w-full object-cover transition-all duration-500 sm:h-48 md:h-52 lg:h-56 xl:h-60 3xl:h-72 4xl:h-80"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent" />

        {Category && (
          <span className="absolute left-3 top-3 z-10 rounded-full border border-cyan-400/30 bg-brand-navy/80 px-2 py-0.5 text-[10px] font-medium text-cyan-300 backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1 sm:text-xs md:left-5 md:top-5 md:px-4 md:py-1.5 md:text-sm 3xl:text-sm 4xl:px-5 4xl:py-2 4xl:text-base">
            {Category.name}
          </span>
        )}

        <button
          onClick={handleBookmark}
          aria-label="Simpan karya"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-brand-navy/80 text-slate-200 backdrop-blur-sm transition-colors hover:border-cyan-400/30 hover:text-cyan-300 sm:right-4 sm:top-4 sm:h-8 sm:w-8 md:right-5 md:top-5 md:h-9 md:w-9"
        >
          <Bookmark
            size={14}
            className={`sm:size-[15px] md:size-4 ${
              isBookmarked ? "fill-cyan-400 text-cyan-400" : ""
            }`}
          />
        </button>
      </div>

      {/* Konten */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 3xl:p-9 4xl:p-10">
        <h3 className="text-base font-bold text-white sm:text-lg md:text-xl lg:text-2xl xl:text-2xl 3xl:text-3xl 4xl:text-4xl">
          {title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300 sm:mt-2.5 sm:text-sm sm:leading-6 md:mt-3 md:text-base md:leading-7 lg:text-base 3xl:mt-4 3xl:text-lg 3xl:leading-8 4xl:text-xl 4xl:leading-9">
          {description}
        </p>

        {/* Info */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400 sm:mt-4 sm:gap-3.5 sm:text-xs md:gap-4 md:text-sm lg:text-sm 3xl:mt-5 3xl:gap-5 3xl:text-base 4xl:gap-6 4xl:text-lg">
          {authorLabel && (
            <span className="flex items-center gap-1.5">
              <UserIcon
                size={12}
                className="sm:size-[13px] md:size-3.5 lg:size-4 3xl:size-[18px] 4xl:size-5"
              />
              {authorLabel}
            </span>
          )}
          {year && (
            <span className="flex items-center gap-1.5">
              <Calendar
                size={12}
                className="sm:size-[13px] md:size-3.5 lg:size-4 3xl:size-[18px] 4xl:size-5"
              />
              {year}
            </span>
          )}
        </div>

        {/* Statistik */}
        <div className="mt-3 flex items-center gap-4 border-t border-slate-700/50 pt-3 text-xs text-slate-400 sm:mt-4 sm:gap-4.5 sm:text-xs md:mt-5 md:gap-5 md:pt-4 md:text-sm lg:pt-5 lg:text-sm 3xl:mt-5 3xl:gap-6 3xl:pt-5 3xl:text-base 4xl:gap-7 4xl:text-lg">
          <button
            onClick={handleLike}
            className="group/action flex cursor-pointer items-center gap-1.5 transition-colors hover:text-pink-400"
          >
            <Heart
              size={14}
              className={`transition-transform group-hover/action:scale-110 sm:size-[15px] md:size-4 lg:size-[18px] 3xl:size-5 4xl:size-[22px] ${
                isLiked ? "fill-pink-500 text-pink-500" : ""
              }`}
            />
            <span>{likesCount}</span>
          </button>

          <Link
            to={`/karya/${categorySlug}/${projectKey}`}
            onClick={(e) => e.stopPropagation()}
            className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-cyan-400"
          >
            <MessageSquare
              size={14}
              className="sm:size-[15px] md:size-4 lg:size-[18px] 3xl:size-5 4xl:size-[22px]"
            />
            <span>{commentsCount || 0}</span>
          </Link>

          <span className="ml-auto flex items-center gap-1.5 text-slate-500">
            <Eye
              size={14}
              className="sm:size-[15px] md:size-4 lg:size-[18px] 3xl:size-5 4xl:size-[22px]"
            />
            <span>{viewsCount || 0}</span>
          </span>
        </div>

        {/* Button */}
        <div className="mt-auto pt-4 sm:pt-5 md:pt-6 lg:pt-7 3xl:pt-8 4xl:pt-10">
          <Link
            to={`/karya/${categorySlug}/${projectKey}`}
            className="group/btn flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-semibold text-slate-900 transition-colors duration-300 hover:bg-slate-200 sm:py-3 sm:text-sm md:text-sm lg:py-3.5 lg:text-base 3xl:py-4 3xl:text-base 4xl:py-5 4xl:text-lg"
          >
            Lihat Detail
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover/btn:translate-x-1 sm:size-[15px] md:size-4 lg:size-[18px] 3xl:size-5 4xl:size-[22px]"
            />
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}

export default KaryaProjectCard;
