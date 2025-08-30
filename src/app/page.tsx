'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Music, BookOpen, Settings, Calendar, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <header className="text-center py-6 sm:py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Music className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Music Diary</h1>
          <p className="text-gray-600 text-base sm:text-lg">あなたの感情に寄り添う音楽を見つけましょう</p>
        </header>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <Link href="/diary/new" className="group">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">今日の日記</h2>
              </div>
              <p className="text-gray-600">今日の気持ちを書いて、あなたにぴったりの音楽を見つけましょう</p>
            </div>
          </Link>

          <Link href="/playlists" className="group">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Music className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">プレイリスト</h2>
              </div>
              <p className="text-gray-600">これまでに提案された音楽や、お気に入りの楽曲を管理</p>
            </div>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          <Link href="/history" className="group">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
              <div className="flex items-center mb-3">
                <Calendar className="w-8 h-8 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">履歴</h3>
              </div>
              <p className="text-gray-600 text-sm">過去の日記と音楽の記録</p>
            </div>
          </Link>

          <Link href="/stats" className="group">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
              <div className="flex items-center mb-3">
                <TrendingUp className="w-8 h-8 text-pink-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">統計</h3>
              </div>
              <p className="text-gray-600 text-sm">音楽発見の記録と統計</p>
            </div>
          </Link>

          <Link href="/setup" className="group">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
              <div className="flex items-center mb-3">
                <Settings className="w-8 h-8 text-orange-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">設定</h3>
              </div>
              <p className="text-gray-600 text-sm">音楽の好みや設定の変更</p>
            </div>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">今日のオススメ</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center">
            <p className="text-gray-500 mb-4 text-sm sm:text-base">まずは日記を書いてみましょう！</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/diary/new"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 text-sm sm:text-base"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                日記を書く
              </Link>
              <Link 
                href="/guide"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
              >
                <Settings className="w-5 h-5 mr-2" />
                機能と使い方
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
