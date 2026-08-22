import React, { useRef, useState } from 'react';
import { MediaAttachment } from '../../types';
import {
  MEDIA_ACCEPT_ATTR,
  MEDIA_MAX_FILES,
  MEDIA_MAX_TOTAL_BYTES,
  buildMediaAttachments,
  formatFileSize,
  totalMediaSize,
} from '../../utils/mediaFiles';
import { Film, Image as ImageIcon, UploadCloud, Trash2, AlertTriangle, Video } from 'lucide-react';

interface MediaUploadSectionProps {
  files: MediaAttachment[];
  onChange: (files: MediaAttachment[]) => void;
}

export const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({ files, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const usedBytes = totalMediaSize(files);
  const usedPercent = Math.min(100, (usedBytes / MEDIA_MAX_TOTAL_BYTES) * 100);
  const isFull = files.length >= MEDIA_MAX_FILES;

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const { accepted, errors: newErrors } = buildMediaAttachments(Array.from(fileList), files);
    if (accepted.length > 0) onChange([...files, ...accepted]);
    setErrors(newErrors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // permite volver a elegir el mismo archivo despues de eliminarlo
    e.target.value = '';
  };

  const handleRemove = (id: string) => {
    const target = files.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(files.filter((item) => item.id !== id));
    setErrors([]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 space-y-5">

      {/* Encabezado de la seccion opcional */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span>¿Quieres añadir fotos o vídeos para encargar un videoclip personalizado?</span>
          </label>
          <p className="text-xs text-slate-400 leading-relaxed">
            Opcional. Adjunta tus recuerdos y nuestro equipo los usará para montar el videoclip de tu encargo.
            Formatos admitidos: JPG, PNG, WEBP, MP4, MOV y WEBM.
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-2.5 py-1 self-start flex-shrink-0">
          Opcional
        </span>
      </div>

      {/* Zona de subida (clic o arrastrar) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isFull && inputRef.current?.click()}
        className={`rounded-2xl border border-dashed p-6 text-center transition-all ${
          isFull
            ? 'border-slate-700 bg-slate-900/40 cursor-not-allowed opacity-70'
            : isDragging
            ? 'border-indigo-500 bg-indigo-600/10 cursor-pointer'
            : 'border-slate-600 bg-slate-900/60 hover:border-indigo-500/70 cursor-pointer'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={MEDIA_ACCEPT_ATTR}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-sm font-bold text-white">
          {isFull ? 'Has alcanzado el máximo de archivos' : 'Selecciona o arrastra tus fotos y vídeos'}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Máximo {MEDIA_MAX_FILES} archivos y {formatFileSize(MEDIA_MAX_TOTAL_BYTES)} en total
        </p>

        <button
          type="button"
          disabled={isFull}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Elegir archivos</span>
        </button>
      </div>

      {/* Contadores de uso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">
            <strong className="text-white font-bold">{files.length}</strong> / {MEDIA_MAX_FILES} archivos
          </span>
          <span className="font-mono text-slate-400">
            {formatFileSize(usedBytes)} / {formatFileSize(MEDIA_MAX_TOTAL_BYTES)}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
          <div
            className={`h-full rounded-full transition-all ${usedPercent > 85 ? 'bg-amber-400' : 'bg-indigo-500'}`}
            style={{ width: `${usedPercent}%` }}
          />
        </div>
      </div>

      {/* Avisos de validacion */}
      {errors.length > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-1">
          <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Algunos archivos no se han añadido</span>
          </p>
          {errors.map((error, idx) => (
            <p key={idx} className="text-[11px] text-amber-200/90 leading-relaxed">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Vistas previas */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {files.map((item) => (
            <div
              key={item.id}
              className="group relative bg-slate-900/70 border border-slate-700 rounded-2xl overflow-hidden hover:border-indigo-500/60 transition-all"
            >
              <div className="relative aspect-square bg-slate-950">
                {item.kind === 'image' ? (
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={item.previewUrl}
                    controls
                    playsInline
                    muted
                    preload="metadata"
                    className="w-full h-full object-cover bg-black"
                  />
                )}

                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700 text-[9px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1 pointer-events-none">
                  {item.kind === 'image' ? (
                    <ImageIcon className="w-2.5 h-2.5" />
                  ) : (
                    <Video className="w-2.5 h-2.5" />
                  )}
                  <span>{item.kind === 'image' ? 'Foto' : 'Vídeo'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  title={`Eliminar ${item.name}`}
                  aria-label={`Eliminar ${item.name}`}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2.5">
                <p className="text-[11px] font-semibold text-white truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {formatFileSize(item.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Los archivos se envían a un almacenamiento privado y seguro solo al confirmar el pedido. Puedes eliminarlos o cambiarlos antes de continuar.
      </p>

    </div>
  );
};

export default MediaUploadSection;
