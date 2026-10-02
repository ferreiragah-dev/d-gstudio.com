import type { LucideIcon } from "lucide-react";

export type Service = { title: string; description: string; icon: LucideIcon };
export type Project = {
  id: string;
  name: string;
  category: string;
  type: string;
  theme: "architecture" | "wellness" | "photography" | "store";
  headline: string;
  description: string;
  tags: string[];
};
export type Plan = {
  name: string;
  badge: string;
  description: string;
  features: string[];
  featured?: boolean;
  projectType: string;
};
