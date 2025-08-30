import { NextRequest, NextResponse } from 'next/server'

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
    release_date: string
  }
  duration_ms: number
  preview_url: string | null
  external_urls: {
    spotify: string
  }
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
  }
}

async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  const isDemo = !clientId || !clientSecret || 
      clientId.includes('your_') || clientSecret.includes('your_') ||
      clientId.includes('***') || clientSecret.includes('***') ||
      clientId.includes('demo') || clientSecret.includes('demo')

  if (isDemo) {
    throw new Error('Demo mode - using mock recommendations')
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token')
  }

  const data: SpotifyTokenResponse = await response.json()
  return data.access_token
}

async function searchSpotifyTracks(
  accessToken: string,
  mood: string,
  genres: string[] = [],
  keywords: string[] = []
): Promise<SpotifyTrack[]> {
  const moodToGenre: Record<string, string[]> = {
    happy: ['pop', 'dance', 'funk', 'soul'],
    sad: ['acoustic', 'indie', 'folk', 'blues'],
    excited: ['electronic', 'rock', 'pop', 'dance'],
    calm: ['ambient', 'jazz', 'classical', 'acoustic'],
    nostalgic: ['indie', 'folk', 'classic rock', 'oldies'],
    energetic: ['rock', 'electronic', 'hip-hop', 'dance'],
    melancholic: ['indie', 'alternative', 'acoustic', 'folk']
  }

  const recommendedGenres = moodToGenre[mood] || ['pop']
  const searchGenres = genres.length > 0 ? genres : recommendedGenres
  
  const queryTerms = [
    ...keywords.slice(0, 2), 
    mood
  ].filter(term => term && term.length > 0)

  const query = `${queryTerms.join(' ')} genre:${searchGenres[0]}`

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20&market=JP`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.status}`)
    }

    const data: SpotifySearchResponse = await response.json()
    return data.tracks.items
  } catch (error) {
    console.error('Spotify search error:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const { analysis, userPreferences } = await request.json()

    if (!analysis) {
      return NextResponse.json(
        { error: '分析結果が必要です' },
        { status: 400 }
      )
    }

    let accessToken
    try {
      accessToken = await getSpotifyAccessToken()
    } catch (error) {
      console.log('Using demo mode for music recommendations')
      
      // デモモードの場合は高度なモック推薦を提供
      return generateAdvancedMockRecommendation(analysis)
    }
    
    const tracks = await searchSpotifyTracks(
      accessToken,
      analysis.mood,
      userPreferences?.favoriteGenres || [],
      analysis.keywords
    )

    if (tracks.length === 0) {
      return NextResponse.json({
        recommendation: null,
        message: '申し訳ございません。現在適切な楽曲が見つかりませんでした。'
      })
    }

    const selectedTrack = tracks[Math.floor(Math.random() * Math.min(tracks.length, 5))]
    
    const recommendation = {
      id: `rec_${Date.now()}`,
      song: {
        spotifyId: selectedTrack.id,
        title: selectedTrack.name,
        artist: selectedTrack.artists.map(a => a.name).join(', '),
        album: selectedTrack.album.name,
        albumCover: selectedTrack.album.images[0]?.url || '',
        duration: Math.floor(selectedTrack.duration_ms / 1000),
        previewUrl: selectedTrack.preview_url,
        spotifyUrl: selectedTrack.external_urls.spotify,
        releaseYear: new Date(selectedTrack.album.release_date).getFullYear()
      },
      reason: generateReasonText(analysis, selectedTrack),
      relevanceScore: calculateRelevanceScore(analysis, selectedTrack)
    }

    return NextResponse.json({ recommendation })

  } catch (error) {
    console.error('Recommendation error:', error)
    
    return NextResponse.json(
      { 
        error: '音楽提案中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
}

function generateReasonText(analysis: any, track: SpotifyTrack): string {
  const mood = analysis.mood
  const artist = track.artists[0]?.name
  const title = track.name

  const reasonTemplates: Record<string, string[]> = {
    happy: [
      `今日の明るい気持ちに合わせて、${artist}の「${title}」はいかがでしょうか。きっと心が弾むような音楽体験になると思います。`,
      `あなたの嬉しそうな様子が伝わってきて、${artist}の「${title}」を思い浮かべました。この楽曲があなたの幸せな気分をさらに盛り上げてくれるはずです。`
    ],
    sad: [
      `少し沈んだ気持ちの時は、${artist}の「${title}」のような優しい音楽がそっと心に寄り添ってくれます。`,
      `今の気持ちを大切にしながら、${artist}の「${title}」と一緒に静かな時間を過ごしてみませんか。`
    ],
    excited: [
      `あなたの興奮した気持ちが伝わってきます！${artist}の「${title}」で、その高揚感をさらに高めてみてください。`,
      `エネルギッシュなあなたにぴったりの${artist}の「${title}」をお勧めします。きっと気持ちが昂ります。`
    ],
    calm: [
      `穏やかな気持ちの今、${artist}の「${title}」のような落ち着いた音楽で心を癒してください。`,
      `リラックスしたいあなたに、${artist}の「${title}」はまさにぴったりの楽曲だと思います。`
    ],
    nostalgic: [
      `懐かしい気持ちになっているあなたに、${artist}の「${title}」をお届けします。きっと心に響くメロディーです。`,
      `ノスタルジックな今の気分に、${artist}の「${title}」が寄り添ってくれることでしょう。`
    ],
    energetic: [
      `元気いっぱいのあなたに、${artist}の「${title}」でさらにパワーアップしてもらいましょう！`,
      `活力に満ちたあなたにぴったりの${artist}の「${title}」。この勢いで今日を駆け抜けてください。`
    ],
    melancholic: [
      `少し物思いにふけっているあなたに、${artist}の「${title}」を聴いてもらいたいです。心に染みる音楽です。`,
      `センチメンタルな気分の時こそ、${artist}の「${title}」のような美しい音楽がそばにいてくれます。`
    ]
  }

  const templates = reasonTemplates[mood] || reasonTemplates.calm
  return templates[Math.floor(Math.random() * templates.length)]
}

function calculateRelevanceScore(analysis: any, track: SpotifyTrack): number {
  let score = 5
  
  if (analysis.emotions?.intensity > 7) score += 2
  if (analysis.emotions?.intensity < 3) score += 1
  
  if (track.preview_url) score += 1
  
  return Math.min(Math.max(score, 1), 10)
}

// 高度なモック推薦関数
function generateAdvancedMockRecommendation(analysis: any) {
  const mood = analysis.mood
  const keywords = analysis.keywords || []
  
  // 感情別の楽曲データベース
  const musicDatabase = {
    happy: [
      { title: 'Sunshine Day', artist: 'Joy Collective', genre: 'Pop', year: 2023 },
      { title: 'Happy Vibes', artist: 'Cheerful Band', genre: 'Indie Pop', year: 2022 },
      { title: 'Good Times', artist: 'Smile Orchestra', genre: 'Folk Pop', year: 2023 }
    ],
    sad: [
      { title: 'Gentle Rain', artist: 'Melancholy Moon', genre: 'Indie Folk', year: 2022 },
      { title: 'Quiet Moments', artist: 'Soft Whispers', genre: 'Acoustic', year: 2023 },
      { title: 'Healing Hearts', artist: 'Comfort Zone', genre: 'Alternative', year: 2022 }
    ],
    excited: [
      { title: 'Electric Energy', artist: 'High Voltage', genre: 'Electronic', year: 2023 },
      { title: 'Rush Hour', artist: 'Adrenaline Rush', genre: 'Rock', year: 2022 },
      { title: 'Festival Night', artist: 'Dance Brigade', genre: 'EDM', year: 2023 }
    ],
    calm: [
      { title: 'Morning Breeze', artist: 'Peaceful Waters', genre: 'Ambient', year: 2023 },
      { title: 'Meditation Flow', artist: 'Zen Garden', genre: 'New Age', year: 2022 },
      { title: 'Quiet Garden', artist: 'Nature Sounds', genre: 'Ambient', year: 2023 }
    ],
    nostalgic: [
      { title: 'Memory Lane', artist: 'Yesterday Dreams', genre: 'Indie Folk', year: 2022 },
      { title: 'Old Photographs', artist: 'Time Capsule', genre: 'Alternative Rock', year: 2023 },
      { title: 'Vintage Soul', artist: 'Retro Revival', genre: 'Soul', year: 2022 }
    ],
    energetic: [
      { title: 'Power Up', artist: 'Energy Boost', genre: 'Rock', year: 2023 },
      { title: 'Workout Anthem', artist: 'Fitness Beat', genre: 'Hip Hop', year: 2022 },
      { title: 'Victory Dance', artist: 'Champion Sound', genre: 'Pop Rock', year: 2023 }
    ],
    melancholic: [
      { title: 'Autumn Leaves', artist: 'Subtle Emotions', genre: 'Indie', year: 2022 },
      { title: 'Moonlight Sonata', artist: 'Evening Mood', genre: 'Classical Pop', year: 2023 },
      { title: 'Silent Thoughts', artist: 'Introspection', genre: 'Alternative', year: 2022 }
    ]
  }

  // キーワードベースの楽曲選択
  const keywordMusic = {
    '散歩': { title: 'Walking Song', artist: 'Step by Step', genre: 'Acoustic Pop' },
    '仕事': { title: 'Focus Flow', artist: 'Productivity Zone', genre: 'Lo-Fi Hip Hop' },
    '友達': { title: 'Friendship Anthem', artist: 'Together Forever', genre: 'Pop' },
    '家族': { title: 'Family Time', artist: 'Warm Hearts', genre: 'Folk' },
    '勉強': { title: 'Study Groove', artist: 'Concentration', genre: 'Ambient' },
    '運動': { title: 'Workout Beat', artist: 'Fitness Flow', genre: 'Electronic' },
    '料理': { title: 'Kitchen Dance', artist: 'Culinary Rhythm', genre: 'Jazz' },
    '旅行': { title: 'Adventure Song', artist: 'Wanderlust', genre: 'World Music' }
  }

  // キーワードマッチから楽曲選択
  let selectedSong = null
  for (const keyword of keywords) {
    if (keywordMusic[keyword]) {
      selectedSong = { ...keywordMusic[keyword], year: 2023 }
      break
    }
  }

  // キーワードマッチしない場合は感情ベース
  if (!selectedSong) {
    const songs = musicDatabase[mood] || musicDatabase.calm
    selectedSong = songs[Math.floor(Math.random() * songs.length)]
  }

  // アルバムカバー色を感情に基づいて生成
  const coverColors = {
    happy: 'FFD700',
    sad: '87CEEB', 
    excited: 'FF6347',
    calm: '98FB98',
    nostalgic: 'DDA0DD',
    energetic: 'FF4500',
    melancholic: '9370DB'
  }

  const song = {
    spotifyId: `mock_${mood}_${Date.now()}`,
    title: selectedSong.title,
    artist: selectedSong.artist,
    album: `${selectedSong.title} - Single`,
    genre: selectedSong.genre,
    albumCover: `https://via.placeholder.com/300x300/${coverColors[mood] || '98FB98'}/FFFFFF?text=${encodeURIComponent(selectedSong.title)}`,
    duration: Math.floor(Math.random() * 60) + 180, // 3-4分
    previewUrl: null, // デモモードではプレビューなし
    spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(selectedSong.title)}`,
    releaseYear: selectedSong.year
  }

  const recommendation = {
    id: `demo_rec_${Date.now()}`,
    song,
    reason: generateAdvancedReason(analysis, selectedSong),
    relevanceScore: 8 + Math.floor(Math.random() * 2) // 8-9
  }

  return NextResponse.json({ recommendation })
}

function generateAdvancedReason(analysis: any, song: any): string {
  const mood = analysis.mood
  const keywords = analysis.keywords || []
  const intensity = analysis.emotions?.intensity || 5

  const reasonTemplates = {
    happy: [
      `今日の明るい気持ちに${song.artist}の「${song.title}」がぴったりですね。${song.genre}の軽やかなサウンドが、あなたの幸せな気分をさらに高めてくれるでしょう。`,
      `嬉しそうな様子が伝わってきます！${song.artist}の「${song.title}」で、その素晴らしい気持ちを音楽と一緒に味わってください。`
    ],
    sad: [
      `少し沈んだ気持ちの今、${song.artist}の「${song.title}」が優しく寄り添ってくれます。${song.genre}の温かい音色が心を癒してくれるはずです。`,
      `今の気持ちを大切にしながら、${song.artist}の「${song.title}」と一緒に静かな時間を過ごしませんか。`
    ],
    excited: [
      `高揚した気持ちが伝わってきます！${song.artist}の「${song.title}」で、その興奮をさらに盛り上げましょう。エネルギッシュな${song.genre}がぴったりです。`,
      `ワクワクした気持ちに${song.artist}の「${song.title}」がマッチしますね。この勢いで素晴らしい一日を！`
    ],
    calm: [
      `穏やかな気持ちの今、${song.artist}の「${song.title}」で心地よい時間をお過ごしください。${song.genre}の落ち着いたサウンドが完璧です。`,
      `リラックスした気分に${song.artist}の「${song.title}」が寄り添います。ゆっくりとした時の流れを音楽と共に。`
    ],
    nostalgic: [
      `懐かしい気持ちになっているあなたに、${song.artist}の「${song.title}」をお届けします。心に響く${song.genre}のメロディーをお楽しみください。`,
      `ノスタルジックな今の気分に、${song.artist}の「${song.title}」がそっと寄り添ってくれることでしょう。`
    ],
    energetic: [
      `元気いっぱいのあなたに${song.artist}の「${song.title}」でさらにパワーアップ！${song.genre}の力強いサウンドが背中を押してくれます。`,
      `活力に満ちた気持ちに${song.artist}の「${song.title}」がぴったりです。この調子で今日も頑張りましょう！`
    ],
    melancholic: [
      `少し物思いにふけっている今、${song.artist}の「${song.title}」が心に染み入ります。${song.genre}の美しいサウンドをゆっくりとお聴きください。`,
      `センチメンタルな気持ちに${song.artist}の「${song.title}」が寄り添います。深い余韻をお楽しみください。`
    ]
  }

  const templates = reasonTemplates[mood] || reasonTemplates.calm
  let reason = templates[Math.floor(Math.random() * templates.length)]

  // キーワードがある場合は追加コメント
  if (keywords.length > 0) {
    const keywordComment = `${keywords.join('や')}について書かれた日記から、`
    reason = keywordComment + reason.charAt(0).toLowerCase() + reason.slice(1)
  }

  // 強度による追加コメント
  if (intensity >= 8) {
    reason += ' 強い感情が伝わってくるので、きっと心に響くと思います。'
  } else if (intensity <= 3) {
    reason += ' 静かな気持ちに合わせて選びました。'
  }

  return reason
}