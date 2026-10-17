import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "ECO DOT — Sua equipe de IA", description: "Crie, configure e gerencie seus próprios funcionários de inteligência artificial.", applicationName: "ECO DOT" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f7f7f4" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
