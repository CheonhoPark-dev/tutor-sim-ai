import { AIService } from '../services/aiService';
import { VirtualStudent } from '../types/ai';

async function testAIService() {
  try {
    // AI 서비스 인스턴스 생성
    const aiService = new AIService();

    // 테스트용 가상 학생 데이터
    const testStudent: VirtualStudent = {
      id: 'test-student-1',
      name: '김철수',
      learningStyle: '시각적',
      personality: '적극적이고 호기심이 많은',
      difficultyLevel: '중급',
      subjects: ['수학', '과학'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 테스트 1: 학생 응답 생성
    console.log('\n=== 학생 응답 생성 테스트 ===');
    const studentResponse = await aiService.generateStudentResponse(
      testStudent,
      '수학 수업 중 이차방정식 설명',
      '이차방정식의 근의 공식에 대해 어떻게 생각하나요?'
    );
    console.log('학생 응답:', studentResponse.content);

    // 테스트 2: 강의 피드백 생성
    console.log('\n=== 강의 피드백 테스트 ===');
    const lectureContent = `
    오늘은 이차방정식의 근의 공식에 대해 설명하겠습니다.
    ax² + bx + c = 0 형태의 이차방정식이 있을 때,
    x = (-b ± √(b² - 4ac)) / 2a
    이 공식을 사용하면 이차방정식의 해를 구할 수 있습니다.
    예를 들어, x² + 6x + 5 = 0 의 경우,
    a=1, b=6, c=5 를 대입하면...
    `;
    
    const feedback = await aiService.generateLectureFeedback(
      lectureContent,
      testStudent
    );
    console.log('강의 피드백:', feedback);

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  }
}

// 테스트 실행
testAIService(); 