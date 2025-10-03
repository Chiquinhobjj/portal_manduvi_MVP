import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Upload,
  Trash2,
  Download,
  Search,
  Image as ImageIcon,
  File,
  Copy,
  Folder,
} from 'lucide-react';
import { logger } from '../lib/logger';
import { mediaPresets, getPresetByFolder } from '../lib/mediaPresets';

interface MediaFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  folder: string;
  tags: string[];
  alt_text: string | null;
  uploaded_at: string;
}

// Pastas dinâmicas obtidas do Storage para espelhar a UI do Supabase
function useStorageFolders() {
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchFolders() {
      try {
        setLoading(true);
        const { data, error } = await supabase.storage.from('media').list('', {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' },
        });
        if (error) throw error;
        const names = (data || [])
          .map((item: any) => item.name)
          .filter((name: string) => !!name);
        if (mounted) setFolders(names);
      } catch (err) {
        logger.error('Erro ao listar pastas do Storage:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchFolders();
    return () => {
      mounted = false;
    };
  }, []);

  return { folders, loading };
}

export function AdminMediaPage() {
  const { profile } = useAuth();
  const { folders: storageFolders, loading: loadingFolders } = useStorageFolders();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [uploadData, setUploadData] = useState({
    file_name: '',
    file_url: '', // opcional se usar Storage
    folder: 'general',
    alt_text: '',
    tags: '',
  });

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  useEffect(() => {
    filterFiles();
  }, [mediaFiles, selectedFolder, searchQuery]);

  async function fetchMediaFiles() {
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setMediaFiles(data || []);
    } catch (error) {
      logger.error('Error fetching media files:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterFiles() {
    let filtered = mediaFiles;

    if (selectedFolder !== 'all') {
      filtered = filtered.filter((file) => file.folder === selectedFolder);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.file_name.toLowerCase().includes(query) ||
          file.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          (file.alt_text && file.alt_text.toLowerCase().includes(query))
      );
    }

    setFilteredFiles(filtered);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const tags = uploadData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      let publicUrl = uploadData.file_url;
      let fileType = 'image/unknown';
      let fileSize = 0;
      let width: number | null = null;
      let height: number | null = null;

      // Se um arquivo local foi selecionado, faz upload para o Storage
      if (selectedFile) {
        fileType = selectedFile.type || fileType;
        fileSize = selectedFile.size;
        if (imageSize) {
          width = imageSize.width;
          height = imageSize.height;
        }

        const path = `${uploadData.folder}/${Date.now()}_${selectedFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(path, selectedFile, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage.from('media').getPublicUrl(path);
        publicUrl = publicData.publicUrl;
      }

      // Validação simples: precisa de arquivo (local ou URL)
      if (!publicUrl) {
        alert('Selecione um arquivo de imagem ou informe uma URL pública.');
        return;
      }

      const { error } = await supabase.from('media_library').insert({
        file_name: uploadData.file_name || (selectedFile ? selectedFile.name : publicUrl),
        file_url: publicUrl,
        file_type: fileType,
        file_size: fileSize,
        width,
        height,
        folder: uploadData.folder,
        alt_text: uploadData.alt_text || null,
        tags,
        uploaded_by: profile?.id,
      });

      if (error) throw error;

      await logActivity('create', 'media_file', null);
      setShowUploadModal(false);
      resetForm();
      fetchMediaFiles();
    } catch (error) {
      logger.error('Error uploading file:', error);
      alert('Erro ao fazer upload do arquivo');
    }
  }

  async function handleDelete(file: MediaFile) {
    if (!confirm(`Tem certeza que deseja excluir "${file.file_name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('media_library').delete().eq('id', file.id);

      if (error) throw error;

      await logActivity('delete', 'media_file', file.id);
      fetchMediaFiles();
    } catch (error) {
      logger.error('Error deleting file:', error);
      alert('Erro ao excluir arquivo');
    }
  }

  async function logActivity(action: string, entityType: string, entityId: string | null) {
    try {
      await supabase.from('admin_activity_log').insert({
        user_id: profile?.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
      });
    } catch (error) {
      logger.error('Error logging activity:', error);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('URL copiada para a área de transferência!');
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  function resetForm() {
    setUploadData({
      file_name: '',
      file_url: '',
      folder: 'general',
      alt_text: '',
      tags: '',
    });
    setSelectedFile(null);
    setImageSize(null);
  }

  const totalSize = mediaFiles.reduce((sum, file) => sum + file.file_size, 0);

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-brand font-bold text-ui-text dark:text-dark-text">
              Biblioteca de Mídia
            </h1>
            <p className="text-ui-muted dark:text-dark-muted mt-1">
              Gerencie imagens e arquivos utilizados no site
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-warm"
          >
            <Upload className="h-5 w-5" />
            Fazer Upload
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-4">
            <p className="text-sm text-ui-muted dark:text-dark-muted mb-1">Total de Arquivos</p>
            <p className="text-2xl font-bold text-ui-text dark:text-dark-text">
              {mediaFiles.length}
            </p>
          </div>

          <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-4">
            <p className="text-sm text-ui-muted dark:text-dark-muted mb-1">Armazenamento</p>
            <p className="text-2xl font-bold text-ui-text dark:text-dark-text">
              {formatFileSize(totalSize)}
            </p>
          </div>

          <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-4">
            <p className="text-sm text-ui-muted dark:text-dark-muted mb-1">Pastas</p>
            <p className="text-2xl font-bold text-ui-text dark:text-dark-text">
              {loadingFolders ? '...' : storageFolders.length}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ui-muted dark:text-dark-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, tags ou descrição..."
              className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel pl-10 pr-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="all">Todas as Pastas</option>
            {storageFolders.map((name) => (
              <option key={name} value={name}>
                {getPresetByFolder(name)?.label || name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel overflow-hidden hover:border-brand transition-all"
            >
              <div className="aspect-square bg-ui-bg dark:bg-dark-bg flex items-center justify-center p-4 relative">
                {file.file_type.startsWith('image/') ? (
                  <img
                    src={file.file_url}
                    alt={file.alt_text || file.file_name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <File className="h-12 w-12 text-ui-muted dark:text-dark-muted" />
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyToClipboard(file.file_url)}
                    className="rounded-lg bg-white/90 p-2 hover:bg-white transition-colors"
                    title="Copiar URL"
                  >
                    <Copy className="h-4 w-4 text-gray-900" />
                  </button>
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-white/90 p-2 hover:bg-white transition-colors"
                    title="Baixar"
                  >
                    <Download className="h-4 w-4 text-gray-900" />
                  </a>
                  <button
                    onClick={() => handleDelete(file)}
                    className="rounded-lg bg-red-500/90 p-2 hover:bg-red-500 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-3">
                <p className="text-sm font-medium text-ui-text dark:text-dark-text truncate mb-1">
                  {file.file_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-ui-muted dark:text-dark-muted">
                  <Folder className="h-3 w-3" />
                  <span>{folders.find((f) => f.value === file.folder)?.label}</span>
                </div>
                {file.width && file.height && (
                  <p className="text-xs text-ui-muted dark:text-dark-muted mt-1">
                    {file.width} × {file.height}
                  </p>
                )}
                {file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {file.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="rounded bg-brand/10 px-2 py-0.5 text-xs text-brand"
                      >
                        {tag}
                      </span>
                    ))}
                    {file.tags.length > 2 && (
                      <span className="text-xs text-ui-muted dark:text-dark-muted">
                        +{file.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredFiles.length === 0 && !loading && (
        <div className="text-center py-12 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel">
          <ImageIcon className="h-12 w-12 text-ui-muted dark:text-dark-muted mx-auto mb-4" />
          <p className="text-ui-muted dark:text-dark-muted mb-4">
            {searchQuery || selectedFolder !== 'all'
              ? 'Nenhum arquivo encontrado com esses filtros'
              : 'Nenhum arquivo na biblioteca ainda'}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-warm"
          >
            <Upload className="h-5 w-5" />
            Fazer Upload
          </button>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border max-h-[90vh] overflow-y-auto">
            <div className="border-b border-ui-border dark:border-dark-border p-6">
              <h2 className="text-xl font-bold text-ui-text dark:text-dark-text">
                Upload de Arquivo
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  Nome do Arquivo *
                </label>
                <input
                  type="text"
                  value={uploadData.file_name}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, file_name: e.target.value })
                  }
                  className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  required
                />
              </div>

              {/* Upload de arquivo local para o Storage */}
              <div>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  Arquivo de Imagem (Upload)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0] || null;
                    setSelectedFile(f);
                    if (f) {
                      const blobUrl = URL.createObjectURL(f);
                      const img = new Image();
                      img.onload = () => {
                        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
                        URL.revokeObjectURL(blobUrl);
                      };
                      img.src = blobUrl;
                    } else {
                      setImageSize(null);
                    }
                  }}
                  className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                {imageSize && (
                  <p className="mt-2 text-xs text-ui-muted dark:text-dark-muted">
                    Dimensões detectadas: {imageSize.width} × {imageSize.height}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  URL pública (opcional)
                </label>
                <input
                  type="url"
                  value={uploadData.file_url}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, file_url: e.target.value })
                  }
                  className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder="https://... (use se a imagem já estiver pública)"
                />
                {uploadData.file_url && (
                  <div className="mt-2 p-2 bg-ui-bg dark:bg-dark-bg rounded-lg">
                    <img
                      src={uploadData.file_url}
                      alt="Preview"
                      className="max-w-full max-h-48 object-contain mx-auto"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  Pasta *
                </label>
                <select
                  value={uploadData.folder}
                  onChange={(e) => setUploadData({ ...uploadData, folder: e.target.value })}
                  className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  required
                >
                  {storageFolders.map((name) => (
                    <option key={name} value={name}>
                      {getPresetByFolder(name)?.label || name}
                    </option>
                  ))}
                </select>
                {/* Dicas de tamanho por local */}
                {getPresetByFolder(uploadData.folder) && (
                  <div className="mt-2 text-xs rounded bg-ui-bg dark:bg-dark-bg p-2">
                    <p className="text-ui-muted dark:text-dark-muted">
                      Local: {getPresetByFolder(uploadData.folder)!.label}
                    </p>
                    <p className="text-ui-muted dark:text-dark-muted">
                      Tamanho recomendado: {getPresetByFolder(uploadData.folder)!.recommendedWidth} × {getPresetByFolder(uploadData.folder)!.recommendedHeight}px
                    </p>
                    <p className="text-ui-muted dark:text-dark-muted">
                      Componente: {getPresetByFolder(uploadData.folder)!.targetComponent} • Página: {getPresetByFolder(uploadData.folder)!.targetLocation}
                    </p>
                  </div>
                )}
              </div>

              {/* Link de destino opcional (para anúncios) */}
              <div>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  URL de Destino (opcional)
                </label>
                <input
                  type="url"
                  value={(uploadData as any).link_url || ''}
                  onChange={(e) => setUploadData({ ...uploadData, link_url: e.target.value } as any)}
                  placeholder="https://... (link quando clicar na imagem)"
                  className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  Texto Alternativo (Alt)
                </label>
                <input
                  type="text"
                  value={uploadData.alt_text}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, alt_text: e.target.value })
                  }
                  placeholder="Descrição para acessibilidade"
                  className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                  placeholder="ex: banner, home, principal"
                  className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-lg border border-ui-border dark:border-dark-border px-4 py-2 text-sm font-medium text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-warm transition-colors"
                >
                  Fazer Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
