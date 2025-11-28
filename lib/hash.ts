export async function computeFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer
        
        // Use Web Crypto API for SHA-256 hashing
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        
        resolve(`0x${hashHex}`)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

