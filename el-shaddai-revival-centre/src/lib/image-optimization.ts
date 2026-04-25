/**
 * Image Optimization Utility
 * Uses sharp to resize, compress, and convert images to WebP format
 * before uploading to Supabase Storage.
 */

import sharp from 'sharp'

export interface OptimizationOptions {
  /** Max width in pixels (default: 1920) */
  maxWidth?: number
  /** Max height in pixels (default: 1920) */
  maxHeight?: number
  /** Output quality 1-100 (default: 80) */
  quality?: number
  /** Output format (default: 'webp') */
  format?: 'webp' | 'jpeg' | 'png'
}

export interface OptimizationResult {
  /** Optimized image buffer */
  buffer: Buffer
  /** New file extension including dot (e.g., '.webp') */
  extension: string
  /** Output MIME type */
  mimeType: string
  /** Original file size in bytes */
  originalSize: number
  /** Optimized file size in bytes */
  optimizedSize: number
  /** Size reduction percentage */
  reductionPercent: number
}

const DEFAULT_OPTIONS: Required<OptimizationOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 80,
  format: 'webp',
}

/**
 * Optimize an image file using sharp.
 * Resizes to fit within max dimensions, converts to WebP, and compresses.
 */
export async function optimizeImage(
  file: File,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Read file into buffer
  const arrayBuffer = await file.arrayBuffer()
  const originalBuffer = Buffer.from(arrayBuffer)
  const originalSize = originalBuffer.length

  // Build sharp pipeline
  let pipeline = sharp(originalBuffer, {
    failOnError: false,
  }).resize(opts.maxWidth, opts.maxHeight, {
    fit: 'inside',
    withoutEnlargement: true,
  })

  // Convert to target format
  switch (opts.format) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality: opts.quality, mozjpeg: true })
      break
    case 'png':
      pipeline = pipeline.png({ quality: opts.quality, compressionLevel: 9 })
      break
    case 'webp':
    default:
      pipeline = pipeline.webp({ quality: opts.quality, effort: 4 })
      break
  }

  const optimizedBuffer = await pipeline.toBuffer()
  const optimizedSize = optimizedBuffer.length

  const reductionPercent =
    originalSize > 0
      ? Math.round(((originalSize - optimizedSize) / originalSize) * 100)
      : 0

  const extensionMap: Record<string, string> = {
    webp: '.webp',
    jpeg: '.jpg',
    png: '.png',
  }

  const mimeTypeMap: Record<string, string> = {
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    png: 'image/png',
  }

  return {
    buffer: optimizedBuffer,
    extension: extensionMap[opts.format],
    mimeType: mimeTypeMap[opts.format],
    originalSize,
    optimizedSize,
    reductionPercent,
  }
}

/**
 * Preset for general media uploads (events, testimonies, gallery).
 * 1920px max, WebP, 80% quality.
 */
export async function optimizeGeneralImage(file: File): Promise<OptimizationResult> {
  return optimizeImage(file, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 80,
    format: 'webp',
  })
}

/**
 * Preset for avatar/profile images.
 * 800px max, WebP, 80% quality.
 */
export async function optimizeAvatarImage(file: File): Promise<OptimizationResult> {
  return optimizeImage(file, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 80,
    format: 'webp',
  })
}

/**
 * Create an optimized File object from a File, ready for upload.
 * Preserves the original file name (with new extension) and updates MIME type.
 */
export async function createOptimizedFile(
  file: File,
  options: OptimizationOptions = {}
): Promise<File> {
  const result = await optimizeImage(file, options)

  // Build new file name with correct extension
  const baseName = file.name.replace(/\.[^/.]+$/, '')
  const newName = `${baseName}${result.extension}`

  return new File([result.buffer], newName, { type: result.mimeType })
}

/**
 * Create an optimized File object using the general preset.
 */
export async function createOptimizedGeneralFile(file: File): Promise<File> {
  const result = await optimizeGeneralImage(file)
  const baseName = file.name.replace(/\.[^/.]+$/, '')
  const newName = `${baseName}${result.extension}`
  return new File([result.buffer], newName, { type: result.mimeType })
}

/**
 * Create an optimized File object using the avatar preset.
 */
export async function createOptimizedAvatarFile(file: File): Promise<File> {
  const result = await optimizeAvatarImage(file)
  const baseName = file.name.replace(/\.[^/.]+$/, '')
  const newName = `${baseName}${result.extension}`
  return new File([result.buffer], newName, { type: result.mimeType })
}
