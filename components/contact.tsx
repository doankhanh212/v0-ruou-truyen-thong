'use client'

import { Phone, Mail, MapPin, Building2, Factory } from 'lucide-react'
import { CTAButton } from '@/components/cta-button'
import { openZalo, HOTLINE } from '@/utils/zalo'
import { brandVisuals, companyInfo } from '@/lib/site-content'
import { track } from '@/utils/track'

export function Contact() {
  return (
    <section id="contact" className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">
          Liên Hệ Mua Hàng
        </h2>
        <p className="text-center text-foreground/60 mb-12">
          {companyInfo.name} — Thương hiệu {companyInfo.brand}
        </p>

        <div className="mb-12 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-white p-3 shadow-sm md:p-4">
            <div className="overflow-hidden rounded-2xl bg-white/70">
              <img
                src={brandVisuals.contact}
                alt="Thông tin liên hệ mua hàng Somo Gold"
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-br from-sky-50 to-white p-3 shadow-sm md:p-4">
              <div className="overflow-hidden rounded-2xl bg-white/70">
                <img
                  src={brandVisuals.contactAlt}
                  alt="Bộ quà tặng Lộc Xuân Somo Gold"
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Hồ sơ doanh nghiệp
              </p>
              <h3 className="mt-3 text-2xl font-bold text-primary">
                Somo Gold, APT và Somo Farm Cửu Long
              </h3>
              <p className="mt-3 text-sm leading-7 text-foreground/70">
                Phần liên hệ được trình bày theo đúng poster doanh nghiệp của công ty, đồng thời giữ nguyên tỷ lệ ảnh gốc để không làm vỡ bố cục thương hiệu.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hotline</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{companyInfo.phone[0]}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p>
                  <p className="mt-2 text-sm font-bold text-slate-900 break-all">{companyInfo.email}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Thương hiệu</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{companyInfo.brand}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href={`tel:${HOTLINE}`}
            onClick={() => track('click_call', { phone: HOTLINE, source: 'contact' })}
            className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl hover:shadow-lg transition-shadow text-center w-full"
          >
            <Phone className="text-secondary w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Hotline</h3>
            <p className="text-foreground/70">{companyInfo.phone.join(' – ')}</p>
          </a>

          <a
            href={`mailto:${companyInfo.email}`}
            className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl hover:shadow-lg transition-shadow"
          >
            <Mail className="text-secondary w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Email</h3>
            <p className="text-foreground/70">{companyInfo.email}</p>
          </a>

          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl">
            <MapPin className="text-secondary w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Văn phòng</h3>
            <p className="text-foreground/70 text-sm text-center">{companyInfo.address}</p>
          </div>
        </div>

        {/* Company details */}
        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <div className="flex items-start gap-4 p-5 bg-blue-50/50 rounded-xl">
            <Factory className="text-primary w-8 h-8 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground text-sm">{companyInfo.factory.name}</h4>
              <p className="text-foreground/60 text-sm mt-1">{companyInfo.factory.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 bg-blue-50/50 rounded-xl">
            <Building2 className="text-primary w-8 h-8 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground text-sm">{companyInfo.distributor.name}</h4>
              <p className="text-foreground/60 text-sm mt-1">{companyInfo.distributor.address}</p>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {companyInfo.certifications.map((cert) => (
            <span key={cert} className="bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold px-4 py-1.5 rounded-full">
              ✓ {cert}
            </span>
          ))}
        </div>

        <div className="rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 p-6 text-center sm:p-8">
          <p className="mb-6 text-base text-foreground/80 sm:text-lg">
            Liên hệ ngay để nhận tư vấn miễn phí và báo giá tốt nhất!
          </p>
          <CTAButton
            label="💬 Liên Hệ Ngay qua Zalo"
            className="btn-lift inline-block bg-[#0068FF] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#0057d6] transition-colors shadow-lg shadow-blue-500/25"
          />
        </div>
      </div>
    </section>
  )
}
