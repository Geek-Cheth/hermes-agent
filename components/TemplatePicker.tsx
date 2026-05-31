'use client';

import { LANDING_TEMPLATES } from '@/lib/landing-templates';

interface TemplatePickerProps {
  selected: string;
  onSelect: (id: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

export function TemplatePicker({
  selected,
  onSelect,
  notes,
  onNotesChange,
}: TemplatePickerProps) {
  return (
    <div className="space-y-4 rounded-xl border border-[#262626] bg-[#111111] p-4">
      <div>
        <h3 className="text-sm font-medium text-[#fafafa]">
          Choose a landing page template
        </h3>
        <p className="mt-1 text-xs text-[#71717a]">
          Pick a visual style for your generated landing page.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LANDING_TEMPLATES.map((template) => {
          const isSelected = selected === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              className={`text-left rounded-lg border p-3 transition-colors ${
                isSelected
                  ? 'border-white/30 bg-white/5 ring-1 ring-white/20'
                  : 'border-[#262626] bg-[#0a0a0a] hover:border-[#404040] hover:bg-[#141414]'
              }`}
            >
              <p className="text-sm font-medium text-[#fafafa]">
                {template.name}
              </p>
              <p className="mt-1 text-xs text-[#71717a] leading-relaxed">
                {template.description}
              </p>
            </button>
          );
        })}
      </div>

      <div>
        <label
          htmlFor="style-notes"
          className="block text-sm font-medium text-[#fafafa] mb-2"
        >
          Describe your preferred colors / style (optional)
        </label>
        <textarea
          id="style-notes"
          className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg p-3 h-20 text-sm text-[#fafafa] placeholder:text-[#71717a] focus:outline-none focus:ring-2 focus:ring-white/10 resize-none"
          placeholder="e.g. Navy and gold, soft gradients, rounded buttons, friendly tone..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>
    </div>
  );
}
