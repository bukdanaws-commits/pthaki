/**
 * Alibaba Cloud DashScope Image Generation
 * 
 * This module provides direct integration with Alibaba Cloud's
 * DashScope API for AI image generation.
 * 
 * Documentation: https://help.aliyun.com/document_detail/2892313.html
 */

interface ImageGenerationResponse {
  output?: {
    task_id: string
    task_status: string
    results?: Array<{
      url: string
    }>
    // For synchronous response
    image?: string  // base64 encoded image
  }
  request_id: string
  code?: string
  message?: string
}

interface TaskResultResponse {
  output: {
    task_id: string
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN'
    results?: Array<{
      url: string
    }>
    message?: string
    image?: string  // base64 encoded image for some models
  }
  request_id: string
}

/**
 * Generate an AI image using Alibaba Cloud DashScope API
 * Supports both synchronous and asynchronous modes
 */
export async function generateImageWithAlibaba(prompt: string): Promise<string | null> {
  const apiKey = process.env.ZAI_API_KEY || process.env.ALIBABA_DASHSCOPE_API_KEY
  
  if (!apiKey) {
    console.error('No Alibaba Cloud API key found. Set ZAI_API_KEY or ALIBABA_DASHSCOPE_API_KEY environment variable.')
    return null
  }

  console.log('Generating image with Alibaba Cloud DashScope...')
  console.log(`Prompt: ${prompt}`)

  // Try multiple endpoints and models
  const attempts = [
    { name: 'wanx-v1 (async)', fn: () => generateWithWanxAsync(prompt, apiKey) },
    { name: 'wanx-v1 (sync)', fn: () => generateWithWanxSync(prompt, apiKey) },
    { name: 'flux-schnell', fn: () => generateWithFlux(prompt, apiKey) },
  ]

  for (const attempt of attempts) {
    try {
      console.log(`Trying ${attempt.name}...`)
      const result = await attempt.fn()
      if (result) {
        console.log(`Success with ${attempt.name}`)
        return result
      }
    } catch (error) {
      console.error(`${attempt.name} failed:`, error)
    }
  }

  return null
}

/**
 * Generate image with Wanx model (async mode)
 */
async function generateWithWanxAsync(prompt: string, apiKey: string): Promise<string | null> {
  const baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: 'wanx-v1',
      input: {
        prompt: prompt,
      },
      parameters: {
        style: '<auto>',
        size: '1024*1024',
        n: 1,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Wanx async error: ${response.status} - ${errorText}`)
    return null
  }

  const result: ImageGenerationResponse = await response.json()
  
  if (result.code) {
    console.error(`API Error: ${result.code} - ${result.message}`)
    return null
  }

  console.log('Task created:', result.output?.task_id)

  // Poll for result
  const taskId = result.output?.task_id
  if (taskId) {
    const imageUrl = await pollTaskResult(taskId, apiKey)
    if (imageUrl) {
      return await downloadImageAsBase64(imageUrl)
    }
  }

  return null
}

/**
 * Generate image with Wanx model (sync mode)
 */
async function generateWithWanxSync(prompt: string, apiKey: string): Promise<string | null> {
  const baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'wanx-v1',
      input: {
        prompt: prompt,
      },
      parameters: {
        style: '<auto>',
        size: '512*512',
        n: 1,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Wanx sync error: ${response.status} - ${errorText}`)
    return null
  }

  const result: ImageGenerationResponse = await response.json()
  
  if (result.code) {
    console.error(`API Error: ${result.code} - ${result.message}`)
    return null
  }

  // Check for direct image result
  if (result.output?.image) {
    return `data:image/png;base64,${result.output.image}`
  }

  // Check for URL result
  if (result.output?.results?.[0]?.url) {
    return await downloadImageAsBase64(result.output.results[0].url)
  }

  return null
}

/**
 * Generate image with Flux model (faster, simpler)
 */
async function generateWithFlux(prompt: string, apiKey: string): Promise<string | null> {
  const baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'flux-schnell',
      input: {
        prompt: prompt,
      },
      parameters: {
        size: '1024*1024',
        n: 1,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Flux error: ${response.status} - ${errorText}`)
    return null
  }

  const result: ImageGenerationResponse = await response.json()
  
  if (result.code) {
    console.error(`API Error: ${result.code} - ${result.message}`)
    return null
  }

  // Check for direct image result
  if (result.output?.image) {
    return `data:image/png;base64,${result.output.image}`
  }

  // Check for URL result
  if (result.output?.results?.[0]?.url) {
    return await downloadImageAsBase64(result.output.results[0].url)
  }

  return null
}

/**
 * Poll for async task result
 */
async function pollTaskResult(taskId: string, apiKey: string, maxAttempts = 60): Promise<string | null> {
  const baseUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds

    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      console.error(`Failed to poll task: ${response.status}`)
      continue
    }

    const result: TaskResultResponse = await response.json()
    console.log(`Task status: ${result.output.task_status}`)

    if (result.output.task_status === 'SUCCEEDED') {
      return result.output.results?.[0]?.url || null
    }

    if (result.output.task_status === 'FAILED') {
      console.error('Image generation task failed:', result.output.message)
      return null
    }
  }

  console.error('Task polling timed out')
  return null
}

/**
 * Download image and convert to base64
 */
async function downloadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    
    return `data:image/png;base64,${base64}`
  } catch (error) {
    console.error('Failed to download and convert image:', error)
    return null
  }
}
