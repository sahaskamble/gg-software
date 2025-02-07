'use client';

import * as React from "react";
import { ThemeProvider as NextThemeProvidre } from "next-themes";

export function GGThemeProvider({ children }) {
  return <NextThemeProvidre>{children}</NextThemeProvidre>;
}