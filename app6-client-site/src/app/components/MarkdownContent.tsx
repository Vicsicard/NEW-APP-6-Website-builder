import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ComponentProps } from 'react'

interface MarkdownContentProps {
  content: string
  className?: string
}

type MarkdownComponents = ComponentProps<typeof ReactMarkdown>['components']

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const components: MarkdownComponents = {
    h1: ({ children }) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold mb-2">{children}</h3>,
    p: ({ children }) => <p className="mb-4">{children}</p>,
    ul: ({ children }) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
    a: ({ children, href }) => (
      <a 
        className="text-blue-600 hover:text-blue-800 underline" 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
        {children}
      </blockquote>
    ),
    code: ({ children, className }) => {
      const isInline = !className
      return isInline ? (
        <code className="bg-gray-100 rounded px-1 py-0.5">{children}</code>
      ) : (
        <code className="block bg-gray-100 rounded p-4 my-4 overflow-auto">
          {children}
        </code>
      )
    },
  }

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
