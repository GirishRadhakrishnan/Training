import { lazy, Suspense, useEffect, useState } from "react";
import type { ComponentType } from "react";

type Topic = {
  key: string; // e.g. "Day1/Topic1-ReactFundamentals"
  day: number;
  number: number;
  title: string;
  path: string;
  Component: ComponentType;
};

// "ListsMapFilterKeys" -> "Lists map filter keys" (acronyms such as JSX stay as they are)
function toTitle(heading: string): string {
  const words = heading.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");
  return words
    .map((word, index) => {
      if (word === word.toUpperCase()) return word;
      return index === 0 ? word : word.toLowerCase();
    })
    .join(" ");
}

// Built once, when this module loads (not on every render).
const modules = import.meta.glob<{ default: ComponentType }>("./topics/Day*/Topic*.tsx");

const topics: Topic[] = Object.entries(modules)
  .flatMap(([path, load]) => {
    const match = path.match(/Day(\d+)\/(Topic(\d+)-(.+))\.tsx$/);
    if (!match) return [];
    return [
      {
        key: `Day${match[1]}/${match[2]}`,
        day: Number(match[1]),
        number: Number(match[3]),
        title: toTitle(match[4]),
        path: `src/${path.slice(2)}`,
        Component: lazy(load),
      },
    ];
  })
  .sort((a, b) => a.day - b.day || a.number - b.number);

const days = [...new Set(topics.map((topic) => topic.day))];

function readHash(): string {
  return decodeURIComponent(window.location.hash.replace(/^#/, ""));
}

type TopicBrowserProps = {
  projectHref?: string;
};

export default function TopicBrowser({ projectHref }: TopicBrowserProps) {
  const [hash, setHash] = useState(readHash);

  useEffect(() => {
    const onHashChange = () => setHash(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (topics.length === 0) {
    return <p className="note">No topics found.</p>;
  }

  const selected = topics.find((topic) => topic.key === hash) ?? topics[0];
  const SelectedTopic = selected.Component;

  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Topics">
        <h1>React leave training</h1>
        {days.map((day) => (
          <section key={day}>
            <h2>Day {day}</h2>
            {topics
              .filter((topic) => topic.day === day)
              .map((topic) => {
                const active = topic.key === selected.key;
                return (
                  <a
                    key={topic.key}
                    href={`#${topic.key}`}
                    className={active ? "topic-link active" : "topic-link"}
                    aria-current={active ? "page" : undefined}
                  >
                    {topic.number}. {topic.title}
                  </a>
                );
              })}
          </section>
        ))}
        {projectHref && (
          <section>
            <h2>Project</h2>
            <a className="topic-link" href={projectHref}>
              Final project
            </a>
          </section>
        )}
      </nav>
      <main className="content">
        <p className="file-label">{selected.path}</p>
        <Suspense key={selected.key} fallback={<p className="muted">Loading topic…</p>}>
          <SelectedTopic />
        </Suspense>
      </main>
    </div>
  );
}
