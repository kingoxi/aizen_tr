import HomeClient from "./HomeClient";
import { getPostsPage, getSettings, listProjects } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [postsResult, projects, settings] = await Promise.all([
    getPostsPage(1, 3),
    listProjects(),
    getSettings().catch(() => null),
  ]);

  return (
    <HomeClient
      initialPosts={postsResult.posts}
      initialProjects={projects.slice(0, 3)}
      initialSettings={settings}
    />
  );
}
