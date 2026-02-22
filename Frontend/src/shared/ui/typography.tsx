import * as React from "react"
import { cn } from "@/lib/utils"

function H1({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn("font-sans text-4xl font-bold tracking-tight", className)}
      {...props}
    />
  )
}

function H2({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("font-sans text-3xl font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function H3({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-sans text-2xl font-semibold", className)} {...props} />
  )
}

function Body({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("font-body text-base leading-7", className)} {...props} />
  )
}

function Caption({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("font-body text-sm text-muted-foreground", className)} {...props} />
  )
}

export { H1, H2, H3, Body, Caption }
