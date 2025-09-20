import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface CompletionScreenProps {
  onViewDoctorScreen: () => void;
  onReset: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  onViewDoctorScreen,
  onReset
}) => {
  return (
    <div className="max-w-md mx-auto">
      <Card className="text-center">
        {/* 成功アイコン */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* メインメッセージ */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          問診送信完了
        </h1>

        {/* 詳細メッセージ */}
        <div className="space-y-3 mb-8 text-gray-600">
          <p className="text-lg">
            問診内容の送信が完了しました。
          </p>
          <p>
            医師による確認をお待ちください。
          </p>
          <p className="text-sm">
            診察の準備が整い次第、お呼びいたします。
          </p>
        </div>

        {/* 追加情報 */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                診察までの流れ
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>医師が問診内容を確認します</li>
                  <li>必要に応じて追加質問を準備します</li>
                  <li>診察室にお呼びします</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onViewDoctorScreen}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          >
            医師画面を確認
          </Button>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onReset}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            新しい問診を開始
          </Button>
        </div>

        {/* フッター情報 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            ご不明な点がございましたら、受付までお声がけください。
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CompletionScreen;
