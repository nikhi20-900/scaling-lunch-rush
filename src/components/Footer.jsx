import { motion } from 'framer-motion';
import { Heart, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Built with</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>for DevOps</span>
            <span className="text-gray-600">|</span>
            <span>Scaling the Lunch Rush 🍔🚀</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              React + Tailwind + Framer Motion
            </span>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-600">
          <p>A DevOps Case Study demonstrating Kubernetes Auto-Scaling for Peak Load Management</p>
          <p className="mt-1">© 2026 — College Presentation Project</p>
        </div>
      </div>
    </footer>
  );
}
