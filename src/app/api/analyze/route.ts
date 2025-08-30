import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// APIキーの取得（常に利用可能）
const apiKey = process.env.OPENAI_API_KEY

// デモ用のデフォルトキーの場合は高度なモック分析を提供
const isDemo = !apiKey || apiKey.includes('test-key') || apiKey.includes('demo') || apiKey.includes('your_')

const openai = apiKey && !isDemo ? new OpenAI({ apiKey }) : null

export async function POST(request: NextRequest) {
  try {
    const { content, photos } = await request.json()

    if (!content && !photos?.length) {
      return NextResponse.json(
        { error: '分析するコンテンツがありません' },
        { status: 400 }
      )
    }

    // OpenAI APIが利用できない場合は高度なモック分析を提供
    if (!openai || isDemo) {
      return generateAdvancedMockAnalysis(content)
    }

    const analysisPrompt = `
以下の日記の内容を分析して、その人の感情や気分を詳細に分析してください。
分析結果は以下のJSON形式で返してください：

{
  "emotions": {
    "primary": "主要な感情（例：happy, sad, excited, calm, nostalgic, energetic, melancholic）",
    "secondary": "副次的な感情（あれば）",
    "intensity": 感情の強度（1-10の数値）
  },
  "keywords": ["キーワード1", "キーワード2", "キーワード3"],
  "mood": "overall mood（例：happy, sad, excited, calm, nostalgic, energetic, melancholic）",
  "musicRecommendationContext": "この感情に基づいて音楽を提案するためのコンテキスト文"
}

日記の内容：
${content}
`

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'あなたは感情分析の専門家です。日記の内容から人の感情や気分を正確に分析し、音楽推薦に適した情報を抽出してください。必ず有効なJSONを返してください。'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
    })

    const analysisResult = completion.choices[0]?.message?.content
    
    if (!analysisResult) {
      throw new Error('分析結果を取得できませんでした')
    }

    let parsedResult
    try {
      parsedResult = JSON.parse(analysisResult)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      
      return NextResponse.json({
        emotions: {
          primary: 'calm',
          intensity: 5
        },
        keywords: ['日記', '感情'],
        mood: 'calm',
        musicRecommendationContext: 'リラックスできる音楽をお探しのようですね。'
      })
    }

    return NextResponse.json(parsedResult)

  } catch (error) {
    console.error('Analysis error:', error)
    
    return NextResponse.json(
      { 
        error: '分析中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
}

// 高度なモック分析関数
function generateAdvancedMockAnalysis(content: string) {
  const text = content.toLowerCase()
  
  // 感情キーワード分析
  const emotionKeywords = {
    happy: ['嬉しい', '楽しい', '幸せ', '最高', '爽快', '笑顔', 'ワクワク', '喜び'],
    sad: ['悲しい', '辛い', '落ち込', '泣い', '寂しい', '憂鬱', '沈ん'],
    excited: ['興奮', 'ドキドキ', 'わくわく', '楽しみ', 'テンション'],
    calm: ['落ち着', '静か', '穏やか', '平和', 'リラックス', '癒'],
    nostalgic: ['懐かし', '昔', '思い出', '昔ながら', '古い'],
    energetic: ['元気', 'パワー', '活力', '頑張', 'やる気', '運動'],
    melancholic: ['物思い', 'しみじみ', 'センチ', '切ない']
  }

  // 感情スコア計算
  const emotionScores = Object.entries(emotionKeywords).map(([emotion, keywords]) => {
    const score = keywords.reduce((sum, keyword) => 
      sum + (text.includes(keyword) ? 1 : 0), 0)
    return { emotion, score }
  })

  // 最高スコアの感情を選択
  const topEmotion = emotionScores.reduce((max, current) => 
    current.score > max.score ? current : max)

  const primaryEmotion = topEmotion.score > 0 ? topEmotion.emotion : 'calm'
  
  // キーワード抽出
  const keywords = extractKeywords(content)
  
  // 強度計算（文字数と感情表現の豊富さベース）
  const intensity = Math.min(Math.max(
    Math.floor((content.length / 50) + (topEmotion.score * 2) + 3), 1), 10)

  const analysis = {
    emotions: {
      primary: primaryEmotion,
      secondary: emotionScores.find(e => e.emotion !== primaryEmotion && e.score > 0)?.emotion,
      intensity
    },
    keywords,
    mood: primaryEmotion,
    musicRecommendationContext: generateContextMessage(primaryEmotion, keywords)
  }

  return NextResponse.json(analysis)
}

function extractKeywords(text: string): string[] {
  const keywords: string[] = []
  
  // 活動キーワード
  const activityKeywords = {
    '散歩': ['散歩', '歩い', 'ウォーキング'],
    '仕事': ['仕事', '会社', 'オフィス', '職場'],
    '友達': ['友達', '友人', '仲間'],
    '家族': ['家族', '母', '父', '兄', '姉', '弟', '妹'],
    '勉強': ['勉強', '学習', '読書', '本'],
    '運動': ['運動', 'ジム', 'スポーツ', 'ランニング'],
    '料理': ['料理', '作っ', '食べ', 'レシピ'],
    '映画': ['映画', '映像', '動画', 'ドラマ'],
    '音楽': ['音楽', '歌', '演奏', 'コンサート'],
    '旅行': ['旅行', '旅', '観光', '温泉']
  }

  // 天気・環境キーワード
  const environmentKeywords = {
    '晴れ': ['晴れ', '太陽', '日光', '青空'],
    '雨': ['雨', '雨降', '濡れ'],
    '桜': ['桜', '花見'],
    '自然': ['自然', '緑', '花', '木'],
    '海': ['海', 'ビーチ', '波'],
    '山': ['山', '登山', 'ハイキング']
  }

  const allKeywords = { ...activityKeywords, ...environmentKeywords }
  
  Object.entries(allKeywords).forEach(([keyword, variations]) => {
    if (variations.some(v => text.toLowerCase().includes(v))) {
      keywords.push(keyword)
    }
  })

  return keywords.length > 0 ? keywords : ['日常', '気持ち']
}

function generateContextMessage(emotion: string, keywords: string[]): string {
  const contexts = {
    happy: `明るく楽しい気持ちが伝わってきます。`,
    sad: `少し沈んだ気持ちに寄り添う音楽を。`,
    excited: `高揚した気分をさらに盛り上げる音楽を。`,
    calm: `落ち着いた気持ちでリラックスできる音楽を。`,
    nostalgic: `懐かしい気持ちに響く音楽を。`,
    energetic: `エネルギッシュな気分にぴったりの音楽を。`,
    melancholic: `物思いにふける時間に合う音楽を。`
  }

  const keywordContext = keywords.length > 0 ? `${keywords.join('、')}について書かれた` : ''
  return `${keywordContext}今日の${contexts[emotion as keyof typeof contexts] || contexts.calm}`
}