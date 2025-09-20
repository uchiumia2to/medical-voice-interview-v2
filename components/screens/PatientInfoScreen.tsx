import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PatientInfo } from '@/lib/types';

interface PatientInfoScreenProps {
  onComplete: (patientInfo: PatientInfo) => void;
  isProcessing: boolean;
}

const PatientInfoScreen: React.FC<PatientInfoScreenProps> = ({
  onComplete,
  isProcessing
}) => {
  const handleTestSubmit = () => {
    const testData: PatientInfo = {
      visitType: '初診',
      department: '内科',
      lastName: 'テスト',
      firstName: '太郎',
      gender: '男性',
      birthYear: 1990,
      birthMonth: 1,
      birthDay: 1
    };
    onComplete(testData);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            医療音声問診システム
          </h1>
          <p className="text-gray-600 mb-6">
            患者情報入力画面（テスト版）
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleTestSubmit}
            disabled={isProcessing}
            isLoading={isProcessing}
          >
            テストデータで開始
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PatientInfoScreen;
