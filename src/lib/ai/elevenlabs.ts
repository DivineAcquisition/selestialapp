export async function generateVoice(
  text: string,
  voiceId: string = 'EXAVITQu4vr4xnSDxMaL' // Default: Sarah
): Promise<ArrayBuffer> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`)
  }

  return response.arrayBuffer()
}

export async function getVoices(): Promise<Array<{
  voice_id: string
  name: string
  category: string
}>> {
  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
    },
  })

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`)
  }

  const data = await response.json()
  return data.voices
}

export async function generateVoiceFollowUp(
  customerName: string,
  businessName: string,
  serviceType: string,
  voiceId?: string
): Promise<ArrayBuffer> {
  const script = `Hi ${customerName}, this is a quick follow-up from ${businessName} about the ${serviceType} quote we sent. Just wanted to check if you had any questions. Feel free to call or text us back. Thanks!`
  
  return generateVoice(script, voiceId)
}
