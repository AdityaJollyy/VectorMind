import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

export function Markdown({ content }: { content: string }) {
  return (
    <div className="text-sm leading-relaxed text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: (props) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
          strong: (props) => <strong className="font-semibold" {...props} />,
          a: (props) => (
            <a
              className="text-accent underline underline-offset-2 hover:text-accent-hover"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          ul: (props) => (
            <ul className="my-2 list-disc space-y-1 pl-5" {...props} />
          ),
          ol: (props) => (
            <ol className="my-2 list-decimal space-y-1 pl-5" {...props} />
          ),
          h1: (props) => (
            <h3
              className="mb-2 mt-4 font-display text-base font-semibold"
              {...props}
            />
          ),
          h2: (props) => (
            <h3
              className="mb-2 mt-4 font-display text-base font-semibold"
              {...props}
            />
          ),
          h3: (props) => (
            <h4 className="mb-1 mt-3 text-sm font-semibold" {...props} />
          ),
          blockquote: (props) => (
            <blockquote
              className="my-2 border-l-2 border-accent pl-3 text-ink-muted"
              {...props}
            />
          ),
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          code: (props) => (
            <code
              className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]"
              {...props}
            />
          ),
          table: (props) => (
            <div className="my-2 overflow-x-auto">
              <table className="w-full border-collapse text-left" {...props} />
            </div>
          ),
          th: (props) => (
            <th
              className="border-b border-line px-2 py-1.5 font-semibold"
              {...props}
            />
          ),
          td: (props) => (
            <td className="border-b border-line px-2 py-1.5" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
