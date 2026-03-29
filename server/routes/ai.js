import express from 'express'
import { GoogleGenAI } from '@google/genai'

const router = express.Router()

const DL_SERVICE_URL = 'http://127.0.0.1:8000'

/**
 * Calls the Python DL microservice for pre-analysis.
 * Gracefully returns null if the service is offline — Gemini still runs normally.
 */
async function getDLContext(prompt, projectType, image) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000) // 4s max wait

    const response = await fetch(`${DL_SERVICE_URL}/full-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt || '',
        project_type: projectType || 'react',
        image_base64: image || null,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) return null
    const data = await response.json()
    return data?.gemini_context || null
  } catch (err) {
    // Python service is offline or timed out — silently skip and use Gemini only
    console.log('[DL Service] Offline or unreachable — skipping DL enrichment')
    return null
  }
}

router.post('/chat', async (req, res) => {
  try {
    const { prompt, contextFiles, projectType, image, chatHistory } = req.body

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const selectedKey = process.env.GEMINI_API_KEY
    if (!selectedKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is empty on the server.' })
    }

    // ── Step 1: Try DL microservice for context enrichment ───────────────────
    const dlContext = await getDLContext(prompt, projectType, image)
    let dlEnrichmentBlock = ''
    if (dlContext) {
      dlEnrichmentBlock = `
--- DEEP LEARNING PRE-ANALYSIS (from CNN + LSTM + ANN models) ---
Detected Intent: ${dlContext.detected_intent}
Suggested Components: ${(dlContext.suggested_components || []).join(', ')}
Recommended Files: ${(dlContext.recommended_files || []).join(', ')}
Recommended Folders: ${(dlContext.recommended_folders || []).join(', ')}
Project Complexity: ${dlContext.complexity}
DL Summary: ${dlContext.context_summary}
--- END DL PRE-ANALYSIS ---

Use the above DL analysis to guide your code generation. Follow the recommended file structure exactly.
`
      console.log('[DL Service] Context enrichment successful ✅')
    }

    const ai = new GoogleGenAI({ apiKey: selectedKey })

    const systemInstruction = `You are NexusForge AI, an elite deep learning AI architect, UI vision model, and expert software engineer. 
Your task is to respond to the user's request by generating or updating a multi-file ${projectType} project.

DEEP LEARNING VISION MODE:
- If the user attaches an image (e.g., a mockup, drawing, or screenshot), you must act as a UI detection model. Detect all UI components, buttons, layouts, and colors, and write the React/HTML code to recreate it identically.

WEBSITE ARCHITECT & STRUCTURING MODE:
- If the user provides a broad request (like "build an e-commerce website"), structure all the necessary pages, navigation bars, footers, styling systems, and nested components. Break them out into logical files rather than a single massive blob to make the site modern, realistic, and interesting.

${dlEnrichmentBlock}

You must respond with ONLY a valid JSON object matching this schema exactly:
{
  "message": "A brief explanation of what you did to show to the user",
  "files": [
    {
      "path": "the file path (e.g. src/App.jsx)",
      "content": "the complete entire source code for this file"
    }
  ]
}

- Always include the FULL content for every file you generate or modify.
- Never output markdown code blocks wrapping the JSON.
- Output ONLY valid, parseable JSON.

Current project files context:
${JSON.stringify(contextFiles)}`

    // ── Step 2: Build prompt with conversation memory ────────────────────────
    let finalPrompt = ''
    if (chatHistory && chatHistory.length > 0) {
      finalPrompt += '--- PAST CONVERSATION MEMORY ---\n'
      chatHistory.forEach(msg => {
        if (msg.text) finalPrompt += `${msg.role.toUpperCase()}: ${msg.text}\n\n`
      })
      finalPrompt += '--- END PAST CONVERSATION ---\n\n'
      finalPrompt += 'NEW USER REQUEST: ' + prompt
    } else {
      finalPrompt = prompt
    }

    let generatedContents = finalPrompt || "Analyze this image and build my website based on the design."

    if (image) {
      const mimeMatch = image.match(/^data:(image\/\w+);base64,(.+)$/)
      if (mimeMatch) {
        const mimeType = mimeMatch[1]
        const base64Data = mimeMatch[2]
        generatedContents = [
          { text: finalPrompt || "Analyze this image and build a website exactly matching this design." },
          { inlineData: { data: base64Data, mimeType: mimeType } }
        ]
      }
    }

    // ── Step 3: Call Gemini with enriched prompt ─────────────────────────────
    // Note: when sending multimodal (image) content, responseMimeType is omitted
    // because some Gemini API versions don't support JSON mode with vision inputs.
    const geminiConfig = {
      systemInstruction: systemInstruction,
      temperature: 0.2,
    }
    // Only force JSON mode for text-only requests (more reliable)
    if (!image) {
      geminiConfig.responseMimeType = 'application/json'
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: generatedContents,
      config: geminiConfig,
    })

    let text = response.text

    // ── Step 4: Robust JSON parsing ───────────────────────────────────────────
    // Gemini sometimes wraps output in markdown code fences — strip them
    if (text.includes('```')) {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match) text = match[1].trim()
    }
    // Also trim any stray whitespace
    text = text.trim()

    let result
    try {
      result = JSON.parse(text)
    } catch (parseErr) {
      console.error('[Gemini] JSON parse failed. Raw response:\n', text.slice(0, 500))
      // Attempt to recover: wrap raw text as a message with no files
      result = {
        message: text.length > 0
          ? text
          : 'The AI returned an unstructured response. Please try again.',
        files: [],
      }
    }

    // Attach DL analysis to response so frontend can display it if desired
    if (dlContext) {
      result.dl_analysis = {
        intent: dlContext.detected_intent,
        components: dlContext.suggested_components,
        complexity: dlContext.complexity,
      }
    }

    res.json(result)
  } catch (error) {
    console.error('Gemini API Error:', error)
    res.status(500).json({ error: 'Failed to generate code: ' + (error.message || String(error)) })
  }
})

// ── Explanation Endpoint ──────────────────────────────────────────────────
router.post('/explain', auth, async (req, res) => {
  try {
    const { files } = req.body

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for explanation' })
    }

    let formattedFiles = ''
    files.forEach(f => {
      formattedFiles += `\n### File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\`\n`
    })

    const prompt = `You are a Senior Software Engineer and Architect.
I am providing you with the source code for a recently generated web application feature.
Your task is to explain this code theoretically and thoroughly so a student or junior developer can deeply understand it.

Please structure your response in Markdown:
1. Start with a high-level summary of what the code does.
2. Then, go through EACH file provided. For each file, explain:
   - Its overall purpose.
   - The key functions, variables, and components inside it.
   - Any important HTML/JSX tags, layout structures, or logic flow.
3. Be clear, educational, and structured.

Here is the code to explain:
${formattedFiles}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
      }
    })

    let explanationText = response.text || "Failed to generate explanation."

    res.json({ explanation: explanationText })
  } catch (error) {
    console.error('Explanation Error:', error)
    res.status(500).json({ error: 'Failed to generate explanation: ' + (error.message || String(error)) })
  }
})

export default router

