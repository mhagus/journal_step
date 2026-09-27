import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
        win: "badge-win",
        loss: "badge-loss",
        breakeven: "badge-breakeven",
        buy: "bg-green-500/10 text-green-400 border border-green-500/20",
        sell: "bg-red-500/10 text-red-400 border border-red-500/20",
        outline: "border border-zinc-700 text-zinc-300",
        secondary: "bg-zinc-800 text-zinc-300",
        high: "bg-red-500/10 text-red-400 border border-red-500/20",
        medium: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        low: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
