import { rem, Skeleton } from "@mantine/core";
import { useEffect, useState } from "react";

function DeferredRender({
  children,
  idleTimeout,
}: {
  children: React.ReactNode;
  idleTimeout: number;
}) {
  const [render, setRender] = useState(false);

  useEffect(() => {
    if (render) setRender(false);
    const id = requestIdleCallback(() => setRender(true), {
      timeout: idleTimeout,
    });

    return () => cancelIdleCallback(id);
  }, [idleTimeout]);

  if (!render) return null;

  return children;
}

export default DeferredRender;
