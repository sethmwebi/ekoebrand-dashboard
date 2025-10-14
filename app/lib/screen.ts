import { useEffect, useState } from "react";

interface ScreenDimensions {
  width: number;
  height: number;
}

export const getClientScreenSize = (): ScreenDimensions => {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

export const useScreenSize = (): ScreenDimensions => {
  const [dimensions, setDimensions] = useState<ScreenDimensions>(
    getClientScreenSize()
  );

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getClientScreenSize());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
};

export const getServerScreenSize = (_: Request): ScreenDimensions => {
  return { width: 1440, height: 900 };
};

export const getScreenSizeLoaderData = (request: Request) => {
  return {
    screen: getServerScreenSize(request),
  };
};
