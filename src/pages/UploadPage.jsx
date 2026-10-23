import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  FileVideo,
  Film,
  Globe2,
  LoaderCircle,
  Lock,
  ShieldCheck,
  UploadCloud,
  Video,
  X,
} from 'lucide-react';
import { categories } from '../data.js';
import { IconButton } from '../components/UI.jsx';
import { cx, formatDuration } from '../lib/utils.js';

function getFileTitle(filename) {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()).slice(0, 100);
}

export default function UploadPage({ onPublish, goBack }) {
  const inputRef = useRef(null);
  const [mode, setMode] = useState('video');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [duration, setDuration] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Animation');
  const [visibility, setVisibility] = useState('public');
  const [publishing, setPublishing] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setThumbnail('');
    setDuration(0);
    setMediaReady(false);
    setTitle('');
    setDescription('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const selectFile = (selected) => {
    if (!selected) return;
    if (!selected.type.startsWith('video/')) {
      setError('Choose a video file. Audio, images, and documents are not supported.');
      return;
    }
    if (selected.size > 500 * 1024 * 1024) {
      setError('This demo accepts videos up to 500 MB to protect your device storage.');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setError('');
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setTitle(getFileTitle(selected.name));
    setThumbnail('');
    setDuration(0);
    setMediaReady(false);
  };

  const captureThumbnail = (media) => {
    try {
      const canvas = document.createElement('canvas');
      const width = Math.min(media.videoWidth || 640, 960);
      const height = Math.round(width * ((media.videoHeight || 360) / (media.videoWidth || 640)));
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(media, 0, 0, width, height);
      setThumbnail(canvas.toDataURL('image/jpeg', 0.78));
    } catch {
      // A colored fallback thumbnail is used if this browser cannot capture a frame.
    }
  };

  const publish = async () => {
    if (!file || !title.trim()) return;
    if (mode === 'short' && duration > 180) {
      setError('Shorts must be 3 minutes or less. Choose Video instead for this file.');
      return;
    }
    setPublishing(true);
    setError('');
    try {
      await onPublish(file, {
        title: title.trim(),
        description: description.trim() || 'A personal creation shared on MyTube.',
        category,
        visibility,
        isShort: mode === 'short',
        duration,
        thumbnail,
      });
    } catch (publishError) {
      setError(publishError.message || 'The video could not be saved. Check your available device storage and try again.');
      setPublishing(false);
    }
  };

  return (
    <div className="upload-page">
      <header className="upload-header">
        <IconButton label="Close creator" onClick={goBack}><ArrowLeft size={23} /></IconButton>
        <div><h1>Create</h1><p>Your device. Your story.</p></div>
        {file && <button className="text-button" onClick={reset} disabled={publishing}>Start over</button>}
      </header>
      <main className="upload-main">
        {!file ? (
          <div className="upload-welcome">
            <div className="creator-mode-tabs" role="tablist">
              <button role="tab" aria-selected={mode === 'video'} className={mode === 'video' ? 'active' : ''} onClick={() => setMode('video')}><Video size={19} /> Video</button>
              <button role="tab" aria-selected={mode === 'short'} className={mode === 'short' ? 'active' : ''} onClick={() => setMode('short')}><Film size={19} /> Short</button>
            </div>
            <button
              className={cx('upload-dropzone', dragging && 'dragging')}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]); }}
            >
              <span className="upload-hero-icon"><UploadCloud size={39} /></span>
              <h2>{mode === 'short' ? 'Share a Short' : 'Upload a video'}</h2>
              <p>{mode === 'short' ? 'Choose a vertical clip up to 3 minutes, or make any clip work.' : 'Choose a video from your device, or drag and drop it here.'}</p>
              <span className="button button-primary">Choose video</span>
              <small>MP4, WebM, MOV, and other browser-supported formats · Up to 500 MB</small>
            </button>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="local-upload-note"><ShieldCheck size={23} /><div><strong>Private by design</strong><p>Publishing adds the video to this app on this device only. Nothing is sent to YouTube or a remote server.</p></div></div>
            <div className="creator-tips"><h3>A good next step</h3><div><span>1</span><p>Choose a clear title that tells people what they’ll see.</p></div><div><span>2</span><p>Add a description and topic so your video is easy to find.</p></div><div><span>3</span><p>Check your preview, then publish to your local channel.</p></div></div>
          </div>
        ) : (
          <div className="upload-editor">
            <section className="upload-preview-section">
              <div className={cx('upload-preview', mode === 'short' && 'vertical')}>
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  onLoadedMetadata={(event) => {
                    const media = event.currentTarget;
                    setDuration(Number.isFinite(media.duration) ? media.duration : 0);
                    setMediaReady(true);
                    setDimensions({ width: media.videoWidth, height: media.videoHeight });
                  }}
                  onLoadedData={(event) => {
                    const media = event.currentTarget;
                    const capture = () => requestAnimationFrame(() => captureThumbnail(media));
                    if (media.duration > 1) {
                      media.addEventListener('seeked', capture, { once: true });
                      media.currentTime = Math.min(1, media.duration / 3);
                    } else capture();
                  }}
                />
                {!thumbnail && <span className="thumbnail-generating"><LoaderCircle className="spin" size={17} /> Preparing thumbnail</span>}
              </div>
              <div className="selected-file-info"><FileVideo size={20} /><div><strong>{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(1)} MB{duration ? ` · ${formatDuration(duration)}` : ''}{dimensions.width ? ` · ${dimensions.width}×${dimensions.height}` : ''}</span></div><button onClick={reset} aria-label="Remove selected video"><X size={18} /></button></div>
              {mode === 'short' && duration > 180 && <p className="form-error">This clip is longer than 3 minutes. Switch to Video to publish it.</p>}
              {mode === 'short' && dimensions.width > dimensions.height && <p className="form-hint">This is a landscape clip. It will be centered in the Shorts player.</p>}
            </section>
            <section className="upload-details-form">
              <div className="creator-mode-tabs compact" role="tablist">
                <button role="tab" aria-selected={mode === 'video'} className={mode === 'video' ? 'active' : ''} onClick={() => setMode('video')}><Video size={17} /> Video</button>
                <button role="tab" aria-selected={mode === 'short'} className={mode === 'short' ? 'active' : ''} onClick={() => setMode('short')}><Film size={17} /> Short</button>
              </div>
              <label className="form-field"><span>Title <em>Required</em></span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} placeholder="Give your video a title" /><small>{title.length}/100</small></label>
              <label className="form-field"><span>Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1000} rows={5} placeholder="Tell viewers about your video" /><small>{description.length}/1000</small></label>
              <label className="form-field"><span>Topic</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select></label>
              <fieldset className="visibility-field"><legend>Visibility on this device</legend><label className={visibility === 'public' ? 'selected' : ''}><input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={() => setVisibility('public')} /><Globe2 size={20} /><span><strong>Public in MyTube</strong><small>Appears in your local Home feed and search</small></span>{visibility === 'public' && <Check size={18} />}</label><label className={visibility === 'private' ? 'selected' : ''}><input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} /><Lock size={20} /><span><strong>Private</strong><small>Only appears in Your videos</small></span>{visibility === 'private' && <Check size={18} />}</label></fieldset>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-primary button-full publish-button" disabled={!title.trim() || publishing || !mediaReady || (mode === 'short' && (!duration || duration > 180))} onClick={publish}>{publishing ? <><LoaderCircle className="spin" size={19} /> Saving to your device…</> : <><UploadCloud size={19} /> Publish {mode === 'short' ? 'Short' : 'video'}</>}</button>
              <p className="publish-disclaimer">This does not upload to YouTube or share the file online.</p>
            </section>
          </div>
        )}
        <input ref={inputRef} type="file" accept="video/*" hidden onChange={(event) => selectFile(event.target.files[0])} />
      </main>
    </div>
  );
}
