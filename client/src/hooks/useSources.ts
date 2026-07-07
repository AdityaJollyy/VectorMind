import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ApiEnvelope, Source } from "@/lib/types";

const SOURCES_KEY = ["sources"];

export function useSources() {
  return useQuery({
    queryKey: SOURCES_KEY,
    queryFn: async () => {
      const res = await api.get<ApiEnvelope<{ sources: Source[] }>>("/sources");
      return res.data.data.sources;
    },
    // Poll every 2.5s while anything is still processing; stop otherwise.
    refetchInterval: (query) =>
      query.state.data?.some((s) => s.status === "processing") ? 2500 : false,
  });
}

/** Shared plumbing for the three create mutations. */
function useCreateSource<TInput>(
  request: (input: TInput) => Promise<Source>,
  onCreated?: (source: Source) => void
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: (source) => {
      queryClient.invalidateQueries({ queryKey: SOURCES_KEY });
      toast.success("Source added — processing started");
      onCreated?.(source);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUploadFile(onCreated?: (source: Source) => void) {
  return useCreateSource(async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<ApiEnvelope<{ source: Source }>>(
      "/sources/upload",
      form
    );
    return res.data.data.source;
  }, onCreated);
}

export function useCreateText(onCreated?: (source: Source) => void) {
  return useCreateSource(async (content: string) => {
    const res = await api.post<ApiEnvelope<{ source: Source }>>(
      "/sources/text",
      { content }
    );
    return res.data.data.source;
  }, onCreated);
}

export function useCreateUrl(onCreated?: (source: Source) => void) {
  return useCreateSource(async (url: string) => {
    const res = await api.post<ApiEnvelope<{ source: Source }>>(
      "/sources/url",
      { url }
    );
    return res.data.data.source;
  }, onCreated);
}

export function useDeleteSource(onDeleted?: (id: string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/sources/${id}`).then(() => id),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: SOURCES_KEY });
      toast.success("Source deleted");
      onDeleted?.(id);
    },
    onError: (err) => toast.error(err.message),
  });
}
