// ScrollContext.js
import { createContext, useContext, useRef } from "react";

const ScrollContext = createContext();

export const ScrollProvider = ({ children }) => {
  const scrollContainerRef = useRef(null);
  return (
    <ScrollContext.Provider value={scrollContainerRef}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => useContext(ScrollContext);
