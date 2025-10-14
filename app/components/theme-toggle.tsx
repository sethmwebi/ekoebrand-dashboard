import { Sun, Moon } from "lucide-react";
import { useTheme } from "~/providers/theme-provider";

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <Sun className="h-4 w-4 cursor-pointer" />
      ) : (
        <Moon className="h-4 w-4 cursor-pointer" />
      )}
    </button>
  );
}
