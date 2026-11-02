import { PageTransition } from "@/components/page-transition";

/**
 * App Router template: re-mounted on navigation, so each new page animates in
 * (gentle fade + float up, CSS only). See src/components/page-transition.tsx.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
