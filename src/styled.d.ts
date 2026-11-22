import "styled-components";
import { ThemeColorsType } from "./theme/constants";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: ThemeColorsType;
    isDark: boolean;
  }
}
