import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ExternalLink, PlayCircle, Sparkles, Wand2 } from 'lucide-react';
import { GameService } from '../services/api';
import { cn } from '../utils/cn';

type LessonData = {
  title?: string;
  lore?: string;
  concept?: string;
  exampleCode?: string;
  proTip?: string;
  topic?: string;
  xpReward?: number;
};

type Resource = {
  id: string;
  type: 'video' | 'doc';
  title: string;
  url: string;
  embedUrl?: string;
  preview: string;
};

const resourceMap: Record<string, Resource[]> = {
  arrays: [
    {
      id: 'arr-v-1',
      type: 'video',
      title: 'JavaScript Arrays in 10 Minutes',
      url: 'https://www.youtube.com/watch?v=oigfaZ5ApsM',
      embedUrl: 'https://www.youtube.com/embed/oigfaZ5ApsM',
      preview: 'Core methods, indexing, push/pop, and iteration patterns.',
    },
    {
      id: 'arr-d-1',
      type: 'doc',
      title: 'MDN: Array Guide',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
      preview: 'Reference for every array method with practical examples.',
    },
  ],
  'linked-list': [
    {
      id: 'll-v-1',
      type: 'video',
      title: 'Linked List Explained Simply',
      url: 'https://www.youtube.com/watch?v=NobHlGUjV3g',
      embedUrl: 'https://www.youtube.com/embed/NobHlGUjV3g',
      preview: 'Understand nodes, pointers, and insert/delete operations.',
    },
    {
      id: 'll-d-1',
      type: 'doc',
      title: 'GeeksforGeeks: Linked List',
      url: 'https://www.geeksforgeeks.org/data-structures/linked-list/',
      preview: 'Comprehensive conceptual and implementation notes.',
    },
  ],
  'stack-queue': [
    {
      id: 'sq-v-1',
      type: 'video',
      title: 'Stack vs Queue Visualized',
      url: 'https://www.youtube.com/watch?v=wjI1WNcIntg',
      embedUrl: 'https://www.youtube.com/embed/wjI1WNcIntg',
      preview: 'Learn LIFO/FIFO operations and real use-cases.',
    },
    {
      id: 'sq-d-1',
      type: 'doc',
      title: 'Programiz: Stack and Queue',
      url: 'https://www.programiz.com/dsa/stack',
      preview: 'Clean conceptual explanation with complexity notes.',
    },
  ],
  trees: [
    {
      id: 'tr-v-1',
      type: 'video',
      title: 'Tree Traversals (BFS/DFS)',
      url: 'https://www.youtube.com/watch?v=9RHO6jU--GU',
      embedUrl: 'https://www.youtube.com/embed/9RHO6jU--GU',
      preview: 'Traversal patterns and recursion strategy.',
    },
    {
      id: 'tr-d-1',
      type: 'doc',
      title: 'Binary Tree Basics',
      url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/',
      preview: 'Node structure, depth/height, and tree operations.',
    },
  ],
  graphs: [
    {
      id: 'gr-v-1',
      type: 'video',
      title: 'Graphs and Shortest Path Intro',
      url: 'https://www.youtube.com/watch?v=tWVWeAqZ0WU',
      embedUrl: 'https://www.youtube.com/embed/tWVWeAqZ0WU',
      preview: 'Graph representations and pathfinding intuition.',
    },
    {
      id: 'gr-d-1',
      type: 'doc',
      title: 'Graph Data Structure',
      url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/',
      preview: 'Reference for graph algorithms and complexity.',
    },
  ],
};

export default function SkillLearningPage() {
  const navigate = useNavigate();
  const { topicId } = useParams();

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [resourceOpen, setResourceOpen] = useState(false);
  const [activeResourceId, setActiveResourceId] = useState<string | null>(null);

  const resources = useMemo(() => {
    if (!topicId) return [];
    return resourceMap[topicId] || [];
  }, [topicId]);

  const activeResource = useMemo(() => {
    if (!activeResourceId) return resources[0] ?? null;
    return resources.find((r) => r.id === activeResourceId) ?? resources[0] ?? null;
  }, [activeResourceId, resources]);

  useEffect(() => {
    let mounted = true;

    const loadLesson = async () => {
      if (!topicId) return;
      setLoading(true);
      setError('');

      try {
        const { data } = await GameService.studyTopic(topicId);
        if (mounted) {
          setLesson(data?.lesson || null);
          if (resources[0]) setActiveResourceId(resources[0].id);
        }
      } catch (e) {
        if (mounted) {
          setError('Unable to load concept right now. Please try again.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLesson();
    return () => {
      mounted = false;
    };
  }, [topicId, resources]);

  return (
    <div className="min-h-screen bg-map-grass px-4 py-6 text-map-ink md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-3xl border border-map-brown/20 bg-white/85 p-6 shadow-(--shadow-map-soft)">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">AI Learning Chamber</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight">Learn: {topicId?.replace('-', ' ') || 'Topic'}</h1>
              <p className="mt-2 text-sm text-map-ink-muted">Concept taught first by Gemini-powered tutor through your backend game engine.</p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/skill-tree')}
              className="rounded-xl border border-map-brown/25 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-map-brown hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              Back to Skill Tree
            </button>
          </div>
        </header>

        <section className="rounded-3xl border border-map-brown/20 bg-white/80 p-5 shadow-(--shadow-map-soft)">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-40 rounded bg-map-brown/15" />
              <div className="h-8 w-72 rounded bg-map-brown/15" />
              <div className="h-24 rounded bg-map-brown/10" />
              <div className="h-16 rounded bg-map-brown/10" />
            </div>
          ) : error ? (
            <p className="text-sm font-semibold text-red-600">{error}</p>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-map-water/30 bg-map-water/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-map-water-deep">
                <Sparkles className="h-3.5 w-3.5" />
                Gemini Lesson
              </div>

              <h2 className="text-2xl font-black">{lesson?.title || 'Untitled Lesson'}</h2>

              <div className="rounded-2xl border border-map-brown/15 bg-map-sand/20 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">Lore</p>
                <p className="mt-2 text-sm text-map-ink">{lesson?.lore || 'No lore generated.'}</p>
              </div>

              <div className="rounded-2xl border border-map-brown/15 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">Core Concept</p>
                <p className="mt-2 text-sm text-map-ink">{lesson?.concept || 'No concept generated.'}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-map-brown/15 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">Example Code</p>
                  <pre className="mt-2 overflow-auto rounded-lg bg-map-ui p-3 text-xs text-map-ink">
                    {lesson?.exampleCode || '// No sample code available'}
                  </pre>
                </div>

                <div className="rounded-2xl border border-map-brown/15 bg-linear-to-br from-map-grass-light/25 to-white p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">Pro Tip</p>
                  <p className="mt-2 text-sm text-map-ink">{lesson?.proTip || 'Practice with tiny examples and build up complexity.'}</p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-map-grass/35 bg-map-grass/15 px-2.5 py-1 text-xs font-black text-map-grass-deep">
                    <Wand2 className="h-3.5 w-3.5" />
                    XP Reward: +{lesson?.xpReward || 0}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-map-brown/20 bg-white/85 shadow-(--shadow-map-soft)">
          <button
            type="button"
            onClick={() => setResourceOpen((s) => !s)}
            className="flex w-full items-center justify-between px-5 py-4 hover:bg-white transition-colors"
          >
            <span className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-map-brown">
              <BookOpen className="h-4 w-4" />
              Learning Resources (Videos + Documents)
            </span>
            <ChevronDown className={cn('h-4 w-4 text-map-brown transition-transform', resourceOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {resourceOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-map-brown/15"
              >
                <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[320px_1fr]">
                  <div className="space-y-2">
                    {resources.length === 0 ? (
                      <p className="rounded-xl border border-map-brown/15 bg-map-sand/20 p-3 text-sm text-map-ink-muted">No resources mapped for this topic yet.</p>
                    ) : (
                      resources.map((resource) => (
                        <button
                          key={resource.id}
                          type="button"
                          onClick={() => setActiveResourceId(resource.id)}
                          className={cn(
                            'w-full rounded-xl border px-3 py-3 text-left transition-all',
                            'hover:-translate-x-0.5 hover:-translate-y-0.5',
                            activeResource?.id === resource.id
                              ? 'border-map-water/40 bg-map-water/10'
                              : 'border-map-brown/15 bg-white',
                          )}
                        >
                          <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">
                            {resource.type === 'video' ? 'Video' : 'Document'}
                          </p>
                          <p className="mt-1 text-sm font-bold text-map-ink">{resource.title}</p>
                          <p className="mt-1 text-xs text-map-ink-muted line-clamp-2">{resource.preview}</p>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="rounded-2xl border border-map-brown/15 bg-map-ui p-3">
                    {activeResource ? (
                      <>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">Preview</p>
                            <p className="text-sm font-bold text-map-ink">{activeResource.title}</p>
                          </div>

                          <a
                            href={activeResource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-map-brown/20 bg-white px-2.5 py-1 text-xs font-black uppercase tracking-wider text-map-brown"
                          >
                            Open <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>

                        {activeResource.type === 'video' && activeResource.embedUrl ? (
                          <div className="overflow-hidden rounded-xl border border-map-brown/15 bg-black/5">
                            <iframe
                              className="h-64 w-full"
                              src={activeResource.embedUrl}
                              title={activeResource.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="rounded-xl border border-map-brown/15 bg-white p-4">
                            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-map-brown/70">
                              <PlayCircle className="h-3.5 w-3.5" />
                              Document Snapshot
                            </p>
                            <p className="mt-2 text-sm text-map-ink">{activeResource.preview}</p>
                            <p className="mt-2 text-xs text-map-ink-muted">
                              Tip: Use the Open button to read full document in a new tab.
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-map-ink-muted">Select a resource to preview.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
