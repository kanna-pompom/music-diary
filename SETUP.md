# Music Diary セットアップガイド

## 🛠️ 必要なAPIキーの取得

### 1. OpenAI API キー
1. https://platform.openai.com/ にアクセス
2. アカウント作成またはログイン
3. API Keys から新しいキーを作成
4. キーをコピー（後で使用）

### 2. Spotify API 認証情報
1. https://developer.spotify.com/dashboard にアクセス
2. Spotifyアカウントでログイン
3. 「Create App」をクリック
4. アプリ情報を入力：
   - App Name: `Music Diary`
   - App Description: `Personal music recommendation diary`
   - Redirect URI: `http://localhost:3000`
5. 作成後、「Client ID」と「Client Secret」をコピー

### 3. Firebase プロジェクト設定
1. https://console.firebase.google.com/ にアクセス
2. 「プロジェクトを追加」
3. プロジェクト名: `music-diary`
4. Google Analyticsは無効でOK
5. プロジェクト作成後：
   - Authentication → 始める → Sign-in method → Anonymous を有効化
   - Firestore Database → データベースの作成 → テストモードで開始
   - Storage → 始める → テストモードで開始
6. プロジェクトの設定 → 全般 → アプリを追加 → Web
7. 設定オブジェクトをコピー

## ⚙️ 環境変数の設定

`.env.local` ファイルを編集：

\`\`\`env
# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# Spotify
SPOTIFY_CLIENT_ID=your-spotify-client-id-here
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret-here

# Firebase (Firebaseコンソールからコピー)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
\`\`\`

## 🧪 テスト方法

1. 開発サーバー起動:
\`\`\`bash
npm run dev
\`\`\`

2. http://localhost:3000 でアプリ確認

3. テストフロー:
   - 初期設定 (http://localhost:3000/setup)
   - 日記作成 (http://localhost:3000/diary/new)
   - 「今日は良い天気で散歩しました。気分爽快です！」などを入力
   - 音楽提案を確認

## 🔧 トラブルシューティング

### API エラーが出る場合
- `/health` エンドポイントで設定確認
- ブラウザのコンソールでエラー内容確認

### Spotify API エラー
- Client IDとSecretが正しいか確認
- Spotify Developer Dashboardでアプリが有効か確認

### OpenAI API エラー
- APIキーが正しいか確認
- 使用量制限に達していないか確認

## 💰 料金について

- **OpenAI**: GPT-3.5使用で1回数円程度
- **Spotify**: 基本無料（レート制限あり）
- **Firebase**: 個人利用なら無料枠内