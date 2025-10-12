async function shaWithWebCrypto(input: string): Promise<string | null> {
  if (
    typeof globalThis.crypto === 'undefined' ||
    !('subtle' in globalThis.crypto)
  ) {
    return null
  }

  try {
    const data = new TextEncoder().encode(input)
    const digest = await globalThis.crypto.subtle.digest('SHA-256', data)
    return bufferToHex(digest)
  } catch {
    return null
  }
}

export async function computeSha256Hex(input: string): Promise<string> {
  const webCryptoResult = await shaWithWebCrypto(input)
  if (webCryptoResult) {
    return webCryptoResult
  }

  return fallbackHash(input)
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function fallbackHash(input: string): string {
  let hash = 0x811C9DC5
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
    hash >>>= 0
  }

  return hash.toString(16).padStart(8, '0')
}
