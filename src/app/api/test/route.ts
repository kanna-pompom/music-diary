import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    // モック分析結果
    const mockAnalysis = {
      emotions: {
        primary: content.includes('嬉しい') || content.includes('楽しい') || content.includes('爽快') 
          ? 'happy' 
          : content.includes('悲しい') || content.includes('辛い') 
          ? 'sad' 
          : 'calm',
        secondary: 'excited',
        intensity: 7
      },
      keywords: extractKeywords(content),
      mood: content.includes('嬉しい') || content.includes('楽しい') || content.includes('爽快') 
        ? 'happy' 
        : content.includes('悲しい') || content.includes('辛い') 
        ? 'sad' 
        : 'calm',
      musicRecommendationContext: '今日の気持ちに合った音楽をお探しのようですね。'
    }

    // モック音楽推薦
    const mockRecommendations = {
      happy: {
        spotifyId: 'mock-happy-song',
        title: 'Happy Song',
        artist: 'Joy Artist',
        album: 'Sunshine Album',
        albumCover: 'https://via.placeholder.com/300x300/FFD700/FFFFFF?text=HAPPY',
        duration: 210,
        previewUrl: null,
        spotifyUrl: 'https://open.spotify.com/track/mock',
        releaseYear: 2023
      },
      sad: {
        spotifyId: 'mock-sad-song',
        title: 'Gentle Rain',
        artist: 'Calm Artist',
        album: 'Peaceful Album',
        albumCover: 'https://via.placeholder.com/300x300/87CEEB/FFFFFF?text=CALM',
        duration: 240,
        previewUrl: null,
        spotifyUrl: 'https://open.spotify.com/track/mock',
        releaseYear: 2022
      },
      calm: {
        spotifyId: 'mock-calm-song',
        title: 'Morning Breeze',
        artist: 'Nature Sounds',
        album: 'Tranquil Moments',
        albumCover: 'https://via.placeholder.com/300x300/98FB98/FFFFFF?text=PEACEFUL',
        duration: 180,
        previewUrl: null,
        spotifyUrl: 'https://open.spotify.com/track/mock',
        releaseYear: 2023
      }
    }

    const selectedSong = mockRecommendations[mockAnalysis.mood as keyof typeof mockRecommendations]

    const mockReasonTemplates = {
      happy: `明るい気持ちが伝わってきます！${selectedSong.artist}の「${selectedSong.title}」で、その幸せな気分をさらに高めてください。`,
      sad: `少し沈んだ気持ちの時は、${selectedSong.artist}の「${selectedSong.title}」のような優しい音楽がそっと心に寄り添ってくれます。`,
      calm: `穏やかな気持ちの今、${selectedSong.artist}の「${selectedSong.title}」のような落ち着いた音楽で心を癒してください。`
    }

    const recommendation = {
      id: `test_rec_${Date.now()}`,
      song: selectedSong,
      reason: mockReasonTemplates[mockAnalysis.mood as keyof typeof mockReasonTemplates],
      relevanceScore: 8
    }

    return NextResponse.json({
      analysis: mockAnalysis,
      recommendation
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { error: 'テスト中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

function extractKeywords(text: string): string[] {
  const keywords = []
  
  if (text.includes('散歩') || text.includes('歩く')) keywords.push('散歩')
  if (text.includes('天気') || text.includes('晴れ')) keywords.push('良い天気')
  if (text.includes('仕事') || text.includes('会社')) keywords.push('仕事')
  if (text.includes('友達') || text.includes('友人')) keywords.push('友達')
  if (text.includes('家族')) keywords.push('家族')
  if (text.includes('音楽')) keywords.push('音楽')
  if (text.includes('映画')) keywords.push('映画')
  if (text.includes('本')) keywords.push('読書')
  if (text.includes('カフェ')) keywords.push('カフェ')
  if (text.includes('公園')) keywords.push('公園')
  
  return keywords.length > 0 ? keywords : ['日常', '気持ち']
}