import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Plus,
  Search,
  Grid3x3,
  List,
  Trash2,
  Share2,
  MoreVertical,
  FolderOpen,
  File,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Archive,
  Home,
  Share,
  Trash,
  Settings,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

export default function CloudWorkspace() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = selectedFiles;

  const { data: files, isLoading } = trpc.cloud.listFiles.useQuery({ folder: '/' });
  const { data: onboardingStatus } = trpc.onboarding.getOnboardingStatus.useQuery();

  // Calcular storage com bônus
  const baseStorage = 60; // Default 60GB
  const bonusStorage = onboardingStatus?.storageBonusApplied ? baseStorage * 0.5 : 0;
  const totalStorage = baseStorage + bonusStorage;
  const usedStorage = 0; // Será atualizado com dados reais
  const storagePercentage = (usedStorage / totalStorage) * 100;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-6 h-6" />;
    if (mimeType.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-6 h-6" />;
    if (mimeType.includes('pdf') || mimeType.includes('document'))
      return <FileText className="w-6 h-6" />;
    if (mimeType.includes('zip') || mimeType.includes('archive'))
      return <Archive className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const filteredFiles = (files || []).filter((file) =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">Vya</h1>
        </div>

        {/* New Button */}
        <div className="p-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Novo
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 font-medium flex items-center gap-3 cursor-pointer">
            <Home className="w-5 h-5" />
            Meu Drive
          </div>
          <div className="p-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium flex items-center gap-3 cursor-pointer">
            <Share className="w-5 h-5" />
            Compartilhados
          </div>
          <div className="p-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium flex items-center gap-3 cursor-pointer">
            <Trash className="w-5 h-5" />
            Lixeira
          </div>
        </nav>

        {/* Storage Progress */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Armazenamento</span>
              {onboardingStatus?.storageBonusApplied && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  Bônus Ativo
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-600">
            {(usedStorage / 1024).toFixed(1)} GB de {(totalStorage / 1024).toFixed(1)} GB
          </p>
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-gray-200">
          <div className="p-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium flex items-center gap-3 cursor-pointer">
            <Settings className="w-5 h-5" />
            Configurações
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Pesquisar no Drive"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500"
            />
            </div>
          </div>
        </div>

        {/* Files Section */}
        <div className="flex-1 overflow-auto p-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {searchQuery ? `Resultados para "${searchQuery}"` : 'Meus Arquivos'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Files Grid/List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Carregando arquivos...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FolderOpen className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Nenhum arquivo encontrado</p>
              <p className="text-gray-400 text-sm mt-2">
                Clique em "Novo" para começar a fazer upload
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <Card
                  key={file.id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="flex items-center justify-center h-24 bg-gray-100 rounded-lg mb-3 group-hover:bg-gray-200">
                    <div className="text-gray-400">
                      {getFileIcon(file.mimeType)}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.filename}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 p-1 text-gray-600 hover:bg-gray-100 rounded">
                      <Share2 className="w-4 h-4 mx-auto" />
                    </button>
                    <button className="flex-1 p-1 text-gray-600 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-gray-50 group"
                >
                  <div className="text-gray-400">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-600 hover:bg-gray-200 rounded">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-200 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
