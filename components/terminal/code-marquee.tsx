'use client'

const codeSnippets = [
  'const agent = await Agent.create({ model: "gpt-4" })',
  'agent.run({ task: "analyze data" })',
  'import { LangChain } from "langchain"',
  'const response = await agent.chat(prompt)',
  'agent.tools.push(new WebBrowser())',
  'const memory = new ConversationMemory()',
  'await agent.execute({ autonomous: true })',
  'const result = agent.reason(context)',
  'agent.observe(environment)',
  'const plan = agent.plan(goal)',
]

export function CodeMarquee() {
  const duplicatedSnippets = [...codeSnippets, ...codeSnippets]

  return (
    <div className="relative w-full overflow-hidden py-3 border-t border-zinc-800/50">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-zinc-950 to-transparent z-10" />
      
      <div className="flex animate-marquee whitespace-nowrap">
        {duplicatedSnippets.map((snippet, i) => (
          <span
            key={i}
            className="mx-8 font-mono text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {snippet}
          </span>
        ))}
      </div>
    </div>
  )
}
