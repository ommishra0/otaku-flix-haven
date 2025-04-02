
import { useEffect, useState, useRef, RefObject } from 'react';

interface IntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
  skip?: boolean;
}

export function useInView(options: IntersectionObserverOptions = {}): {
  ref: RefObject<any>;
  inView: boolean;
  entry: IntersectionObserverEntry | null;
} {
  const { 
    root = null, 
    rootMargin = '0px', 
    threshold = 0,
    triggerOnce = false,
    skip = false
  } = options;
  
  const [inView, setInView] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const ref = useRef<Element | null>(null);
  const frozen = useRef(false);
  
  useEffect(() => {
    if (skip || (triggerOnce && frozen.current)) return;
    
    const node = ref.current;
    if (!node) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        
        const isIntersecting = entry.isIntersecting;
        setInView(isIntersecting);
        
        if (triggerOnce && isIntersecting) {
          frozen.current = true;
        }
      },
      { root, rootMargin, threshold }
    );
    
    observer.observe(node);
    
    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, triggerOnce, skip]);
  
  return { ref, inView, entry };
}
