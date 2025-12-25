import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// ================================================
// Phase 2: 공유 기능 Hooks
// ================================================

/**
 * 공유된 컬렉션 조회
 */
export function useSharedCollections() {
  return useQuery({
    queryKey: ['shared-collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('is_shared', true)
        .order('created_at', { ascending: false});

      if (error) throw error;

      // Manually fetch author information for each collection
      const collectionsWithAuthors = await Promise.all(
        (data || []).map(async (collection) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, email, full_name, hospital, department')
            .eq('id', collection.user_id)
            .maybeSingle();

          return {
            ...collection,
            author: profile || null,
          };
        })
      );

      return collectionsWithAuthors as any[];
    },
  });
}

/**
 * 공유 토글
 */
export function useToggleCollectionShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isShared }: { id: string; isShared: boolean }) => {
      const updates: Record<string, any> = {
        is_shared: !isShared,
      };

      if (!isShared) {
        updates.shared_at = new Date().toISOString();
      } else {
        updates.shared_at = null;
      }

      const { error } = await supabase
        .from('collections')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['shared-collections'] });
      toast.success('공유 설정이 변경되었습니다');
    },
    onError: (error) => {
      console.error('Failed to toggle share:', error);
      toast.error('공유 설정 변경 실패');
    },
  });
}

/**
 * 좋아요 토글
 */
export function useToggleCollectionLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collectionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      // 기존 좋아요 확인
      const { data: existingLike } = await supabase
        .from('collection_likes')
        .select('id')
        .eq('collection_id', collectionId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // 좋아요 취소
        const { error } = await supabase
          .from('collection_likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;
      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from('collection_likes')
          .insert({
            collection_id: collectionId,
            user_id: user.id,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection-like'] });
    },
    onError: (error) => {
      console.error('Failed to toggle like:', error);
      toast.error('좋아요 처리 실패');
    },
  });
}

/**
 * 조회수 증가
 */
export function useIncrementCollectionViewCount() {
  return useMutation({
    mutationFn: async (collectionId: string) => {
      const { error } = await supabase.rpc('increment_collection_view_count', {
        collection_id: collectionId,
      });

      if (error) throw error;
    },
  });
}

/**
 * 공유 컬렉션을 내 수집함에 저장
 */
export function useSaveSharedCollectionToMy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collectionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      // 원본 컬렉션 조회
      const { data: original, error: fetchError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single();

      if (fetchError || !original) throw fetchError;

      // Storage에서 소스 코드 다운로드 (있는 경우)
      let sourceCode: string | null = null;
      if (original.storage_path) {
        const { content } = await downloadCollectionFile(original.storage_path);
        sourceCode = content;
      }

      // 새 컬렉션 ID 생성
      const newId = crypto.randomUUID();

      // Storage 파일 업로드 (있는 경우)
      let newStoragePath: string | null = null;
      if (sourceCode && original.preview_mode !== 'artifact') {
        const extension = original.preview_mode === 'python' ? 'py'
          : original.preview_mode === 'react' ? 'jsx'
          : 'html';

        const { path } = await uploadCollectionFile(
          user.id,
          newId,
          sourceCode,
          extension
        );
        newStoragePath = path;
      }

      // DB에 새 컬렉션 저장
      const { error: insertError } = await supabase
        .from('collections')
        .insert({
          id: newId,
          user_id: user.id,
          title: `${original.title} (공유)`,
          category: original.category,
          preview_mode: original.preview_mode,
          artifact_url: original.artifact_url,
          storage_path: newStoragePath,
          memo: original.memo
            ? `${original.memo}\n\n[출처: 공유 컬렉션]`
            : '[출처: 공유 컬렉션]',
          is_favorite: false,
          is_shared: false,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('내 수집함에 저장되었습니다');
    },
    onError: (error) => {
      console.error('Failed to save shared collection:', error);
      toast.error('저장 실패');
    },
  });
}

/**
 * 사용자가 좋아요 했는지 확인
 */
export function useCheckCollectionLike(collectionId: string) {
  return useQuery({
    queryKey: ['collection-like', collectionId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('collection_likes')
        .select('id')
        .eq('collection_id', collectionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking collection like:", error);
        return false;
      }

      return !!data;
    },
  });
}
