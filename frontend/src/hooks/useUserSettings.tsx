import {
    CanvasBackgroundOptions,
    ThemeOptions,
} from "@/integrations/api/generated";
import { getApiSettingsOptions } from "@/integrations/api/generated/@tanstack/react-query.gen";
import { useFirebaseAuth } from "@/integrations/firebase/firebase-auth-provider";
import { getContext } from "@/integrations/tanstack-query/root-provider";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const { queryClient } = getContext();

interface ISettings {
  autoSaveInterval: number;
  canvasBackground: CanvasBackgroundOptions;
  theme: ThemeOptions;
}

function useUserSettings() {
  const { user } = useFirebaseAuth();

  const settingsQuery = getApiSettingsOptions({
    query: { Email: user?.email || "" },
  });
  const { data: queryData } = useQuery({ ...settingsQuery, enabled: !!user });

  const settingsQueryKey = settingsQuery.queryKey;

  const settingsQueryData =
    queryClient.getQueryState(settingsQueryKey)?.data?.data;

  // Derived settings object
  const settings = useMemo<ISettings>(() => {
    return {
      autoSaveInterval: settingsQueryData?.autoSaveInterval || 0,
      canvasBackground: settingsQueryData?.canvasBackground || "Dots",
      theme: settingsQueryData?.theme || "Dark",
    };
  }, [settingsQueryData]);

  // Setter for updating settings in the cache
  const setSettings = <K extends keyof ISettings>(
    key: K,
    value: ISettings[K]
  ) => {
    queryClient.setQueryData(settingsQueryKey, (old) => {
      if (!old?.data) return old;

      return {
        ...old,
        data: {
          ...old.data,
          [key]: value,
        },
      };
    });
  };

  return { settings, setSettings };
}

export default useUserSettings;
