export type PolicyPageSlug =
  | "chinh-sach-doi-tra-hang"
  | "phuong-thuc-thanh-toan"
  | "chinh-sach-bao-mat"
  | "chinh-sach-giao-nhan-hang";

export type PolicyPageConfig = {
  pageSlug: PolicyPageSlug;
  publicSlug: string;
  title: string;
  href: string;
  adminHref: string;
  description: string;
};

export const POLICY_PAGES: PolicyPageConfig[] = [
  {
    pageSlug: "chinh-sach-doi-tra-hang",
    publicSlug: "doi-tra-hang",
    title: "Chính sách đổi trả hàng",
    href: "/chinh-sach/doi-tra-hang",
    adminHref: "/admin/pages/chinh-sach-doi-tra-hang",
    description: "Quy định đổi trả, điều kiện áp dụng và hướng dẫn xử lý đơn hàng cần đổi/trả.",
  },
  {
    pageSlug: "phuong-thuc-thanh-toan",
    publicSlug: "phuong-thuc-thanh-toan",
    title: "Phương thức thanh toán",
    href: "/chinh-sach/phuong-thuc-thanh-toan",
    adminHref: "/admin/pages/phuong-thuc-thanh-toan",
    description: "Các hình thức thanh toán, chuyển khoản, COD và lưu ý xác nhận thanh toán.",
  },
  {
    pageSlug: "chinh-sach-bao-mat",
    publicSlug: "bao-mat",
    title: "Chính sách bảo mật",
    href: "/chinh-sach/bao-mat",
    adminHref: "/admin/pages/chinh-sach-bao-mat",
    description: "Cách website thu thập, sử dụng và bảo vệ thông tin khách hàng.",
  },
  {
    pageSlug: "chinh-sach-giao-nhan-hang",
    publicSlug: "giao-nhan-hang",
    title: "Chính sách giao nhận hàng",
    href: "/chinh-sach/giao-nhan-hang",
    adminHref: "/admin/pages/chinh-sach-giao-nhan-hang",
    description: "Thông tin giao hàng, thời gian xử lý, phạm vi vận chuyển và nhận hàng.",
  },
];

export function getPolicyPageByPublicSlug(slug: string) {
  return POLICY_PAGES.find((page) => page.publicSlug === slug) ?? null;
}

export function getPolicyPageByPageSlug(slug: string) {
  return POLICY_PAGES.find((page) => page.pageSlug === slug) ?? null;
}
