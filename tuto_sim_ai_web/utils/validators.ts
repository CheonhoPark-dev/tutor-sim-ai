import { 
  User, 
  Lecture, 
  Material, 
  MaterialType, 
  VirtualStudent,
  LectureFeedback 
} from '../types/database';

// 이메일 형식 검사
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 사용자 데이터 유효성 검사
export const validateUser = (user: Partial<User>): string[] => {
  const errors: string[] = [];

  if (!user.email) {
    errors.push('이메일은 필수입니다.');
  } else if (!isValidEmail(user.email)) {
    errors.push('유효하지 않은 이메일 형식입니다.');
  }

  if (!user.displayName) {
    errors.push('사용자 이름은 필수입니다.');
  } else if (user.displayName.length < 2) {
    errors.push('사용자 이름은 2자 이상이어야 합니다.');
  }

  if (user.role && !['user', 'admin'].includes(user.role)) {
    errors.push('유효하지 않은 사용자 역할입니다.');
  }

  return errors;
};

// 강의 데이터 유효성 검사
export const validateLecture = (lecture: Partial<Lecture>): string[] => {
  const errors: string[] = [];

  if (!lecture.userId) {
    errors.push('사용자 ID는 필수입니다.');
  }

  if (!lecture.title) {
    errors.push('강의 제목은 필수입니다.');
  } else if (lecture.title.length < 2) {
    errors.push('강의 제목은 2자 이상이어야 합니다.');
  }

  if (!lecture.content) {
    errors.push('강의 내용은 필수입니다.');
  } else if (lecture.content.length < 10) {
    errors.push('강의 내용은 10자 이상이어야 합니다.');
  }

  if (lecture.duration && lecture.duration < 0) {
    errors.push('강의 시간은 0 이상이어야 합니다.');
  }

  return errors;
};

// 가상 학생 설정 유효성 검사
export const validateVirtualStudent = (student: Partial<VirtualStudent>): string[] => {
  const errors: string[] = [];

  if (!student.personality) {
    errors.push('가상 학생의 성향은 필수입니다.');
  } else if (!['active', 'passive', 'curious', 'challenging'].includes(student.personality)) {
    errors.push('유효하지 않은 가상 학생 성향입니다.');
  }

  if (!student.level) {
    errors.push('가상 학생의 수준은 필수입니다.');
  } else if (!['beginner', 'intermediate', 'advanced'].includes(student.level)) {
    errors.push('유효하지 않은 가상 학생 수준입니다.');
  }

  return errors;
};

// 강의 피드백 유효성 검사
export const validateLectureFeedback = (feedback: Partial<LectureFeedback>): string[] => {
  const errors: string[] = [];

  if (!feedback.pace) {
    errors.push('강의 속도 피드백은 필수입니다.');
  } else if (!['too_fast', 'good', 'too_slow'].includes(feedback.pace)) {
    errors.push('유효하지 않은 강의 속도 피드백입니다.');
  }

  if (!feedback.clarity) {
    errors.push('강의 명확성 피드백은 필수입니다.');
  } else if (!['clear', 'moderate', 'unclear'].includes(feedback.clarity)) {
    errors.push('유효하지 않은 강의 명확성 피드백입니다.');
  }

  if (feedback.score !== undefined) {
    if (feedback.score < 0 || feedback.score > 100) {
      errors.push('강의 점수는 0에서 100 사이여야 합니다.');
    }
  }

  return errors;
};

// 학습 자료 유효성 검사
export const validateMaterial = (material: Partial<Material>): string[] => {
  const errors: string[] = [];

  if (!material.userId) {
    errors.push('사용자 ID는 필수입니다.');
  }

  if (!material.title) {
    errors.push('자료 제목은 필수입니다.');
  } else if (material.title.length < 2) {
    errors.push('자료 제목은 2자 이상이어야 합니다.');
  }

  if (!material.type) {
    errors.push('자료 유형은 필수입니다.');
  } else if (!['pdf', 'image', 'text', 'video'].includes(material.type)) {
    errors.push('유효하지 않은 자료 유형입니다.');
  }

  if (!material.url) {
    errors.push('자료 URL은 필수입니다.');
  } else if (!isValidUrl(material.url)) {
    errors.push('유효하지 않은 URL 형식입니다.');
  }

  return errors;
};

// URL 형식 검사
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}; 