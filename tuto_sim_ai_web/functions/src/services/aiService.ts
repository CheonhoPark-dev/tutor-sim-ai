import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { VirtualStudent, AIResponse, PromptTemplate } from '../types/ai';
import { AppError } from '../utils/error';

dotenv.config();

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: string = 'gemini-2.0-flash';

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new AppError('Google AI API 키가 설정되지 않았습니다.', 500);
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * 가상 학생의 응답을 생성합니다.
   */
  async generateStudentResponse(
    student: VirtualStudent,
    context: string,
    prompt: string
  ): Promise<AIResponse> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      const systemPrompt = this.buildStudentPrompt(student, context);
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [systemPrompt],
          },
          {
            role: 'model',
            parts: ['네, 이해했습니다. 해당 학생의 특성과 학습 스타일에 맞춰 응답하겠습니다.'],
          },
        ],
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        timestamp: new Date(),
        studentId: student.id,
        context: context,
        originalPrompt: prompt
      };
    } catch (error) {
      console.error('AI 응답 생성 중 오류:', error);
      throw new AppError('AI 응답을 생성하는 중 오류가 발생했습니다.', 500);
    }
  }

  /**
   * 강의 피드백을 생성합니다.
   */
  async generateLectureFeedback(
    lectureContent: string,
    student: VirtualStudent
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      const feedbackPrompt = this.buildFeedbackPrompt(lectureContent, student);
      const result = await model.generateContent(feedbackPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('피드백 생성 중 오류:', error);
      throw new AppError('강의 피드백을 생성하는 중 오류가 발생했습니다.', 500);
    }
  }

  /**
   * 학생의 특성에 맞는 프롬프트를 생성합니다.
   */
  private buildStudentPrompt(student: VirtualStudent, context: string): string {
    return `
당신은 다음과 같은 특성을 가진 학생입니다:

- 학습 스타일: ${student.learningStyle}
- 성격: ${student.personality}
- 난이도: ${student.difficultyLevel}
- 주요 과목: ${student.subjects.join(', ')}
- 학습 맥락: ${context}

이러한 특성을 고려하여 실제 학생처럼 자연스럽게 응답해주세요. 
질문이나 설명이 이해되지 않으면 구체적으로 어떤 부분이 어려운지 물어보세요.
`;
  }

  /**
   * 강의 피드백을 위한 프롬프트를 생성합니다.
   */
  private buildFeedbackPrompt(content: string, student: VirtualStudent): string {
    return `
다음 강의 내용을 ${student.learningStyle} 학습 스타일과 ${student.difficultyLevel} 난이도를 선호하는 
학생의 관점에서 분석하고 피드백을 제공해주세요:

강의 내용:
${content}

다음 사항을 포함해주세요:
1. 이해하기 어려웠던 부분
2. 더 자세한 설명이 필요한 개념
3. 실제 적용 예시나 시각화가 도움될 만한 부분
4. 전반적인 설명의 명확성과 구조
`;
  }

  /**
   * 프롬프트 템플릿을 관리합니다.
   */
  async getPromptTemplate(templateId: string): Promise<PromptTemplate> {
    // TODO: Firestore에서 프롬프트 템플릿을 가져오는 로직 구현
    throw new AppError('아직 구현되지 않았습니다.', 501);
  }
} 