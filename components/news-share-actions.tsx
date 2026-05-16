"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

type NewsShareActionsProps = {
  url: string;
  title: string;
};

export function NewsShareActions({ url, title }: NewsShareActionsProps) {
  const [copied, setCopied] = useState(false);

  function shareFacebook() {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=720,height=520");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const message = encodeURIComponent(`${title} ${url}`);
      window.open(`https://zalo.me/share?u=${encodeURIComponent(url)}&text=${message}`, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={shareFacebook}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2 text-sm font-bold text-white shadow-sm shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-[#0f66d0] hover:shadow-md"
      >
        <Share2 size={16} />
        Facebook
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-[#004a99] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Đã copy" : "Zalo / Copy link"}
      </button>
    </div>
  );
}
