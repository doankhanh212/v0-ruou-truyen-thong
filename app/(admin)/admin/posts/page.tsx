import { AdminShell } from "@/components/admin/shell";
import { HeroSettingsClient } from "../pages/hero-settings-client";
import { PostsClient } from "./posts-client";

export const dynamic = "force-dynamic";

export default function AdminPostsPage() {
  return (
    <AdminShell>
      <div className="mb-6">
        <HeroSettingsClient
          slug="tin-tuc"
          pageTitle="Banner trang Tin tức"
          pageDescription="Tùy chỉnh banner đầu trang /tin-tuc ngay tại khu vực quản lý bài viết."
          previewHref="/tin-tuc"
          defaultBadge="Cập nhật thường xuyên"
          defaultTitle="Tin Tức & Bài Viết"
          defaultSubtitle="Kiến thức về rượu truyền thống, sức khỏe và văn hóa ẩm thực Việt Nam"
          defaultColor="blue"
        />
      </div>
      <PostsClient />
    </AdminShell>
  );
}
