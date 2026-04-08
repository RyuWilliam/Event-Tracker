export function resolveImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl
  }

  if (imageUrl.startsWith("/")) {
    return imageUrl
  }

  return imageUrl
}