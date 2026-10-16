export default function Footer() {
  return (
    <footer className="border-t border-line py-6 text-center text-sm text-slate-500">
      © {new Date().getFullYear()} PromptForge — AI Prompt Engineering and Management Platform
    </footer>
  );
}