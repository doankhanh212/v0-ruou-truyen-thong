'use client'

import { Phone, Mail, MapPin, Building2, Factory } from 'lucide-react'
import { CTAButton } from '@/components/cta-button'
import { openZalo } from '@/utils/zalo'
import { companyInfo } from '@/data/products'

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

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <button
            type="button"
            onClick={() => openZalo()}
            className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl hover:shadow-lg transition-shadow text-center w-full"
          >
            <Phone className="text-secondary w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Hotline</h3>
            <p className="text-foreground/70">{companyInfo.phone.join(' – ')}</p>
          </button>

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
        <div className="grid md:grid-cols-2 gap-6 mb-12">
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

        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-8 text-center">
          <p className="text-lg text-foreground/80 mb-6">
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
