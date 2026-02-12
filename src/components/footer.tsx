export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
      Powered by{' '}
      <a
        href="https://openclaw.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        OpenClaw
      </a>
      {' '}• Built by Noah &amp; Kai
    </footer>
  )
}
