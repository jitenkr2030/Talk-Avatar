import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const image = formData.get('image') as File
    const options = JSON.parse(formData.get('options') as string || '{}')

    if (!userId || !image) {
      return NextResponse.json({ 
        error: 'User ID and image are required' 
      }, { status: 400 })
    }

    // Convert image to buffer
    const imageBuffer = Buffer.from(await image.arrayBuffer())

    // Send to likeness service
    const likenessFormData = new FormData()
    likenessFormData.append('userId', userId)
    likenessFormData.append('image', new Blob([imageBuffer]), image.name)
    likenessFormData.append('options', JSON.stringify(options))

    const response = await fetch('http://localhost:3004/upload-likeness', {
      method: 'POST',
      body: likenessFormData
    })

    if (!response.ok) {
      throw new Error('Failed to upload image for likeness generation')
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Likeness upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to process likeness upload' 
    }, { status: 500 })
  }
}