import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowDownToLine, ArrowRight, Check, Clipboard, Copy, ExternalLink,
  FileAudio, FileVideo, Info, Link2, LoaderCircle, Music2,
  ShieldCheck, Sparkles, X,
} from 'lucide-react';
import {
  availableQualities, formatBytes, prepareMedia, saveMedia,
} from '../lib/media';

const initialFormat = 'mp4';
const initialQuality = '1080p';

export default function Downloader() {
  const [url, setUrl] = useState('');
  const [media, setMedia] = useState(null);
  const [format, setFormat] = useState(initialFormat);
  const [quality, setQuality] = useState(initialQuality);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const inputRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = setTimeout(() => setNotice(''), 4200);
    return () => clearTimeout(timeout);
  }, [notice]);

  const formats = useMemo(() => {
    if (!media) return [initialFormat, 'mp3'];
    const supplied = [...new Set(media.formats.map((item) => item.format))];
    return supplied.length ? supplied : [initialFormat, 'mp3'];
  }, [media]);

  const qualities = useMemo(() => (
    media ? availableQualities(media, format) : [initialQuality]
  ), [media, format]);

  const selectedDownload = media?.formats.find((item) => (
    item.format === format && item.quality === quality
  ));

  const selectMedia = (nextMedia) => {
    setMedia(nextMedia);
    const nextFormat = nextMedia.formats[0]?.format || initialFormat;
    const nextQualities = availableQualities(nextMedia, nextFormat);
    setFormat(nextFormat);
    setQuality(nextMedia.kind === 'direct'
      ? nextQualities[0]
      : nextFormat === 'mp3' ? '128 kbps' : nextQualities.includes('1080p') ? '1080p' : nextQualities[0]);
  };

  const processLink = async (value) => {
    setLoading(true);
    setError('');
    setMedia(null);
    try {
      const nextMedia = await prepareMedia(value);
      selectMedia(nextMedia);
      setUrl(nextMedia.inputUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The link could not be prepared.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading) processLink(url);
  };

  const handlePaste = async () => {
    setError('');
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        setNotice('Your clipboard does not contain a link yet.');
        return;
      }
      setUrl(text.trim());
      inputRef.current?.focus();
    } catch {
      setNotice('Clipboard access is blocked. Paste with Ctrl+V or a long-press instead.');
      inputRef.current?.focus();
    }
  };

  const handleSample = () => {
    const sampleUrl = new URL('/assets/creator-sample.webm', window.location.origin).href;
    setUrl(sampleUrl);
    processLink(sampleUrl);
  };

  const handleFormat = (nextFormat) => {
    setFormat(nextFormat);
    const nextQualities = media ? availableQualities(media, nextFormat) : [];
    setQuality(nextQualities.includes('1080p') && nextFormat === 'mp4'
      ? '1080p'
      : nextQualities.includes('128 kbps') && nextFormat === 'mp3' ? '128 kbps' : nextQualities[0]);
  };

  const handleCopy = async () => {
    if (!media) return;
    try {
      await navigator.clipboard.writeText(media.inputUrl);
      setNotice('Media link copied.');
    } catch {
      setNotice('Copy was blocked by your browser. Select the link from the input instead.');
    }
  };

  const handleDownload = async () => {
    if (!media || !selectedDownload || downloading) return;
    setDownloading(true);
    setError('');
    try {
      const message = await saveMedia(media, selectedDownload);
      setNotice(message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The download could not be started.');
    } finally {
      setDownloading(false);
    }
  };

  const reset = () => {
    setMedia(null);
    setError('');
    setFormat(initialFormat);
    setQuality(initialQuality);
    inputRef.current?.focus();
  };

  return (
    <div className="downloader-wrap">
      <form className={`download-form ${error ? 'has-error' : ''}`} onSubmit={handleSubmit} noValidate>
        <Link2 className="input-link-icon" size={22} aria-hidden="true" />
        <label className="sr-only" htmlFor="video-url">Video, Shorts, or direct media URL</label>
        <input
          ref={inputRef}
          id="video-url"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="Paste your video link here"
          value={url}
          onChange={(event) => { setUrl(event.target.value); setError(''); }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'download-error' : 'download-hint'}
        />
        <button className="paste-button" type="button" onClick={handlePaste} aria-label="Paste link from clipboard">
          <Clipboard size={18} aria-hidden="true" /><span>Paste</span>
        </button>
        <button className="submit-button" type="submit" disabled={loading || !url.trim()}>
          {loading ? <LoaderCircle className="spin" size={20} /> : <ArrowDownToLine size={20} />}
          <span>{loading ? 'Fetching' : 'Get video'}</span>
          {!loading && <ArrowRight className="submit-arrow" size={18} aria-hidden="true" />}
        </button>
      </form>

      <div className="form-subrow" id="download-hint">
        <span><ShieldCheck size={15} /> No account. No software.</span>
        <button type="button" onClick={handleSample} disabled={loading}>
          <Sparkles size={14} /> Try the offline sample
        </button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            id="download-error"
            className="download-error"
            role="alert"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Info size={18} /><span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {media && (
          <motion.section
            className="media-result"
            aria-label="Media download details"
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 260, damping: 27 }}
          >
            <div className="result-topline">
              <span className="result-status"><span />{media.kind === 'direct' ? 'Ready to save' : 'Public video details'}</span>
              <button type="button" className="icon-button" onClick={reset} aria-label="Clear result and enter another link"><X size={19} /></button>
            </div>
            <div className="result-main">
              <a className="result-thumbnail" href={media.url} target="_blank" rel="noreferrer" aria-label={`Open ${media.title} at its source`}>
                {media.mediaType === 'audio' ? <FileAudio size={36} /> : <FileVideo size={36} />}
                {media.thumbnail && <img src={media.thumbnail} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />}
                <span className="thumbnail-open"><ExternalLink size={15} /></span>
              </a>
              <div className="result-copy">
                <span className="result-source">{media.source}</span>
                <h2>{media.title}</h2>
                <p>{media.author}</p>
                <div className="result-links">
                  <button type="button" onClick={handleCopy}><Copy size={14} /> Copy link</button>
                  <a href={media.url} target="_blank" rel="noreferrer">Open source <ExternalLink size={13} /></a>
                </div>
              </div>
            </div>

            <div className="result-options">
              <fieldset>
                <legend>Format</legend>
                <div className="format-segment">
                  {formats.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={format === item ? 'active' : ''}
                      aria-pressed={format === item}
                      onClick={() => handleFormat(item)}
                    >
                      {item === 'mp3' || ['m4a', 'wav', 'ogg'].includes(item)
                        ? <Music2 size={16} /> : <FileVideo size={16} />}
                      {item.toUpperCase()}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="quality-field">
                <span>Quality</span>
                <select value={quality} onChange={(event) => setQuality(event.target.value)}>
                  {qualities.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <button
                className="result-download"
                type="button"
                disabled={!selectedDownload || downloading}
                onClick={handleDownload}
                title={!selectedDownload ? 'An authorized media service is needed for this source' : undefined}
              >
                {downloading ? <LoaderCircle className="spin" size={19} /> : <ArrowDownToLine size={19} />}
                {downloading ? 'Preparing' : selectedDownload ? 'Download' : 'Unavailable'}
                {selectedDownload?.size && <small>{formatBytes(selectedDownload.size)}</small>}
              </button>
            </div>

            {media.kind === 'youtube' && !media.serviceConnected && (
              <div className="service-note">
                <Info size={18} />
                <p><strong>Preview only.</strong> YouTube extraction needs an authorized media service, which is not connected to this reconstruction. No download request has been sent.</p>
              </div>
            )}
            {media.metadataUnavailable && media.kind === 'youtube' && (
              <p className="metadata-note">Public title and channel details could not be retrieved. The thumbnail is derived from the supplied video ID.</p>
            )}
            {media.kind === 'direct' && (
              <div className="direct-note"><Check size={16} /> Original {media.extension.toUpperCase()} file · no conversion or recompression</div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <p className="download-legal">Save only media you own or have permission to download. Respect copyright and source-platform terms.</p>

      <AnimatePresence>
        {notice && (
          <motion.div
            className="toast"
            role="status"
            initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Check size={18} /><span>{notice}</span>
            <button type="button" onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
