import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase, uploadCollectionFile, downloadCollectionFile, deleteCollectionFile } from '@/lib/supabase';
import type { Collection, CollectionWithContent, CreateCollectionInput, UpdateCollectionInput } from '@/types/collection';

/**
 * 프로그램 수집함 - Supabase 기반 컬렉션 관리 Hook
 */
export function useCollections() {
  const { user } = useAuthContext();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 컬렉션 목록 조회
  const fetchCollections = useCallback(async () => {
    if (!user) {
      setCollections([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCollections(data || []);
    } catch (error) {
      console.error('Failed to load collections:', error);
      toast.error('컬렉션 불러오기 실패');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 초기 로드
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // 컬렉션 저장
  const saveCollection = useCallback(async (input: CreateCollectionInput) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return null;
    }

    try {
      // 1. HTML, Python 또는 React 모드인 경우 Storage에 파일 업로드
      let storagePath: string | null = null;
      if ((input.preview_mode === 'html' || input.preview_mode === 'python' || input.preview_mode === 'react') && input.sourceCode) {
        const collectionId = crypto.randomUUID();
        const fileExtension = input.preview_mode === 'python' ? 'py' : input.preview_mode === 'react' ? 'jsx' : 'html';
        const { path, error } = await uploadCollectionFile(
          user.id,
          collectionId,
          input.sourceCode,
          fileExtension
        );

        if (error) throw error;
        storagePath = path;

        // 2. DB에 메타데이터 저장
        const { data, error: dbError } = await supabase
          .from('collections')
          .insert({
            id: collectionId,
            user_id: user.id,
            title: input.title,
            category: input.category,
            preview_mode: input.preview_mode,
            artifact_url: input.artifact_url || null,
            storage_path: storagePath,
            memo: input.memo || null,
            is_favorite: input.is_favorite || false,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        setCollections((prev) => [data, ...prev]);
        toast.success('컬렉션이 저장되었습니다');
        return data;
      } else if (input.preview_mode === 'artifact') {
        // Artifact 모드인 경우 URL만 저장
        const { data, error: dbError } = await supabase
          .from('collections')
          .insert({
            user_id: user.id,
            title: input.title,
            category: input.category,
            preview_mode: input.preview_mode,
            artifact_url: input.artifact_url || null,
            storage_path: null,
            memo: input.memo || null,
            is_favorite: input.is_favorite || false,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        setCollections((prev) => [data, ...prev]);
        toast.success('컬렉션이 저장되었습니다');
        return data;
      }
    } catch (error) {
      console.error('Failed to save collection:', error);
      toast.error('저장 실패');
      return null;
    }
  }, [user]);

  // 컬렉션 삭제
  const deleteCollection = useCallback(async (id: string) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    try {
      // 1. 컬렉션 정보 가져오기
      const collection = collections.find((c) => c.id === id);
      if (!collection) {
        toast.error('컬렉션을 찾을 수 없습니다');
        return;
      }

      // 2. Storage 파일 삭제 (HTML 모드인 경우)
      if (collection.storage_path) {
        const { error: storageError } = await deleteCollectionFile(collection.storage_path);
        if (storageError) {
          console.error('Storage delete error:', storageError);
        }
      }

      // 3. DB에서 삭제
      const { error: dbError } = await supabase
        .from('collections')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      setCollections((prev) => prev.filter((c) => c.id !== id));
      toast.success('컬렉션이 삭제되었습니다');
    } catch (error) {
      console.error('Failed to delete collection:', error);
      toast.error('삭제 실패');
    }
  }, [user, collections]);

  // 컬렉션 업데이트
  const updateCollection = useCallback(async (id: string, updates: UpdateCollectionInput) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    try {
      // HTML 소스 코드가 업데이트되는 경우 Storage에도 업데이트
      if (updates.sourceCode) {
        const collection = collections.find((c) => c.id === id);
        if (collection && collection.storage_path) {
          const { error } = await uploadCollectionFile(
            user.id,
            id,
            updates.sourceCode
          );
          if (error) throw error;
        }
      }

      // DB 업데이트
      const { data, error } = await supabase
        .from('collections')
        .update({
          title: updates.title,
          category: updates.category,
          preview_mode: updates.preview_mode,
          artifact_url: updates.artifact_url,
          memo: updates.memo,
          is_favorite: updates.is_favorite,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setCollections((prev) =>
        prev.map((c) => (c.id === id ? data : c))
      );
      toast.success('컬렉션이 업데이트되었습니다');
    } catch (error) {
      console.error('Failed to update collection:', error);
      toast.error('업데이트 실패');
    }
  }, [user, collections]);

  // ID로 컬렉션 찾기 (소스 코드 포함)
  const getCollectionById = useCallback(async (id: string): Promise<CollectionWithContent | null> => {
    if (!user) return null;

    try {
      const collection = collections.find((c) => c.id === id);
      if (!collection) return null;

      // HTML, Python 또는 React 모드인 경우 Storage에서 소스 코드 다운로드
      if ((collection.preview_mode === 'html' || collection.preview_mode === 'python' || collection.preview_mode === 'react') && collection.storage_path) {
        const { content, error } = await downloadCollectionFile(collection.storage_path);
        if (error) throw error;

        return {
          ...collection,
          sourceCode: content || undefined,
        };
      }

      return collection;
    } catch (error) {
      console.error('Failed to get collection:', error);
      toast.error('컬렉션 로드 실패');
      return null;
    }
  }, [user, collections]);

  return {
    collections,
    isLoading,
    saveCollection,
    deleteCollection,
    updateCollection,
    getCollectionById,
    refetch: fetchCollections,
  };
}
