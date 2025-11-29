import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

export interface Refs {
  [key: string]: HTMLDivElement | null;
}

function Virtualizer({
  scrollingContainerRef,
  itemRefs,
  componentKey,
  children,
}: {
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  itemRefs: Refs;
  componentKey: string;
  children: React.ReactNode;
  // (
  //   componentKey: string,
  //   setRefs: (node: any) => void,
  //   height: number,
  //   inView: boolean,
  //   heightRef: React.MutableRefObject<any>
  // ) => JSX.Element;
}) {
  const [height, setHeight] = useState(0);
  const [inViewRef, inView] = useInView({
    rootMargin: "150% 150%", // Extends the "viewport"
    root: scrollingContainerRef.current, // Use the scrolling container as the root so we can use rootMargin
    fallbackInView: true,
  });
  const heightRef = useRef<any>(null);

  /**
   * Responsible for measuring the height of
   * the child element before painting
   */
  useLayoutEffect(() => {
    if (inView && heightRef.current) {
      // Measure the height of the child element
      const measuredHeight = heightRef.current.getBoundingClientRect().height;
      // Update the height of the parent element
      setHeight(measuredHeight);
    }
  }, [inView, children]);

  /**
   * Allows us to set multiple refs for a single element
   * @param {any} node - The node to be set as a ref
   * @returns {void}
   */
  const setRefs = useCallback(
    (node: any) => {
      // Ref's from useRef needs to have the node assigned to `current`
      if (node) itemRefs[componentKey] = node;
      // Callback refs, like the one from `useInView`, is a function that takes the node as an argument
      inViewRef(node);
    },
    [itemRefs, componentKey, inViewRef]
  );

  return (
    <>
      {/* {children(componentKey, setRefs, height, inView, heightRef)} */}
      <div
        key={componentKey}
        ref={setRefs}
        style={{ minHeight: height || "auto" }}
        className="w-full"
      >
        {inView ? (
          <div ref={heightRef} className="w-full">
            {children}
          </div>
        ) : (
          // Render a placeholder div with the measured height
          <div
            style={{ height: height || "auto" }}
            className="bg-blue-300 w-full"
          />
        )}
      </div>
    </>
  );
}

export default Virtualizer;
