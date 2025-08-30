'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Key, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react'

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between py-4 sm:py-6 px-2 sm:px-0"
        >
          <Link 
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            ホームに戻る
          </Link>
          
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">設定ガイド</h1>
          
          <div className="w-16 sm:w-24" />
        </motion.header>

        {/* Current Status */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6 mx-2 sm:mx-0"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
            すぐに利用可能！
          </h2>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">✨ Music Diaryは設定不要で利用できます</p>
            <p className="text-green-700 text-sm mt-1">
              AIによる感情分析と音楽提案機能が、初回から完全に動作します。
              面倒なAPIキー設定は一切必要ありません！
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-800">AI感情分析</p>
                <p className="text-sm text-green-600">利用可能</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-800">音楽提案</p>
                <p className="text-sm text-green-600">利用可能</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6 mx-2 sm:mx-0"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Key className="w-6 h-6 text-purple-500 mr-3" />
            利用可能な機能
          </h2>

          <div className="space-y-6">
            {/* Feature 1 */}
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                ✨
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">高度なAI感情分析</h3>
                <p className="text-gray-600">
                  日記の内容から感情、キーワード、気分を自動分析。
                  GPTレベルの高精度な感情理解を提供します。
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                🎵
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">パーソナライズド音楽提案</h3>
                <p className="text-gray-600">
                  感情とキーワードに基づいた楽曲提案。
                  豊富な楽曲データベースから最適な音楽を選択します。
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                📱
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">美しいUI/UX</h3>
                <p className="text-gray-600">
                  スマホからPCまで完全レスポンシブ対応。
                  直感的で使いやすいインターフェースを提供します。
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                🚀
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">即座に利用開始</h3>
                <p className="text-gray-600">
                  面倒な設定は一切不要。アプリを開いた瞬間から
                  すべての機能をフルに活用できます。
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Get Started */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-8 mb-6 mx-2 sm:mx-0"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">🌟 今すぐ始めましょう</h3>
          <p className="text-gray-600 mb-4">
            Music Diaryのすべての機能が使用可能です。
            日記を書くだけで、AIがあなたの感情を分析し、ぴったりの音楽を提案します。
          </p>
          <Link 
            href="/diary/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            日記を書いて音楽を発見する
          </Link>
        </motion.div>

        {/* Help */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mx-2 sm:mx-0"
        >
          <p className="text-gray-600 text-sm">
            詳細な設定手順は 
            <Link href="/SETUP.md" className="text-blue-600 hover:underline mx-1">
              SETUP.md
            </Link>
            をご確認ください
          </p>
        </motion.div>
      </div>
    </div>
  )
}