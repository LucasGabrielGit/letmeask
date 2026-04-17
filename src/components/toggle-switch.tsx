import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useCallback } from "react";

export const ToggleSwitch = () => {
  const { setTheme, theme } = useTheme();

  const handleChangeTheme = useCallback(() => {
    switch (theme) {
      case "dark":
        setTheme("light");
        break;
      case "light":
        setTheme("dark");
        break;
    }
  }, [theme]);

  return (
    <Button variant={"outline"} size={"icon-lg"} onClick={handleChangeTheme}>
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};
