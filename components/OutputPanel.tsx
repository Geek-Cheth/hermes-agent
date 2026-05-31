'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import JSZip from 'jszip';
import { MarkdownContent } from '@/components/MarkdownContent';

type DeviceSize = 'mobile' | 'tablet' | 'desktop';

const DEVICE_CONFIG: Record<
  DeviceSize,
  { label: string; width: string; ariaLabel: string }
> = {
  mobile: { label: '375px', width: '375px', ariaLabel: 'Mobile preview' },
  tablet: { label: '768px', width: '768px', ariaLabel: 'Tablet preview' },
  desktop: { label: 'Full width', width: '100%', ariaLabel: 'Desktop preview' },
};

function DeviceIcon({
  device,
  className = 'h-4 w-4',
}: {
  device: DeviceSize;
  className?: string;
}) {
  if (device === 'mobile') {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <line x1="12" y1="18" x2="12" y2="18.01" strokeLinecap="round" />
      </svg>
    );
  }

  if (device === 'tablet') {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <line x1="12" y1="17" x2="12" y2="17.01" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="18" x2="12" y2="21" />
    </svg>
  );
}

function DeviceToggle({
  device,
  onChange,
}: {
  device: DeviceSize;
  onChange: (device: DeviceSize) => void;
}) {
  return (
    <div className="flex rounded-lg border border-[#262626] overflow-hidden">
      {(Object.keys(DEVICE_CONFIG) as DeviceSize[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          title={DEVICE_CONFIG[key].ariaLabel}
          aria-label={DEVICE_CONFIG[key].ariaLabel}
          aria-pressed={device === key}
          className={`px-2.5 py-1.5 transition-colors ${
            device === key
              ? 'bg-[#fafafa] text-black'
              : 'text-[#71717a] hover:text-[#fafafa] hover:bg-[#1a1a1a]'
          }`}
        >
          <DeviceIcon device={key} />
        </button>
      ))}
    </div>
  );
}

function PreviewFrame({
  title,
  device,
  expanded,
  previewUrl,
  srcDoc,
}: {
  title: string;
  device: DeviceSize;
  expanded: boolean;
  previewUrl?: string;
  srcDoc?: string;
}) {
  const iframeHeight = expanded
    ? 'calc(100vh - 9rem)'
    : device === 'desktop'
      ? 'min(70vh, 680px)'
      : device === 'mobile'
        ? '640px'
        : '600px';

  return (
    <div className={`flex flex-col items-center gap-2 ${expanded ? 'flex-1 min-h-0' : ''}`}>
      {!expanded && (
        <span className="text-xs text-[#52525b] self-start">
          Preview · {DEVICE_CONFIG[device].label}
        </span>
      )}
      <motion.div
        className={`w-full flex justify-center ${
          device !== 'desktop' ? 'overflow-x-hidden' : ''
        } ${expanded ? 'flex-1 min-h-0' : ''}`}
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div
          layout
          className={`rounded-lg border border-[#262626] bg-white shadow-2xl shadow-black/50 ${
            device !== 'desktop' ? 'overflow-x-hidden max-w-full' : ''
          } ${expanded ? 'h-full flex flex-col' : ''}`}
          style={{
            width: expanded && device === 'desktop' ? '100%' : DEVICE_CONFIG[device].width,
            maxWidth: '100%',
          }}
        >
          <iframe
            title={title}
            src={previewUrl}
            srcDoc={srcDoc}
            sandbox="allow-forms allow-same-origin allow-popups"
            className="w-full bg-white block"
            style={{
              height: iframeHeight,
              maxHeight: expanded ? undefined : device === 'desktop' ? '680px' : undefined,
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

interface OutputPanelProps {
  title: string;
  content: string;
  language?: 'markdown' | 'html' | 'code' | 'preview';
  previewUrl?: string;
}

export function OutputPanel({
  title,
  content,
  language = 'markdown',
  previewUrl,
}: OutputPanelProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [device, setDevice] = useState<DeviceSize>('desktop');
  const [expanded, setExpanded] = useState(false);

  const showPreviewTools = language === 'preview' || language === 'html';

  useEffect(() => {
    if (!expanded) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setExpanded(false);
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded]);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadZip() {
    if (!content.trim()) return;
    setDownloading(true);
    try {
      const zip = new JSZip();
      zip.file('index.html', content);
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'landing-page.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  function handleOpenPreview() {
    if (previewUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  const previewContent =
    language === 'preview' && previewUrl ? (
      <PreviewFrame
        title={title}
        device={device}
        expanded={false}
        previewUrl={previewUrl}
      />
    ) : language === 'html' ? (
      <PreviewFrame title={title} device={device} expanded={false} srcDoc={content} />
    ) : null;

  return (
    <>
      <section className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#262626]">
          <h2 className="font-semibold text-[#fafafa]">{title}</h2>
          <div className="flex flex-wrap items-center gap-2">
            {showPreviewTools && (
              <>
                <DeviceToggle device={device} onChange={setDevice} />
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="text-sm text-[#71717a] hover:text-[#fafafa] px-3 py-1.5 rounded-lg border border-[#262626] transition-colors"
                >
                  Expand
                </button>
                <button
                  type="button"
                  onClick={handleOpenPreview}
                  className="text-sm text-[#71717a] hover:text-[#fafafa] px-3 py-1.5 rounded-lg border border-[#262626] transition-colors"
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={downloading || !content.trim()}
                  className="text-sm text-[#71717a] hover:text-[#fafafa] px-3 py-1.5 rounded-lg border border-[#262626] disabled:opacity-40"
                >
                  {downloading ? 'Zipping…' : 'Download .zip'}
                </button>
              </>
            )}
            <button
              onClick={handleCopy}
              className="text-sm text-[#71717a] hover:text-[#fafafa] px-3 py-1 rounded-lg border border-[#262626]"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div
          className={
            language === 'markdown'
              ? 'p-4 sm:p-6'
              : showPreviewTools
                ? `p-4 overflow-hidden${device !== 'desktop' ? ' overflow-x-hidden' : ''}`
                : 'p-4 max-h-[700px] overflow-y-auto scrollbar-dark'
          }
        >
          {previewContent}
          {language === 'code' && (
            <pre className="text-sm bg-[#0d0d0d] text-zinc-300 p-4 rounded-lg overflow-x-auto border border-[#1f1f1f] scrollbar-dark">
              <code>{content}</code>
            </pre>
          )}
          {language === 'markdown' && <MarkdownContent content={content} />}
        </div>
      </section>

      <AnimatePresence>
        {expanded && showPreviewTools && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]/95 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={`${title} fullscreen preview`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[#262626] shrink-0">
              <div>
                <h2 className="font-semibold text-[#fafafa]">{title}</h2>
                <p className="text-xs text-[#52525b] mt-0.5">
                  {DEVICE_CONFIG[device].label} · Press Esc to close
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DeviceToggle device={device} onChange={setDevice} />
                <button
                  type="button"
                  onClick={handleOpenPreview}
                  className="text-sm text-[#71717a] hover:text-[#fafafa] px-3 py-1.5 rounded-lg border border-[#262626] transition-colors"
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="text-sm text-[#fafafa] bg-[#262626] hover:bg-[#404040] px-3 py-1.5 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            <div
              className={`flex-1 min-h-0 p-4 sm:p-6 overflow-hidden ${
                device !== 'desktop' ? 'overflow-x-hidden' : ''
              }`}
            >
              <PreviewFrame
                title={title}
                device={device}
                expanded
                previewUrl={language === 'preview' ? previewUrl : undefined}
                srcDoc={language === 'html' ? content : undefined}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
