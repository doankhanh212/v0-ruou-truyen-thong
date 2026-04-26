import { AdminShell } from "@/components/admin/shell";
import { PostsClient } from "./posts-client";

export const dynamic = "force-dynamic";

export default function AdminPostsPage() {
  return (
    <AdminShell>
      <PostsClient />
    </AdminShell>
  );
}
