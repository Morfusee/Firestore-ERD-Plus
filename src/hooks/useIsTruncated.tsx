import { useEffect, useRef, useState } from "react";

type TruncationResult<T extends HTMLElement> = {
  isTruncated: boolean;
  textRef: React.RefObject<T>;
};

function useIsTruncated<T extends HTMLElement>(text: string): TruncationResult<T> {
  const textRef = useRef<T>(null);
  const [isTruncated, setIsTruncated] = useState<boolean>(false);

  const checkTruncation = () => {
    if (textRef.current) {
      const element = textRef.current;
      setIsTruncated(element.scrollWidth > element.clientWidth);
    }
  };

  useEffect(() => {
    checkTruncation();

    window.addEventListener("resize", checkTruncation);

    return () => {
      window.removeEventListener("resize", checkTruncation);
    };
  }, [text]);

  return { isTruncated, textRef };
}

export default useIsTruncated;
