'use client'

import { Phone, Mail, MapPin } from 'lucide-react'

const ZALO_PHONE = process.env.NEXT_PUBLIC_ZALO_PHONE || '0999999999'

export function Contact() {
  return (
    <section id="contact" className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
          Liên Hệ Chúng Tôi
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <a
            href={`https://zalo.me/${ZALO_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl hover:shadow-lg transition-shadow text-center"
          >
            <Phone className="text-secondary w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Zalo</h3>
            <p className="text-foreground/70">{ZALO_PHONE}</p>
          </a>

          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl">
            <Mail className="text-secondary w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Email</h3>
            <p className="text-foreground/70">info@ruoutuyenthuong.vn</p>
          </div>

          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl">
            <MapPin className="text-secondary w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Địa chỉ</h3>
            <p className="text-foreground/70">Tp. Hồ Chí Minh, Việt Nam</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-8 text-center">
          <p className="text-lg text-foreground/80 mb-6">
            Hãy liên hệ với chúng tôi để nhận tư vấn miễn phí về sản phẩm phù hợp với nhu cầu của bạn.
          </p>
          <a
            href={`https://zalo.me/${ZALO_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-secondary text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
          >
            Liên Hệ Ngay qua Zalo
          </a>
        </div>
      </div>
    </section>
  )
}
