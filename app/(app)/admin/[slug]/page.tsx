import { notFound } from "next/navigation";
import { getContent } from "@/lib/data";
import { findTopic } from "@/lib/status";
import TopicEditor from "@/components/TopicEditor";

export default async function AdminTopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const topic = findTopic(content, slug);
  if (!topic) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-4 text-2xl font-bold text-navy">Edit: {topic.title}</h1>
      <TopicEditor topic={topic} phases={content.phases} />
    </div>
  );
}
