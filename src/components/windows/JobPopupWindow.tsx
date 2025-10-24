import { Mail, Calendar, Sparkles } from "lucide-react";

export const JobPopupWindow = () => {
  return (
    <div className="win95-border-inset bg-white p-4 space-y-4">
      {/* Header with sparkles */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <h2 className="text-xl font-bold text-primary">
            Looking for Opportunities!
          </h2>
          <Sparkles className="w-5 h-5 text-pink-500" />
        </div>
      </div>

      {/* Message */}
      <div className="win95-border p-3 space-y-3 text-sm bg-gradient-to-br from-pink-50 to-pink-50">
        <p className="font-semibold text-center text-pink-500">
          I'm currently seeking <strong>in-person opportunities in the Bay Area</strong>!
        </p>
        <p className="text-center text-pink-500">
          If you're excited about my interests and you think I could be a good fit:
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-1 gap-2">
        <a
          href="https://calendar.app.google/TxR1iiyEriso6AqL9"
          target="_blank"
          rel="noopener noreferrer"
          className="win95-border p-3 flex items-center justify-center gap-2 text-sm font-bold active:win95-border-inset transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(90deg, hsl(180, 75%, 75%))' }}
        >
          <Calendar className="w-4 h-4" />
          Schedule a Time
        </a>
        <a
          href="mailto:marianameireles@protonmail.com"
          className="win95-border p-3 flex items-center justify-center gap-2 text-sm font-bold active:win95-border-inset transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(90deg,hsl(330, 75%, 75%))' }}
        >
          <Mail className="w-4 h-4" />
          Send me an Email
        </a>
      </div>

    </div>
  );
};
