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

  const nodeCrypto = await import('node:crypto')
  const hash = nodeCrypto.createHash('sha256')
  hash.update(input)
  return hash.digest('hex')
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
